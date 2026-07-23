# Igbokwe Research Hub

A functional MVP website for **Igbokwe Research Hub**.

## What it does

- Public website for research support services
- Searchable services section
- Searchable resources/blog-topic section
- Client sign up and login
- Client dashboard to submit project requests
- Admin dashboard to view all requests and update request status
- Contact form that saves messages
- Basic SEO files: `robots.txt`, `sitemap.xml`, meta description, keywords, Open Graph tags

## Academic integrity positioning

The site is worded as ethical support: research coaching, guidance, editing, data analysis, formatting, article preparation, and dissertation support. Clients remain responsible for their own academic submissions.

## Run locally

```bash
cd igbokwe-research-hub
npm install
npm run dev
```

This starts:

- Frontend: usually `http://localhost:5173`
- Backend/API: `http://localhost:4173`

## Default admin login

Use this for local testing only:

- Email: `admin@igbokweresearchhub.com`
- Password: `ChangeMe123!`

Before real deployment, change the admin password and set a secure `JWT_SECRET` environment variable.

## Build for production

```bash
npm run build
npm start
```

## Deployment notes

For a real launch, you should use:

1. A domain name, e.g. `igbokweresearchhub.com`
2. Hosting such as Render, Railway, Vercel, Netlify, or a VPS
3. A proper production database such as PostgreSQL
4. HTTPS/SSL
5. Real email delivery for contact forms and request notifications
6. Updated contact details, logo, pricing, privacy policy, and terms

## Files to edit

- Frontend content: `src/main.jsx`
- Styling/colors: `src/styles.css`
- Backend/API: `server/index.js`
- SEO metadata: `index.html`
- Sitemap: `public/sitemap.xml`
