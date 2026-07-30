# Backend Deployment on Railway

## Project Overview

This document outlines the complete deployment process for a Node.js backend application using [Railway](https://railway.app), a modern cloud platform for deploying web services.

---

## Prerequisites

- Node.js project with `server.js` as the entry point
- GitHub account
- Railway account ([railway.app](https://railway.app))

---

## Step 1: Prepare the Project

Ensure the backend project is properly configured for deployment.

**Entry file:** `server.js` must exist in the root directory.

**`package.json` start script:**
```json
"scripts": {
  "start": "node server.js"
}
```

**Dynamic port configuration in `server.js`:**
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

>  Railway injects the `PORT` environment variable automatically

---

## Step 2: Push Code to GitHub Repo Main Branch




---

## Step 3: Create a Railway Project

1. Log in to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub Repo"**
4. Authenticate with GitHub and select backend repository
5. Railway will auto-detect the Node.js environment

---

## Step 4: Configure Environment Variables

In the Railway dashboard:

1. Open project
2. Navigate to the **Variables** tab
3. Add the required environment variables:

| Variable                | Description                   |
|-------------------------|-------------------------------|
| `PORT`                  | Port Number Server Running on |
| `MONGO_URI`             | MongoDB connection string     |
| `JWT_SECRET`            | Secret key for JWT signing    |
| `CLOUDINARY_API_KEY`    | Cloudinary API KEY            |
| `CLOUDINARY_API_SECRET` | Cloudinary API SECRET         |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name         |
| `TRANSLATE_KEY`         | Google Translate API Key      |


**Example:**
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your_super_secret_key_here

```


---

## Step 5: Deploy the Application

Railway automatically:

- Detects the Node.js runtime
- Installs dependencies via `npm install`
- Starts the server using the `start` script from `package.json`

No additional configuration files (e.g., `Procfile`) are required.

---

## Step 6: Verify Deployment

1. Open the **Deployments** tab in Railway
2. Click on the latest deployment to view build and runtime logs
3. Look for a success message such as:

```
✔ Build succeeded
✔ Deploy succeeded
Server running on port 5000
```

4. Check for any errors in the **Logs** section


---

## Deployment Screenshot

![Deployment Success](./screenshots/deployment.png)

---

## Step 7: Access the Application

Railway generates a public URL for service automatically.

**Retrieve the URL:**
- Go to **Settings → Networking → Public Domain**
- Or find it under the **Deployments** tab

**Test API Endpoints:**
```
GET https://afbackend-production-af0b.up.railway.app
```

**Example using curl:**
```bash
curl https://afbackend-production-af0b.up.railway.app
```

**Expected Response:**
```json
{
  "code": 200,
  "message": "Server Up and Running",
  "content": {
    "status": "ok"
  }
}
```

---


## Live URL

![Live_URL](./screenshots/live_url.png)

---

## Deployment Summary

| Item | Details |
|---|---|
| **Platform** | Railway |
| **Runtime** | Node.js |
| **Entry Point** | `server.js` |
| **Start Command** | `node server.js` |
| **Port** | Dynamic (`process.env.PORT`) |
| **Environment** | Production |
| **Source** | GitHub Repository |

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Build fails | Check `package.json` for missing dependencies |
| Server crashes on start | Ensure `process.env.PORT` is used |
| Environment variable errors | Verify all variables are set in Railway Variables tab |
| 502 Bad Gateway | Check logs — server may not be binding to the correct port |
| MongoDB connection error | Verify `MONGO_URI` is correct and IP whitelist allows Railway |

---



*Deployment completed successfully on Railway. *