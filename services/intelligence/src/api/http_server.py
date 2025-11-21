"""FastAPI server for the Advent Intelligence service."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import structlog

from ..settings import settings
from ..core.chat_engine import chat_engine
from .schemas import (
    ChatStreamRequest,
    ChatStreamResponse,
    GenerateDaysRequest,
    GenerateDaysResponse,
    ErrorResponse
)

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Advent Intelligence Service",
    description="AI-powered chat and content generation for Advent Calendar",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "advent-intelligence"}


@app.post("/chat/stream", response_model=ChatStreamResponse)
async def chat_stream(request: ChatStreamRequest):
    """Stream a chat response for the given conversation."""

    try:
        logger.info(
            "Chat stream request",
            child_id=request.child_id,
            session_id=request.session_id,
            persona=request.persona,
            message_length=len(request.message)
        )

        # Generate streaming response
        async def generate_response():
            try:
                async for chunk in chat_engine.generate_response(
                    child_id=request.child_id,
                    session_id=request.session_id,
                    user_message=request.message,
                    persona=request.persona,
                    child_name="Child",  # TODO: Get from backend API
                    custom_prompt=request.custom_prompt,
                    conversation_history=request.conversation_history
                ):
                    yield f"data: {chunk}\n\n"

                # Send completion signal
                yield "data: [DONE]\n\n"

            except Exception as e:
                logger.error("Streaming error", error=str(e))
                yield f"data: [ERROR] {str(e)}\n\n"

        return StreamingResponse(
            generate_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )

    except Exception as e:
        logger.error("Chat stream failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/generate_days", response_model=GenerateDaysResponse)
async def generate_days(request: GenerateDaysRequest):
    """Generate 24 personalized daily messages for the advent calendar."""

    try:
        logger.info(
            "Generate days request",
            child_id=request.child_id,
            child_name=request.child_name,
            persona=request.persona
        )

        messages = await chat_engine.generate_daily_messages(
            child_id=request.child_id,
            child_name=request.child_name,
            persona=request.persona,
            custom_prompt=request.custom_prompt,
            theme=request.theme
        )

        return GenerateDaysResponse(messages=messages)

    except Exception as e:
        logger.error("Generate days failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.on_event("startup")
async def startup_event():
    """Initialize service on startup."""
    logger.info("Starting Advent Intelligence Service")


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown."""
    logger.info("Shutting down Advent Intelligence Service")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "http_server:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )