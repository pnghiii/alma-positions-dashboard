(() => {
    "use strict";

    const API = "/.netlify/functions";

    const content = document.getElementById("protected-content");
    const gate = document.getElementById("auth-gate");
    const loading = document.getElementById("auth-loading");
    const panel = document.getElementById("auth-panel");
    const heading = document.getElementById("auth-heading");
    const description = document.getElementById("auth-description");
    const form = document.getElementById("auth-form");
    const emailInput = document.getElementById("auth-email");
    const passwordInput = document.getElementById("auth-password");
    const confirmField = document.getElementById("auth-confirm-field");
    const confirmInput = document.getElementById("auth-password-confirm");
    const submitButton = document.getElementById("auth-submit");
    const modeToggle = document.getElementById("auth-mode-toggle");
    const message = document.getElementById("auth-message");
    const session = document.getElementById("auth-session");
    const sessionEmail = document.getElementById("auth-user-email");
    const logoutButton = document.getElementById("auth-logout");

    if (!content || !gate || !form) return;

    let mode = "login";

    const setBusy = (busy, label) => {
        submitButton.disabled = busy;
        if (label) submitButton.textContent = label;
    };

    const showMessage = (text, type = "error") => {
        message.textContent = text;
        message.classList.toggle("is-success", type === "success");
        message.hidden = false;
    };

    const clearMessage = () => {
        message.textContent = "";
        message.classList.remove("is-success");
        message.hidden = true;
    };

    const parseResponse = async (response) => {
        let body = {};
        try {
            body = await response.json();
        } catch {
            body = {};
        }

        if (!response.ok) {
            const error = new Error(body.message || "Die Anfrage konnte nicht abgeschlossen werden.");
            error.status = response.status;
            error.code = body.code;
            throw error;
        }

        return body;
    };

    const callFunction = async (name, options = {}) => {
        const response = await fetch(`${API}/${name}`, {
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });
        return parseResponse(response);
    };

    const setMode = (nextMode) => {
        mode = nextMode;
        clearMessage();
        form.reset();

        const isSignup = mode === "signup";
        confirmField.hidden = !isSignup;
        confirmInput.required = isSignup;

        if (isSignup) {
            heading.textContent = "Zugang erstellen";
            description.textContent =
                "Verwenden Sie die von ALMA freigeschaltete E-Mail-Adresse und legen Sie Ihr Passwort fest.";
            passwordInput.autocomplete = "new-password";
            submitButton.textContent = "Konto erstellen";
            modeToggle.textContent = "Bereits registriert? Anmelden";
        } else {
            heading.textContent = "Willkommen zurück";
            description.textContent =
                "Melden Sie sich an, um die offenen Positionen einzusehen.";
            passwordInput.autocomplete = "current-password";
            submitButton.textContent = "Anmelden";
            modeToggle.textContent = "Noch kein Konto? Zugang erstellen";
        }

        window.setTimeout(() => emailInput.focus(), 0);
    };

    const showGuest = () => {
        content.hidden = true;
        gate.hidden = false;
        loading.hidden = true;
        panel.hidden = false;
        session.hidden = true;
        sessionEmail.textContent = "";
        document.body.style.overflow = "hidden";
        setMode("login");
    };

    const showAuthenticated = (user) => {
        content.hidden = false;
        gate.hidden = true;
        session.hidden = false;
        sessionEmail.textContent = user?.email || "Angemeldet";
        document.body.style.overflow = "";
    };

    const mapError = (error, action) => {
        if (error.code === "EMAIL_NOT_ALLOWED" || error.status === 403) {
            return "Diese E-Mail-Adresse ist nicht für den Partnerzugang freigeschaltet. Bitte kontaktieren Sie ALMA.";
        }

        if (error.code === "USER_EXISTS" || error.status === 409) {
            return "Für diese E-Mail-Adresse besteht bereits ein Konto. Bitte wechseln Sie zu „Anmelden“.";
        }

        if (error.code === "INVALID_CREDENTIALS" || error.status === 401) {
            return action === "login"
                ? "E-Mail-Adresse oder Passwort ist nicht korrekt."
                : "Das Konto konnte nicht erstellt werden.";
        }

        if (error.code === "INVALID_INPUT") {
            return error.message;
        }

        return error.message || "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.";
    };

    modeToggle.addEventListener("click", () => {
        setMode(mode === "login" ? "signup" : "login");
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearMessage();

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        if (!email || !emailInput.checkValidity()) {
            showMessage("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
            emailInput.focus();
            return;
        }

        if (password.length < 8) {
            showMessage("Das Passwort muss mindestens 8 Zeichen enthalten.");
            passwordInput.focus();
            return;
        }

        if (mode === "signup" && password !== confirmInput.value) {
            showMessage("Die beiden Passwörter stimmen nicht überein.");
            confirmInput.focus();
            return;
        }

        try {
            if (mode === "signup") {
                setBusy(true, "Konto wird erstellt …");
                await callFunction("signup", {
                    method: "POST",
                    body: JSON.stringify({ email, password })
                });

                setBusy(true, "Anmeldung wird gestartet …");
                const result = await callFunction("login", {
                    method: "POST",
                    body: JSON.stringify({ email, password })
                });
                showAuthenticated(result.user);
            } else {
                setBusy(true, "Anmeldung läuft …");
                const result = await callFunction("login", {
                    method: "POST",
                    body: JSON.stringify({ email, password })
                });
                showAuthenticated(result.user);
            }
        } catch (error) {
            console.error("Authentication error:", error);
            showMessage(mapError(error, mode));
            setBusy(false, mode === "signup" ? "Konto erstellen" : "Anmelden");
        }
    });

    logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;
        logoutButton.textContent = "Abmeldung …";

        try {
            await callFunction("logout", {
                method: "POST",
                body: JSON.stringify({})
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            logoutButton.disabled = false;
            logoutButton.textContent = "Abmelden";
            showGuest();
        }
    });

    const initialise = async () => {
        content.hidden = true;
        gate.hidden = false;
        loading.hidden = false;
        panel.hidden = true;
        session.hidden = true;
        document.body.style.overflow = "hidden";

        try {
            const result = await callFunction("session", {
                method: "GET",
                headers: {}
            });

            if (result.user) {
                showAuthenticated(result.user);
            } else {
                showGuest();
            }
        } catch (error) {
            console.error("Session check failed:", error);
            showGuest();
            showMessage(
                "Der Anmeldedienst konnte nicht erreicht werden. Bitte laden Sie die Seite erneut."
            );
        }
    };

    initialise();
})();
