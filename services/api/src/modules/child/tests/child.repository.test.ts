import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { ChildRepository } from '../child.repository';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  })),
}));

describe('ChildRepository', () => {
  let repository: ChildRepository;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createClient('mock-url', 'mock-key');
    repository = new ChildRepository(mockSupabase);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a child successfully', async () => {
      const mockChild = {
        child_id: 'test-child-id',
        account_id: 'test-account-id',
        child_name: 'Test Child',
        hero_photo_url: 'https://example.com/photo.jpg',
        chat_persona: 'daddy' as const,
        custom_chat_prompt: undefined,
        theme: 'snow',
        created_at: new Date().toISOString(),
      };

      const mockResponse = { data: mockChild, error: null };
      mockSupabase.from('child').insert().select().single.mockResolvedValue(mockResponse);

      const result = await repository.create({
        account_id: 'test-account-id',
        child_name: 'Test Child',
        hero_photo_url: 'https://example.com/photo.jpg',
        chat_persona: 'daddy',
      });

      expect(result).toEqual(mockChild);
    });

    it('should throw error when creation fails', async () => {
      const mockError = { message: 'Database error' };
      mockSupabase.from('child').insert().select().single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(repository.create({
        account_id: 'test-account-id',
        child_name: 'Test Child',
        chat_persona: 'daddy',
      })).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return child when found', async () => {
      const mockChild = {
        child_id: 'test-child-id',
        account_id: 'test-account-id',
        child_name: 'Test Child',
        hero_photo_url: 'https://example.com/photo.jpg',
        chat_persona: 'daddy' as const,
        custom_chat_prompt: undefined,
        theme: 'snow',
        created_at: new Date().toISOString(),
      };

      const mockResponse = { data: mockChild, error: null };
      mockSupabase.from('child').select().eq().single.mockResolvedValue(mockResponse);

      const result = await repository.findById('test-child-id');

      expect(result).toEqual(mockChild);
    });

    it('should return null when child not found', async () => {
      const mockResponse = { data: null, error: { code: 'PGRST116' } };
      mockSupabase.from('child').select().eq().single.mockResolvedValue(mockResponse);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByAccountId', () => {
    it('should return child for account', async () => {
      const mockChild = {
        child_id: 'test-child-id',
        account_id: 'test-account-id',
        child_name: 'Test Child',
        hero_photo_url: 'https://example.com/photo.jpg',
        chat_persona: 'daddy' as const,
        custom_chat_prompt: undefined,
        theme: 'snow',
        created_at: new Date().toISOString(),
      };

      const mockResponse = { data: mockChild, error: null };
      mockSupabase.from('child').select().eq().single.mockResolvedValue(mockResponse);

      const result = await repository.findByAccountId('test-account-id');

      expect(result).toEqual(mockChild);
    });

    it('should return null when no child exists for account', async () => {
      const mockResponse = { data: null, error: { code: 'PGRST116' } };
      mockSupabase.from('child').select().eq().single.mockResolvedValue(mockResponse);

      const result = await repository.findByAccountId('test-account-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update child successfully', async () => {
      const mockChild = {
        child_id: 'test-child-id',
        account_id: 'test-account-id',
        child_name: 'Updated Name',
        hero_photo_url: 'https://example.com/photo.jpg',
        chat_persona: 'daddy' as const,
        custom_chat_prompt: undefined,
        theme: 'snow',
        created_at: new Date().toISOString(),
      };

      const mockResponse = { data: mockChild, error: null };
      mockSupabase.from('child').update().eq().select().single.mockResolvedValue(mockResponse);

      const result = await repository.update('test-child-id', {
        child_name: 'Updated Name',
      });

      expect(result).toEqual(mockChild);
    });

    it('should throw error when update fails', async () => {
      const mockError = { message: 'Update failed' };
      mockSupabase.from('child').update().eq().select().single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(repository.update('test-child-id', {
        child_name: 'Updated Name',
      })).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete child successfully', async () => {
      const mockResponse = { error: null };
      mockSupabase.from('child').delete().eq.mockResolvedValue(mockResponse);

      await expect(repository.delete('test-child-id')).resolves.toBeUndefined();
    });

    it('should throw error when deletion fails', async () => {
      const mockError = { message: 'Deletion failed' };
      mockSupabase.from('child').delete().eq.mockResolvedValue({
        error: mockError,
      });

      await expect(repository.delete('test-child-id')).rejects.toThrow('Deletion failed');
    });
  });
});