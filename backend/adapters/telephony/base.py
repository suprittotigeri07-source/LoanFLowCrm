from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class BaseTelephonyAdapter(ABC):
    """Abstract interface for telephony providers (Exotel, Ozonetel, Knowlarity, etc.)."""

    @abstractmethod
    def initiate_call(self, from_number: str, to_number: str, caller_id: str, custom_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Trigger a click-to-call session between telecaller and lead."""
        pass

    @abstractmethod
    def fetch_call_recording(self, call_sid: str) -> Optional[str]:
        """Fetch the public/presigned audio URL of the recorded call."""
        pass

    @abstractmethod
    def parse_webhook_event(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Parse incoming provider webhook (call answered, disconnected, duration, recording URL)."""
        pass
