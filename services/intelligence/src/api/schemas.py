"""Pydantic schemas for API requests and responses."""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
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


# Multi-Product Generation Schemas

class ProductType(str, Enum):
    """Supported product types for content generation."""
    CALENDAR = "calendar"
    STORYBOOK = "storybook"
    INTERACTIVE_GAME = "interactive_game"


class GenerateContentRequest(BaseModel):
    """Request for generating content for any product type."""
    template_id: str = Field(..., description="Template identifier")
    custom_data: Dict[str, Any] = Field(..., description="Custom data for template personalization")
    product_type: ProductType = Field(..., description="Target product type")
    product_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Product-specific configuration")


class CalendarDayEntry(BaseModel):
    """Calendar day content entry."""
    day: int = Field(..., ge=1, le=24, description="Day number (1-24)")
    photo_url: Optional[str] = Field(None, description="Optional photo URL placeholder")
    text: str = Field(..., description="Day content text")


class StorybookChapter(BaseModel):
    """Storybook chapter content entry."""
    chapter_number: int = Field(..., ge=1, description="Chapter number")
    page_content: str = Field(..., description="Chapter/page content")
    illustrations: Optional[List[str]] = Field(default_factory=list, description="Illustration URLs")


class GameLevel(BaseModel):
    """Interactive game level content entry."""
    level_number: int = Field(..., ge=1, description="Level number")
    challenges: List[str] = Field(..., description="Level challenges")
    rewards: List[str] = Field(..., description="Level rewards")


class CalendarContent(BaseModel):
    """Generated content for calendar product type."""
    day_entries: List[CalendarDayEntry] = Field(..., description="Calendar day entries")
    chat_persona_prompt: str = Field(..., description="Chat persona prompt")
    surprise_urls: List[str] = Field(default_factory=list, description="Surprise content URLs")


class StorybookContent(BaseModel):
    """Generated content for storybook product type."""
    chapters: List[StorybookChapter] = Field(..., description="Storybook chapters")
    chat_persona_prompt: str = Field(..., description="Chat persona prompt")
    theme_elements: List[str] = Field(default_factory=list, description="Story theme elements")


class GameContent(BaseModel):
    """Generated content for interactive game product type."""
    levels: List[GameLevel] = Field(..., description="Game levels")
    chat_persona_prompt: str = Field(..., description="Chat persona prompt")
    game_mechanics: List[str] = Field(default_factory=list, description="Game mechanics descriptions")


class GenerateContentResponse(BaseModel):
    """Response for multi-product content generation."""
    product_type: ProductType = Field(..., description="Generated content product type")
    template_id: str = Field(..., description="Template used for generation")
    content: Union[CalendarContent, StorybookContent, GameContent] = Field(..., description="Generated content")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Generation metadata")


class ContentGenerationError(str, Enum):
    """Content generation error types."""
    UNSUPPORTED_PRODUCT_TYPE = "UNSUPPORTED_PRODUCT_TYPE"
    TEMPLATE_INCOMPATIBLE = "TEMPLATE_INCOMPATIBLE"
    SCHEMA_VALIDATION_FAILED = "SCHEMA_VALIDATION_FAILED"
    CUSTOM_DATA_INVALID = "CUSTOM_DATA_INVALID"
    GENERATION_FAILED = "GENERATION_FAILED"