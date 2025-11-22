import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { ContentGrid } from './ContentGrid';
import { ProductContent } from '../../types/product';
import '@testing-library/jest-dom';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock theme utilities
vi.mock('../../../../themes/ThemeProvider', () => ({
  useThemeUtils: () => ({
    getThemeClass: (baseClass: string, theme?: string) => `${baseClass} theme-${theme || 'default'}`,
  }),
}));

const mockContent: ProductContent[] = [
  {
    id: '1',
    product_id: 'test-product',
    content_number: 1,
    title: 'Day 1',
    content: 'Test content 1',
    is_unlocked: true,
    is_completed: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    product_id: 'test-product',
    content_number: 2,
    title: 'Day 2',
    content: 'Test content 2',
    is_unlocked: false,
    is_completed: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockRenderItem = (content: ProductContent, index: number) => (
  <div key={content.id} data-testid={`item-${index}`}>
    {content.title}
  </div>
);

describe('ContentGrid', () => {
  it('renders content items with correct layout', () => {
    render(
      <ContentGrid
        content={mockContent}
        renderItem={mockRenderItem}
        columns={5}
      />
    );

    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByText('Day 1')).toBeInTheDocument();
    expect(screen.getByText('Day 2')).toBeInTheDocument();
  });

  it('applies correct grid classes for 5 columns (calendar layout)', () => {
    const { container } = render(
      <ContentGrid
        content={mockContent}
        renderItem={mockRenderItem}
        columns={5}
      />
    );

    const gridContainer = container.firstChild;
    expect(gridContainer).toHaveClass('grid-cols-2', 'sm:grid-cols-3', 'md:grid-cols-4', 'lg:grid-cols-5');
  });

  it('applies correct grid classes for 4 columns (storybook/game layout)', () => {
    const { container } = render(
      <ContentGrid
        content={mockContent}
        renderItem={mockRenderItem}
        columns={4}
      />
    );

    const gridContainer = container.firstChild;
    expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4');
  });

  it('applies correct grid classes for other column counts', () => {
    const { container } = render(
      <ContentGrid
        content={mockContent}
        renderItem={mockRenderItem}
        columns={3}
      />
    );

    const gridContainer = container.firstChild;
    expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-3');
  });

  it('applies custom className and gap', () => {
    const { container } = render(
      <ContentGrid
        content={mockContent}
        renderItem={mockRenderItem}
        columns={5}
        className="custom-class"
        gap="gap-8"
      />
    );

    const gridContainer = container.firstChild;
    expect(gridContainer).toHaveClass('gap-8');
    expect(gridContainer).toHaveClass('custom-class');
  });

  it('applies item className to motion div wrappers', () => {
    const { container } = render(
      <ContentGrid
        content={mockContent}
        renderItem={mockRenderItem}
        columns={5}
        itemClassName="item-custom-class"
      />
    );

    const motionDivs = container.querySelectorAll('div');
    // Find the motion divs (they should have the item class)
    const itemDivs = Array.from(motionDivs).filter(div =>
      div.classList.contains('item-custom-class')
    );
    expect(itemDivs).toHaveLength(2); // One for each content item
  });

  it('applies theme-aware styling', () => {
    const { container } = render(
      <ContentGrid
        content={mockContent}
        renderItem={mockRenderItem}
        columns={5}
        theme="christmas"
      />
    );

    const gridContainer = container.firstChild;
    expect(gridContainer).toHaveClass('theme-christmas');
  });

  it('renders empty grid when no content', () => {
    const { container } = render(
      <ContentGrid
        content={[]}
        renderItem={mockRenderItem}
        columns={5}
      />
    );

    const gridContainer = container.firstChild as HTMLElement;
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer.children).toHaveLength(0);
  });

  it('uses default values for optional props', () => {
    const { container } = render(
      <ContentGrid
        content={mockContent}
        renderItem={mockRenderItem}
      />
    );

    const gridContainer = container.firstChild;
    expect(gridContainer).toHaveClass('gap-4'); // default gap
    expect(gridContainer).toHaveClass('grid-cols-2', 'sm:grid-cols-3', 'md:grid-cols-4', 'lg:grid-cols-5'); // default 5 columns
  });

  it('passes correct props to renderItem function', () => {
    const mockRenderItemWithProps = vi.fn((content: ProductContent, index: number) =>
      <div key={content.id} data-testid={`item-${index}`}>{content.title}</div>
    );

    render(
      <ContentGrid
        content={mockContent}
        renderItem={mockRenderItemWithProps}
        columns={5}
      />
    );

    expect(mockRenderItemWithProps).toHaveBeenCalledTimes(2);
    expect(mockRenderItemWithProps).toHaveBeenCalledWith(mockContent[0], 0);
    expect(mockRenderItemWithProps).toHaveBeenCalledWith(mockContent[1], 1);
  });
});