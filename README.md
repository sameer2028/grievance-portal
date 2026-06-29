<div align="center">
  <img src="frontend/public/faviconnew.png" alt="JanSamadhan Logo" width="100" />
  
  # JanSamadhan (जनसमाधान)

  **AI-Powered Public Grievance Analytics & Smart Routing System**

  [![React](https://img.shields.io/badge/React-18-blue.svg?logo=react&style=flat-square)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg?logo=nodedotjs&style=flat-square)](https://nodejs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688.svg?logo=fastapi&style=flat-square)](https://fastapi.tiangolo.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg?logo=mongodb&style=flat-square)](https://www.mongodb.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?logo=tailwind-css&style=flat-square)](https://tailwindcss.com/)

  ### [🚀 View Live Deployment Here](https://grievance-portal-jade.vercel.app/)

  *Built for the Smart India Hackathon (SIH)*
</div>

---

## 📖 Overview

**JanSamadhan** is a full-stack e-governance platform that allows citizens to submit public grievances efficiently. Using advanced Artificial Intelligence and NLP, the system automatically **classifies** complaints, **routes** them to the correct government department, gauges **urgency**, and provides **real-time analytics** and hotspot mapping to administrators.

## ✨ Key Features

- **🤖 AI-Powered Classification:** Automatically routes grievances to departments (Water, Electricity, Roads, etc.) using Machine Learning.
- **⚡ Urgency & Sentiment Detection:** Identifies critical issues for auto-escalation and gauges citizen sentiment from descriptions.
- **🗺️ Geographic Insights:** Interactive heat maps reveal grievance hotspots by district, helping authorities prioritize resource deployment.
- **🔐 Role-Based Access Control (RBAC):** Distinct portals for Citizens, Department Officers, and Super Administrators.
- **📈 Real-Time Analytics Dashboard:** Beautiful, live-updating charts and KPIs with a premium glassmorphism dark-mode UI.
- **🔔 Live Tracking:** Citizens can track their ticket status end-to-end without needing to constantly log in.

## 🏗️ Architecture & Tech Stack

### Microservices Structure
```text
grievance-system/
├── frontend/          # React SPA (Vite, Tailwind, Redux Toolkit)
├── backend/           # Node.js/Express REST API (MongoDB, JWT)
└── ai-service/        # Python FastAPI ML service (Scikit-Learn, NLP)
```

### Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS (Custom UI), Lucide React (Icons), Recharts
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Authentication
- **AI Service**: Python, FastAPI, Scikit-learn, Transformers (NLP for text classification)

## 🚀 Quick Start (Local Development)

### 1. Backend Service (Port 5000)
```bash
cd backend
cp .env.example .env   # Fill in your MongoDB URI and JWT secrets
npm install
npm run dev
```

### 2. AI ML Service (Port 8000)
```bash
cd ai-service
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend Web App (Port 5173)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## 🩺 Health Checks

Ensure all services are running smoothly by visiting:
- **Backend API**: [http://localhost:5000/health](http://localhost:5000/health)
- **AI Service**: [http://localhost:8000/health](http://localhost:8000/health)
- **Frontend App**: [http://localhost:5173](http://localhost:5173)

## 🧪 Testing Credentials

Use these credentials to explore the different role-based views. 

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `admin@grievance.gov.in` | `Admin@1234` |
| **Water Supply Officer** | `water@gov.in` | `1234` |
| **Electricity Officer** | `electricity@gov.in` | `1234` |
| **Roads & Infra Officer** | `roads@gov.in` | `1234` |
| **Sanitation Officer** | `sanitation@gov.in` | `1234` |
| **Health Officer** | `health@gov.in` | `1234` |
| **Police Officer** | `police@gov.in` | `1234` |

*(Note: Additional department officer emails follow the pattern `<department>@gov.in` with password `1234`)*

---

<div align="center">
  <p>Made with ❤️ for <b>Smart India Hackathon</b></p>
</div>
