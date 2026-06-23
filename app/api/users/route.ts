import { NextResponse } from "next/server"
import { getAdminDb } from "@/app/lib/firebaseAdmin"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search')?.toLowerCase() || ''
        const permission = searchParams.get('permission') || ''
        const page = parseInt(searchParams.get('page') || '1', 10)
        const limit = parseInt(searchParams.get('limit') || '20', 10)

        const adminDb = getAdminDb()
        const snapshot = await adminDb.ref('users').once('value')

        if (!snapshot.exists()) {
            return NextResponse.json({ users: [], total: 0 })
        }

        const users: any[] = []
        snapshot.forEach((child) => {
            const data = child.val()
            const nameMatch = data.userName?.toLowerCase().includes(search)
            const regMatch = data.registrationNumber?.toLowerCase().includes(search)
            const permMatch = !permission || data.userPermission === permission

            if ((!search || nameMatch || regMatch) && permMatch) {
                users.push({
                    id: child.key,
                    registrationNumber: data.registrationNumber || '',
                    userName: data.userName || '',
                    userPermission: data.userPermission || '',
                    userLocalWork: data.userLocalWork || '',
                    center: data.center || '',
                    userRegistrationDate: data.userRegistrationDate || '',
                    userActive: data.userActive !== false,
                })
            }
        })

        users.sort((a, b) => a.userName.localeCompare(b.userName))
        const total = users.length
        const start = (page - 1) * limit
        const paginated = users.slice(start, start + limit)

        return NextResponse.json({ users: paginated, total, page, limit })
    } catch (err) {
        console.error("Users list error:", err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : String(err) },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { registrationNumber, userName, userPermission, userLocalWork, center, password } = body

        if (!registrationNumber || !userName || !userPermission || !center || !password) {
            return NextResponse.json(
                { error: "Campos obrigatórios: registrationNumber, userName, userPermission, center, password." },
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
                { status: 409 }
            )
        }

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const user = {
            registrationNumber,
            userName,
            userPermission,
            userLocalWork: userLocalWork || center,
            center,
            userRegistrationDate: Date.now().toString(),
            userPassword: hash,
            userActive: true,
        }

        const result = await adminDb.ref('users').push(user)

        return NextResponse.json({
            success: true,
            id: result.key,
            message: "Usuário criado com sucesso.",
        })
    } catch (err) {
        console.error("Users create error:", err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : String(err) },
            { status: 500 }
        )
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { id, registrationNumber, userName, userPermission, userLocalWork, center, password } = body

        if (!id) {
            return NextResponse.json({ error: "ID do usuário é obrigatório." }, { status: 400 })
        }

        const adminDb = getAdminDb()
        const updateData: Record<string, any> = {}

        if (registrationNumber !== undefined) updateData.registrationNumber = registrationNumber
        if (userName !== undefined) updateData.userName = userName
        if (userPermission !== undefined) updateData.userPermission = userPermission
        if (userLocalWork !== undefined) updateData.userLocalWork = userLocalWork
        if (center !== undefined) updateData.center = center
        if (password) {
            const salt = await bcrypt.genSalt(10)
            updateData.userPassword = await bcrypt.hash(password, salt)
        }

        await adminDb.ref(`users/${id}`).update(updateData)

        return NextResponse.json({ success: true, message: "Usuário atualizado." })
    } catch (err) {
        console.error("Users update error:", err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : String(err) },
            { status: 500 }
        )
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { id, userActive } = body

        if (!id) {
            return NextResponse.json({ error: "ID do usuário é obrigatório." }, { status: 400 })
        }

        const adminDb = getAdminDb()

        await adminDb.ref(`users/${id}`).update({
            userActive: userActive !== false,
        })

        const status = userActive !== false ? 'ativado' : 'desativado'
        return NextResponse.json({ success: true, message: `Usuário ${status} com sucesso.` })
    } catch (err) {
        console.error("Users status error:", err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : String(err) },
            { status: 500 }
        )
    }
}
