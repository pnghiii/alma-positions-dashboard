import { signup, verifyRequestOrigin } from "@netlify/identity";
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
        const user = await signup(email, password);
        return json({ ok: true, user: { email: user.email } }, 201);
    } catch (error) {
        console.error("Identity signup failed:", error);
        const message = String(error?.message || "").toLowerCase();

        if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
            return json(
                { code: "USER_EXISTS", message: "Für diese E-Mail-Adresse besteht bereits ein Konto." },
                409
            );
        }

        return json(
            { code: "SIGNUP_FAILED", message: "Das Konto konnte nicht erstellt werden." },
            400
        );
    }
};
