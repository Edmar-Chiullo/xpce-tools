import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/app/lib/firebaseAdmin"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { activityRef, taskType, data } = body

        const adminDb = getAdminDb()

        const task = {
            activityRef,
            activityID: data.activityID || '',
            activityName: data.activityName || '',
            activityUserCenter: data.activityUserCenter || '',
            activityDate: data.activityDate || new Date().toISOString().slice(0, 10),
            taskType,
            loadAddress: data.loadAddress || null,
            loadProduct: data.loadProduct || null,
            loadQuant: data.loadQuant || null,
            loadValid: data.loadValid || null,
            validMaster: data.validMaster || null,
            createdAt: Date.now(),
        }

        const result = await adminDb.ref('tasks').push(task)
        return NextResponse.json({ key: result.key! })
    } catch (erro) {
        console.error('API tasks error:', erro)
        return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
    }
}
