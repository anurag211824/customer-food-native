import {
    COOKIE_MAX_AGE,
    COOKIE_NAME,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    JWT_SECRET
} from "@/constant";
import { SignJWT } from "jose";

export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code) {
            return Response.json({ error: "No code provided" }, { status: 400 });
        }

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID!,
                client_secret: GOOGLE_CLIENT_SECRET!,
                redirect_uri: GOOGLE_REDIRECT_URI,
                grant_type: "authorization_code",
            }).toString(),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error("Token exchange failed:", tokenData);
            return Response.json(
                { error: "Failed to exchange token", details: tokenData },
                { status: 500 },
            );
        }

        const userInfoResponse = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                },
            },
        );

        const userInfo = await userInfoResponse.json();

        if (!userInfoResponse.ok) {
            console.error("User info fetch failed:", userInfo);
            return Response.json(
                { error: "Failed to fetch user info", details: userInfo },
                { status: 500 },
            );
        }

        // 3. Generate your own session token (JWT)
        const secret = new TextEncoder().encode(JWT_SECRET || "default_dev_secret");
        const token = await new SignJWT({
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("30d") // Match refresh token expiry for now
            .sign(secret);

        // 4. Set cookies if needed
        const cookieStore = `Max-Age=${COOKIE_MAX_AGE}; Path=/; HttpOnly; SameSite=Lax`;

        return Response.json(
            {
                user: userInfo,
                token, // Return token for Mobile/SecureStore usage
            },
            {
                headers: {
                    "Set-Cookie": `${COOKIE_NAME}=${token}; ${cookieStore}`,
                },
            },
        );
    } catch (error) {
        console.error("Token exchange error:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
