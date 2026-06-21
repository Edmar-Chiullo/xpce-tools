import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getDatabase } from "firebase-admin/database"

function getServiceAccount() {
    const key = process.env.FIREBASE_ADMIN_KEY
    if (!key) {
        throw new Error(
            "FIREBASE_ADMIN_KEY não configurada. Gere uma chave de conta de serviço em " +
            "Firebase Console > Project Settings > Service Accounts > Generate New Private Key " +
            "e adicione o JSON como variável de ambiente FIREBASE_ADMIN_KEY no .env.local"
        )
    }
    return JSON.parse(key)
}

export function getAdminDb() {
    const existing = getApps()
    const app = existing.length > 0
        ? existing[0]
        : initializeApp({
            credential: cert(getServiceAccount()),
            databaseURL: getDbUrl(),
        })

    return getDatabase(app)
}

function getDbUrl() {
    const url = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    if (!url) {
        throw new Error("NEXT_PUBLIC_FIREBASE_DATABASE_URL não configurada no .env.local")
    }
    return url
}
