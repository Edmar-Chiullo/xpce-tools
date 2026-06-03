'use client';

import { DataSnapshot, onChildAdded, onChildChanged, ref } from "firebase/database";
import { db } from "@/app/firebasekey/keyapi";

import { useState, useEffect, useMemo } from "react";

import { AtividadeProps } from "@/app/types/TasksProps";
import { fullDate, fullDatePrint, hourPrint } from "@/app/utils/ger-dates";

function ContainerTasks() {

    const [tasks, setTasks] = useState<AtividadeProps[]>([])
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const itemsPerPage = 8;
    
    const ano = '2026';
    const mesano = '052026';
    const dia = '13';

    const strDate = fullDate().replace(/\//g, '');
    const dbPath = `${ano}/${mesano}/${dia}/${'1046'}/pce`;
    const dbRef = ref(db, dbPath); //strDate.slice(0, 2)

    useEffect(() => {
        const unsubscribeAdd = onChildAdded(dbRef, (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const value = Object.values(snapshot.val())
                console.log(value)
                const newActivitys = value.map(activity => activity as AtividadeProps);
                setTasks(prevTasks => [...prevTasks, ...newActivitys])
            }
        });

        const unsubscribeChange = onChildChanged(dbRef, (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const value = Object.values(snapshot.val() as AtividadeProps[])

                setTasks((prev:AtividadeProps[]) => {
                    return prev.map((task: AtividadeProps) => {
                        const foundUpdated = value.find(
                            updated => updated.activity.activityID === task.activity.activityID
                        );
                        return foundUpdated ? foundUpdated : task;
                    });
                });
            }
        });

        return () => {
            unsubscribeAdd();
            unsubscribeChange();
        };
    }, []);

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

    
  return (
    <div className="container-tasks flex flex-col gap-6 w-full h-full">
        <div className="">
            <input 
                type="text"
                placeholder="Buscar tarefa pelo nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 rounded w-full text-zinc-800"
            />
        </div>
        <div className=" h-[80%] p-2 border border-zinc-900 rounded-lg">
            <ul className="tasks-list flex flex-col text-zinc-800 gap-0.5">
                {paginatedData.map((task, index) => (
                    <div key={index} className="grid grid-rows-2 grid-cols-4 justify-items-start rounded-sm p-1 bg-zinc-200">
                        <li className="col-start-1 row-start-1">{`Código: ${task['activity']['activityID']}`}</li>
                        <li className="col-start-1 col-end-3 row-start-2">{`Atividade: ${task['activity']['activityName']}`}</li>
                        <li className="col-start-2 row-start-1">{`Usuário: ${task['activity']['activtyUserName']}`}</li>
                        <li className="col-start-3 row-start-1">{`Data: ${fullDatePrint(task['activity']['activityInitDate'])}`}</li>
                        <li className="col-start-3 row-start-2">{`Hora: ${hourPrint(task['activity']['activityInitDate'])}`}</li>
                        <li className="col-start-4 row-start-1 row-end-2">{`Centro: ${task['activity']['activityLocalWork']}`}</li>
                        <li className="col-start-4 row-start-2">{`Situação: ${task['activity']['activityState']}`}</li>
                    </div>
                ))}
            </ul>
        </div>
        <div className="flex justify-around w-full">
            <button 
                className="w-32 p-0.75 rounded-2xl bg-zinc-950"
                disabled={currentPage === 0} 
                onClick={() => setCurrentPage(p => p - 1)}
            >
                Anterior
            </button>

            <span className="text-zinc-950">Página {currentPage + 1} de {totalPages}</span>

            <button 
                className="w-32 p-0.75 rounded-2xl bg-zinc-950"
                disabled={currentPage >= totalPages - 1} 
                onClick={() => setCurrentPage(p => p + 1)}
            >
                Próxima
            </button>
        </div>
    </div>
  );
}

export default ContainerTasks;
