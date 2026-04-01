# 🎙️ AI Meeting Intelligence System

An AI-powered meeting assistant that transcribes, summarizes, extracts action items, and enables semantic search across your meeting history.

## Architecture

```
React Frontend → FastAPI Backend → Whisper (STT) → LLM (Summary/Tasks) → FAISS (Search) → PostgreSQL (Storage)
```

## Features

- **Audio Upload** — Upload .wav, .mp3, .m4a recordings
- **Speech-to-Text** — Automatic transcription via OpenAI Whisper
- **AI Summarization** — Structured summaries with topic, key points, decisions
- **Task Extraction** — Automatic action item detection (Person → Task)
- **Semantic Search** — RAG-powered Q&A across all past meetings
- **Dashboard** — Clean, responsive React UI

## Quick Start

### Prerequisites

- Docker & Docker Compose
- An OpenAI API key **or** Google Gemini API key

### 1. Clone & Configure

```bash
git clone https://github.com/YOUR_USER/ai-meeting-intelligence.git
cd ai-meeting-intelligence

cp .env.example .env
# Edit .env — add your API key
```

### 2. Start Everything

```bash
docker compose up --build
```

This starts:
- **PostgreSQL** on port 5432
- **FastAPI backend** on port 8000
- **React frontend** on port 3000

### 3. Open the Dashboard

Navigate to [http://localhost:3000](http://localhost:3000)

### 4. Upload a Meeting

Click "Upload & Process", select an audio file, and wait for the AI pipeline to complete.

## Running Without Docker

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start PostgreSQL locally and update DATABASE_URL in .env
cp ../.env.example .env
# Edit .env

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, React Router |
| Backend | Python 3.11, FastAPI, SQLAlchemy |
| Speech-to-Text | OpenAI Whisper (local) |
| LLM | OpenAI GPT-4o-mini or Google Gemini |
| Embeddings | SentenceTransformers (all-MiniLM-L6-v2) |
| Vector DB | FAISS |
| Database | PostgreSQL 16 |
| Deployment | Docker, Docker Compose, Nginx |

## Project Structure

```
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py              # FastAPI entry point
│       ├── config.py            # Settings
│       ├── database.py          # SQLAlchemy setup
│       ├── models/meeting.py    # ORM models
│       ├── schemas/meeting.py   # Pydantic schemas
│       ├── api/routes/          # API endpoints
│       └── services/            # AI modules
│           ├── transcription.py # Whisper STT
│           ├── summarization.py # LLM summaries
│           ├── task_extraction.py
│           ├── embeddings.py    # FAISS + SentenceTransformers
│           └── search.py        # RAG pipeline
└── frontend/
    ├── Dockerfile
    └── src/
        ├── api/client.js        # API client
        ├── components/          # React components
        └── pages/               # Route pages
```
