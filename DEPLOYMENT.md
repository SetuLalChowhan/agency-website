# Vercel Deployment Guide

This project consists of 3 applications ready for deployment on **Vercel**:

1. **`server`**: The Express CMS API with MongoDB Atlas integration (deployed as a Vercel Serverless API).
2. **`admin`**: The Next.js Admin Dashboard CMS.
3. **`client`**: The Next.js Public Client Website.

---

## Step 1: Deploy the Backend API (`server`)

1. Go to **[Vercel Dashboard](https://vercel.com/new)** → Import your GitHub/Git repository.
2. Select **Root Directory**: `server`
3. Framework Preset: **Other** (Vercel automatically detects `vercel.json` and `@vercel/node`).
4. Configure **Environment Variables**:
   | Variable | Example Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Environment mode |
   | `DATABASE_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/kern?retryWrites=true&w=majority` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `generate-a-64-character-random-secret` | Secret for admin authentication tokens |
   | `JWT_EXPIRES_IN` | `7d` | Token expiration duration |
   | `COOKIE_SECURE` | `true` | `true` for HTTPS production |
   | `CORS_ORIGINS` | `https://your-client.vercel.app,https://your-admin.vercel.app` | Comma-separated domains for client & admin |
   | `PUBLIC_API_URL` | `https://your-api.vercel.app` | The production URL of this server deployment |
   | `REVALIDATE_SECRET`| `shared-revalidation-secret-key` | Shared secret for triggering Next.js cache purges |
   | `REVALIDATE_URL` | `https://your-client.vercel.app/api/revalidate` | URL of the client revalidation webhook |
   | `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | (Optional) Cloudinary media uploads |
   | `CLOUDINARY_API_KEY` | `your_api_key` | (Optional) Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | `your_api_secret` | (Optional) Cloudinary API secret |
   | `SEED_ADMIN_EMAIL` | `admin@kern.studio` | Initial admin account email |
   | `SEED_ADMIN_PASSWORD` | `SecureAdminPassword!2026` | Initial admin account password |
5. Click **Deploy**. Note your deployment URL (e.g. `https://your-api.vercel.app`).
6. Run the database seed once:
   ```bash
   cd server
   DATABASE_URL="mongodb+srv://..." npm run seed
   ```

---

## Step 2: Deploy the Admin Dashboard (`admin`)

1. In Vercel, click **Add New Project** → Select the same repository.
2. Select **Root Directory**: `admin`
3. Framework Preset: **Next.js**
4. Configure **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://agency-website-five-rho.vercel.app` | The backend API URL from Step 1 |
   | `NEXT_PUBLIC_SITE_URL` | `https://agency-website-etch.vercel.app` | The client website URL for live preview links |
5. Click **Deploy**. Note your deployment URL (e.g. `https://agency-website-admin.vercel.app`).

---

## Step 3: Deploy the Client Website (`client`)

1. In Vercel, click **Add New Project** → Select the same repository.
2. Select **Root Directory**: `client`
3. Framework Preset: **Next.js**
4. Configure **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-client.vercel.app` | The public website URL |
   | `PUBLIC_API_URL` | `https://your-api.vercel.app` | The backend API URL from Step 1 |
   | `REVALIDATE_SECRET` | `shared-revalidation-secret-key` | Must match `REVALIDATE_SECRET` in Step 1 |
   | `CMS_REVALIDATE_SECONDS` | `60` | Background ISR revalidation window |
5. Click **Deploy**.

---

## Step 4: Final CORS & Revalidation Synchronization

Once all three are deployed:
1. Go back to your **`server`** project in Vercel → **Settings** → **Environment Variables**.
2. Update `CORS_ORIGINS` to the exact production domains:
   ```env
   CORS_ORIGINS=https://your-client.vercel.app,https://your-admin.vercel.app
   ```
3. Update `REVALIDATE_URL`:
   ```env
   REVALIDATE_URL=https://your-client.vercel.app/api/revalidate
   ```
4. Click **Redeploy** on the `server` project to apply the updated environment variables.

---

## Production Verification Checklist

- [ ] Log in to Admin at `https://your-admin.vercel.app/login` with your seeded admin credentials.
- [ ] Make an edit in **General & Branding** or **Theme** and click **Save**.
- [ ] Open `https://your-client.vercel.app` and confirm your changes appear live.
- [ ] Submit a message via the public **Contact** page and verify it appears in Admin → **Leads**.
