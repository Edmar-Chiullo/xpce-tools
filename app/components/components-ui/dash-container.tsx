'use client';

import { DataSnapshot, onChildAdded, onChildChanged, ref } from "firebase/database";
import { db } from "@/firebasekey/keyapi";

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

import { useState, useEffect, useMemo } from "react";

import Card from "@/app/components/components-ui/card";
import { ActivityProps } from "@/app/types/TasksProps";
import { fullDate, fullDatePrint, hourPrint } from "@/app/utils/ger-date";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// interface Options {
//     responsive: boolean;
//     plugins: {
//         legend: { position: string };
//         title: { display: boolean; text: string };
//     };
// }

const options: ChartOptions<'bar'> = {
  responsive: true,
  plugins: {
    legend: { 
      position: 'top' as const // O 'as const' ajuda a garantir o tipo literal
    },
    title: { 
      display: true, 
      text: 'Atividades PCE' 
    },
  },
};

function ContainerDash() {

    const [tasks, setTasks] = useState<ActivityProps[]>([])
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const itemsPerPage = 8;

    const strDate = fullDate().replace(/\//g, '');
    const dbPath = `${strDate.slice(4, 8)}/${strDate.slice(2, 8)}/${13}/${'1046'}/pce`;
    const dbRef = ref(db, dbPath); //strDate.slice(0, 2)

    const options: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Atividades PCE' },
        },
    };

    const labels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'];

    const data = {
        labels,
        datasets: [
            {
            label: 'Atividades',
            data: [12, 19, 3, 5, 8, 10],
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
        ],
    };

    useEffect(() => {
        const unsubscribeAdd = onChildAdded(dbRef, (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const value = Object.values(snapshot.val())
             
                const newActivitys = value.map(activity => activity as ActivityProps);
                setTasks(prevTasks => [...prevTasks, ...newActivitys])
            }
        });

        const unsubscribeChange = onChildChanged(dbRef, (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const value = Object.values(snapshot.val() as ActivityProps)

                setTasks((prev:ActivityProps[]) => {
                    return prev.map((task: ActivityProps) => {
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
    <div className="container-dash flex flex-col justify-center gap-6 w-full h-full">
        <div className="flex justify-around w-full h-0[20%] p-2 border border-zinc-900 rounded-lg">
            <Card title="Tasks" description="Manage your tasks" />
            <Card title="Tasks" description="Manage your tasks" />
            <Card title="Tasks" description="Manage your tasks" />
            <Card title="Tasks" description="Manage your tasks" />
        </div>
        <div className="w-full h-[79%] p-2 border border-zinc-900 rounded-lg">
            <Bar className="w-full h-full" options={options} data={data} />
        </div>
    </div>
  );
}

export default ContainerDash;
