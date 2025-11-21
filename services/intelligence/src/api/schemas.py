"""Pydantic schemas for API requests and responses."""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class PersonaType(str, Enum):
    """Chat persona types."""
    MUMMY = "mummy"
    DADDY = "daddy"
    CUSTOM = "custom"


class ChatMessage(BaseModel):
    """A single chat message."""
    role: str = Field(..., description="Message role: 'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message content")
    image_url: Optional[str] = Field(None, description="Optional image URL for assistant messages")


class ChatStreamRequest(BaseModel):
    """Request for streaming chat."""
    child_id: str = Field(..., description="Child identifier")
    session_id: str = Field(..., description="Chat session identifier")
    persona: PersonaType = Field(..., description="Chat persona type")
    custom_prompt: Optional[str] = Field(None, description="Custom prompt for custom persona")
    message: str = Field(..., description="User message to respond to")
    conversation_history: List[ChatMessage] = Field(default_factory=list, description="Recent conversation history")


class ChatStreamResponse(BaseModel):
    """Response for streaming chat."""
    session_id: str = Field(..., description="Chat session identifier")
    response: str = Field(..., description="AI response content")


class GenerateDaysRequest(BaseModel):
    """Request for generating 24 daily messages."""
    child_id: str = Field(..., description="Child identifier")
    child_name: str = Field(..., description="Child's name for personalization")
    persona: PersonaType = Field(..., description="Chat persona type")
    custom_prompt: Optional[str] = Field(None, description="Custom prompt for custom persona")
    theme: str = Field(..., description="Calendar theme")


class DailyMessage(BaseModel):
    """A generated daily message."""
    day: int = Field(..., ge=1, le=24, description="Day number (1-24)")
    title: str = Field(..., description="Message title")
    content: str = Field(..., description="Message content")
    tone: str = Field(..., description="Message tone/mood")


class GenerateDaysResponse(BaseModel):
    """Response for daily message generation."""
    messages: List[DailyMessage] = Field(..., description="Generated daily messages")


class ErrorResponse(BaseModel):
    """Error response."""
    error: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")