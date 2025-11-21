import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import AdventCalendar from './AdventCalendar';
import * as dateLib from '../../lib/date';
import React from 'react';
import { AdventDay } from '../../types/advent';

// Mock framer-motion to disable animations in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');

  type DivProps = React.ComponentProps<typeof actual.motion.div>;
  type SpanProps = React.ComponentProps<typeof actual.motion.span>;
  type PathProps = React.ComponentProps<typeof actual.motion.path>;

  return {
    ...actual,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: React.forwardRef<HTMLDivElement, DivProps>((props, ref) => <div {...props} ref={ref} />),
      span: React.forwardRef<HTMLSpanElement, SpanProps>((props, ref) => <span {...props} ref={ref} />),
      path: React.forwardRef<SVGPathElement, PathProps>((props, ref) => <path {...props} ref={ref} />),
    },
  };
});

const createMockDays = (): AdventDay[] =>
  Array.from({ length: 25 }, (_, index) => ({
    id: index + 1,
    message: `Message ${index + 1}`,
    title: `Day ${index + 1}`,
    photo_url: 'https://via.placeholder.com/400x300',
    is_opened: false,
    opened_at: null,
    created_at: new Date().toISOString(),
  }));

describe('AdventCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('enables the button for the current day in December', () => {
    const mockDate = new Date('2024-12-05T12:00:00Z');
    vi.spyOn(dateLib, 'getAdelaideDate').mockReturnValue(mockDate);

    render(<AdventCalendar days={createMockDays()} onOpenDay={vi.fn()} />);

    const buttonDay5 = screen.getByText('5');
    expect(buttonDay5).not.toBeDisabled();

    const buttonDay6 = screen.getByText('6');
    expect(buttonDay6).toBeDisabled();
  });

  it('disables all buttons if it is not December', () => {
    const mockDate = new Date('2024-11-05T12:00:00Z');
    vi.spyOn(dateLib, 'getAdelaideDate').mockReturnValue(mockDate);

    render(<AdventCalendar days={createMockDays()} onOpenDay={vi.fn()} />);

    const buttonDay5 = screen.getByText('5');
    expect(buttonDay5).toBeDisabled();
  });

  it('opens the modal when the correct button is clicked', async () => {
    const mockDate = new Date('2024-12-05T12:00:00Z');
    vi.spyOn(dateLib, 'getAdelaideDate').mockReturnValue(mockDate);

    render(<AdventCalendar days={createMockDays()} onOpenDay={vi.fn()} />);

    const buttonDay5 = screen.getByText('5');
    fireEvent.click(buttonDay5);

    // Fast-forward time to after the animation timeout
    vi.advanceTimersByTime(2100);

    // The modal should now be open
    const modalTitle = await screen.findByText('Day 5');
    expect(modalTitle).toBeInTheDocument();
  });
});
