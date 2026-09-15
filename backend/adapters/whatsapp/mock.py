import uuid
from typing import Dict, Any, List
from .base import BaseWhatsAppAdapter


class MockWhatsAppAdapter(BaseWhatsAppAdapter):
    """Mock WhatsApp adapter for development and testing."""

    def send_template(self, to_mobile: str, template_name: str, language_code: str, params: List[str]) -> Dict[str, Any]:
        msg_id = f"wa_mock_{uuid.uuid4().hex[:12]}"
        return {
            "status": "queued",
            "message_id": msg_id,
            "to": to_mobile,
            "template": template_name,
            "params": params,
        }

    def send_text_message(self, to_mobile: str, message: str) -> Dict[str, Any]:
        msg_id = f"wa_mock_{uuid.uuid4().hex[:12]}"
        return {
            "status": "queued",
            "message_id": msg_id,
            "to": to_mobile,
            "content": message,
        }

    def parse_webhook_event(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "message_id": payload.get("message_id"),
            "event": payload.get("event", "delivered"),
            "timestamp": payload.get("timestamp"),
            "inbound_text": payload.get("text"),
        }
