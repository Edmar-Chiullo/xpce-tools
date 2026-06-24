'use client';

import { DataSnapshot, onChildAdded, onChildChanged, ref, query, orderByChild, equalTo, get } from "firebase/database";
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
import { AtividadeProps, TaskItem } from "@/app/types/TasksProps";
import { fullDatePrint, hourPrint } from "@/app/utils/ger-dates";
import { ClipboardList, Warehouse, ScanLine, Plane, Activity, Clock } from "lucide-react";

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

const TASK_TYPE_MAP: Record<string, string> = {
  quarentena: 'quarentena-fracionada',
  picking: 'rotativo-picking',
  endereco: 'validacao-produto-endereco',
  aereo: 'aereo-vazio',
};

const DETAIL_COLUMNS: Record<string, { key: string; label: string }[]> = {
  quarentena: [
    { key: 'activityID', label: 'Código' },
    { key: 'loadProduct', label: 'Produto' },
    { key: 'loadQuant', label: 'Quantidade' },
    { key: 'loadValid', label: 'Validade' },
  ],
  picking: [
    { key: 'activityID', label: 'Código' },
    { key: 'loadAddress', label: 'Endereço' },
    { key: 'loadProduct', label: 'Produto' },
    { key: 'loadQuant', label: 'Quantidade' },
    { key: 'loadValid', label: 'Validade' },
  ],
  endereco: [
    { key: 'activityID', label: 'Código' },
    { key: 'loadAddress', label: 'Endereço' },
    { key: 'loadProduct', label: 'Produto' },
  ],
  aereo: [
    { key: 'activityID', label: 'Código' },
    { key: 'loadAddress', label: 'Endereço' },
  ],
};

function formatDuration(ms: number) {
  if (ms <= 0) return '-';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}

const KPI_MAP: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string; bg: string }[]> = {
  quarentena: [
    { icon: ClipboardList, label: 'Total de Registros', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: Activity, label: 'Produtos Distintos', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: Clock, label: 'Unidades Contadas', color: 'text-blue-500', bg: 'bg-blue-50' },
  ],
  picking: [
    { icon: Warehouse, label: 'Total de Registros', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Activity, label: 'Endereços Distintos', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: Clock, label: 'Unidades Separadas', color: 'text-amber-500', bg: 'bg-amber-50' },
  ],
  endereco: [
    { icon: ScanLine, label: 'Total de Registros', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: Activity, label: 'Endereços Distintos', color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: Clock, label: 'Produtos Distintos', color: 'text-blue-500', bg: 'bg-blue-50' },
  ],
  aereo: [
    { icon: Plane, label: 'Total de Registros', color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: Activity, label: 'Endereços Varridos', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: Clock, label: '—', color: 'text-amber-500', bg: 'bg-amber-50' },
  ],
};

function getTodayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateBR(isoDate: string) {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

interface DashTipoProps {
  filterKey: 'quarentena' | 'picking' | 'endereco' | 'aereo';
}

function DashTipoContainer({ filterKey }: DashTipoProps) {
  const searchParams = useSearchParams();
  const urlDate = searchParams?.get('date');
  const [tasks, setTasks] = useState<AtividadeProps[]>([]);
  const [tasksData, setTasksData] = useState<TaskItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    urlDate && /^\d{4}-\d{2}-\d{2}$/.test(urlDate) ? urlDate : getTodayISO()
  );
  const [loading, setLoading] = useState(true);

  const dbQuery = query(ref(db, 'activities'), orderByChild('activityDate'), equalTo(selectedDate));
  const tasksQuery = query(ref(db, 'tasks'), orderByChild('activityDate'), equalTo(selectedDate));

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

    get(dbQuery).then((snapshot) => { if (!cancelled && !snapshot.exists()) setLoading(false); }).catch(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      unsubscribeAdd();
      unsubscribeChange();
    };
  }, [selectedDate]);

  useEffect(() => {
    let cancelled = false;
    setTasksData([]);
    get(tasksQuery).then((snapshot) => {
      if (cancelled) return;
      const items: TaskItem[] = [];
      snapshot.forEach((child) => { items.push(child.val()); });
      const taskTypeTarget = TASK_TYPE_MAP[filterKey];
      const filtered = items.filter(t => {
        if (t.taskType === taskTypeTarget) return true;
        const name = (t.activityName || '').toLowerCase();
        return FILTER_MAP[filterKey](name);
      });
      console.log(`[dash-tipo] date=${selectedDate} key=${filterKey} target=${taskTypeTarget} raw=${items.length} taskTypes=${[...new Set(items.map(t => t.taskType))].join(',')} filtered=${filtered.length}`);
      setTasksData(filtered);
    });
    return () => { cancelled = true; };
  }, [selectedDate, filterKey]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => filterFn(t.activity?.activityName?.toLowerCase() || ''));
  }, [tasks, filterFn]);

  const taskStats = useMemo(() => {
    const total = tasksData.length;
    const uniqueProducts = new Set(tasksData.map(t => t.loadProduct).filter(Boolean)).size;
    const uniqueAddresses = new Set(tasksData.map(t => t.loadAddress).filter(Boolean)).size;
    const totalQuant = tasksData.reduce((acc, t) => acc + (parseInt(t.loadQuant || '0') || 0), 0);
    switch (filterKey) {
      case 'quarentena': return [total, uniqueProducts, totalQuant];
      case 'picking':    return [total, uniqueAddresses, totalQuant];
      case 'endereco':   return [total, uniqueAddresses, uniqueProducts];
      case 'aereo':      return [total, uniqueAddresses, '—'];
      default:           return [total, 0, 0];
    }
  }, [tasksData, filterKey]);

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
    const activityMap = new Map(filteredTasks.map(a => [a._firebaseKey, a.activity]))
    const data = tasksData.map(task => {
      const validStr = task.loadValid || ''
      const validFormatted = validStr.length === 8
        ? `${validStr.slice(0, 2)}/${validStr.slice(2, 4)}/${validStr.slice(4, 8)}`
        : validStr
      const dateParts = (task.activityDate || '').split('-')
      const dateFormatted = dateParts.length === 3
        ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
        : task.activityDate
      const activity = activityMap.get(task.activityRef || '')
      return {
        Centro: task.activityUserCenter ? `Centro ${task.activityUserCenter}` : '',
        Tarefa: task.activityID || '',
        Endereço: task.loadAddress || '',
        Produto: task.loadProduct || '',
        Quantidade: task.loadQuant || '',
        Validade: validFormatted,
        Operador: activity?.activtyUserName || '',
        Data: dateFormatted,
        Hora: task.createdAt ? hourPrint(task.createdAt) : '',
        Atividade: task.activityName || '',
      }
    })
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
            disabled={tasksData.length === 0}
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
          <div className="flex gap-4">
            {KPI_MAP[filterKey].map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <div
                  key={kpi.label}
                  className="flex items-center gap-4 flex-1 bg-card-bg rounded-[var(--radius)] p-5 shadow-sm border border-border min-w-0"
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${kpi.bg}`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-fg font-medium uppercase tracking-wider">{kpi.label}</p>
                    <p className={`text-lg font-bold truncate ${kpi.color}`}>{taskStats[i]}</p>
                  </div>
                </div>
              )
            })}
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
              Detalhamento ({tasksData.length})
            </h3>
            <div className="max-h-72 overflow-auto border border-zinc-900 rounded-lg">
              <table className="w-full text-sm text-zinc-800">
                <thead className="bg-zinc-200 sticky top-0">
                  <tr>
                    {DETAIL_COLUMNS[filterKey].map(col => (
                      <th key={col.key} className="text-left p-2 whitespace-nowrap">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasksData.map((t, i) => (
                    <tr key={i} className="border-t border-zinc-200 hover:bg-zinc-100">
                      {DETAIL_COLUMNS[filterKey].map(col => (
                        <td key={col.key} className="p-2 whitespace-nowrap">{(t as any)[col.key] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {filteredTasks.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-zinc-800">Atividades ({filteredTasks.length})</h3>
              <div className="max-h-60 overflow-auto border border-zinc-900 rounded-lg">
                <table className="w-full text-sm text-zinc-800">
                  <thead className="bg-zinc-200 sticky top-0">
                    <tr>
                      <th className="text-left p-2 whitespace-nowrap">Código</th>
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
                        <td className="p-2 whitespace-nowrap">{t.activity.activtyUserName}</td>
                        <td className="p-2 whitespace-nowrap">{t.activity.activityLocalWork}</td>
                        <td className="p-2 whitespace-nowrap">
                          {fullDatePrint(t.activity.activityInitDate)} {hourPrint(t.activity.activityInitDate)}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {t.activity.activityState ? '-' : `${fullDatePrint(t.activity.activityFinishDate)} ${hourPrint(t.activity.activityFinishDate)}`}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {t.activity.activityState ? '-' : formatDuration(t.activity.activityFinishDate - t.activity.activityInitDate)}
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
          )}
        </div>
      )}
    </div>
  );
}

export default DashTipoContainer;
