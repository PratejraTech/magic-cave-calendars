"""Manages short-term and long-term memory for chat sessions."""

import json
from typing import List, Dict, Any, Optional
import redis.asyncio as redis
import structlog

from ..settings import settings

logger = structlog.get_logger(__name__)


class MemoryManager:
    """Manages chat memory using Redis for short-term and long-term storage."""

    def __init__(self):
        self.redis_client = redis.from_url(settings.redis_url, decode_responses=True)

    async def store_short_term_memory(
        self,
        child_id: str,
        session_id: str,
        messages: List[Dict[str, Any]]
    ) -> None:
        """Store the last 5 messages for a chat session."""
        try:
            # Keep only the last 5 messages
            recent_messages = messages[-5:] if len(messages) > 5 else messages

            key = f"session:{session_id}"
            data = {
                "child_id": child_id,
                "messages": recent_messages,
                "updated_at": self._get_timestamp()
            }

            await self.redis_client.setex(
                key,
                settings.memory_ttl_days * 24 * 60 * 60,  # Convert days to seconds
                json.dumps(data)
            )

            logger.debug(f"Stored short-term memory for session {session_id}")

        except Exception as e:
            logger.error(f"Failed to store short-term memory: {e}")
            raise

    async def load_short_term_memory(self, session_id: str) -> List[Dict[str, Any]]:
        """Load recent messages for a chat session."""
        try:
            key = f"session:{session_id}"
            data = await self.redis_client.get(key)

            if data:
                parsed = json.loads(data)
                return parsed.get("messages", [])
            else:
                return []

        except Exception as e:
            logger.error(f"Failed to load short-term memory: {e}")
            return []

    async def store_long_term_memory(
        self,
        child_id: str,
        messages: List[Dict[str, Any]],
        embeddings: Optional[List[List[float]]] = None
    ) -> None:
        """Store historical chat data for long-term memory retrieval."""
        try:
            # Store as chunks for better retrieval
            chunks = self._chunk_messages(messages)

            for i, chunk in enumerate(chunks):
                key = f"memory:{child_id}:chunk:{i}"
                data = {
                    "child_id": child_id,
                    "chunk_id": i,
                    "messages": chunk,
                    "embedding": embeddings[i] if embeddings and i < len(embeddings) else None,
                    "created_at": self._get_timestamp()
                }

                await self.redis_client.setex(
                    key,
                    settings.memory_ttl_days * 24 * 60 * 60,
                    json.dumps(data)
                )

            logger.debug(f"Stored {len(chunks)} long-term memory chunks for child {child_id}")

        except Exception as e:
            logger.error(f"Failed to store long-term memory: {e}")
            raise

    async def search_long_term_memory(
        self,
        child_id: str,
        query_embedding: List[float],
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """Search for relevant historical memories using embeddings."""
        try:
            # Get all memory chunks for this child
            pattern = f"memory:{child_id}:chunk:*"
            keys = await self.redis_client.keys(pattern)

            relevant_chunks = []

            for key in keys:
                data = await self.redis_client.get(key)
                if data:
                    parsed = json.loads(data)
                    embedding = parsed.get("embedding")

                    if embedding:
                        # Calculate cosine similarity
                        similarity = self._cosine_similarity(query_embedding, embedding)
                        if similarity > 0.7:  # Relevance threshold
                            relevant_chunks.append({
                                "chunk": parsed,
                                "similarity": similarity
                            })

            # Sort by similarity and return top results
            relevant_chunks.sort(key=lambda x: x["similarity"], reverse=True)
            return [chunk["chunk"] for chunk in relevant_chunks[:limit]]

        except Exception as e:
            logger.error(f"Failed to search long-term memory: {e}")
            return []

    def _chunk_messages(self, messages: List[Dict[str, Any]], chunk_size: int = 10) -> List[List[Dict[str, Any]]]:
        """Split messages into chunks for better storage and retrieval."""
        return [messages[i:i + chunk_size] for i in range(0, len(messages), chunk_size)]

    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        import math

        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a * a for a in vec1))
        norm2 = math.sqrt(sum(b * b for b in vec2))

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return dot_product / (norm1 * norm2)

    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format."""
        from datetime import datetime
        return datetime.utcnow().isoformat()

    async def cleanup_expired_memory(self) -> int:
        """Clean up expired memory entries (handled automatically by Redis TTL)."""
        # Redis handles TTL automatically, but we can add custom cleanup logic here
        logger.info("Memory cleanup completed (Redis TTL handles expiration)")
        return 0


# Global memory manager instance
memory_manager = MemoryManager()