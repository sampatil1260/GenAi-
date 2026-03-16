"""
Speech-to-Text service using OpenAI Whisper.

Whisper runs locally — no API key needed for transcription.
Supports audio: .wav, .mp3, .m4a, .webm, .ogg
Supports video: .mp4, .mkv, .mov, .avi (audio extracted via FFmpeg)
"""

import os
import subprocess
import whisper
import logging

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Video formats that need audio extraction before transcription
VIDEO_EXTENSIONS = {".mp4", ".mkv", ".mov", ".avi"}


def extract_audio_from_video(video_path: str) -> str:
    """
    Extract audio track from a video file using FFmpeg.

    Converts to 16 kHz mono WAV — the optimal format for Whisper.

    Args:
        video_path: Path to the video file on disk.

    Returns:
        Path to the extracted audio WAV file.

    Raises:
        RuntimeError: If FFmpeg fails to extract audio.
    """
    audio_path = video_path.rsplit(".", 1)[0] + "_audio.wav"
    logger.info(f"Extracting audio from video: {video_path} → {audio_path}")

    try:
        result = subprocess.run(
            [
                "ffmpeg", "-i", video_path,
                "-vn",                  # Discard video stream
                "-acodec", "pcm_s16le", # 16-bit PCM (Whisper-friendly)
                "-ar", "16000",         # 16 kHz sample rate
                "-ac", "1",             # Mono channel
                audio_path,
                "-y",                   # Overwrite if exists
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        logger.info(f"Audio extraction complete: {audio_path}")
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg failed: {e.stderr}")
        raise RuntimeError(f"Failed to extract audio from video: {e.stderr}")

    return audio_path


class TranscriptionService:
    """Converts audio/video files to text using Whisper."""

    def __init__(self):
        logger.info(f"Loading Whisper model: {settings.WHISPER_MODEL_SIZE}")
        self.model = whisper.load_model(settings.WHISPER_MODEL_SIZE)

    def transcribe(self, file_path: str) -> dict:
        """
        Transcribe an audio or video file to text.

        For video files, audio is first extracted using FFmpeg.

        Args:
            file_path: Path to the audio or video file on disk.

        Returns:
            dict with keys:
                - text: Full transcript string
                - segments: List of time-stamped segments
                - duration: Audio duration in seconds
        """
        ext = os.path.splitext(file_path)[1].lower()

        # If it's a video file, extract audio first
        if ext in VIDEO_EXTENSIONS:
            logger.info(f"Video file detected ({ext}), extracting audio...")
            audio_path = extract_audio_from_video(file_path)
        else:
            audio_path = file_path

        logger.info(f"Transcribing: {audio_path}")

        result = self.model.transcribe(
            audio_path,
            language=None,      # auto-detect language
            verbose=False,
            fp16=False,         # CPU-safe; set True if you have a CUDA GPU
        )

        # Calculate total duration from segments
        duration = 0.0
        if result.get("segments"):
            duration = result["segments"][-1].get("end", 0.0)

        transcript = {
            "text": result["text"].strip(),
            "segments": [
                {
                    "start": seg["start"],
                    "end": seg["end"],
                    "text": seg["text"].strip(),
                }
                for seg in result.get("segments", [])
            ],
            "duration": duration,
            "language": result.get("language", "unknown"),
        }

        logger.info(
            f"Transcription complete: {len(transcript['text'])} chars, "
            f"{duration:.1f}s, language={transcript['language']}"
        )
        return transcript