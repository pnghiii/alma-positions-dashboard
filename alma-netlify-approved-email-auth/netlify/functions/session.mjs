import { getUser, logout } from "@netlify/identity";
import { isAllowedEmail } from "./_lib/allowed-emails.mjs";
import { json, methodNotAllowed } from "./_lib/http.mjs";

export default async (request) => {
    if (request.method !== "GET") return methodNotAllowed();

    try {
        const user = await getUser();

        if (!user) {
            return json({ user: null });
        }

        if (!isAllowedEmail(user.email)) {
            await logout();
            return json({ user: null });
        }

        return json({ user: { email: user.email } });
    } catch (error) {
        console.error("Identity session check failed:", error);
        return json({ user: null });
    }
};
