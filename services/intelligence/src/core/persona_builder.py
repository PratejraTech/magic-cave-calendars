"""Builds persona-specific prompts for chat interactions."""

import os
from pathlib import Path
from typing import Dict, Optional
import structlog

from ..api.schemas import PersonaType

logger = structlog.get_logger(__name__)


class PersonaBuilder:
    """Builds chat prompts based on persona type and child information."""

    def __init__(self):
        self.prompts_dir = Path(__file__).parent.parent / "prompts" / "parent_chat"
        self._prompt_cache: Dict[str, str] = {}

    def build_system_prompt(
        self,
        persona: PersonaType,
        child_name: str,
        custom_prompt: Optional[str] = None
    ) -> str:
        """Build a complete system prompt for the chat persona."""

        base_prompt = self._load_base_prompt()

        if persona == PersonaType.CUSTOM and custom_prompt:
            persona_prompt = custom_prompt
        else:
            persona_prompt = self._load_persona_prompt(persona)

        # Combine prompts with child personalization
        system_prompt = f"""{base_prompt}

{persona_prompt}

Child's name: {child_name}

Remember to be warm, loving, and age-appropriate in your responses."""

        return system_prompt

    def _load_base_prompt(self) -> str:
        """Load the base chat prompt template."""
        return self._load_prompt_file("base.md")

    def _load_persona_prompt(self, persona: PersonaType) -> str:
        """Load persona-specific prompt."""
        filename = f"{persona.value}_variant.md"
        return self._load_prompt_file(filename)

    def _load_prompt_file(self, filename: str) -> str:
        """Load a prompt file from the prompts directory."""
        if filename in self._prompt_cache:
            return self._prompt_cache[filename]

        prompt_path = self.prompts_dir / filename

        try:
            with open(prompt_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                self._prompt_cache[filename] = content
                return content
        except FileNotFoundError:
            logger.warning(f"Prompt file not found: {filename}, using fallback")
            return self._get_fallback_prompt(filename)
        except Exception as e:
            logger.error(f"Error loading prompt file {filename}: {e}")
            return self._get_fallback_prompt(filename)

    def _get_fallback_prompt(self, filename: str) -> str:
        """Provide fallback prompts when files are missing."""
        fallbacks = {
            "base.md": """You are a loving parent figure in a magical advent calendar experience.
Your role is to provide warm, encouraging, and age-appropriate responses to your child.
Keep responses positive, engaging, and focused on building emotional connection.""",

            "mummy_variant.md": """You are Mummy, speaking warmly and nurturingly to your child.
Use terms of endearment like "darling," "sweetheart," "my love."
Focus on comfort, care, and gentle guidance.""",

            "daddy_variant.md": """You are Daddy, speaking with warmth and playfulness to your child.
Use terms of endearment like "buddy," "champ," "my little explorer."
Focus on encouragement, fun, and gentle strength.""",

            "custom_variant.md": """You are a loving parent figure speaking to your child.
Adapt your communication style to be warm, supportive, and engaging."""
        }

        return fallbacks.get(filename, fallbacks["base.md"])


# Global persona builder instance
persona_builder = PersonaBuilder()