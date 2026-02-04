import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { Tooltip } from '@/components/common/Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children correctly', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('shows tooltip on mouse enter and hides on mouse leave', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    
    // Mouse enter
    fireEvent.mouseEnter(trigger);
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Tooltip content')).toBeInTheDocument();

    // Mouse leave
    fireEvent.mouseLeave(trigger);
    
    act(() => {
      vi.advanceTimersByTime(0); // For the hide logic if it had delay, but it's immediate clear
      // Wait, hide() uses clearTimeout and setVisible(false) immediately.
    });
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus and hides on blur', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Focus me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Focus me');
    
    // Focus
    fireEvent.focus(trigger);
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Blur
    fireEvent.blur(trigger);
    
    act(() => {
        // Just to be safe with state updates
    });
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('hides tooltip on Escape key press', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(trigger, { key: 'Escape', code: 'Escape' });
    });
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not render tooltip if content is empty', () => {
    render(
      <Tooltip content="">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('applies correct placement classes', () => {
    render(
      <Tooltip content="Tooltip content" placement="right">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('translate-x-0', '-translate-y-1/2');
  });

  it('sets aria-describedby when visible', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    expect(trigger).not.toHaveAttribute('aria-describedby');
    
    fireEvent.mouseEnter(trigger);
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    const tooltip = screen.getByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });
});
