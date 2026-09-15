from typing import Dict, Any
from .base import BaseSTTAdapter


class StubSTTAdapter(BaseSTTAdapter):
    """Stub Speech-to-Text adapter returning placeholder transcriptions."""

    def transcribe_audio(self, audio_url: str) -> Dict[str, Any]:
        return {
            "status": "completed",
            "audio_url": audio_url,
            "transcription": "[Simulated STT] Customer is looking for ₹25 Lakhs business loan for inventory expansion before festive season. Needs call tomorrow at 4 PM.",
            "confidence": 0.94
        }
