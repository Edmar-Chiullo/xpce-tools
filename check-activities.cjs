const { initializeApp, cert, getApps } = require("firebase-admin/app")
const { getDatabase } = require("firebase-admin/database")
const fs = require("fs")
const path = require("path")

// Load .env.local
const envPath = path.resolve(__dirname, ".env.local")
const envContent = fs.readFileSync(envPath, "utf-8")
const env = {}
for (const line of envContent.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const k = trimmed.slice(0, eqIdx)
    const v = trimmed.slice(eqIdx + 1)
    if (k && v) env[k] = v
}

const key = env.FIREBASE_ADMIN_KEY
if (!key) throw new Error("FIREBASE_ADMIN_KEY not set")

const existing = getApps()
const app = existing.length > 0
    ? existing[0]
    : initializeApp({
        credential: cert(JSON.parse(key)),
        databaseURL: env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })

const db = getDatabase(app)
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

async function main() {
    const action = process.argv[2] || "report"

    // Buscar todas as atividades ativas
    const activeSnap = await db.ref('activities')
        .orderByChild('activityState')
        .equalTo(true)
        .once('value')

    if (!activeSnap.exists()) {
        console.log("Nenhuma atividade ativa encontrada.")
        return
    }

    // Buscar todas as entradas existentes em active-activities
    const aaSnap = await db.ref('active-activities').once('value')
    const aaEntries = new Set()
    if (aaSnap.exists()) {
        aaSnap.forEach((userChild) => {
            const matricula = userChild.key
            userChild.forEach((actChild) => {
                aaEntries.add(`${matricula}:${actChild.key}`)
            })
        })
    }

    let orphanCount = 0
    let backfillCount = 0
    const now = Date.now()
    const backfillPromises = []

    console.log("=== ATIVIDADES ATIVAS ORFÃS (sem active-activities) ===\n")

    activeSnap.forEach((child) => {
        const val = child.val()
        const activityKey = child.key
        const userId = val.activityUserID || ''

        // only process activities with a valid numeric user ID (registration number)
        if (!userId || !/^\d{7}$/.test(String(userId))) return

        const aaKey = `${userId}:${activityKey}`
        if (aaEntries.has(aaKey)) return // already has active-activities entry

        orphanCount++
        const age = now - (val.activityInitDate || now)
        const ageDays = Math.floor(age / (24 * 60 * 60 * 1000))
        const isRecent = age < SEVEN_DAYS_MS

        console.log(`Key: ${activityKey}`)
        console.log(`  activityID: ${val.activityID}`)
        console.log(`  activityName: ${val.activityName}`)
        console.log(`  activityUserID: ${userId}`)
        console.log(`  age: ${ageDays} day(s)`)
        console.log(`  recent: ${isRecent ? 'YES' : 'NO'}`)
        console.log("---")

        if (action === "backfill" && isRecent) {
            const p = db.ref(`active-activities/${userId}/${activityKey}`).set({
                activityName: val.activityName || '',
            }).then(() => {
                backfillCount++
                console.log(`  → backfilled to active-activities/${userId}/${activityKey}`)
            }).catch(err => {
                console.error(`  → FAILED: ${err.message}`)
            })
            backfillPromises.push(p)
        }
    })

    if (orphanCount === 0) {
        console.log("Nenhuma atividade órfã encontrada. Tudo ok!")
    } else {
        console.log(`\nTotal de atividades órfãs: ${orphanCount}`)
        if (action === "backfill") {
            await Promise.all(backfillPromises)
            console.log(`Backfill concluído para ${backfillCount} atividades recentes.`)
            console.log("Execute novamente sem parâmetros para verificar se ainda há órfãs.")
        } else {
            console.log("\nPara backfill das atividades recentes, execute:")
            console.log("  node check-activities.cjs backfill")
        }
    }

    process.exit(0)
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
