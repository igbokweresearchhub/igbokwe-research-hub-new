# How to Put Igbokwe Research Hub Online

Your local website is only visible on your computer/workspace. For other people to see it, you need to deploy it to a hosting platform.

## Recommended MVP hosting: Render

Render can host the React frontend and Express backend together.

### Step 1: Create a GitHub repository

1. Go to https://github.com
2. Create a new repository called `igbokwe-research-hub`
3. Upload/push this project folder to the repository.

If using terminal:

```bash
cd igbokwe-research-hub
git init
git add .
git commit -m "Initial Igbokwe Research Hub website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/igbokwe-research-hub.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to https://render.com
2. Create an account or sign in.
3. Click **New +**.
4. Choose **Web Service**.
5. Connect your GitHub repository.
6. Use these settings:

- **Name:** `igbokwe-research-hub`
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### Step 3: Add environment variables

Add:

```bash
NODE_ENV=production
JWT_SECRET=your-long-random-secret-here
```

Render can also auto-generate the `JWT_SECRET` if you use the included `render.yaml` file.

### Step 4: Open your live website

Render will give you a public link like:

```text
https://igbokwe-research-hub.onrender.com
```

You can share that link with anyone.

## Adding your own domain name

To use a professional domain like:

```text
www.igbokweresearchhub.com
```

You need to:

1. Buy the domain from Namecheap, GoDaddy, Google Domains/Squarespace Domains, Hostinger, etc.
2. In Render, open your service.
3. Go to **Settings > Custom Domains**.
4. Add your domain.
5. Update the DNS records where you bought the domain.

## Making it searchable on Google

After the site is live:

1. Go to https://search.google.com/search-console
2. Add your domain or website URL.
3. Verify ownership.
4. Submit your sitemap:

```text
https://yourdomain.com/sitemap.xml
```

5. Add real blog/resource articles regularly so Google has content to rank.

## Important database note

The current MVP stores users and requests in a local JSON file. This is okay for testing, but for a real public website you should upgrade to a production database such as PostgreSQL.

Without a real database or persistent disk, some hosting platforms may lose saved users/requests after redeployment or server restart.

Recommended production upgrade:

- PostgreSQL database
- Secure admin password reset
- Email notifications when clients submit requests
- Payment integration if needed
- Privacy policy and terms page
