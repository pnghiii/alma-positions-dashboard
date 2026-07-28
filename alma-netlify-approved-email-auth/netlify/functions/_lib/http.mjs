export function json(data, status = 200) {
    return Response.json(data, {
        status,
        headers: {
            "Cache-Control": "no-store"
        }
    });
}

export async function readCredentials(request) {
    let body;

    try {
        body = await request.json();
    } catch {
        return { error: json({ code: "INVALID_INPUT", message: "Ungültige Anfrage." }, 400) };
    }

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !email.includes("@")) {
        return {
            error: json(
                { code: "INVALID_INPUT", message: "Bitte geben Sie eine gültige E-Mail-Adresse ein." },
                400
            )
        };
    }

    if (password.length < 8) {
        return {
            error: json(
                { code: "INVALID_INPUT", message: "Das Passwort muss mindestens 8 Zeichen enthalten." },
                400
            )
        };
    }

    return { email, password };
}

export function methodNotAllowed() {
    return json({ code: "METHOD_NOT_ALLOWED", message: "Methode nicht erlaubt." }, 405);
}
