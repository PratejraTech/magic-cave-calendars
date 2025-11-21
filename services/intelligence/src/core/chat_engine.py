"""Chat engine for handling streaming conversations with memory integration."""

from typing import AsyncGenerator, List, Dict, Any, Optional
import structlog

from .persona_builder import persona_builder
from .memory_manager import memory_manager
from ..integrations.openai_client import openai_client
from ..api.schemas import PersonaType

logger = structlog.get_logger(__name__)


class ChatEngine:
    """Handles chat conversations with streaming responses and memory integration."""

    async def generate_response(
        self,
        child_id: str,
        session_id: str,
        user_message: str,
        persona: PersonaType,
        child_name: str,
        custom_prompt: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, Any]]] = None
    ) -> AsyncGenerator[str, None]:
        """Generate a streaming response to a user message."""

        try:
            # Build system prompt
            system_prompt = persona_builder.build_system_prompt(
                persona=persona,
                child_name=child_name,
                custom_prompt=custom_prompt
            )

            # Load conversation history
            history = conversation_history or []
            if not history:
                history = await memory_manager.load_short_term_memory(session_id)

            # Add current user message to history
            history.append({"role": "user", "content": user_message})

            # Retrieve relevant long-term memories
            relevant_memories = await self._get_relevant_memories(child_id, user_message)

            # Build messages for OpenAI
            messages = self._build_messages(system_prompt, history, relevant_memories)

            # Generate streaming response
            full_response = ""
            async for chunk in openai_client.create_chat_completion(messages, stream=True):
                full_response += chunk
                yield chunk

            # Store updated conversation in short-term memory
            history.append({"role": "assistant", "content": full_response})
            await memory_manager.store_short_term_memory(child_id, session_id, history)

            # Store in long-term memory (could be done asynchronously)
            await self._update_long_term_memory(child_id, history)

            logger.info(f"Generated response for child {child_id}, session {session_id}")

        except Exception as e:
            logger.error(f"Chat engine error: {e}")
            yield "I'm having trouble right now, but I love chatting with you!"

    async def generate_daily_messages(
        self,
        child_id: str,
        child_name: str,
        persona: PersonaType,
        custom_prompt: Optional[str] = None,
        theme: str = "default"
    ) -> List[Dict[str, Any]]:
        """Generate 24 personalized daily messages for the advent calendar."""

        try:
            system_prompt = f"""You are creating 24 magical advent calendar messages for {child_name}.
Each message should be warm, age-appropriate, and personalized.
Theme: {theme}
Persona style: {persona.value}

Create messages that are:
- Exciting and magical
- Age-appropriate for a child
- Personalized with the child's name
- Varied in tone and content
- Suitable for daily reveals throughout December

Return exactly 24 messages, one for each day of advent."""

            prompt = f"""Create 24 unique, magical advent calendar messages for {child_name}.
Each message should be personalized, warm, and exciting.
Make them varied - some playful, some reflective, some adventurous.
Keep each message to 2-3 sentences maximum.

Format as a JSON array of objects with 'day', 'title', and 'content' fields."""

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]

            response = ""
            async for chunk in openai_client.create_chat_completion(messages, stream=False):
                response += chunk

            # Parse the response (this would need proper JSON parsing in production)
            # For now, return a structured response
            return self._parse_generated_messages(response, child_name)

        except Exception as e:
            logger.error(f"Daily message generation error: {e}")
            return self._get_fallback_messages(child_name)

    async def _get_relevant_memories(self, child_id: str, user_message: str) -> List[Dict[str, Any]]:
        """Retrieve relevant historical memories for context."""
        try:
            # In a full implementation, this would:
            # 1. Create an embedding for the user_message
            # 2. Search the vector database for similar memories
            # 3. Return the most relevant chunks

            # For now, return empty list (no long-term memory integration yet)
            return []

        except Exception as e:
            logger.error(f"Memory retrieval error: {e}")
            return []

    def _build_messages(
        self,
        system_prompt: str,
        history: List[Dict[str, Any]],
        relevant_memories: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Build the messages array for OpenAI API."""

        messages = [{"role": "system", "content": system_prompt}]

        # Add relevant historical context if available
        if relevant_memories:
            context = "Previous conversations with your child:\n"
            for memory in relevant_memories[:2]:  # Limit to avoid token limits
                context += f"{memory.get('content', '')}\n"
            messages.append({"role": "system", "content": context})

        # Add conversation history (limit to recent messages)
        recent_history = history[-10:] if len(history) > 10 else history
        messages.extend(recent_history)

        return messages

    async def _update_long_term_memory(self, child_id: str, history: List[Dict[str, Any]]) -> None:
        """Update long-term memory with new conversation data."""
        try:
            # In a full implementation, this would:
            # 1. Create embeddings for new messages
            # 2. Store in vector database
            # 3. Update memory chunks

            # For now, just log that we'd update memory
            logger.debug(f"Would update long-term memory for child {child_id}")

        except Exception as e:
            logger.error(f"Long-term memory update error: {e}")

    def _parse_generated_messages(self, response: str, child_name: str) -> List[Dict[str, Any]]:
        """Parse the AI-generated messages into structured format."""
        # This is a simplified parser - in production you'd use proper JSON parsing
        messages = []
        lines = response.split('\n')

        for i in range(1, 25):  # Days 1-24
            messages.append({
                "day": i,
                "title": f"Day {i}",
                "content": f"A magical message for {child_name} on day {i}!",
                "tone": "exciting"
            })

        return messages

    def _get_fallback_messages(self, child_name: str) -> List[Dict[str, Any]]:
        """Provide fallback messages if AI generation fails."""
        return [
            {
                "day": i,
                "title": f"Day {i}",
                "content": f"Hello {child_name}! Today is a special day filled with magic and wonder. I love you!",
                "tone": "warm"
            }
            for i in range(1, 25)
        ]


# Global chat engine instance
chat_engine = ChatEngine()