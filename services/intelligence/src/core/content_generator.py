"""Content generation engine for multi-product AI-powered content creation."""

import json
import os
from pathlib import Path
from typing import Dict, Any, Optional, Union
import structlog

from ..integrations.openai_client import openai_client
from ..api.schemas import (
    ProductType,
    CalendarContent,
    StorybookContent,
    GameContent,
    ContentGenerationError
)

logger = structlog.get_logger(__name__)


class ContentGenerationEngine:
    """Handles AI-powered content generation for multiple product types."""

    def __init__(self):
        self.prompts_dir = Path(__file__).parent.parent / "prompts"

    async def generate_content(
        self,
        template_id: str,
        custom_data: Dict[str, Any],
        product_type: ProductType,
        product_config: Optional[Dict[str, Any]] = None
    ) -> Union[CalendarContent, StorybookContent, GameContent]:
        """Generate content for the specified product type using template and custom data."""

        try:
            logger.info(
                "Generating content",
                template_id=template_id,
                product_type=product_type.value,
                custom_data_keys=list(custom_data.keys())
            )

            # Validate product type support
            if not self._is_product_type_supported(product_type):
                raise ValueError(f"Unsupported product type: {product_type}")

            # Load and prepare prompt
            prompt = await self._load_prompt(product_type, template_id)
            if not prompt:
                raise ValueError(f"Prompt not found for product type {product_type} and template {template_id}")

            # Inject custom data into prompt
            processed_prompt = self._inject_custom_data(prompt, custom_data, product_config or {})

            # Generate content using AI
            ai_response = await self._call_ai_generation(processed_prompt, product_type)

            # Parse and validate response
            content = self._parse_ai_response(ai_response, product_type)

            logger.info(
                "Content generation successful",
                template_id=template_id,
                product_type=product_type.value,
                content_type=type(content).__name__
            )

            return content

        except Exception as e:
            logger.error(
                "Content generation failed",
                template_id=template_id,
                product_type=product_type.value,
                error=str(e)
            )
            raise

    def _is_product_type_supported(self, product_type: ProductType) -> bool:
        """Check if the product type is supported for AI generation."""
        supported_types = {ProductType.CALENDAR, ProductType.STORYBOOK, ProductType.INTERACTIVE_GAME}
        return product_type in supported_types

    async def _load_prompt(self, product_type: ProductType, template_id: str) -> Optional[str]:
        """Load the appropriate prompt template for the product type and template."""
        # For now, use base template. In future, could support specific template variants
        prompt_path = self.prompts_dir / product_type.value / "base.md"

        if not prompt_path.exists():
            return None

        try:
            with open(prompt_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Failed to load prompt {prompt_path}: {e}")
            return None

    def _inject_custom_data(
        self,
        prompt: str,
        custom_data: Dict[str, Any],
        product_config: Dict[str, Any]
    ) -> str:
        """Inject custom data and product config into the prompt template."""
        # Combine custom data with product config
        all_data = {**custom_data, **product_config}

        # Replace placeholders in prompt
        processed_prompt = prompt
        for key, value in all_data.items():
            placeholder = f"{{{key}}}"
            if isinstance(value, (list, dict)):
                # Convert complex types to string representation
                processed_prompt = processed_prompt.replace(placeholder, str(value))
            else:
                processed_prompt = processed_prompt.replace(placeholder, str(value))

        return processed_prompt

    async def _call_ai_generation(self, prompt: str, product_type: ProductType) -> str:
        """Call the AI service to generate content."""
        system_message = self._get_system_message(product_type)

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]

        # Use OpenAI client to generate response
        response_text = ""
        async for chunk in openai_client.create_chat_completion(
            messages=messages,
            temperature=0.7,  # Creative but consistent
            max_tokens=self._get_max_tokens(product_type),
            stream=False
        ):
            response_text += chunk

        return response_text

    def _get_system_message(self, product_type: ProductType) -> str:
        """Get the system message for the specific product type."""
        base_message = "You are an expert content creator. Generate high-quality, engaging content following the exact JSON format specified in the prompt. Ensure all required fields are present and properly formatted."

        type_specific = {
            ProductType.CALENDAR: "Specialize in creating personalized advent calendar experiences that build excitement and wonder throughout the holiday season.",
            ProductType.STORYBOOK: "Specialize in crafting engaging children's stories with rich narratives, compelling characters, and age-appropriate content.",
            ProductType.INTERACTIVE_GAME: "Specialize in designing educational games that combine learning objectives with engaging gameplay mechanics."
        }

        return f"{base_message} {type_specific.get(product_type, '')}"

    def _get_max_tokens(self, product_type: ProductType) -> int:
        """Get the maximum tokens for generation based on product type."""
        # Adjust based on expected content complexity
        token_limits = {
            ProductType.CALENDAR: 4000,      # 24 days with content
            ProductType.STORYBOOK: 6000,     # Multiple chapters with illustrations
            ProductType.INTERACTIVE_GAME: 3000  # Levels with challenges and rewards
        }
        return token_limits.get(product_type, 2000)

    def _parse_ai_response(
        self,
        ai_response: str,
        product_type: ProductType
    ) -> Union[CalendarContent, StorybookContent, GameContent]:
        """Parse the AI response and validate it against the expected schema."""
        try:
            # Parse JSON response
            data = json.loads(ai_response)

            # Validate and convert based on product type
            if product_type == ProductType.CALENDAR:
                return CalendarContent(**data)
            elif product_type == ProductType.STORYBOOK:
                return StorybookContent(**data)
            elif product_type == ProductType.INTERACTIVE_GAME:
                return GameContent(**data)
            else:
                raise ValueError(f"Unsupported product type for parsing: {product_type}")

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            raise ValueError("AI response is not valid JSON")
        except Exception as e:
            logger.error(f"Failed to validate AI response: {e}")
            raise ValueError(f"AI response does not match expected schema: {e}")


# Global instance
content_generator = ContentGenerationEngine()