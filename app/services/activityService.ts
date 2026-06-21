import { ref, push, update, query, orderByChild, equalTo, get } from "firebase/database"
import { db } from "@/app/firebasekey/keyapi"
import { fullDate } from "@/app/utils/ger-dates"

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
    const { activityDate, activityDateCenter, activityDateCenterID } = makeDateCenterID(activity, date)

    const q = query(ref(db, 'activities'), orderByChild('activityDateCenterID'), equalTo(activityDateCenterID))
    const snap = await get(q)

    if (snap.exists()) {
        let key = ''
        snap.forEach((child) => { key = child.key! })
        return key
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

    const result = await push(ref(db, 'activities'), newActivity)
    return result.key!
}

export async function finishActivity(
    activity: { activityUserCenter: string; activityID: string; activityName: string },
    date?: string
): Promise<boolean> {
    const { activityDateCenterID } = makeDateCenterID(activity, date)

    const q = query(ref(db, 'activities'), orderByChild('activityDateCenterID'), equalTo(activityDateCenterID))
    const snap = await get(q)

    if (!snap.exists()) return false

    let key = ''
    snap.forEach((child) => { key = child.key! })

    await update(ref(db), {
        [`activities/${key}/activityState`]: false,
        [`activities/${key}/activityFinishDate`]: Date.now(),
    })

    return true
}

export async function createTask(
    activityRef: string,
    taskType: string,
    data: Record<string, any>
): Promise<string> {
    const task = {
        activityRef,
        activityID: data.activityID || '',
        activityName: data.activityName || '',
        activityUserCenter: data.activityUserCenter || '',
        activityDate: getTodayISO(),
        taskType,
        loadAddress: data.loadAddress || null,
        loadProduct: data.loadProduct || null,
        loadQuant: data.loadQuant || null,
        loadValid: data.loadValid || null,
        validMaster: data.validMaster || null,
        createdAt: Date.now(),
    }

    const result = await push(ref(db, 'tasks'), task)
    return result.key!
}
