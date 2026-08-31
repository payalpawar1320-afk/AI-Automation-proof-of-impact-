# 🚀 Deployment Guide: Proof of Impact (Vercel + Render + MongoDB Atlas)

This guide walks you through deploying your split architecture:
- **Frontend**: Next.js App deployed on **Vercel** (`client/` directory).
- **Backend API**: Node.js + Express API deployed on **Render** (`server/` directory).
- **Database**: **MongoDB Atlas Cluster0** connected directly to the Render backend.

---

## 📌 Architecture Overview

```text
GitHub (payalpawar1320-afk/AI-Automation-proof-of-impact-)
├── client/  ──► Vercel (Frontend UI: https://ai-automation-proof-of-impact.vercel.app)
└── server/  ──► Render (Backend API: https://your-backend.onrender.com)
                     └──► MongoDB Atlas Cluster0 (Database)
```

---

## 🗄️ Step 0: Ensure MongoDB Atlas Network Access

1. Log into [MongoDB Atlas](https://cloud.mongodb.com).
2. Under **Security** in the left sidebar, click **Network Access**.
3. Check your IP Access List:
   - Ensure `0.0.0.0/0` (Allow Access From Anywhere) is active so Render cloud servers can connect.
   - If not present, click **Add IP Address** → **Allow Access From Anywhere** (`0.0.0.0/0`) → **Confirm**.

---

## 🖥️ Step 1: Deploy the Backend to Render

1. Log in to [Render.com](https://render.com).
2. Click **New +** (top right) → **Web Service**.
3. Connect your GitHub repository (`AI-Automation-proof-of-impact-`).
4. Configure the Web Service with the following exact settings:

| Setting | Value |
| :--- | :--- |
| **Name** | `proof-of-impact-api` (or your preferred name) |
| **Region** | Choose the region closest to you (e.g. *Singapore*, *Frankfurt*, or *Ohio*) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

5. Under **Environment Variables**, add the following:

| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://ai-automation-proof-of-impact.vercel.app` |
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@cluster0.1zwuaww.mongodb.net/proof_of_impact?retryWrites=true&w=majority&appName=Cluster0` |
| `GEMINI_API_KEY` | `<your-gemini-api-key>` |

6. Click **Create Web Service**.
7. Wait ~1-2 minutes for Render to build and start your service.
8. Copy your live Render URL (e.g. `https://proof-of-impact-api.onrender.com`).
9. Verify by visiting `https://<your-render-url>/api/health` in your browser.

---

## ⚡ Step 2: Configure & Deploy the Frontend on Vercel

### If using your existing Vercel project (`https://ai-automation-proof-of-impact.vercel.app`):
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on your existing **`ai-automation-proof-of-impact`** project.
3. Go to **Settings** → **General**:
   - Find **Root Directory** and click **Edit**.
   - Set it to **`client`** and click **Save**.
4. Go to **Settings** → **Environment Variables**:
   - Add/Update:
     - **Key**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://<your-render-app>.onrender.com` (your live Render backend URL)
     - **Key**: `NEXT_PUBLIC_APP_NAME`
     - **Value**: `Proof of Impact`
5. Go to **Deployments** tab → Click the three dots `...` on the latest deployment → Click **Redeploy**.

---

## 🧪 Step 3: Verify Everything Live

1. Open `https://ai-automation-proof-of-impact.vercel.app`.
2. Check the header status badge: **`[ 🗄️ MongoDB Atlas 🟢 ]`**.
3. Click **"+ Report Issue"** to submit an issue and verify live Gemini AI triage and Before/After photographic proof verification through the Render backend!
