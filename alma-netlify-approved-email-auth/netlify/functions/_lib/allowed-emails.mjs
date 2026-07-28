export function normaliseEmail(value) {
    return String(value || "").trim().toLowerCase();
}

export function getAllowedEmails() {
    const raw =
        (typeof Netlify !== "undefined" && Netlify.env)
            ? Netlify.env.get("ALLOWED_PARTNER_EMAILS")
            : process.env.ALLOWED_PARTNER_EMAILS;

    return new Set(
        String(raw || "")
            .split(/[\n,;]+/)
            .map(normaliseEmail)
            .filter(Boolean)
    );
}

export function isAllowedEmail(email) {
    const normalised = normaliseEmail(email);
    return Boolean(normalised) && getAllowedEmails().has(normalised);
}
