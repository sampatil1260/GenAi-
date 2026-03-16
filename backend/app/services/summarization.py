"""
Meeting summarization using an LLM (OpenAI GPT or Google Gemini).

Produces structured output:
  - topic
  - summary
  - key_points
  - decisions
  - highlights
"""

import json
import logging
from typing import Optional

import openai
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# ── System prompt for the summarizer ─────────────────────────────
SUMMARIZATION_PROMPT = """You are an expert meeting analyst. Given a meeting transcript,
produce a structured JSON summary with exactly these keys:

{
  "topic": "One-line meeting topic",
  "summary": "2-4 paragraph executive summary",
  "key_points": ["point 1", "point 2", ...],
  "decisions": ["decision 1", "decision 2", ...],
  "highlights": ["highlight 1", "highlight 2", ...]
}

Rules:
- key_points: 3-7 bullet points of the most important discussion items.
- decisions: Any commitments or decisions agreed upon.
- highlights: Notable quotes, milestones, or surprises.
- If the transcript is unclear, do your best and note uncertainty.
- Return ONLY valid JSON, no markdown fences.
"""


class SummarizationService:
    """Summarizes meeting transcripts using an LLM."""

    def __init__(self):
        if settings.LLM_PROVIDER == "openai":
            self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        elif settings.LLM_PROVIDER == "gemini":
            # Google Gemini via OpenAI-compatible endpoint
            self.client = openai.OpenAI(
                api_key=settings.GEMINI_API_KEY,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {settings.LLM_PROVIDER}")

    def summarize(self, transcript: str) -> dict:
        """
        Summarize a meeting transcript.

        Args:
            transcript: Full text transcript of the meeting.

        Returns:
            dict with keys: topic, summary, key_points, decisions, highlights
        """
        logger.info(f"Summarizing transcript ({len(transcript)} chars)")

        # Truncate very long transcripts to stay within context limits
        max_chars = 12000
        truncated = transcript[:max_chars]
        if len(transcript) > max_chars:
            truncated += "\n\n[TRANSCRIPT TRUNCATED]"

        model = (
            "gpt-4o-mini" if settings.LLM_PROVIDER == "openai"
            else "gemini-2.5-flash"
        )

        response = self.client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SUMMARIZATION_PROMPT},
                {"role": "user", "content": f"Meeting Transcript:\n\n{truncated}"},
            ],
            temperature=0.3,
            max_tokens=2000,
        )

        raw = response.choices[0].message.content.strip()

        # Parse JSON from LLM response (handle markdown code fences)
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]

        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            logger.warning("LLM returned invalid JSON, using fallback")
            result = {
                "topic": "Meeting Summary",
                "summary": raw,
                "key_points": [],
                "decisions": [],
                "highlights": [],
            }

        logger.info(f"Summary generated: topic='{result.get('topic', '')}'")
        return result