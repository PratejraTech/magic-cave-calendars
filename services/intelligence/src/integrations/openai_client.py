"""OpenAI client for chat completions and streaming."""

import openai
from typing import AsyncGenerator, List, Dict, Any
import structlog

from ..settings import settings

logger = structlog.get_logger(__name__)


class OpenAIClient:
    """Client for OpenAI API interactions."""

    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=settings.openai_api_key,
        )

    async def create_chat_completion(
        self,
        messages: List[Dict[str, Any]],
        stream: bool = False,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Create a chat completion, optionally streaming the response."""

        # Set default parameters
        completion_kwargs = {
            "model": settings.openai_model,
            "messages": messages,
            "temperature": settings.openai_temperature,
            "max_tokens": settings.openai_max_tokens,
            "stream": stream,
            **kwargs
        }

        try:
            if stream:
                async for chunk in self._stream_completion(completion_kwargs):
                    yield chunk
            else:
                response = await self.client.chat.completions.create(**completion_kwargs)
                content = response.choices[0].message.content or ""
                yield content

        except Exception as e:
            logger.error("OpenAI API error", error=str(e))
            raise

    async def _stream_completion(self, kwargs: Dict[str, Any]) -> AsyncGenerator[str, None]:
        """Handle streaming completion responses."""
        async for chunk in await self.client.chat.completions.create(**kwargs):
            if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                yield content

    async def create_completion(
        self,
        prompt: str,
        **kwargs
    ) -> str:
        """Create a simple completion (non-chat)."""
        try:
            response = await self.client.completions.create(
                model=settings.openai_model,
                prompt=prompt,
                temperature=settings.openai_temperature,
                max_tokens=settings.openai_max_tokens,
                **kwargs
            )
            return response.choices[0].text or ""
        except Exception as e:
            logger.error("OpenAI completion error", error=str(e))
            raise


# Global client instance
openai_client = OpenAIClient()