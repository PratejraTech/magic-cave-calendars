import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateSelectionStep } from './TemplateSelectionStep';
import { getTemplatesByProductType } from '../../../lib/api';

// Mock the API
jest.mock('../../../lib/api');
const mockGetTemplatesByProductType = getTemplatesByProductType as jest.MockedFunction<typeof getTemplatesByProductType>;

describe('TemplateSelectionStep', () => {
  const mockProductType = {
    id: 'calendar',
    name: 'Advent Calendar',
    description: 'A magical 24-day advent calendar',
    default_content_schema: {},
    supported_features: ['daily_messages', 'photos'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockTemplates = [
    {
      id: 'template-1',
      name: 'Magical Christmas Template',
      description: 'A festive template with holiday themes',
      product_type_id: 'calendar',
      default_custom_data_schema: {},
      compatible_themes: ['snow', 'warm'],
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'template-2',
      name: 'Adventure Template',
      description: 'An exciting adventure-themed template',
      product_type_id: 'calendar',
      default_custom_data_schema: {},
      compatible_themes: ['forest'],
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  const defaultProps = {
    selectedProductType: mockProductType,
    selectedTemplate: null,
    onTemplateSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTemplatesByProductType.mockResolvedValue(mockTemplates);
  });

  it('renders loading state initially', () => {
    render(<TemplateSelectionStep {...defaultProps} />);
    expect(screen.getByText('Loading templates for Advent Calendar...')).toBeInTheDocument();
  });

  it('renders templates after loading', async () => {
    render(<TemplateSelectionStep {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Magical Christmas Template')).toBeInTheDocument();
      expect(screen.getByText('Adventure Template')).toBeInTheDocument();
    });
  });

  it('calls onTemplateSelect when a template is clicked', async () => {
    render(<TemplateSelectionStep {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Magical Christmas Template')).toBeInTheDocument();
    });

    const templateCard = screen.getByText('Magical Christmas Template').closest('div');
    fireEvent.click(templateCard!);

    expect(defaultProps.onTemplateSelect).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('shows selected state for selected template', async () => {
    const propsWithSelection = {
      ...defaultProps,
      selectedTemplate: mockTemplates[0],
    };

    render(<TemplateSelectionStep {...propsWithSelection} />);

    await waitFor(() => {
      expect(screen.getByText('Magical Christmas Template')).toBeInTheDocument();
    });

    // Check for selection indicator (checkmark)
    const checkIcon = document.querySelector('.lucide-check');
    expect(checkIcon).toBeInTheDocument();
  });

  it('displays compatible themes', async () => {
    render(<TemplateSelectionStep {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('snow')).toBeInTheDocument();
      expect(screen.getByText('warm')).toBeInTheDocument();
      expect(screen.getByText('forest')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockGetTemplatesByProductType.mockRejectedValue(new Error('API Error'));

    render(<TemplateSelectionStep {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load templates. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows no templates message when empty', async () => {
    mockGetTemplatesByProductType.mockResolvedValue([]);

    render(<TemplateSelectionStep {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('No templates available')).toBeInTheDocument();
    });
  });

  it('shows prompt to select product type when none selected', () => {
    const propsWithoutProductType = {
      ...defaultProps,
      selectedProductType: null,
    };

    render(<TemplateSelectionStep {...propsWithoutProductType} />);
    expect(screen.getByText('Please select a product type first.')).toBeInTheDocument();
  });

  it('shows selected template summary', async () => {
    const propsWithSelection = {
      ...defaultProps,
      selectedTemplate: mockTemplates[0],
    };

    render(<TemplateSelectionStep {...propsWithSelection} />);

    await waitFor(() => {
      expect(screen.getByText('Selected Template')).toBeInTheDocument();
      expect(screen.getByText('Magical Christmas Template')).toBeInTheDocument();
    });
  });
});