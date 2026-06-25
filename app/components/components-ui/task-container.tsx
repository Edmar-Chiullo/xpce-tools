'use client';

import { DataSnapshot, onChildAdded, onChildChanged, ref, query, orderByChild, equalTo, get } from "firebase/database";
import { db } from "@/app/firebasekey/keyapi";
import { useSession } from "next-auth/react";

import * as XLSX from "xlsx";
import { CheckCircle } from "lucide-react";

import { useState, useEffect, useMemo } from "react";

import { AtividadeProps, TaskItem } from "@/app/types/TasksProps";
import { fullDate, fullDatePrint, hourPrint } from "@/app/utils/ger-dates";
import { finishActivity, deleteActivity } from "@/app/services/activityService";
import ModalConfirm from "./modal-confirm";

function ContainerTasks() {

    const [tasks, setTasks] = useState<AtividadeProps[]>([])
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<AtividadeProps | null>(null);
    const [selectedDate, setSelectedDate] = useState(fullDate())
    const { data: session } = useSession()
    const userCenter = session?.user?.center || ''

    const itemsPerPage = 7;

    const parts = selectedDate.split('/');
    const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const dateCenter = `${isoDate}_${userCenter}`;

    const dbQuery = query(ref(db, 'activities'), orderByChild('activityDateCenter'), equalTo(dateCenter));

    useEffect(() => {
        if (!userCenter) return
        setTasks([])
        setCurrentPage(0)

        const unsubscribeAdd = onChildAdded(dbQuery, (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const activity = snapshot.val() as AtividadeProps['activity']
                setTasks(prevTasks => [...prevTasks, { activity, _firebaseKey: snapshot.key! }])
            }
        });

        const unsubscribeChange = onChildChanged(dbQuery, (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const activity = snapshot.val() as AtividadeProps['activity']

                setTasks((prev: AtividadeProps[]) => {
                    return prev.map((task) =>
                        task._firebaseKey === snapshot.key
                            ? { activity, _firebaseKey: snapshot.key! }
                            : task
                    );
                });
            }
        });

        return () => {
            unsubscribeAdd();
            unsubscribeChange();
        };
    }, [selectedDate, userCenter]);

    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    const { paginatedData, totalPages } = useMemo(() => {

        const term = searchTerm.toLowerCase();
        const filtered = tasks.filter(task => {
            return (
                (task.activity.activityID || '').toLowerCase().includes(term) ||
                (task.activity.activityName || '').toLowerCase().includes(term) ||
                (task.activity.activtyUserName || '').toLowerCase().includes(term) ||
                (task.activity.activityUserID || '').toLowerCase().includes(term)
            );
        });

        const pages = Math.ceil(filtered.length / itemsPerPage);

        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        const sliced = filtered.slice(start, end);

        return {
            paginatedData: sliced,
            totalPages: pages
        };

    }, [tasks, searchTerm, currentPage]);

    function formatDateSafe(dateVal: unknown): string {
        if (!dateVal) return ''
        const str = String(dateVal)
        const parts = str.split('-')
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`
        }
        return str
    }

    async function fetchTasksForActivity(activityKey: string): Promise<TaskItem[]> {
        const snap = await get(query(ref(db, 'tasks'), orderByChild('activityRef'), equalTo(activityKey)))
        const items: TaskItem[] = []
        snap.forEach((childSnap) => {
            items.push({ ...childSnap.val() as TaskItem, _firebaseKey: childSnap.key! })
        })
        return items
    }

    async function exportAll() {
        const allNested = await Promise.all(tasks.map(t => fetchTasksForActivity(t._firebaseKey!)))
        const allTasks = allNested.flat()
        if (allTasks.length === 0) return

        const activityMap = new Map(tasks.map(a => [a._firebaseKey, a.activity]))
        const data = allTasks.map(t => {
            const activity = activityMap.get(t.activityRef || '')
            const validStr = t.loadValid || ''
            const validFormatted = validStr.length === 8
                ? `${validStr.slice(0, 2)}/${validStr.slice(2, 4)}/${validStr.slice(4, 8)}`
                : validStr
            return {
                Centro: userCenter ? `Centro ${userCenter}` : '',
                Tarefa: t.activityID || '',
                Endereço: t.loadAddress || '',
                Produto: t.loadProduct || '',
                Quantidade: t.loadQuant || '',
                Validade: validFormatted,
                Operador: activity?.activtyUserName || '',
                Data: formatDateSafe(t.activityDate),
                Hora: t.createdAt ? hourPrint(t.createdAt) : '',
                Atividade: t.activityName || '',
            }
        })

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Tarefas")
        XLSX.writeFile(wb, `tarefas-pce-${selectedDate.replace(/\//g, "-")}.xlsx`)
    }

    async function exportIndividual(task: AtividadeProps) {
        const key = task._firebaseKey
        if (!key) return
        const tasksForActivity = await fetchTasksForActivity(key)
        if (tasksForActivity.length === 0) return

        const data = tasksForActivity.map(t => {
            const validStr = t.loadValid || ''
            const validFormatted = validStr.length === 8
                ? `${validStr.slice(0, 2)}/${validStr.slice(2, 4)}/${validStr.slice(4, 8)}`
                : validStr
            return {
                Centro: userCenter ? `Centro ${userCenter}` : '',
                Tarefa: t.activityID || '',
                Endereço: t.loadAddress || '',
                Produto: t.loadProduct || '',
                Quantidade: t.loadQuant || '',
                Validade: validFormatted,
                Operador: task.activity.activtyUserName || '',
                Data: formatDateSafe(t.activityDate),
                Hora: t.createdAt ? hourPrint(t.createdAt) : '',
                Atividade: t.activityName || '',
            }
        })

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Tarefa")
        XLSX.writeFile(wb, `tarefa-${task.activity.activityID}.xlsx`)
    }

    async function handleFinish(task: AtividadeProps) {
        await finishActivity({
            activityUserCenter: '',
            activityID: task.activity.activityID || '',
            activityName: task.activity.activityName || '',
            activityUserID: task.activity.activityUserID || '',
            _firebaseKey: task._firebaseKey,
        });
    }

    async function handleDelete() {
        if (!deleteTarget?._firebaseKey) return
        await deleteActivity(deleteTarget._firebaseKey, deleteTarget.activity.activityUserID)
        setTasks(prev => prev.filter(t => t._firebaseKey !== deleteTarget._firebaseKey))
        setDeleteTarget(null)
    }

  return (
    <div className="flex flex-col gap-6 w-full h-full p-4">
        <div className="flex gap-2 flex-wrap">
            <input
                type="date"
                value={selectedDate.split('/').reverse().join('-')}
                onChange={(e) => {
                    const [year, month, day] = e.target.value.split('-')
                    setSelectedDate(`${day}/${month}/${year}`)
                }}
                className="border border-zinc-900/20 p-2 rounded-3xl text-zinc-800"
            />
            <input
                type="text"
                placeholder="Buscar por código, atividade, operador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-zinc-900/20 p-2 rounded-3xl flex-1 min-w-[200px] text-zinc-800"
            />
            <button
                onClick={() => exportAll()}
                className="px-4 py-2 rounded-[var(--radius)] bg-zinc-950 text-white hover:bg-zinc-800 cursor-pointer text-sm whitespace-nowrap"
            >
                Exportar Todas
            </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto border border-zinc-900/20 rounded-[var(--radius)] p-1">
            <div className="flex flex-col gap-2">
                {paginatedData.map((task, index) => (
                    <div key={task._firebaseKey || index} className="flex flex-col bg-zinc-200 rounded-[var(--radius)] py-1 px-8 ">
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                            <span className="min-w-0 flex-1">
                                <strong>Código:</strong> {task.activity.activityID}
                            </span>
                            <span className="min-w-0 flex-[2]">
                                <strong>Atividade:</strong> <span className="truncate">{task.activity.activityName}</span>
                            </span>
                            <span className="whitespace-nowrap">
                                <strong>Data:</strong> {fullDatePrint(task.activity.activityInitDate)}
                            </span>
                            <span className="whitespace-nowrap">
                                <strong>Hora:</strong> {hourPrint(task.activity.activityInitDate)}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                            <span className="min-w-0 flex-[2]">
                                <strong>Usuário:</strong> <span className="truncate">{task.activity.activtyUserName}</span>
                            </span>
                            <span className="whitespace-nowrap">
                                <strong>Centro:</strong> {task.activity.activityLocalWork && task.activity.activityLocalWork !== 'Centro ' ? task.activity.activityLocalWork : `Centro ${task.activity.activityUserCenter}`}
                            </span>
                            <span className="whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${task.activity.activityState ? 'bg-green-100 text-green-700' : 'bg-zinc-300 text-zinc-600'}`}>
                                    {task.activity.activityState ? "Ativa" : "Finalizada"}
                                </span>
                            </span>
                            <div className="flex gap-1 ml-auto">
                                {task.activity.activityState && (
                                    <button
                                        onClick={() => handleFinish(task)}
                                        className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-700 cursor-pointer"
                                        title="Finalizar"
                                    >
                                        <CheckCircle className="w-3 h-3" />
                                        Finalizar
                                    </button>
                                )}
                                <button
                                    onClick={() => exportIndividual(task)}
                                    className="px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 cursor-pointer"
                                    title="Exportar tarefa"
                                >
                                    XLSX
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(task)}
                                    className="px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 cursor-pointer"
                                    title="Excluir tarefa"
                                >
                                    Del
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {paginatedData.length === 0 && (
                    <p className="text-center text-zinc-500 py-8">Nenhuma tarefa encontrada.</p>
                )}
            </div>
        </div>

        <div className="flex justify-around items-center w-full">
            <button
                className="w-32 py-2 rounded-[var(--radius)] bg-zinc-950 text-white text-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => p - 1)}
            >
                Anterior
            </button>

            <span className="text-zinc-950 text-sm">Página {currentPage + 1} de {totalPages}</span>

            <button
                className="w-32 py-2 rounded-[var(--radius)] bg-zinc-950 text-white text-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(p => p + 1)}
            >
                Próxima
            </button>
        </div>

        <ModalConfirm
            open={!!deleteTarget}
            title="Excluir tarefa"
            message={`Tem certeza que deseja excluir a tarefa ${deleteTarget?.activity.activityID}?`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
        />
    </div>
  );
}

export default ContainerTasks;
