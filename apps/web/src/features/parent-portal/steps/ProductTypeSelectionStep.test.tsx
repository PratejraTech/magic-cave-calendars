import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductTypeSelectionStep } from './ProductTypeSelectionStep';
import { getProductTypes } from '../../../lib/api';

// Mock the API
jest.mock('../../../lib/api');
const mockGetProductTypes = getProductTypes as jest.MockedFunction<typeof getProductTypes>;

describe('ProductTypeSelectionStep', () => {
  const mockProductTypes = [
    {
      id: 'calendar',
      name: 'Advent Calendar',
      description: 'A magical 24-day advent calendar',
      default_content_schema: {},
      supported_features: ['daily_messages', 'photos'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'storybook',
      name: 'Interactive Storybook',
      description: 'An interactive storybook with chapters',
      default_content_schema: {},
      supported_features: ['chapters', 'illustrations'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  const defaultProps = {
    selectedProductType: null,
    onProductTypeSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProductTypes.mockResolvedValue(mockProductTypes);
  });

  it('renders loading state initially', () => {
    render(<ProductTypeSelectionStep {...defaultProps} />);
    expect(screen.getByText('Loading available products...')).toBeInTheDocument();
  });

  it('renders product types after loading', async () => {
    render(<ProductTypeSelectionStep {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Advent Calendar')).toBeInTheDocument();
      expect(screen.getByText('Interactive Storybook')).toBeInTheDocument();
    });
  });

  it('calls onProductTypeSelect when a product type is clicked', async () => {
    render(<ProductTypeSelectionStep {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Advent Calendar')).toBeInTheDocument();
    });

    const calendarCard = screen.getByText('Advent Calendar').closest('div');
    fireEvent.click(calendarCard!);

    expect(defaultProps.onProductTypeSelect).toHaveBeenCalledWith(mockProductTypes[0]);
  });

  it('shows selected state for selected product type', async () => {
    const propsWithSelection = {
      ...defaultProps,
      selectedProductType: mockProductTypes[0],
    };

    render(<ProductTypeSelectionStep {...propsWithSelection} />);

    await waitFor(() => {
      expect(screen.getByText('Advent Calendar')).toBeInTheDocument();
    });

    // Check for selection indicator (checkmark)
    const checkIcon = document.querySelector('.lucide-check');
    expect(checkIcon).toBeInTheDocument();
  });

  it('displays product features', async () => {
    render(<ProductTypeSelectionStep {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('daily_messages')).toBeInTheDocument();
      expect(screen.getByText('photos')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockGetProductTypes.mockRejectedValue(new Error('API Error'));

    render(<ProductTypeSelectionStep {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load product types. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows selected product summary', async () => {
    const propsWithSelection = {
      ...defaultProps,
      selectedProductType: mockProductTypes[0],
    };

    render(<ProductTypeSelectionStep {...propsWithSelection} />);

    await waitFor(() => {
      expect(screen.getByText('Selected Product')).toBeInTheDocument();
      expect(screen.getByText('Advent Calendar')).toBeInTheDocument();
    });
  });
});