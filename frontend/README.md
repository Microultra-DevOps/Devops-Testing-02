
# 📝 MERN Stack Localhost Setup Guide (MongoDB, Express, React, Node.js)

> 📍 This guide is for running a MERN stack project locally on `localhost`. Make sure Node.js and MongoDB are installed.

---

## ✅ Requirements

1. **Node.js** and **npm**: [https://nodejs.org/](https://nodejs.org/)
2. **MongoDB** (Local or Atlas): [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
3. **Git** (optional, for cloning)

---

## 📁 Project Structure

```
mern-app/
├── backend/     ← Express + MongoDB
├── frontend/    ← React app
```

---

## ⚙️ Step 1: Backend Setup (Node + Express + MongoDB)

### 1. Go to `backend` folder:
```bash
cd backend
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Create a `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mernapp
```

> 🔁 Replace `MONGO_URI` with MongoDB Atlas URI if you're using it online.

### 4. Start MongoDB locally:
```bash
mongod
```

### 5. Run the backend:
```bash
npm run dev
```
> Visit: `http://localhost:5000`

---

## 🎨 Step 2: Frontend Setup (React)

### 1. Open another terminal, go to `frontend`:
```bash
cd frontend
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Start the React app:
```bash
npm run dev
```
> Visit: `http://localhost:3000`

### 4. API Integration:
In your frontend code (e.g. `axios` or `fetch`), use:
```js
http://localhost:5000/api/your-endpoint
```

---

## 🔁 Development Tips

- Use **concurrently** to run both frontend and backend with one command.
- You can create a `package.json` script like:
```json
"scripts": {
  "dev": "concurrently \"npm run server\" \"npm run client\"",
  "server": "cd backend && npm run dev",
  "client": "cd frontend && npm start"
}
```

---