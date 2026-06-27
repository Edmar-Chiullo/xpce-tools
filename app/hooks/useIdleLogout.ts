'use client'

import { useEffect, useRef } from "react"
import { signOut } from "next-auth/react"

const IDLE_TIMEOUT = 5 * 60 * 1000
const EVENTS = ['mousemove', 'keydown', 'click', 'touchstart', 'scan']

export function useIdleLogout() {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        function resetTimer() {
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => {
                signOut({ redirectTo: '/login' })
            }, IDLE_TIMEOUT)
        }

        resetTimer()

        for (const event of EVENTS) {
            window.addEventListener(event, resetTimer)
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            for (const event of EVENTS) {
                window.removeEventListener(event, resetTimer)
            }
        }
    }, [])
}
