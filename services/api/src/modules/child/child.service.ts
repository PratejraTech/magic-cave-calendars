import { ChildRepository, CreateChildData, UpdateChildData } from './child.repository';

export class ChildService {
  constructor(private childRepository: ChildRepository) {}

  async getChildById(childId: string) {
    const child = await this.childRepository.findById(childId);
    if (!child) {
      throw new Error('Child not found');
    }
    return child;
  }

  async getChildByAccountId(accountId: string) {
    return await this.childRepository.findByAccountId(accountId);
  }

  async createChild(childData: CreateChildData) {
    // Enforce one child per account
    const existingChild = await this.childRepository.existsForAccount(childData.account_id);
    if (existingChild) {
      throw new Error('Account already has a child');
    }

    // Validate chat persona
    if (!['mummy', 'daddy', 'custom'].includes(childData.chat_persona)) {
      throw new Error('Invalid chat persona');
    }

    // If custom persona, custom prompt is required
    if (childData.chat_persona === 'custom' && !childData.custom_chat_prompt) {
      throw new Error('Custom chat prompt required for custom persona');
    }

    return await this.childRepository.create(childData);
  }

  async updateChild(childId: string, updateData: UpdateChildData) {
    // Validate chat persona if provided
    if (updateData.chat_persona && !['mummy', 'daddy', 'custom'].includes(updateData.chat_persona)) {
      throw new Error('Invalid chat persona');
    }

    // If changing to custom persona, custom prompt is required
    if (updateData.chat_persona === 'custom' && !updateData.custom_chat_prompt) {
      // Check if we already have a custom prompt
      const existingChild = await this.childRepository.findById(childId);
      if (!existingChild?.custom_chat_prompt && !updateData.custom_chat_prompt) {
        throw new Error('Custom chat prompt required for custom persona');
      }
    }

    return await this.childRepository.update(childId, updateData);
  }

  async deleteChild(childId: string) {
    // Verify child exists
    const child = await this.childRepository.findById(childId);
    if (!child) {
      throw new Error('Child not found');
    }

    await this.childRepository.delete(childId);
  }
}