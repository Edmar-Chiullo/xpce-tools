import { ref, push, query, orderByChild, equalTo, get } from "firebase/database"
import { db } from "@/app/firebasekey/keyapi"
import bcrypt from "bcryptjs"
import { UserProps } from "@/app/types/TasksProps"

export async function createUser(data: {
    registrationNumber: string
    userName: string
    userPermission: string
    userLocalWork: string
    center: string
    password: string
}): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(data.password, salt)

    const user = {
        registrationNumber: data.registrationNumber,
        userName: data.userName,
        userPermission: data.userPermission,
        userLocalWork: data.userLocalWork,
        userRegistrationDate: Date.now().toString(),
        userPassword: hash,
        center: data.center,
    }

    const result = await push(ref(db, 'users'), user)
    return result.key!
}

export async function findUserByRegistration(registrationNumber: string): Promise<{ key: string; data: UserProps } | null> {
    const q = query(ref(db, 'users'), orderByChild('registrationNumber'), equalTo(registrationNumber))
    const snapshot = await get(q)
    if (!snapshot.exists()) return null

    let result: { key: string; data: UserProps } | null = null
    snapshot.forEach((child) => {
        result = { key: child.key!, data: child.val() as UserProps }
    })
    return result
}
