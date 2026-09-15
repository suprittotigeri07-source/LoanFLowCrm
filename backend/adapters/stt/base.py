from abc import ABC, abstractmethod
from typing import Dict, Any


class BaseSTTAdapter(ABC):
    """Abstract interface for Speech-to-Text providers."""

    @abstractmethod
    def transcribe_audio(self, audio_url: str) -> Dict[str, Any]:
        """Transcribe an audio file at the given URL."""
        pass
