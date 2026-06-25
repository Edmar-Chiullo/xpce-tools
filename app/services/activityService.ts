import { ref, push, update, query, orderByChild, equalTo, get } from "firebase/database"
import { db } from "@/app/firebasekey/keyapi"

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

export async function findOrCreateActivity(
    activity: { activityUserCenter: string; activityID: string; activityName: string; activtyUserName?: string; activityUserID?: string; activityLocalWork?: string },
    date?: string
): Promise<string> {
    const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'findOrCreate', activity, date }),
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Falha ao criar atividade')
    }
    const data = await res.json()
    return data.key
}

export async function finishActivity(
    activity: { activityUserCenter: string; activityID: string; activityName: string; _firebaseKey?: string; activityUserID?: string },
    date?: string
): Promise<boolean> {
    const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'finish', activity, date, _firebaseKey: activity._firebaseKey, activityUserID: activity.activityUserID }),
    })
    if (!res.ok) return false
    const data = await res.json()
    return data.success === true
}

export async function createTask(
    activityRef: string,
    taskType: string,
    data: Record<string, any>
): Promise<string> {
    const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityRef, taskType, data }),
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Falha ao criar task')
    }
    const result = await res.json()
    return result.key
}

export async function deleteActivity(activityKey: string, userId?: string): Promise<boolean> {
    const params = new URLSearchParams({ key: activityKey })
    if (userId) params.set('userId', userId)
    const res = await fetch(`/api/activities?${params.toString()}`, {
        method: 'DELETE',
    })
    if (!res.ok) return false
    const data = await res.json()
    return data.success === true
}
