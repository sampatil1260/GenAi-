# ── Stage 1: Build ───────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# System dependencies for psycopg2, audio processing, and FAISS
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Pin setuptools to a version that still ships pkg_resources,
# then install all requirements with build-isolation disabled
# so that openai-whisper can find pkg_resources during its wheel build.
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir "setuptools<75" wheel

COPY requirements.txt .
ENV PIP_NO_BUILD_ISOLATION=0
RUN pip install --no-cache-dir --no-build-isolation -r requirements.txt

# ── Stage 2: Runtime ────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Runtime-only system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Create directories for uploads and FAISS data
RUN mkdir -p uploads data

EXPOSE 8000

# Run with uvicorn — single worker for Whisper model loading
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]