'use client';

import { DataSnapshot, onChildAdded, onChildChanged, ref, remove, query, orderByChild, equalTo, get } from "firebase/database";
import { db } from "@/app/firebasekey/keyapi";

import * as XLSX from "xlsx";

import { useState, useEffect, useMemo } from "react";

import { AtividadeProps } from "@/app/types/TasksProps";
import { fullDate, fullDatePrint, hourPrint } from "@/app/utils/ger-dates";
import ModalConfirm from "./modal-confirm";

function ContainerTasks() {

    const [tasks, setTasks] = useState<AtividadeProps[]>([])
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<AtividadeProps | null>(null);
    const [selectedDate, setSelectedDate] = useState(fullDate())
    const [selectedCenter, setSelectedCenter] = useState('1046');

    const itemsPerPage = 8;

    const parts = selectedDate.split('/');
    const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const dateCenter = `${isoDate}_${selectedCenter}`;

    const dbQuery = query(ref(db, 'activities'), orderByChild('activityDateCenter'), equalTo(dateCenter));

    useEffect(() => {
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
    }, [selectedDate, selectedCenter]);

    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    const { paginatedData, totalPages } = useMemo(() => {

        const filtered = tasks.filter(task => {
            return task.activity.activityID.toLowerCase().includes(searchTerm.toLowerCase());
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

    function exportAll() {
        const data = tasks.map(t => ({
            Código: t.activity.activityID,
            Atividade: t.activity.activityName,
            Usuário: t.activity.activtyUserName,
            Data: fullDatePrint(t.activity.activityInitDate),
            Hora: hourPrint(t.activity.activityInitDate),
            Centro: t.activity.activityLocalWork,
            Situação: t.activity.activityState ? "Ativa" : "Finalizada",
        }))
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Tarefas")
        XLSX.writeFile(wb, `tarefas-pce-${selectedDate.replace(/\//g, "-")}.xlsx`)
    }

    function exportIndividual(task: AtividadeProps) {
        const data = [{
            Código: task.activity.activityID,
            Atividade: task.activity.activityName,
            Usuário: task.activity.activtyUserName,
            Data: fullDatePrint(task.activity.activityInitDate),
            Hora: hourPrint(task.activity.activityInitDate),
            Centro: task.activity.activityLocalWork,
            Situação: task.activity.activityState ? "Ativa" : "Finalizada",
        }]
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Tarefa")
        XLSX.writeFile(wb, `tarefa-${task.activity.activityID}.xlsx`)
    }

    async function handleDelete() {
        if (!deleteTarget?._firebaseKey) return

        const activityKey = deleteTarget._firebaseKey

        const tasksQuery = query(ref(db, 'tasks'), orderByChild('activityRef'), equalTo(activityKey))
        const tasksSnap = await get(tasksQuery)
        if (tasksSnap.exists()) {
            const promises: Promise<void>[] = []
            tasksSnap.forEach((child) => {
                promises.push(remove(child.ref))
            })
            await Promise.all(promises)
        }

        await remove(ref(db, `activities/${activityKey}`))

        setTasks(prev => prev.filter(t => t._firebaseKey !== activityKey))
        setDeleteTarget(null)
    }

  return (
    <div className="container-tasks flex flex-col gap-6 w-full h-full">
        <div className="flex gap-2">
            <input
                type="date"
                value={selectedDate.split('/').reverse().join('-')}
                onChange={(e) => {
                    const [year, month, day] = e.target.value.split('-')
                    setSelectedDate(`${day}/${month}/${year}`)
                }}
                className="border p-2 rounded text-zinc-800"
            />
            <input
                type="text"
                placeholder="Centro (Ex: 1046)"
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="border p-2 rounded w-24 text-zinc-800"
            />
            <input
                type="text"
                placeholder="Buscar tarefa pelo nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 rounded w-full text-zinc-800"
            />
            <button
                onClick={exportAll}
                className="px-4 py-2 rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 cursor-pointer text-sm whitespace-nowrap"
            >
                Exportar Todas
            </button>
        </div>
        <div className="h-[75%] p-2 border border-zinc-900 rounded-lg overflow-y-auto">
            <ul className="tasks-list flex flex-col text-zinc-800 gap-0.5">
                {paginatedData.map((task, index) => (
                    <div key={task._firebaseKey || index} className="grid grid-rows-2 grid-cols-5 justify-items-start items-center rounded-sm p-1 bg-zinc-200">
                        <li className="col-start-1 row-start-1">{`Código: ${task['activity']['activityID']}`}</li>
                        <li className="col-start-1 col-end-3 row-start-2">{`Atividade: ${task['activity']['activityName']}`}</li>
                        <li className="col-start-2 row-start-1">{`Usuário: ${task['activity']['activtyUserName']}`}</li>
                        <li className="col-start-3 row-start-1">{`Data: ${fullDatePrint(task['activity']['activityInitDate'])}`}</li>
                        <li className="col-start-3 row-start-2">{`Hora: ${hourPrint(task['activity']['activityInitDate'])}`}</li>
                        <li className="col-start-4 row-start-1">{`Centro: ${task['activity']['activityLocalWork']}`}</li>
                        <li className="col-start-4 row-start-2">{`Situação: ${task['activity']['activityState'] ? "Ativa" : "Finalizada"}`}</li>
                        <div className="col-start-5 row-span-2 flex flex-col gap-1">
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
                ))}
            </ul>
        </div>
        <div className="flex justify-around w-full">
            <button
                className="w-32 p-0.75 rounded-2xl bg-zinc-950 text-white"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => p - 1)}
            >
                Anterior
            </button>

            <span className="text-zinc-950">Página {currentPage + 1} de {totalPages}</span>

            <button
                className="w-32 p-0.75 rounded-2xl bg-zinc-950 text-white"
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
