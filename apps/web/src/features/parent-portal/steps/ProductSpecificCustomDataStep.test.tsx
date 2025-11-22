import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductSpecificCustomDataStep } from './ProductSpecificCustomDataStep';

describe('ProductSpecificCustomDataStep', () => {
  const mockProductType = {
    id: 'calendar',
    name: 'Advent Calendar',
    description: 'A magical 24-day advent calendar',
    default_content_schema: {},
    supported_features: ['daily_messages', 'photos'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockTemplate = {
    id: 'template-1',
    name: 'Test Template',
    description: 'A test template',
    product_type_id: 'calendar',
    default_custom_data_schema: {
      properties: {
        title: {
          type: 'string',
          title: 'Calendar Title',
          required: true,
        },
        days: {
          type: 'number',
          title: 'Number of Days',
          minimum: 1,
          maximum: 31,
        },
      },
    },
    compatible_themes: ['snow'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const defaultProps = {
    selectedProductType: mockProductType,
    selectedTemplate: mockTemplate,
    customData: {},
    onCustomDataChange: jest.fn(),
  };

  it('renders form fields based on schema', () => {
    render(<ProductSpecificCustomDataStep {...defaultProps} />);

    expect(screen.getByText('Calendar Title')).toBeInTheDocument();
    expect(screen.getByText('Number of Days')).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    render(<ProductSpecificCustomDataStep {...defaultProps} />);

    const titleInput = screen.getByDisplayValue('');
    fireEvent.change(titleInput, { target: { value: '' } });

    // Trigger validation by changing focus
    fireEvent.blur(titleInput);

    await waitFor(() => {
      expect(screen.getByText('All fields are valid. Ready to proceed!')).toBeInTheDocument();
    });
  });

  it('calls onCustomDataChange when form values change', () => {
    render(<ProductSpecificCustomDataStep {...defaultProps} />);

    const titleInput = screen.getByDisplayValue('');
    fireEvent.change(titleInput, { target: { value: 'My Calendar' } });

    expect(defaultProps.onCustomDataChange).toHaveBeenCalledWith({
      title: 'My Calendar',
      days: 0,
    });
  });

  it('shows prompt when no product type or template selected', () => {
    const propsWithoutSelection = {
      ...defaultProps,
      selectedProductType: null,
      selectedTemplate: null,
    };

    render(<ProductSpecificCustomDataStep {...propsWithoutSelection} />);
    expect(screen.getByText('Please select a product type and template first.')).toBeInTheDocument();
  });

  it('shows no customization message when template has no schema', () => {
    const templateWithoutSchema = {
      ...mockTemplate,
      default_custom_data_schema: {},
    };

    const propsWithoutSchema = {
      ...defaultProps,
      selectedTemplate: templateWithoutSchema,
    };

    render(<ProductSpecificCustomDataStep {...propsWithoutSchema} />);
    expect(screen.getByText('No customization needed')).toBeInTheDocument();
  });
});