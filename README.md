# AI-Powered Public Grievance Analytics & Smart Routing System

> Smart India Hackathon (SIH) Project

## Overview

A full-stack platform that allows citizens to submit public grievances, automatically classifies them using AI, routes them to the correct department, and provides real-time analytics to administrators.

## Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, React Router v6  |
| Backend     | Node.js, Express.js, MongoDB, Mongoose, JWT    |
| AI Service  | Python, FastAPI, scikit-learn, transformers    |

## Project Structure

```
grievance-system/
├── frontend/          # React SPA (port 5173)
├── backend/           # Express REST API (port 5000)
├── ai-service/        # FastAPI ML service (port 8000)
└── README.md
```

## Quick Start

### 1. Backend
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev
```

### 2. AI Service
```bash
cd ai-service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Health Checks

- Backend:    http://localhost:5000/health
- AI Service: http://localhost:8000/health
- Frontend:   http://localhost:5173

## Environment Variables

See `.env.example` in each service folder.

## Testing Accounts

**Super Admin**
- Email: `admin@grievance.gov.in`
- Password: `Admin@1234`

**Department Officers** (Password is `1234` for all)
- Water Supply: `water@gov.in`
- Electricity: `electricity@gov.in`
- Roads & Infrastructure: `roads@gov.in`
- Sanitation: `sanitation@gov.in`
- Health: `health@gov.in`
- Education: `education@gov.in`
- Transport: `transport@gov.in`
- Revenue: `revenue@gov.in`
- Police: `police@gov.in`
- Other: `other@gov.in`
