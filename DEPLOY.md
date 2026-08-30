# 🚀 Deployment Guide: Proof of Impact (ImpactLoop AI)

This guide walks you through uploading your project to **GitHub** and deploying it to **Vercel** (Frontend / Fullstack) and/or **Render** (Web Service).

---

## 📌 Prerequisites: MongoDB Atlas Network Access

Before deploying to the cloud (Vercel or Render), ensure your MongoDB Atlas cluster allows incoming connections from cloud servers:

1. Log into [MongoDB Atlas](https://cloud.mongodb.com).
2. In the left sidebar, click **Network Access** (under *Security*).
3. Check your IP Access List:
   - If `0.0.0.0/0` (Allow access from anywhere) is not added, click **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**.

---

## 🐙 Step 1: Upload Project to GitHub

### 1. Initialize Git & Check `.gitignore`
The `.gitignore` file has already been created to protect your private `.env.local` keys.

Open your terminal in the project folder and run:

```bash
# 1. Initialize git
git init

# 2. Stage all project files
git add .

# 3. Commit files
git commit -m "feat: initial commit for Proof of Impact with MongoDB and Gemini AI"
```

### 2. Push to GitHub
1. Go to [GitHub.com](https://github.com) and click **New repository** (+ icon top right).
2. Name your repository (e.g. `proof-of-impact`).
3. Leave it as **Public** (or **Private**) and **DO NOT** initialize with README or .gitignore (we already have them).
4. Click **Create repository**.
5. Copy the commands shown on GitHub and run them in your terminal:

```bash
# Rename branch to main
git branch -M main

# Link your local repo to GitHub (replace YOUR-USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/proof-of-impact.git

# Push code to GitHub
git push -u origin main
```

---

## ⚡ Step 2: Deploy to Vercel (Recommended for Next.js)

Since **Proof of Impact** is built with **Next.js 14 App Router**, Vercel natively deploys both the **Frontend UI** and the **Backend API routes** (`/api/issues`, `/api/ai/verify`, `/api/health`, etc.) with zero extra configuration.

### 1. Import Repository
1. Go to [Vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** → **Project**.
3. Locate your `proof-of-impact` repository from the list and click **Import**.

### 2. Configure Environment Variables
In the **Environment Variables** section on Vercel, add:

| Key | Value |
| :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@cluster0.1zwuaww.mongodb.net/proof_of_impact?retryWrites=true&w=majority` |
| `GEMINI_API_KEY` | `your_gemini_api_key_here` |
| `NEXT_PUBLIC_APP_NAME` | `Proof of Impact` |

### 3. Deploy
1. Click **Deploy**.
2. Vercel will build and launch your application in under 1 minute.
3. You will get a free production URL (e.g. `https://proof-of-impact.vercel.app`).

---

## 🖥️ Step 3: Deploy to Render (Alternative Web Service)

If you prefer to run the Node.js production server on **Render**:

### 1. Create a New Web Service
1. Go to [Render.com](https://render.com) and log in.
2. Click **New +** (top right) → **Web Service**.
3. Connect your GitHub account and select your `proof-of-impact` repository.

### 2. Configure Settings
Fill in the following fields:

- **Name**: `proof-of-impact`
- **Region**: Choose closest to you (e.g., `Singapore`, `Frankfurt`, or `Ohio`)
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 3. Add Environment Variables on Render
Scroll down to **Environment Variables** and add:

| Key | Value |
| :--- | :--- |
| `NODE_VERSION` | `20.18.0` |
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@cluster0.1zwuaww.mongodb.net/proof_of_impact?retryWrites=true&w=majority` |
| `GEMINI_API_KEY` | `your_gemini_api_key_here` |
| `PORT` | `3000` |

### 4. Deploy Web Service
1. Click **Create Web Service**.
2. Render will pull from GitHub, install dependencies, build the Next.js production bundle, and launch your live site with an `onrender.com` domain.

---

## 🧪 Step 4: Verify Your Cloud Deployment

Once deployed (on Vercel or Render):
1. Open your live URL in a browser.
2. Check the header badge: It should display **`[ 🗄️ MongoDB Atlas 🟢 ]`**.
3. Visit `https://your-domain/api/health` to confirm:
   ```json
   {
     "status": "connected",
     "provider": "MongoDB Atlas",
     "database": "proof_of_impact",
     "readyState": 1
   }
   ```
4. Click **"+ Report Issue"** to test submitting an issue and verifying that live Gemini AI triage and Before/After CV verification work in the cloud!
