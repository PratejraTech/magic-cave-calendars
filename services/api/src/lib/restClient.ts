import { ChatMessage } from '../modules/chat/chat.repository';

export interface ChatStreamRequest {
  session_id: string;
  child_id: string;
  message: string;
  context_messages?: ChatMessage[];
  persona_config?: {
    persona: 'mummy' | 'daddy' | 'custom';
    custom_prompt?: string;
  };
}

export interface ChatStreamResponse {
  session_id: string;
  response: string;
  finished: boolean;
}

export interface GenerateDaysRequest {
  child_id: string;
  persona_config: {
    persona: 'mummy' | 'daddy' | 'custom';
    custom_prompt?: string;
  };
  existing_days?: Array<{
    day_number: number;
    current_content?: string;
  }>;
}

export interface GenerateDaysResponse {
  days: Array<{
    day_number: number;
    suggested_content: string;
  }>;
}

export class RestClient {
  constructor(private baseUrl: string) {}

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  /**
   * Stream chat response from intelligence service
   * Note: This is a simplified implementation. In production, this would use
   * Server-Sent Events or WebSockets for true streaming.
   */
  async streamChatResponse(request: ChatStreamRequest): Promise<ChatStreamResponse> {
    return this.makeRequest<ChatStreamResponse>('/chat/stream', 'POST', request);
  }

  /**
   * Generate daily messages for calendar
   */
  async generateCalendarDays(request: GenerateDaysRequest): Promise<GenerateDaysResponse> {
    return this.makeRequest<GenerateDaysResponse>('/chat/generate_days', 'POST', request);
  }

  /**
   * Health check for intelligence service
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest('/health', 'GET');
  }
}

// Factory function to create configured RestClient
export function createRestClient(): RestClient {
  const intelligenceServiceUrl = process.env.INTELLIGENCE_SERVICE_URL || 'http://localhost:8000';
  return new RestClient(intelligenceServiceUrl);
}