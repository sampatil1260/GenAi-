# Health check
curl http://localhost:8000/health

# Upload a meeting
curl -X POST http://localhost:8000/api/v1/upload \
  -F "title=Sprint Planning Week 12" \
  -F "file=@./meeting-recording.wav"

# List all meetings
curl http://localhost:8000/api/v1/meetings

# Get a specific meeting
curl http://localhost:8000/api/v1/meetings/MEETING_UUID

# Get structured summary
curl http://localhost:8000/api/v1/meetings/MEETING_UUID/summary

# Semantic search
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What was discussed about the AI project deadline?", "top_k": 5}'