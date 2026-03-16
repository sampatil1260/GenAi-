"""
Action item / task extraction from meeting transcripts.

Uses an LLM to identify who is responsible for what.
Output format: [{"assignee": "Name", "task": "Description", "priority": "high|medium|low"}]
"""

import json
import logging

import openai
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

TASK_EXTRACTION_PROMPT = """You are an expert at extracting action items from meeting transcripts.

Given a meeting transcript, extract all action items and return a JSON array.
Each item must have:

{
  "assignee": "Person's name (use 'Unassigned' if unclear)",
  "task": "Clear description of what needs to be done",
  "priority": "high | medium | low"
}

Rules:
- Look for phrases like "will do", "take care of", "responsible for", "action item",
  "needs to", "should", "let's", "follow up", "deadline", etc.
- If no tasks are found, return an empty array: []
- Return ONLY valid JSON, no markdown fences.
"""


class TaskExtractionService:
    """Extracts structured action items from transcripts."""

    def __init__(self):
        if settings.LLM_PROVIDER == "openai":
            self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        elif settings.LLM_PROVIDER == "gemini":
            self.client = openai.OpenAI(
                api_key=settings.GEMINI_API_KEY,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            )

    def extract_tasks(self, transcript: str) -> list[dict]:
        """
        Extract action items from a transcript.

        Args:
            transcript: Full meeting transcript text.

        Returns:
            List of dicts with keys: assignee, task, priority
        """
        logger.info("Extracting action items from transcript")

        max_chars = 12000
        truncated = transcript[:max_chars]

        model = (
            "gpt-4o-mini" if settings.LLM_PROVIDER == "openai"
            else "gemini-2.5-flash"
        )

        response = self.client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": TASK_EXTRACTION_PROMPT},
                {"role": "user", "content": f"Meeting Transcript:\n\n{truncated}"},
            ],
            temperature=0.2,
            max_tokens=1500,
        )

        raw = response.choices[0].message.content.strip()

        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]

        try:
            tasks = json.loads(raw)
            if not isinstance(tasks, list):
                tasks = []
        except json.JSONDecodeError:
            logger.warning("Failed to parse task extraction JSON")
            tasks = []

        logger.info(f"Extracted {len(tasks)} action items")
        return tasks