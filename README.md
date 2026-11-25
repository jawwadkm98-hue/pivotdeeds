# Crown Wholesalers

Nationwide cash-buyer website for [crownwholesalers.com](https://crownwholesalers.com). Crown Wholesalers buys real estate and high-value assets such as gold, diamonds, and jewelry. Sellers request a no-obligation cash offer. Buyers join the list by category. Leads, including optional photos, are stored on the server. There is a password-protected admin page with CSV export.

For real estate, Crown Wholesalers is an investor, not a licensed broker or agent. The site says that a contract may be assigned or the property resold, and that Crown Wholesalers is not a foreclosure consultant. Precious-metal and jewelry purchases follow applicable dealer laws and may require a government ID at the transaction. The site does not claim any license.

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
- `SESSION_SECRET` — at least 24 characters. Generate one with:

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
| `DATABASE_PATH` | No | SQLite file. Defaults to `data/crownwholesalers.sqlite`. On a server, use an absolute path such as `/var/lib/crownwholesalers/crownwholesalers.sqlite`. |
| `COOKIE_SECURE` | No | `true` or `false`. Defaults to `true` when `NODE_ENV=production`. |

Do not commit `.env` or `.env.local`.

## What the forms do

Seller fields start with an asset category: real estate, gold and precious metals, diamonds and jewelry, or other. Every request asks for name, phone, email, city, state, ZIP, and timeline. Real estate also asks for the address, property type, condition, and an optional reason. Metals and jewelry ask for item type, and optionally weight, karat or carat, certification (for example GIA), quantity, a description, and up to three photos stored on the server. Other assets require a description. Asking price is optional.

Buyer fields: name, phone, email, optional company, category interests, markets (nationwide or specific states), property types when real estate is selected, price range, buy box notes, and whether proof of funds is available.

Add a future category in `src/lib/constants.ts` (`ASSET_CATEGORIES`) and teach `parseSeller` which fields it requires.

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
npm run dev        # local site; leads go to SQLite on disk
npm run build      # Next.js production build
npm test           # validation, CSV, and database tests
npm run deploy     # build for Cloudflare and publish the Worker
npm run preview    # build and preview the Worker locally
```

`npm run dev` does not need a Cloudflare account. It stores leads in `data/crownwholesalers.sqlite` and photos in `data/uploads`. The deployed Worker uses D1 and R2 instead.

## Deploy on Cloudflare (free)

The live site runs as a Cloudflare Worker through [OpenNext](https://opennext.js.org/cloudflare). Leads live in D1. Optional seller photos live in R2. If the `PHOTOS` binding is missing, the lead is still saved and the photos are skipped.

You need a free Cloudflare account and Node.js 22. The git repository is still `https://github.com/jawwadkm98-hue/pivotdeeds.git`.

### 1. Install and log in

```bash
git clone https://github.com/jawwadkm98-hue/pivotdeeds.git
cd pivotdeeds
npm ci
npx wrangler login
```

`wrangler login` opens a browser and stores an API token for this machine.

### 2. Create the D1 database and apply the schema

```bash
npx wrangler d1 create crownwholesalers
```

The command prints a `database_id`. Paste that id over `00000000-0000-0000-0000-000000000000` in `wrangler.jsonc` (`d1_databases[0].database_id`).

```bash
npx wrangler d1 migrations apply crownwholesalers --remote
```

That runs `migrations/0001_init.sql`. The Worker also creates the same tables on the first request if a migration was skipped.

### 3. Create the photo bucket

```bash
npx wrangler r2 bucket create crownwholesalers-photos
```

The binding name in `wrangler.jsonc` is `PHOTOS`. The app keeps working if this bucket is not attached; photo uploads are then ignored.

### 4. Set the admin secrets

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
```

`ADMIN_PASSWORD` must be at least 10 characters. `SESSION_SECRET` must be at least 24 characters. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste each value when Wrangler prompts. They are not stored in git.

### 5. Deploy

```bash
npm run deploy
```

Wrangler prints a `*.workers.dev` URL. Open it, submit the seller form once, then sign in at `/admin` and confirm the lead is listed. `/api/health` returns `{"ok":true}` when D1 answers.

### 6. Attach crownwholesalers.com

Register `crownwholesalers.com` if it is not registered yet, then add the domain to this same Cloudflare account (Cloudflare dashboard → **Websites** → **Add a domain**, and point the registrar nameservers at the two Cloudflare nameservers). Wait until the zone is **Active**.

Then attach the Worker:

1. **Workers & Pages** → **crownwholesalers** → **Settings** → **Domains & Routes**.
2. **Add** → **Custom domain** → `crownwholesalers.com`.
3. Add `www.crownwholesalers.com` the same way.

Because the zone is on this account, Cloudflare creates the proxied DNS records for you. You do not point the apex at a separate host. After both names are listed on the Worker, `https://crownwholesalers.com` and `https://www.crownwholesalers.com` serve the site. `config/brand.ts` already uses `https://crownwholesalers.com` for canonical URLs.

## Backups

```bash
npx wrangler d1 export crownwholesalers --remote --output crownwholesalers.sql
```

Keep that file somewhere other than the laptop you deploy from. R2 objects can be copied with `npx wrangler r2 object get`.

## Update later

```bash
git pull
npm ci
npm run deploy
```

A new admin password is `npx wrangler secret put ADMIN_PASSWORD` again. The public phone and email are changed in `/admin/settings` and do not need a new deploy.

## Build files for an API upload

`npm run deploy` both builds and publishes. To build without publishing:

```bash
npx opennextjs-cloudflare build
```

Upload these paths with the Workers Assets direct-upload flow:

- Worker module: `.open-next/worker.js`
- Static assets directory: `.open-next/assets`

The Worker metadata still has to include the bindings from `wrangler.jsonc`: D1 `DB`, R2 `PHOTOS`, assets `ASSETS`, and the email binding `NOTIFY_EMAIL`.

After the code is uploaded, apply `migrations/0002_dashboard.sql` to the existing D1 database if it is not already applied. Each line is one statement. Email Routing must already allow `leads@crownwholesalers.com` to send to `crownwholesalersusa@gmail.com`, or new-lead mail is skipped and the form still saves.

## Project map

- `config/brand.ts` — name, default phone, default email, service area, social links
- `wrangler.jsonc` — Worker name, D1 `DB`, R2 `PHOTOS`, email `NOTIFY_EMAIL`
- `migrations/0001_init.sql` and `migrations/0002_dashboard.sql` — D1 schema
- `src/lib/db.ts` — D1 on Cloudflare, local SQLite everywhere else
- `src/lib/actions.ts` — public form actions

Pages: Home, How it works, Sell, Sell real estate, Sell gold and precious metals, Sell diamonds and jewelry, We buy, Inventory, Situations, Cash buyers, About, FAQ, Contact, Privacy Policy, Terms of Use, and `/admin`.
