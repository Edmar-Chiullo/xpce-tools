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
import Link from "next/link";

import { AtividadeProps } from "@/app/types/TasksProps";
import { fullDatePrint, hourPrint } from "@/app/utils/ger-dates";
import KPICards from "./dash-kpi-cards";
import DashFeed from "./dash-feed";
import DashDistribution from "./dash-distribution";
import DashActivityCards from "./dash-activity-cards";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function getTodayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateBR(isoDate: string) {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function ContainerDash() {
  const [tasks, setTasks] = useState<AtividadeProps[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayISO);
  const [loading, setLoading] = useState(true);

  console.log("Selected Date:");
  
  const dbQuery = query(ref(db, 'activities'), orderByChild('activityDate'), equalTo(selectedDate));

  const chartRef = useRef<any>(null);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Atividades — ${formatDateBR(selectedDate)}`,
        color: '#27272a',
        font: { size: 14 },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0,0,0,0.06)' } },
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

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      const name = t.activity?.activityName || 'Desconhecido';
      counts[name] = (counts[name] || 0) + 1;
    }
    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: 'Tarefas',
          data: Object.values(counts),
          backgroundColor: ['rgba(34,197,94,0.5)', 'rgba(59,130,246,0.5)', 'rgba(245,158,11,0.5)', 'rgba(239,68,68,0.5)'],
          borderColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [tasks]);

  function exportDashboard() {
    const data = tasks.map(t => ({
      Código: t.activity.activityID,
      Atividade: t.activity.activityName,
      Usuário: t.activity.activtyUserName,
      Centro: t.activity.activityLocalWork,
      Situação: t.activity.activityState ? "Ativa" : "Finalizada",
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Dashboard")
    XLSX.writeFile(wb, `dashboard-pce-${selectedDate}.xlsx`)
  }

  const filterLinks = [
    { href: 'quarentena-fracionada', label: 'Quarentena' },
    { href: 'rotativo-picking', label: 'Rotativo' },
    { href: 'validacao-produto-endereco', label: 'Validação' },
    { href: 'aereo-vazio', label: 'Aéreo' },
  ]

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-card-bg border border-border rounded-xl text-sm text-card-fg"
          />
          {loading && (
            <span className="flex items-center gap-1 text-sm text-muted-fg">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Carregando
            </span>
          )}
        </div>
        <button
          onClick={exportDashboard}
          disabled={tasks.length === 0}
          className="px-4 py-2 rounded-xl bg-sidebar-bg text-sidebar-fg text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Exportar XLSX
        </button>
      </div>

      <DashActivityCards tasks={tasks} selectedDate={selectedDate} />

      {!loading && tasks.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-muted-fg text-lg">
          Nenhuma atividade para esta data.
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0 gap-6">
          <KPICards tasks={tasks} />

          <div className="flex gap-6 flex-1 min-h-0">
            <div className="flex flex-col gap-6 flex-1 min-w-0">
              <div className="flex-1 min-h-70 bg-card-bg rounded-[(--radius)] p-5 shadow-sm border border-border">
                <Bar ref={chartRef} options={options} data={chartData} />
              </div>

              <div className="bg-card-bg rounded-[(--radius)] p-5 shadow-sm border border-border">
                <h3 className="text-sm font-semibold text-card-fg mb-3">
                  Tarefas do dia ({tasks.length})
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-2 whitespace-nowrap text-muted-fg font-medium">Código</th>
                        <th className="text-left p-2 whitespace-nowrap text-muted-fg font-medium">Atividade</th>
                        <th className="text-left p-2 whitespace-nowrap text-muted-fg font-medium">Usuário</th>
                        <th className="text-left p-2 whitespace-nowrap text-muted-fg font-medium">Centro</th>
                        <th className="text-left p-2 whitespace-nowrap text-muted-fg font-medium">Início</th>
                        <th className="text-left p-2 whitespace-nowrap text-muted-fg font-medium">Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t) => (
                        <tr key={t._firebaseKey} className="border-t border-border hover:bg-accent">
                          <td className="p-2 whitespace-nowrap text-card-fg">{t.activity.activityID}</td>
                          <td className="p-2 whitespace-nowrap text-card-fg">{t.activity.activityName}</td>
                          <td className="p-2 whitespace-nowrap text-card-fg">{t.activity.activtyUserName}</td>
                          <td className="p-2 whitespace-nowrap text-card-fg">{t.activity.activityLocalWork}</td>
                          <td className="p-2 whitespace-nowrap text-card-fg">
                            {fullDatePrint(t.activity.activityInitDate)} {hourPrint(t.activity.activityInitDate)}
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${t.activity.activityState ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>
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

            <div className="flex flex-col gap-6 w-80 shrink-0">
              <DashFeed tasks={tasks} />
              <DashDistribution tasks={tasks} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContainerDash;
