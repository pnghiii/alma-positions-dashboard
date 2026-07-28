import { logout, verifyRequestOrigin } from "@netlify/identity";
import { json, methodNotAllowed } from "./_lib/http.mjs";

export default async (request) => {
    if (request.method !== "POST") return methodNotAllowed();

    try {
        verifyRequestOrigin(request);
        await logout();
        return json({ ok: true });
    } catch (error) {
        console.error("Identity logout failed:", error);
        return json({ code: "LOGOUT_FAILED", message: "Abmeldung fehlgeschlagen." }, 400);
    }
};
