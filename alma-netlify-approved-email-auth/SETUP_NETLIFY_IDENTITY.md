# ALMA Partner Login — setup

## Authentication behaviour

- Registration uses the custom ALMA form, not the standard Netlify Identity widget.
- Only exact email addresses in `ALLOWED_PARTNER_EMAILS` may register or log in.
- Approved users create their own password directly on the dashboard.
- No email confirmation is required after signup.
- Removing an email from the allowlist prevents future login.

## Netlify settings

### 1. Registration must be Open

Go to:

`Project configuration → Identity → Registration → Registration preferences → Configure`

Choose:

`Open`

The server-side allowlist function now decides who is permitted. Do not use Invite only for this flow.

### 2. Disable email confirmation

Go to:

`Project configuration → Identity → Emails → Confirmation template → Configure`

Enable the option that allows Identity users to sign up without verifying their email address.

### 3. Add the approved-email allowlist

Go to:

`Project configuration → Environment variables → Add a variable`

Key:

`ALLOWED_PARTNER_EMAILS`

Example value:

`partner1@example.com,partner2@example.com,school@example.de`

Use commas, semicolons, or separate lines. Matching is case-insensitive.

If Netlify asks for a scope, include `Functions`.

### 4. Deploy again

Environment-variable changes apply to a new deploy. Trigger a new deploy after creating or editing the allowlist.

## Existing pending invitations

This setup does not use invitation links. If an email already appears in Identity as pending, invited, or unconfirmed, delete that old Identity user first or test with a fresh approved email. Then open the dashboard normally and choose `Zugang erstellen`.

## Files to upload

Keep existing image assets such as:

- `alma-logo.png`
- `alma-logo-white.png`

Replace/add:

- `index.html`
- `ausbildung.html`
- `18b-19c-16d.html`
- `auth.css`
- `auth.js`
- `package.json`
- `netlify.toml`
- `netlify/functions/` and all files inside it
