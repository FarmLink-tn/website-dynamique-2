
=======

# FarmLink Website

This repository contains the static files for the FarmLink website. All public pages are served from the project root.

## Structure
- `index.html` – landing page
- `about.html` – about FarmLink
- `how-it-works.html` – explanation of our process
- `solutions.html` – overview of available solutions
- `ai-advisor.html` – access to the AI advisor
- `account.html` – user account page
- `contact.html` – contact form
- `image/` – shared images
- `script.js`, `style.css` – client-side assets
- `server/` – PHP backend scripts

Obsolete files from the previous `farmlink_website/` directory have been removed.

# website

## Configuration

### Database

Database credentials are loaded from a `.env` file located either at the project root or inside the `server/` directory. Start by copying the provided template and updating it with the credentials provisioned in your hosting panel:

```bash
cp .env.example .env
```

Required keys:

- `DB_HOST` – Database host (defaults to `10.10.10.100` if omitted)
- `DB_PORT` – Database port (defaults to `3306`)
- `DB_NAME` – Database name (set to `brefzuoh_farmlink` for production)
- `DB_USER` – **MySQL user that has been granted ALL PRIVILEGES on `brefzuoh_farmlink` via cPanel**
- `DB_PASSWORD` – Password of the MySQL user (example: `NtopQX-73y94+A`)
- `DB_CHARSET` – Charset, defaults to `utf8mb4`

`server/config.php` validates that `DB_NAME`, `DB_USER`, and `DB_PASSWORD` are present; if any are missing the API returns a safe `Connexion à la base de données impossible.` response and logs the technical reason when `APP_DEBUG=true`.

After editing `.env`, confirm in **cPanel → MySQL® Databases** that the specified user is attached to `brefzuoh_farmlink` with all privileges, otherwise authentication will fail.

The `APP_DEBUG` flag controls whether detailed error messages are displayed to the browser. Leave it set to `false` in production. Optionally provide `APP_TIMEZONE` (defaults to `UTC`) and session settings such as `SESSION_SECURE` or `SESSION_SAMESITE`.

### Connectivity test

`test_db.php` performs a minimal connectivity check by loading the shared configuration and attempting a PDO connection. Deploy the file with the rest of the application and open `https://farmlink.tn/test_db.php` to confirm the database is reachable. A successful check responds with `OK DB`; failures return HTTP 500 along with a generic message (or the detailed error if `APP_DEBUG=true`). Use this endpoint immediately after updating credentials to verify that the remote host, port, and firewall are accessible from the PHP runtime.

### Registration API

The registration endpoint (`/server/auth.php?action=register`) expects a JSON payload with the following properties:

```json
{
  "first_name": "...",
  "last_name": "...",
  "email": "...",
  "phone": "...",
  "region": "...",
  "password": "..."
}
```

Client-side validation is handled in `script.js`, while the backend sanitises and persists the record using prepared statements and hashed passwords.



## AI Provider Fallback

The `server/ai.php` endpoint attempts to contact the AI provider specified in the request. If the call fails due to a timeout or a 5xx error, it automatically falls back to the other provider. The JSON response includes the provider ultimately used so that clients can display which service handled the request.

