'use client';

import React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';

import { Bounce, ToastContainer, toast } from 'react-toastify';

import { createUser } from '@/app/services/userService';

const middleNames = (words: string[]) => {
    const meddlesNames = words.slice(1, -1);
    const initialsWords = meddlesNames
        .filter(p => p.length > 2)
        .map(p => p[0].toUpperCase() + '.')
        .join(' ');

    return initialsWords
}

const firstLastName = (fullName: string) => {
    const words = fullName.split(' ');
    const firstName = words[0];
    const middleName = middleNames(words)
    const lastName = words[words.length - 1];
    const formattedName = `${firstName} ${middleName} ${lastName}`;
    return words.length > 1 ? formattedName : firstName
}

const checkPermission = (role: string) => {
    switch (role) {
        case 'Aux. Logistico':
            return 'pce-operation'
        case 'Ana. Logistico':
            return 'pce-analytics'
        case 'admin':
            return 'admin'
        default:
            break;
    }
    return ''
}

const createUserSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    registrationNumber: z.string().regex(/^\d{7}$/, "Matrícula deve ter exatamente 7 dígitos."),
    role: z.enum(['Aux. Logistico', 'Ana. Logistico'])
        .refine((val) => ['Aux. Logistico', 'Ana. Logistico'].includes(val), {
            message: "Selecione uma função (Aux. Logistico ou Ana. Logistico)."
        }),
    center: z.string().min(1, "O centro de trabalho é obrigatório."),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
    onSubmit?: (data: CreateUserFormData) => void;
}

const CreateUser: React.FC<CreateUserFormProps> = ({ onSubmit }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<CreateUserFormData>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: '',
            registrationNumber: '',
            role: 'Aux. Logistico',
            center: '',
            password: '',
        }
    });

    const handleFormSubmit: SubmitHandler<CreateUserFormData> = async (data) => {
        try {
            await createUser({
                registrationNumber: data.registrationNumber,
                userName: firstLastName(data.name),
                userPermission: checkPermission(data.role),
                userLocalWork: data.center,
                center: data.center,
                password: data.password,
            })

            toast.success('Usuário cadastrado com sucesso!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });

            reset()
        } catch (error) {
            toast.error('Não foi possível concluir o cadastro: ' + error, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    };

    return (
        <div className='lg:px-10 space-y-2 text-zinc-600'>
            <ToastContainer />
            <h1 className='text-2xl'>Cadastro de Usuário</h1>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 w-full mx-auto">
                <div>
                    <label htmlFor="name" className="block mb-1 font-medium">Nome</label>
                    <input
                        id="name"
                        type="text"
                        placeholder='Nome'
                        {...register("name")}
                        className="w-full border px-3 py-2 rounded bg-zinc-50"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <label htmlFor="registrationNumber" className="block mb-1 font-medium">Matrícula</label>
                    <input
                        id="registrationNumber"
                        type="text"
                        placeholder='Ex: 1036960'
                        {...register("registrationNumber")}
                        className="w-full border px-3 py-2 rounded bg-zinc-50"
                    />
                    {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber.message}</p>}
                </div>

                <div className='space-y-2'>
                    <label className='block mb-1 font-medium'>Função</label>
                    <div className='border p-2 rounded-md'>
                        <div className='flex gap-6'>
                            <div className='flex items-center gap-2'>
                                <input
                                    id="role-operador"
                                    type="radio"
                                    value="Aux. Logistico"
                                    {...register("role")}
                                    className="w-4 h-4 text-zinc-900 border-gray-300"
                                />
                                <label htmlFor="role-operador" className="font-medium">Aux. Logística</label>
                            </div>

                            <div className='flex items-center gap-2'>
                                <input
                                    id="role-analista"
                                    type="radio"
                                    value="Ana. Logistico"
                                    {...register("role")}
                                    className="w-4 h-4 text-zinc-900 border-gray-300"
                                />
                                <label htmlFor="role-analista" className="font-medium">Ana. Logística</label>
                            </div>
                        </div>
                    </div>
                    {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                </div>

                <div>
                    <label htmlFor="center" className="block mb-1 font-medium">Centro de Trabalho</label>
                    <input
                        id="center"
                        type="text"
                        placeholder='Centro (Ex: 1046)'
                        {...register("center")}
                        className="w-full border px-3 py-2 rounded bg-zinc-50"
                    />
                    {errors.center && <p className="text-red-500 text-sm mt-1">{errors.center.message}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block mb-1 font-medium">Senha</label>
                    <input
                        id="password"
                        type="password"
                        placeholder='Senha'
                        {...register("password")}
                        className="w-full border px-3 py-2 rounded bg-zinc-50"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`text-zinc-50 w-full mt-6 px-4 py-2 rounded transition-colors ${isSubmitting ? 'bg-zinc-600 cursor-not-allowed' : 'bg-zinc-950 hover:bg-zinc-900'
                        }`}
                >
                    {isSubmitting ? 'Aguarde...' : 'Criar Usuário'}
                </button>
            </form>
        </div>
    );
};

export default CreateUser;
