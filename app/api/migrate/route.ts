import { NextResponse } from "next/server"
import { getAdminDb } from "@/app/lib/firebaseAdmin"

interface PreviewEntry {
    date: string
    center: string
    activityName: string
    activityId: string
    tasksCount: number
}

interface ScanResult {
    entries: PreviewEntry[]
    totalActivities: number
    totalTasks: number
    dates: string[]
    centers: string[]
}

async function scanOldData(): Promise<ScanResult> {
    const adminDb = getAdminDb()
    const rootSnap = await adminDb.ref('/').once('value')
    const entries: PreviewEntry[] = []
    const datesSet = new Set<string>()
    const centersSet = new Set<string>()
    let totalTasks = 0

    if (!rootSnap.exists()) {
        return { entries, totalActivities: 0, totalTasks: 0, dates: [], centers: [] }
    }

    const rootVal = rootSnap.val() as Record<string, any>

    for (const [year, yearVal] of Object.entries(rootVal)) {
        for (const [monthKey, monthVal] of Object.entries(yearVal as Record<string, any>)) {
            for (const [day, dayVal] of Object.entries(monthVal as Record<string, any>)) {
                const month = monthKey.replace(year, '')
                const activityDate = `${year}-${month}-${day}`
                datesSet.add(activityDate)

                for (const [center, centerVal] of Object.entries(dayVal as Record<string, any>)) {
                    const pce = (centerVal as any)?.pce as Record<string, any> | undefined
                    if (!pce) continue
                    centersSet.add(center)

                    for (const [activityName, actNameVal] of Object.entries(pce)) {
                        for (const [activityId, actIdVal] of Object.entries(actNameVal as Record<string, any>)) {
                            const activity = (actIdVal as any)?.activity as Record<string, any> | undefined
                            if (!activity) continue

                            const tasks = (activity as any)?.activityTasks as Record<string, any> | undefined
                            let tasksCount = 0
                            if (tasks) {
                                for (const [, taskVal] of Object.entries(tasks)) {
                                    const taskData = (taskVal as any)?.activity as Record<string, any> | undefined
                                    if (taskData) tasksCount++
                                }
                            }

                            entries.push({
                                date: activityDate,
                                center,
                                activityName: activity.activityName || activityName,
                                activityId: activity.activityID || activityId,
                                tasksCount,
                            })
                            totalTasks += tasksCount
                        }
                    }
                }
            }
        }
    }

    entries.sort((a, b) => a.date.localeCompare(b.date) || a.center.localeCompare(b.center))

    return {
        entries,
        totalActivities: entries.length,
        totalTasks,
        dates: Array.from(datesSet).sort(),
        centers: Array.from(centersSet).sort(),
    }
}

function findDayInRoot(
    rootVal: Record<string, any>,
    targetDate: string
): Record<string, any> | null {
    const [year, month, day] = targetDate.split('-')
    const yearVal = (rootVal as any)?.[year] as Record<string, any> | undefined
    if (!yearVal) return null

    const monthVal = (yearVal as any)?.[`${year}${month}`] ?? (yearVal as any)?.[month]
    if (!monthVal) return null

    return (monthVal as any)?.[day] as Record<string, any> | null
}

async function migrateDate(
    adminDb: ReturnType<typeof getAdminDb>,
    dayVal: Record<string, any>,
    activityDate: string
): Promise<{ activities: number; tasks: number }> {
    const batch: Record<string, any> = {}
    let activitiesMigrated = 0
    let tasksMigrated = 0

    for (const [center, centerVal] of Object.entries(dayVal)) {
        const pce = (centerVal as any)?.pce as Record<string, any> | undefined
        if (!pce) continue

        for (const [activityName, actNameVal] of Object.entries(pce)) {
            for (const [activityId, actIdVal] of Object.entries(actNameVal as Record<string, any>)) {
                const activity = (actIdVal as any)?.activity as Record<string, any> | undefined
                if (!activity) continue

                const activityDateCenter = `${activityDate}_${center}`
                const activityDateCenterID = `${activityDateCenter}_${activityId}`
                const activityKey = adminDb.ref('activities').push().key!

                batch[`activities/${activityKey}`] = {
                    activityID: activity.activityID || activityId,
                    activityName: activity.activityName || activityName,
                    activityUserCenter: activity.activityUserCenter || center,
                    activityUserID: activity.activityUserID || '',
                    activtyUserName: activity.activtyUserName || '',
                    activityState: activity.activityState ?? true,
                    activityLocalWork: activity.activityLocalWork || '',
                    activityStreet: activity.activityStreet || '',
                    activitySide: activity.activitySide || '',
                    activityInitDate: activity.activityInitDate || Date.now(),
                    activityFinishDate: activity.activityFinishDate || activity.activityFinisDate || 0,
                    activityDate,
                    activityDateCenter,
                    activityDateCenterID,
                }
                activitiesMigrated++

                const tasks = (activity as any)?.activityTasks as Record<string, any> | undefined
                if (tasks) {
                    for (const [, taskVal] of Object.entries(tasks)) {
                        const taskData = (taskVal as any)?.activity as Record<string, any> | undefined
                        if (!taskData) continue

                        const taskKey = adminDb.ref('tasks').push().key!
                        const task: Record<string, any> = {
                            activityRef: activityKey,
                            activityID: taskData.activityID || activityId,
                            activityName: taskData.activityName || activityName,
                            activityUserCenter: taskData.activityUserCenter || center,
                            activityDate,
                            taskType: '',
                            loadAddress: taskData.loadAddress || null,
                            loadProduct: taskData.loadProduct || null,
                            loadQuant: taskData.loadQuant || null,
                            loadValid: taskData.loadValid || null,
                            validMaster: taskData.validMaster || null,
                            createdAt: taskData.activityDate || Date.now(),
                        }

                        if (taskData.loadAddress && !taskData.loadProduct && !taskData.validMaster) {
                            task.taskType = 'aereo-vazio'
                        } else if (taskData.validMaster) {
                            task.taskType = 'valida-master-expedicao'
                        } else if (taskData.loadProduct && taskData.loadAddress) {
                            task.taskType = 'validacao-produto-endereco'
                        } else if (taskData.loadProduct && taskData.loadQuant) {
                            task.taskType = activityName.toLowerCase().includes('quarentena')
                                ? 'quarentena-fracionada'
                                : 'rotativo-picking'
                        }

                        batch[`tasks/${taskKey}`] = task
                        tasksMigrated++
                    }
                }
            }
        }
    }

    if (Object.keys(batch).length > 0) {
        await adminDb.ref().update(batch)
    }

    return { activities: activitiesMigrated, tasks: tasksMigrated }
}

export async function GET() {
    try {
        const result = await scanOldData()
        return NextResponse.json(result)
    } catch (err) {
        console.error("Migrate scan error:", err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : String(err) },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}))
        const { date, dates } = body as { date?: string; dates?: string[] }

        const adminDb = getAdminDb()

        if (date) {
            const rootSnap = await adminDb.ref('/').once('value')
            if (!rootSnap.exists()) {
                return NextResponse.json({ error: "Nenhum dado encontrado." }, { status: 400 })
            }
            const rootVal = rootSnap.val() as Record<string, any>
            const dayVal = findDayInRoot(rootVal, date)
            if (!dayVal) {
                return NextResponse.json({ error: `Nenhum dado para a data ${date}.` }, { status: 404 })
            }
            const result = await migrateDate(adminDb, dayVal, date)
            return NextResponse.json({ success: true, ...result, date })
        }

        if (dates && dates.length > 0) {
            const rootSnap = await adminDb.ref('/').once('value')
            if (!rootSnap.exists()) {
                return NextResponse.json({ error: "Nenhum dado encontrado." }, { status: 400 })
            }
            const rootVal = rootSnap.val() as Record<string, any>

            let totalActivities = 0
            let totalTasks = 0

            for (const d of dates) {
                const dayVal = findDayInRoot(rootVal, d)
                if (!dayVal) continue
                const result = await migrateDate(adminDb, dayVal, d)
                totalActivities += result.activities
                totalTasks += result.tasks
            }

            return NextResponse.json({
                success: true,
                activitiesMigrated: totalActivities,
                tasksMigrated: totalTasks,
            })
        }

        const scanResult = await scanOldData()
        if (scanResult.totalActivities === 0) {
            return NextResponse.json({ error: "Nenhum dado encontrado para migrar." }, { status: 400 })
        }

        const rootSnap = await adminDb.ref('/').once('value')
        const rootVal = rootSnap.val() as Record<string, any>

        let totalActivities = 0
        let totalTasks = 0

        for (const d of scanResult.dates) {
            const dayVal = findDayInRoot(rootVal, d)
            if (!dayVal) continue
            const result = await migrateDate(adminDb, dayVal, d)
            totalActivities += result.activities
            totalTasks += result.tasks
        }

        return NextResponse.json({
            success: true,
            activitiesMigrated: totalActivities,
            tasksMigrated: totalTasks,
        })
    } catch (err) {
        console.error("Migrate error:", err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : String(err) },
            { status: 500 }
        )
    }
}
