import { ChatRepository, CreateChatRecordData, CreateChatMessageData } from './chat.repository';

export class ChatService {
  constructor(private chatRepository: ChatRepository) {}

  async createChatSession(sessionData: CreateChatRecordData) {
    return await this.chatRepository.createChatRecord(sessionData);
  }

  async getChatSession(sessionId: string) {
    const session = await this.chatRepository.findChatRecordBySessionId(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }
    return session;
  }

  async getChatHistory(childId: string, limit = 50) {
    return await this.chatRepository.findChatRecordsByChildId(childId, limit);
  }

  async getChatMessages(chatRecordId: string, limit = 100) {
    // Verify the chat record exists
    const session = await this.chatRepository.findChatRecordById(chatRecordId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    return await this.chatRepository.findMessagesByChatRecordId(chatRecordId, limit);
  }

  async addChildMessage(sessionId: string, messageText: string) {
    // Get or create chat session
    let session = await this.chatRepository.findChatRecordBySessionId(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Add child message
    const message = await this.chatRepository.createChatMessage({
      chat_record_id: session.chat_record_id,
      sender: 'child',
      message_text: messageText,
    });

    return { session, message };
  }

  async addParentAgentMessage(sessionId: string, messageText: string) {
    // Get chat session
    const session = await this.chatRepository.findChatRecordBySessionId(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Add parent agent message
    const message = await this.chatRepository.createChatMessage({
      chat_record_id: session.chat_record_id,
      sender: 'parent_agent',
      message_text: messageText,
    });

    return { session, message };
  }

  async getRecentMessagesForContext(childId: string) {
    return await this.chatRepository.findRecentMessagesByChildId(childId, 5);
  }

  async getLastFiveMessages(chatRecordId: string) {
    return await this.chatRepository.getLastFiveMessages(chatRecordId);
  }

  // Cleanup method for retention policy (called by scheduled job)
  async cleanupOldChats(cutoffDate: string) {
    const deletedCount = await this.chatRepository.deleteOldChatRecords(cutoffDate);
    return { deletedRecords: deletedCount };
  }
}