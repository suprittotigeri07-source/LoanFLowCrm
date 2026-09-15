from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class BaseWhatsAppAdapter(ABC):
    """Abstract interface for WhatsApp Business API BSPs (Gupshup, AiSensy, Meta Cloud, etc.)."""

    @abstractmethod
    def send_template(self, to_mobile: str, template_name: str, language_code: str, params: List[str]) -> Dict[str, Any]:
        """Send an approved WhatsApp template to customer."""
        pass

    @abstractmethod
    def send_text_message(self, to_mobile: str, message: str) -> Dict[str, Any]:
        """Send a standard 24-hr session text message."""
        pass

    @abstractmethod
    def parse_webhook_event(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Parse delivery receipts (sent, delivered, read) or inbound customer replies."""
        pass
