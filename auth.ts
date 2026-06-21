import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            registrationNumber: string
            name: string
            permission: string
            center: string
            localWork: string
        }
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                registrationNumber: { label: "Matrícula", type: "text" },
                password: { label: "Senha", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.registrationNumber || !credentials?.password) return null

                const { registrationNumber, password } = credentials as {
                    registrationNumber: string
                    password: string
                }

                const { getAdminDb } = await import("@/app/lib/firebaseAdmin")
                const adminDb = getAdminDb()
                const snapshot = await adminDb
                    .ref('users')
                    .orderByChild('registrationNumber')
                    .equalTo(registrationNumber)
                    .once('value')

                if (!snapshot.exists()) return null

                let userKey = ''
                let userData: Record<string, any> = {}
                snapshot.forEach((child) => {
                    userKey = child.key!
                    userData = child.val()
                })

                const valid = await bcrypt.compare(password, userData.userPassword)
                if (!valid) return null

                return {
                    id: userKey,
                    name: userData.userName,
                    registrationNumber: userData.registrationNumber,
                    permission: userData.userPermission,
                    center: userData.center,
                    localWork: userData.userLocalWork,
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 10 * 60,
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.permission = (user as any).permission
                token.center = (user as any).center
                token.localWork = (user as any).localWork
                token.registrationNumber = (user as any).registrationNumber
            }
            return token
        },
        async session({ session, token }) {
            session.user.id = token.sub!
            session.user.permission = token.permission as string
            session.user.center = token.center as string
            session.user.localWork = token.localWork as string
            session.user.registrationNumber = token.registrationNumber as string
            return session
        },
    },
})
