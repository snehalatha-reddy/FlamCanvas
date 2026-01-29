# Deploying Flam Canvas for Free (Render.com)

Render is the best platform to deploy Node.js WebSocket applications for free.

## Prerequisites
- A GitHub account.
- This code pushed to GitHub (Already done!).

## Steps to Deploy

1.  **Sign Up / Login to Render**
    - Go to [render.com](https://dashboard.render.com).
    - Sign in with your GitHub account.

2.  **Create a New Web Service**
    - Click **"New +"** button in dashboard -> Select **"Web Service"**.
    - Choose **"Build and deploy from a Git repository"**.
    - Find your repository (`FlamCanvas`) in the list and click **"Connect"**.

3.  **Configure the Service**
    - **Name**: `flam-canvas` (or any unique name).
    - **Region**: Closest to you (e.g., Singapore, Frankfurt).
    - **Branch**: `main`.
    - **Root Directory**: (Leave blank).
    - **Runtime**: `Node`.
    - **Build Command**: `npm install`.
    - **Start Command**: `npm start`.
    - **Instance Type**: Select **"Free"**.

4.  **Deploy**
    - Click **"Create Web Service"**.
    - Render will start building your app. It will install dependencies and start the server.
    - Wait for the "Live" status (usually 2-3 minutes).

## Access Your App
- Once deployed, Render will give you a URL like `https://flam-canvas.onrender.com`.
- Open that link to start drawing!

## Note on Free Tier
- The server initializes after a period of inactivity. The first request might take ~30 seconds to wake up (cold start). This is normal for the free tier.
