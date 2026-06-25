import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/app/lib/firebaseAdmin"

function getTodayISO() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function makeDateCenterID(activity: { activityUserCenter: string; activityID: string; activityName: string }, date?: string) {
    const d = date || getTodayISO()
    const dateCenter = `${d}_${activity.activityUserCenter}`
    const dateCenterID = `${dateCenter}_${activity.activityID}`
    return { activityDate: d, activityDateCenter: dateCenter, activityDateCenterID: dateCenterID }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, activity, date } = body

        if (action === 'findOrCreate') {
            const { activityDate, activityDateCenter, activityDateCenterID } = makeDateCenterID(activity, date)

            const adminDb = getAdminDb()
            const snap = await adminDb
                .ref('activities')
                .orderByChild('activityDateCenterID')
                .equalTo(activityDateCenterID)
                .once('value')

            if (snap.exists()) {
                let key = ''
                snap.forEach((child) => { key = child.key! })
                // garantir que o nó active-activities existe para esta atividade
                if (activity.activityUserID) {
                    await adminDb.ref(`active-activities/${activity.activityUserID}/${key}`).set({
                        activityName: activity.activityName,
                    })
                }
                return NextResponse.json({ key })
            }

            const newActivity = {
                activityID: activity.activityID,
                activityName: activity.activityName,
                activityUserCenter: activity.activityUserCenter,
                activityUserID: activity.activityUserID || '',
                activtyUserName: activity.activtyUserName || '',
                activityState: true,
                activityLocalWork: activity.activityLocalWork || '',
                activityStreet: '',
                activitySide: '',
                activityInitDate: Date.now(),
                activityFinishDate: 0,
                activityDate,
                activityDateCenter,
                activityDateCenterID,
            }

            const result = await adminDb.ref('activities').push(newActivity)
            const activityKey = result.key!

            // registrar no nó de atividades ativas para busca rápida por matrícula
            if (activity.activityUserID) {
                await adminDb.ref(`active-activities/${activity.activityUserID}/${activityKey}`).set({
                    activityName: activity.activityName,
                })
            }

            return NextResponse.json({ key: activityKey })
        }

        if (action === 'finish') {
            const { activityDateCenterID } = makeDateCenterID(activity, date)
            const activityKey = body._firebaseKey || ''
            const userId = body.activityUserID || ''

            const adminDb = getAdminDb()
            const key = activityKey || await new Promise<string>((resolve, reject) => {
                adminDb
                    .ref('activities')
                    .orderByChild('activityDateCenterID')
                    .equalTo(activityDateCenterID)
                    .once('value', (snap) => {
                        if (!snap.exists()) {
                            reject(new Error('Atividade não encontrada'))
                            return
                        }
                        let k = ''
                        snap.forEach((child) => { k = child.key! })
                        resolve(k)
                    }, reject)
            })

            await adminDb.ref(`activities/${key}`).update({
                activityState: false,
                activityFinishDate: Date.now(),
            })

            // remover do nó de atividades ativas
            if (userId) {
                await adminDb.ref(`active-activities/${userId}/${key}`).remove()
            }

            return NextResponse.json({ success: true })
        }

        if (action === 'claim') {
            const { firebaseKey, userId, userName } = body
            if (!firebaseKey || !userId) {
                return NextResponse.json({ success: false, message: 'firebaseKey e userId obrigatórios' }, { status: 400 })
            }

            const adminDb = getAdminDb()

            // ler activityName da atividade antes de alterar
            const activitySnap = await adminDb.ref(`activities/${firebaseKey}`).once('value')
            const activityName = activitySnap.val()?.activityName || ''

            await adminDb.ref(`activities/${firebaseKey}`).update({
                activityUserID: userId,
                activtyUserName: userName || '',
            })

            // registrar no nó de atividades ativas
            await adminDb.ref(`active-activities/${userId}/${firebaseKey}`).set({
                activityName,
            })

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ success: false, message: 'Ação inválida' }, { status: 400 })
    } catch (erro) {
        console.error('API activities error:', erro)
        return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const activityKey = searchParams.get('key')
        const userId = searchParams.get('userId') || ''
        if (!activityKey) {
            return NextResponse.json({ success: false, message: 'key é obrigatório' }, { status: 400 })
        }

        const adminDb = getAdminDb()

        const tasksSnap = await adminDb
            .ref('tasks')
            .orderByChild('activityRef')
            .equalTo(activityKey)
            .once('value')

        if (tasksSnap.exists()) {
            const promises: Promise<void>[] = []
            tasksSnap.forEach((child) => {
                promises.push(child.ref.remove())
            })
            await Promise.all(promises)
        }

        await adminDb.ref(`activities/${activityKey}`).remove()

        // remover do nó de atividades ativas
        if (userId) {
            await adminDb.ref(`active-activities/${userId}/${activityKey}`).remove()
        }

        return NextResponse.json({ success: true })
    } catch (erro) {
        console.error('API activities DELETE error:', erro)
        return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
    }
}
