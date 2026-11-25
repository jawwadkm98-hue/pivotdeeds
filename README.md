# PivotDeeds

Nationwide cash-buyer website for [pivotdeeds.com](https://pivotdeeds.com). Property owners can request a no-obligation cash offer. Cash buyers can join the buyers list. Leads are stored in a SQLite file on the server. There is a password-protected admin page with CSV export.

PivotDeeds is a real estate investor, not a licensed broker or agent. The site says that, including that a contract may be assigned or the property resold, and that PivotDeeds is not a foreclosure consultant.

## Brand settings

Edit **only** [`config/brand.ts`](config/brand.ts) for the company name, phone, email, service area, domain, and social links.

**TODO:** `phone` is the placeholder `(000) 000-0000`. Replace it with the live number, then set `phoneStatus` to `"live"`. Until you do that, the site shows the placeholder and does not link it as a callable number. Social URLs stay blank until you paste real `https://` profiles.

## Requirements

- Node.js 22 or newer
- npm

## Run locally

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

- `ADMIN_PASSWORD` — at least 10 characters. This is the `/admin` password.
- `ADMIN_SESSION_SECRET` — at least 24 characters. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then:

```bash
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin inbox is [http://localhost:3000/admin](http://localhost:3000/admin).

Production mode on this machine:

```bash
npm run build
npm start
```

`npm start` sets `NODE_ENV=production`, so the admin cookie is marked Secure and will not stick on plain `http://localhost`. For a local production test over HTTP, set `COOKIE_SECURE=false` in `.env.local`. Leave that unset (or `true`) once the public site is on HTTPS.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Yes, for admin | Password for `/admin`. Minimum 10 characters. |
| `ADMIN_SESSION_SECRET` | Yes, for admin | Signs the admin session cookie. Minimum 24 characters. |
| `DATABASE_PATH` | No | SQLite file. Defaults to `data/pivotdeeds.sqlite`. On a server, use an absolute path such as `/var/lib/pivotdeeds/pivotdeeds.sqlite`. |
| `COOKIE_SECURE` | No | `true` or `false`. Defaults to `true` when `NODE_ENV=production`. |

Do not commit `.env` or `.env.local`.

## What the forms do

Seller fields: name, phone, email, property address, city, state, ZIP, property type, condition, timeline, optional asking price, optional reason for selling, and notes.

Buyer fields: name, phone, email, optional company, markets (nationwide or specific states), property types, price range, buy box notes, and whether proof of funds is available.

Both require a consent checkbox that starts **unchecked**. The consent covers calls and texts, including autodialed or prerecorded messages, message and data rates, reply STOP to opt out, and that consent is not a condition of any purchase. The server rejects the submission if the box was not checked.

Spam controls, all on the server:

- A hidden honeypot field. If it is filled, the lead is discarded and the visitor still sees a success message.
- A short-submit check for browsers that send a timestamp. Submissions faster than 1.5 seconds are discarded the same way.
- A fixed rate limit of 6 saved submissions per IP per 15 minutes, shared by the seller, buyer, and contact forms. Admin sign-in allows 8 attempts per 15 minutes.

Validation of emails, U.S. phone numbers, ZIP codes, states, and the option lists also runs on the server. The database is created automatically the first time a form or the admin page is used.

Contact-form messages are stored in the same database and shown in the admin inbox. This app does not send email. There is no mail server in the free setup. Check `/admin`. Direct email still goes to the address in `config/brand.ts`.

## Admin

1. Set the two secrets above and restart the server.
2. Open `/admin` and sign in.
3. Seller leads, cash buyers, and contact messages are separate tabs.
4. **Export CSV** downloads the full list for the current tab. The file is UTF-8 with a BOM so Excel opens it cleanly, and cells that start with `=`, `+`, `-`, or `@` are prefixed so a spreadsheet does not treat them as formulas.

The session cookie is httpOnly, lasts 12 hours, and is not readable by page scripts. `/admin` is marked `noindex` and disallowed in `robots.txt`.

## Scripts

```bash
npm run dev        # local site with reload
npm run build      # production build
npm start          # serve the production build
npm test           # validation, CSV, and SQLite tests
npm run typecheck
```

## Deploy for free

SQLite needs a disk that keeps the file after a restart. **Do not deploy this app to Vercel, Netlify, or Cloudflare Workers.** Those runtimes wipe the local filesystem, so the leads would disappear. A free virtual machine with a normal disk is the setup that matches this app.

[Oracle Cloud Always Free](https://www.oracle.com/cloud/free/) can run an Ampere VM at no charge. The console labels move around; the steps below are the shape of the setup. Use Ubuntu 24.04.

### 1. Create the VM

1. Create an Oracle Cloud account and open **Compute → Instances → Create instance**.
2. Choose a name such as `pivotdeeds`, an **Always Free** Ampere shape, and Ubuntu 24.04.
3. Upload your SSH public key.
4. Create the instance and note the **public IPv4 address**.
5. Open the subnet **security list** (or network security group) and add ingress rules for TCP **22** (your IP only, if you can), **80**, and **443** from `0.0.0.0/0`.

Oracle’s Ubuntu image also has its own firewall. After you SSH in, allow HTTP and HTTPS there too. On current images that still use iptables:

```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo apt-get update
sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save
```

If `iptables -L` shows no blocking rules, the security list is enough.

### 2. Install Node.js 22

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # v22 or newer
```

If NodeSource is unavailable, install the Node.js 22 Linux tarball from [nodejs.org](https://nodejs.org/) and put `node` and `npm` on your `PATH`.

### 3. Put the app on the server

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin pivot
sudo mkdir -p /var/www/pivotdeeds /var/lib/pivotdeeds/backups
sudo chown -R pivot:pivot /var/www/pivotdeeds /var/lib/pivotdeeds
sudo -u pivot git clone https://github.com/jawwadkm98-hue/pivotdeeds.git /var/www/pivotdeeds
cd /var/www/pivotdeeds
sudo -u pivot npm ci
sudo -u pivot npm run build
```

`npm ci` includes the dev dependencies the production build needs (`tailwind`, TypeScript). `next` itself stays available for `npm start`.

### 4. Secrets and the database path

```bash
sudo nano /etc/pivotdeeds.env
```

```bash
ADMIN_PASSWORD=replace-with-a-long-password
ADMIN_SESSION_SECRET=replace-with-the-output-of-the-node-command-above
DATABASE_PATH=/var/lib/pivotdeeds/pivotdeeds.sqlite
```

```bash
sudo chown root:pivot /etc/pivotdeeds.env
sudo chmod 640 /etc/pivotdeeds.env
```

Confirm `pivot` can read that file (`sudo -u pivot head -c 1 /etc/pivotdeeds.env`).

### 5. Run it under systemd

The unit file in the repo expects `npm` at `/usr/bin/npm`. Check with `command -v npm` and edit the file if your path differs.

```bash
sudo cp /var/www/pivotdeeds/deploy/pivotdeeds.service /etc/systemd/system/pivotdeeds.service
sudo systemctl daemon-reload
sudo systemctl enable --now pivotdeeds
sudo systemctl status pivotdeeds
curl -fsS http://127.0.0.1:3000/api/health
```

A healthy process returns `{"ok":true}`.

### 6. HTTPS with Caddy

Caddy gets a free Let’s Encrypt certificate once DNS points at the VM (next section). You can install it before DNS; the first certificate request will fail until the domain resolves, then succeed after you reload.

```bash
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update
sudo apt-get install -y caddy
sudo cp /var/www/pivotdeeds/deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy listens on 80 and 443 and proxies to the Node process on port 3000. Do not open port 3000 to the public internet.

## Point pivotdeeds.com at the server

The domain is not registered yet.

1. Register `pivotdeeds.com` at any registrar (Cloudflare Registrar, Namecheap, Porkbun, Google Domains’ successor, and so on).
2. In the registrar’s DNS settings, add:
   - **A** record, host `@` (or `pivotdeeds.com`), value = the VM’s public IPv4 address.
   - **A** record, host `www`, value = the same IPv4 address.
3. If the registrar offers AAAA records and the VM has no public IPv6, do not add an AAAA record. A stale IPv6 address will make the site fail for some visitors.
4. Wait for DNS. Check with `dig +short pivotdeeds.com` until it prints the VM address.
5. Reload Caddy if the first certificate attempt happened before DNS was ready: `sudo systemctl reload caddy`.
6. Open `https://pivotdeeds.com`. The `www` host redirects to the apex.
7. Sign in at `https://pivotdeeds.com/admin` and submit the seller form once to confirm a row appears.

`config/brand.ts` already uses `https://pivotdeeds.com` for canonical URLs, the sitemap, and Open Graph. Change `siteUrl` there if you use a different hostname.

## Backups

The leads live only in the SQLite file. Back it up daily. Stop-the-world copies can tear a database that is being written, so use SQLite’s backup command:

```bash
sudo apt-get install -y sqlite3
sudo mkdir -p /var/lib/pivotdeeds/backups
sudo sqlite3 /var/lib/pivotdeeds/pivotdeeds.sqlite ".backup /var/lib/pivotdeeds/backups/pivotdeeds-$(date +%F).sqlite"
```

A cron entry for root, once a day, is enough. Keep a copy off the VM as well (download the backup over SSH). Losing the VM without a backup loses the leads.

## Update the site later

```bash
cd /var/www/pivotdeeds
sudo -u pivot git pull
sudo -u pivot npm ci
sudo -u pivot npm run build
sudo systemctl restart pivotdeeds
```

Change the phone number in `config/brand.ts`, commit it, and pull on the server. You do not need a new deploy to change only the admin password: edit `/etc/pivotdeeds.env` and restart the service.

## Optional: Docker

`Dockerfile` builds the Next.js standalone server. SQLite is stored in `/data`, so mount a persistent volume. This is another way to run the same app on a VM. It is not a free host by itself, and it still should not be pointed at a serverless platform.

```bash
docker build -t pivotdeeds .
docker run --env-file /etc/pivotdeeds.env -p 127.0.0.1:3000:3000 -v /var/lib/pivotdeeds:/data pivotdeeds
```

Put Caddy in front of port 3000 the same way as the systemd setup. `DATABASE_PATH` inside the container should stay `/data/pivotdeeds.sqlite` (the image default) so the volume actually holds the file.

## Project map

- `config/brand.ts` — name, phone, email, service area, social links
- `src/app` — pages, sitemap, robots, Open Graph image
- `src/lib/validate.ts` — server-side form rules
- `src/lib/db.ts` — SQLite schema
- `src/lib/actions.ts` — form and admin sign-in actions
- `deploy/` — systemd unit and Caddyfile

Pages: Home, Sell your property, Cash buyers, About, Contact, Privacy Policy, Terms of Use, and `/admin`.
