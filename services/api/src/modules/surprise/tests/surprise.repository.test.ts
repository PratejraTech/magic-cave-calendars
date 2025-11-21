import { SurpriseRepository } from '../surprise.repository';

// Mock Supabase
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

describe('SurpriseRepository', () => {
  let repository: SurpriseRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SurpriseRepository(mockSupabase as any);
  });

  describe('findByCalendarId', () => {
    it('should return surprise config when found', async () => {
      const mockConfig = {
        surprise_config_id: 'config-123',
        calendar_id: 'cal-123',
        youtube_urls: ['https://youtube.com/watch?v=abc'],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockConfig,
        error: null,
      });

      const result = await repository.findByCalendarId('cal-123');

      expect(result).toEqual(mockConfig);
      expect(mockSupabase.from).toHaveBeenCalledWith('surprise_config');
      expect(mockSupabase.eq).toHaveBeenCalledWith('calendar_id', 'cal-123');
    });

    it('should return null when config not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.findByCalendarId('cal-123');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return new surprise config', async () => {
      const createData = {
        calendar_id: 'cal-123',
        youtube_urls: ['https://youtube.com/watch?v=abc'],
      };

      const mockConfig = {
        surprise_config_id: 'config-123',
        ...createData,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.select.mockResolvedValue({
        data: mockConfig,
        error: null,
      });

      const result = await repository.create(createData);

      expect(result).toEqual(mockConfig);
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        calendar_id: 'cal-123',
        youtube_urls: ['https://youtube.com/watch?v=abc'],
      });
    });
  });

  describe('upsert', () => {
    it('should upsert and return surprise config', async () => {
      const youtubeUrls = ['https://youtube.com/watch?v=abc'];
      const mockConfig = {
        surprise_config_id: 'config-123',
        calendar_id: 'cal-123',
        youtube_urls: youtubeUrls,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.select.mockResolvedValue({
        data: mockConfig,
        error: null,
      });

      const result = await repository.upsert('cal-123', youtubeUrls);

      expect(result).toEqual(mockConfig);
      expect(mockSupabase.upsert).toHaveBeenCalledWith({
        calendar_id: 'cal-123',
        youtube_urls: youtubeUrls,
      });
    });
  });
});