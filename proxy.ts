import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function proxy(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
        secureCookie: req.nextUrl.protocol === 'https:',
    })
    if (!token) {
        const loginUrl = new URL("/login", req.url)
        loginUrl.searchParams.set("callbackUrl", req.url)
        return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
}

export const config = {
    matcher: ["/pages/:path*"],
}
