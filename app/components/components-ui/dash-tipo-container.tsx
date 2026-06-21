'use client';

import { DataSnapshot, onChildAdded, onChildChanged, ref, query, orderByChild, equalTo } from "firebase/database";
import { db } from "@/app/firebasekey/keyapi";

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

import { useState, useEffect, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import { useSearchParams } from "next/navigation";

import Link from "next/link";
import Card from "@/app/components/components-ui/card";
import { AtividadeProps } from "@/app/types/TasksProps";
import { fullDatePrint, hourPrint } from "@/app/utils/ger-dates";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FILTER_MAP: Record<string, (name: string) => boolean> = {
  quarentena: (name) => name.includes('quarentena'),
  picking: (name) => name.includes('picking') || name.includes('rotativo'),
  endereco: (name) => name.includes('endereço') || name.includes('produto'),
  aereo: (name) => name.includes('aéreo'),
};

const TITLE_MAP: Record<string, { title: string; description: string }> = {
  quarentena: { title: 'Quarentena Fracionada', description: 'Tarefas em quarentena' },
  picking: { title: 'Rotativo de Picking', description: 'Tarefas de picking' },
  endereco: { title: 'Validação End x Prod', description: 'Tarefas de validação' },
  aereo: { title: 'Aéreo Vazio', description: 'Tarefas de aéreo' },
};

function getTodayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateBR(isoDate: string) {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function formatDuration(ms: number) {
  if (ms <= 0) return '-';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}

interface DashTipoProps {
  filterKey: 'quarentena' | 'picking' | 'endereco' | 'aereo';
}

function DashTipoContainer({ filterKey }: DashTipoProps) {
  const searchParams = useSearchParams();
  const urlDate = searchParams?.get('date');
  const [tasks, setTasks] = useState<AtividadeProps[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    urlDate && /^\d{4}-\d{2}-\d{2}$/.test(urlDate) ? urlDate : getTodayISO()
  );
  const [loading, setLoading] = useState(true);

  const dbQuery = query(ref(db, 'activities'), orderByChild('activityDate'), equalTo(selectedDate));

  const chartRef = useRef<any>(null);

  const filterFn = FILTER_MAP[filterKey];
  const meta = TITLE_MAP[filterKey];

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `${meta.title} — ${formatDateBR(selectedDate)}` },
    },
  };

  useEffect(() => {
    setLoading(true);
    setTasks([]);

    let isFirstBatch = true;
    let cancelled = false;

    const unsubscribeAdd = onChildAdded(dbQuery, (snapshot: DataSnapshot) => {
      if (cancelled) return;
      const activity = snapshot.val() as AtividadeProps['activity'] | null;
      if (!activity) return;

      const item: AtividadeProps = {
        activity,
        _firebaseKey: snapshot.key!,
      };

      if (isFirstBatch) {
        isFirstBatch = false;
        setTasks([item]);
      } else {
        setTasks(prev => [...prev, item]);
      }
      setLoading(false);
    });

    const unsubscribeChange = onChildChanged(dbQuery, (snapshot: DataSnapshot) => {
      if (cancelled) return;
      const activity = snapshot.val() as AtividadeProps['activity'] | null;
      if (!activity) return;

      setTasks((prev) => {
        return prev.map((task) =>
          task._firebaseKey === snapshot.key
            ? { activity, _firebaseKey: snapshot.key! }
            : task
        );
      });
    });

    return () => {
      cancelled = true;
      unsubscribeAdd();
      unsubscribeChange();
    };
  }, [selectedDate]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => filterFn(t.activity?.activityName?.toLowerCase() || ''));
  }, [tasks, filterFn]);

  const cardStat = useMemo(() => {
    let total = 0, active = 0, finished = 0;
    for (const t of filteredTasks) {
      total++;
      if (t.activity?.activityState === true) active++;
      else finished++;
    }
    return { total, active, finished };
  }, [filteredTasks]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of filteredTasks) {
      const name = t.activity?.activityName || 'Desconhecido';
      counts[name] = (counts[name] || 0) + 1;
    }
    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: 'Quantidade de Tarefas',
          data: Object.values(counts),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [filteredTasks]);

  const ranking = useMemo(() => {
    const userMap: Record<string, { count: number; totalDuration: number }> = {};
    for (const t of filteredTasks) {
      if (t.activity?.activityState === true) continue;
      const user = t.activity?.activtyUserName || 'Desconhecido';
      if (!userMap[user]) userMap[user] = { count: 0, totalDuration: 0 };
      userMap[user].count++;
      const duration = (t.activity.activityFinishDate || 0) - (t.activity.activityInitDate || 0);
      userMap[user].totalDuration += Math.max(0, duration);
    }
    return Object.entries(userMap)
      .map(([user, data]) => ({
        user,
        count: data.count,
        totalDuration: data.totalDuration,
        avgDuration: data.count > 0 ? data.totalDuration / data.count : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredTasks]);

  function exportDashboard() {
    const data = filteredTasks.map(t => ({
      Código: t.activity.activityID,
      Atividade: t.activity.activityName,
      Usuário: t.activity.activtyUserName,
      Centro: t.activity.activityLocalWork,
      Início: `${fullDatePrint(t.activity.activityInitDate)} ${hourPrint(t.activity.activityInitDate)}`,
      Término: t.activity.activityState ? '-' : `${fullDatePrint(t.activity.activityFinishDate)} ${hourPrint(t.activity.activityFinishDate)}`,
      Duração: t.activity.activityState ? '-' : formatDuration(t.activity.activityFinishDate - t.activity.activityInitDate),
      Situação: t.activity.activityState ? "Ativa" : "Finalizada",
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, meta.title)
    XLSX.writeFile(wb, `${filterKey}-pce-${selectedDate}.xlsx`)
  }

  return (
    <div className="flex flex-col gap-6 w-full h-full relative p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <Link href="/pages/dashboard" className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar ao Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border p-2 rounded text-zinc-800"
          />
          {loading && (
            <span className="flex items-center gap-1 text-sm text-zinc-500">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Carregando
            </span>
          )}
          <button
            onClick={exportDashboard}
            disabled={filteredTasks.length === 0}
            className="px-4 py-2 rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 cursor-pointer text-sm whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Exportar XLSX
          </button>
        </div>
      </div>

      {!loading && filteredTasks.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-zinc-500 text-lg">
          Não há dados para esta data.
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0 gap-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Card
              title={meta.title}
              description={meta.description}
              total={cardStat.total}
              active={cardStat.active}
              finished={cardStat.finished}
            />
          </div>

          <div className="flex-1 min-h-[250px] p-2 border border-zinc-900 rounded-lg">
            <Bar ref={chartRef} options={options} data={chartData} />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-zinc-800">Ranking de Executores</h3>
            <div className="overflow-x-auto border border-zinc-900 rounded-lg">
              <table className="w-full text-sm text-zinc-800">
                <thead className="bg-zinc-200">
                  <tr>
                    <th className="text-left p-2 whitespace-nowrap">#</th>
                    <th className="text-left p-2 whitespace-nowrap">Usuário</th>
                    <th className="text-left p-2 whitespace-nowrap">Tarefas</th>
                    <th className="text-left p-2 whitespace-nowrap">Tempo Total</th>
                    <th className="text-left p-2 whitespace-nowrap">Tempo Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((r, i) => (
                    <tr key={r.user} className="border-t border-zinc-200 hover:bg-zinc-100">
                      <td className="p-2 whitespace-nowrap">{i + 1}</td>
                      <td className="p-2 whitespace-nowrap">{r.user}</td>
                      <td className="p-2 whitespace-nowrap">{r.count}</td>
                      <td className="p-2 whitespace-nowrap">{formatDuration(r.totalDuration)}</td>
                      <td className="p-2 whitespace-nowrap">{formatDuration(r.avgDuration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-zinc-800">
              Detalhamento ({filteredTasks.length})
            </h3>
            <div className="max-h-60 overflow-y-auto border border-zinc-900 rounded-lg">
              <table className="w-full text-sm text-zinc-800">
                <thead className="bg-zinc-200 sticky top-0">
                  <tr>
                    <th className="text-left p-2 whitespace-nowrap">Código</th>
                    <th className="text-left p-2 whitespace-nowrap">Atividade</th>
                    <th className="text-left p-2 whitespace-nowrap">Usuário</th>
                    <th className="text-left p-2 whitespace-nowrap">Centro</th>
                    <th className="text-left p-2 whitespace-nowrap">Início</th>
                    <th className="text-left p-2 whitespace-nowrap">Término</th>
                    <th className="text-left p-2 whitespace-nowrap">Duração</th>
                    <th className="text-left p-2 whitespace-nowrap">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((t) => (
                    <tr key={t._firebaseKey} className="border-t border-zinc-200 hover:bg-zinc-100">
                      <td className="p-2 whitespace-nowrap">{t.activity.activityID}</td>
                      <td className="p-2 whitespace-nowrap">{t.activity.activityName}</td>
                      <td className="p-2 whitespace-nowrap">{t.activity.activtyUserName}</td>
                      <td className="p-2 whitespace-nowrap">{t.activity.activityLocalWork}</td>
                      <td className="p-2 whitespace-nowrap">
                        {fullDatePrint(t.activity.activityInitDate)} {hourPrint(t.activity.activityInitDate)}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {t.activity.activityState
                          ? '-'
                          : `${fullDatePrint(t.activity.activityFinishDate)} ${hourPrint(t.activity.activityFinishDate)}`
                        }
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {t.activity.activityState
                          ? '-'
                          : formatDuration(t.activity.activityFinishDate - t.activity.activityInitDate)
                        }
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${t.activity.activityState ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-600'}`}>
                          {t.activity.activityState ? "Ativa" : "Finalizada"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashTipoContainer;
