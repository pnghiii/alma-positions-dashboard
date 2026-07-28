import { login, verifyRequestOrigin } from "@netlify/identity";
import { isAllowedEmail } from "./_lib/allowed-emails.mjs";
import { json, methodNotAllowed, readCredentials } from "./_lib/http.mjs";

export default async (request) => {
    if (request.method !== "POST") return methodNotAllowed();

    try {
        verifyRequestOrigin(request);
    } catch {
        return json({ code: "FORBIDDEN", message: "Anfrage abgelehnt." }, 403);
    }

    const credentials = await readCredentials(request);
    if (credentials.error) return credentials.error;

    const { email, password } = credentials;

    if (!isAllowedEmail(email)) {
        return json(
            {
                code: "EMAIL_NOT_ALLOWED",
                message: "Diese E-Mail-Adresse ist nicht für den Partnerzugang freigeschaltet."
            },
            403
        );
    }

    try {
        const user = await login(email, password);
        return json({ ok: true, user: { email: user.email } });
    } catch (error) {
        console.error("Identity login failed:", error);
        return json(
            { code: "INVALID_CREDENTIALS", message: "E-Mail-Adresse oder Passwort ist nicht korrekt." },
            401
        );
    }
};
