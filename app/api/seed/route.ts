import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getAdminDb } from "@/app/lib/firebaseAdmin"

export async function GET() {
    return NextResponse.json({ hasUsers: false })
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { registrationNumber, name, center, password } = body

        if (!registrationNumber || !name || !center || !password) {
            return NextResponse.json(
                { error: "Todos os campos são obrigatórios." },
                { status: 400 }
            )
        }

        if (!/^\d{7}$/.test(registrationNumber)) {
            return NextResponse.json(
                { error: "Matrícula deve ter exatamente 7 dígitos." },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Senha deve ter pelo menos 6 caracteres." },
                { status: 400 }
            )
        }

        const adminDb = getAdminDb()
        const existing = await adminDb
            .ref('users')
            .orderByChild('registrationNumber')
            .equalTo(registrationNumber)
            .once('value')

        if (existing.exists()) {
            return NextResponse.json(
                { error: "Matrícula já cadastrada." },
                { status: 400 }
            )
        }

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        await adminDb.ref('users').push({
            registrationNumber,
            userName: name,
            userPermission: 'admin',
            userLocalWork: center,
            userRegistrationDate: Date.now().toString(),
            userPassword: hash,
            center,
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Seed error:", err)
        return NextResponse.json(
            { error: "Erro interno do servidor." },
            { status: 500 }
        )
    }
}
