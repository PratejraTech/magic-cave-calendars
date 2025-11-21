import { CalendarRepository } from '../calendar.repository';

// Mock Supabase
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  order: jest.fn().mockReturnThis(),
};

describe('CalendarRepository', () => {
  let repository: CalendarRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new CalendarRepository(mockSupabase as any);
  });

  describe('findById', () => {
    it('should return calendar when found', async () => {
      const mockCalendar = {
        calendar_id: '123',
        account_id: 'acc-123',
        child_id: 'child-123',
        share_uuid: 'share-123',
        is_published: false,
        year: 2025,
        created_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockCalendar,
        error: null,
      });

      const result = await repository.findById('123');

      expect(result).toEqual(mockCalendar);
      expect(mockSupabase.from).toHaveBeenCalledWith('calendar');
      expect(mockSupabase.eq).toHaveBeenCalledWith('calendar_id', '123');
    });

    it('should return null when calendar not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.findById('123');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return new calendar', async () => {
      const createData = {
        account_id: 'acc-123',
        child_id: 'child-123',
        year: 2025,
      };

      const mockCalendar = {
        calendar_id: '123',
        ...createData,
        share_uuid: 'generated-uuid',
        is_published: false,
        created_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.select.mockResolvedValue({
        data: mockCalendar,
        error: null,
      });

      const result = await repository.create(createData);

      expect(result).toEqual(mockCalendar);
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        account_id: 'acc-123',
        child_id: 'child-123',
        year: 2025,
      });
    });
  });

  describe('createEmptyDaysForCalendar', () => {
    it('should create 24 empty days for calendar', async () => {
      mockSupabase.insert.mockResolvedValue({
        error: null,
      });

      await repository.createEmptyDaysForCalendar('cal-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('calendar_day');
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          { calendar_id: 'cal-123', day_number: 1 },
          { calendar_id: 'cal-123', day_number: 24 },
        ])
      );

      const insertCall = mockSupabase.insert.mock.calls[0][0];
      expect(insertCall).toHaveLength(24);
    });
  });
});