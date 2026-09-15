import uuid
from typing import Dict, Any, Optional
from .base import BaseTelephonyAdapter


class MockTelephonyAdapter(BaseTelephonyAdapter):
    """Mock telephony adapter for local testing and Phase 1."""

    def initiate_call(self, from_number: str, to_number: str, caller_id: str, custom_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        call_sid = f"mock_call_{uuid.uuid4().hex[:12]}"
        return {
            "status": "initiated",
            "call_sid": call_sid,
            "from": from_number,
            "to": to_number,
            "message": f"Simulated call initiated between {from_number} and {to_number}"
        }

    def fetch_call_recording(self, call_sid: str) -> Optional[str]:
        return f"https://mock-s3.telecom.local/recordings/{call_sid}.mp3"

    def parse_webhook_event(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "call_sid": payload.get("call_sid", "unknown"),
            "status": payload.get("status", "completed"),
            "duration": payload.get("duration", 60),
            "recording_url": payload.get("recording_url", "https://mock-s3.telecom.local/mock.mp3")
        }
