# Baba Hakeem Storefront

Next.js storefront and admin application, configured for Hostinger Node.js Web App hosting.

## Run locally

1. Install Node.js 22 and MySQL 8.
2. Copy `.env.example` to `.env` and set local MySQL and mail credentials.
3. Install dependencies with `npm ci`.
4. Import `database/schema.mysql.sql` and `database/public-catalogue.mysql.sql` into the `babahakeem` database.
5. Start the development server with `npm run dev`.

## Deploy from GitHub to Hostinger

The Git repository root is the application root. Deploy this repository using Hostinger's **Node.js Web App** GitHub flow; the framework is Next.js.

1. In Hostinger, create a Node.js Web App and connect the GitHub repository.
2. Select Node.js 22. Use `npm run build` as the build command and `npm start` as the start command.
3. Create a MySQL database in hPanel. Import `database/schema.mysql.sql`, then `database/public-catalogue.mysql.sql` using phpMyAdmin.
4. Add the variables listed in `.env.example` to the Hostinger app's Environment Variables. Hostinger MySQL uses `DB_HOST=127.0.0.1`, port `3306`; use the complete database and username values shown in hPanel.
5. Set a random `ADMIN_SESSION_SECRET` with at least 32 characters. For first startup only, set `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` (12+ characters). `npm start` creates the initial admin only if the admins table is empty. Remove both initial-admin variables after the first successful deployment.
6. Add the Titan SMTP settings and production `SITE_URL`, then deploy/restart the app.

Do not commit `.env`, database exports containing orders or customer data, SMTP credentials, or bank account details. The checked-in catalogue seed contains only published product records; the schema contains table definitions only. Bank details and social/contact settings can be entered in the admin panel after deployment.

## Hostinger plan requirement

Hostinger's current Node.js Web App documentation lists Business Web Hosting and Cloud plans as eligible. The older **Premium** shared plan is not listed, so confirm Node.js Web App access in hPanel before setting up the GitHub deployment. Hostinger's current guide is [How to add a Node.js web app](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).

## Useful commands

- `npm run build` — production build
- `npm start` — production server (and optional one-time admin bootstrap)
- `npm run db:migrate:reviews` — add review tables to an existing database
- `npm run db:migrate:blogs` — add blog tables to an existing database
- `npm run email:verify` — verify SMTP settings
