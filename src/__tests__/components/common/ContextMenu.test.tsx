import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContextMenu, ContextMenuItem } from '@/components/common/ContextMenu';

// Mock icon component for testing
const MockIcon = ({ className }: { className?: string }) => (
  <svg data-testid="mock-icon" className={className} />
);

const DeleteIcon = ({ className }: { className?: string }) => (
  <svg data-testid="delete-icon" className={className} />
);

// Helper to create basic menu items
const createBasicItems = (): ContextMenuItem[] => [
  { label: 'Edit', onClick: vi.fn() },
  { label: 'Copy', onClick: vi.fn(), shortcut: '⌘C' },
  { separator: true },
  { label: 'Delete', onClick: vi.fn(), danger: true, icon: DeleteIcon },
];

describe('ContextMenu', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <ContextMenu items={[]}>
          <button>Right-click me</button>
        </ContextMenu>
      );
      expect(screen.getByRole('button', { name: 'Right-click me' })).toBeInTheDocument();
    });

    it('does not show menu initially', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div>Trigger</div>
        </ContextMenu>
      );
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('applies custom className to wrapper', () => {
      const { container } = render(
        <ContextMenu items={[]} className="custom-wrapper">
          <div>Trigger</div>
        </ContextMenu>
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-wrapper');
    });

    it('wrapper has aria-haspopup attribute', () => {
      const { container } = render(
        <ContextMenu items={[]}>
          <div>Trigger</div>
        </ContextMenu>
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('uses Tailwind contents class for layout transparency', () => {
      const { container } = render(
        <ContextMenu items={[]}>
          <div>Trigger</div>
        </ContextMenu>
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('contents');
    });
  });

  describe('Opening Menu', () => {
    it('shows menu on context menu (right-click)', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      const trigger = screen.getByTestId('trigger');
      fireEvent.contextMenu(trigger);

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('prevents default context menu behavior', async () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      const trigger = screen.getByTestId('trigger');
      const contextMenuEvent = fireEvent.contextMenu(trigger);

      // fireEvent.contextMenu returns false if preventDefault was called
      expect(contextMenuEvent).toBe(false);
    });

    it('positions menu at click coordinates', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      const trigger = screen.getByTestId('trigger');
      fireEvent.contextMenu(trigger, { clientX: 150, clientY: 250 });

      const menu = screen.getByRole('menu');
      expect(menu).toHaveStyle({ top: '250px', left: '150px' });
    });

    it('focuses menu when opened', async () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      const trigger = screen.getByTestId('trigger');
      fireEvent.contextMenu(trigger);

      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(document.activeElement).toBe(menu);
      });
    });
  });

  describe('Menu Items', () => {
    it('renders all menu items', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      expect(screen.getByRole('menuitem', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /copy/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
    });

    it('renders separator items', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('renders item with icon', () => {
      const items: ContextMenuItem[] = [{ label: 'With Icon', icon: MockIcon, onClick: vi.fn() }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('renders item with shortcut', () => {
      const items: ContextMenuItem[] = [{ label: 'Copy', shortcut: '⌘C', onClick: vi.fn() }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      expect(screen.getByText('⌘C')).toBeInTheDocument();
    });

    it('renders danger item with correct styling', () => {
      const items: ContextMenuItem[] = [{ label: 'Delete', danger: true, onClick: vi.fn() }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      const deleteItem = screen.getByRole('menuitem', { name: /delete/i });
      expect(deleteItem).toHaveClass('text-red-600');
    });

    it('renders disabled item with correct styling', () => {
      const items: ContextMenuItem[] = [{ label: 'Disabled', disabled: true, onClick: vi.fn() }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      const disabledItem = screen.getByRole('menuitem', { name: /disabled/i });
      expect(disabledItem).toBeDisabled();
      expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
      expect(disabledItem).toHaveClass('cursor-not-allowed', 'opacity-50');
    });
  });

  describe('Item Click Behavior', () => {
    it('calls onClick when item is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onClickMock = vi.fn();
      const items: ContextMenuItem[] = [{ label: 'Click Me', onClick: onClickMock }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      await user.click(screen.getByRole('menuitem', { name: /click me/i }));

      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('closes menu after item click', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const items: ContextMenuItem[] = [{ label: 'Click Me', onClick: vi.fn() }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      await user.click(screen.getByRole('menuitem', { name: /click me/i }));

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('does not call onClick for disabled items', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onClickMock = vi.fn();
      const items: ContextMenuItem[] = [{ label: 'Disabled', disabled: true, onClick: onClickMock }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      await user.click(screen.getByRole('menuitem', { name: /disabled/i }));

      expect(onClickMock).not.toHaveBeenCalled();
    });
  });

  describe('Closing Menu', () => {
    it('closes menu when clicking outside', async () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.mouseDown(document.body);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes menu when pressing Escape', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes menu on scroll', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.scroll(document);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes menu via global Escape key listener', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Simulate global keydown event
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates down with ArrowDown', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      const menu = screen.getByRole('menu');

      fireEvent.keyDown(menu, { key: 'ArrowDown' });

      const editItem = screen.getByRole('menuitem', { name: /edit/i });
      expect(editItem).toHaveClass('bg-blue-50', 'text-blue-700');
    });

    it('navigates up with ArrowUp', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      const menu = screen.getByRole('menu');

      // Start from first item
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      // Go up (should wrap to last)
      fireEvent.keyDown(menu, { key: 'ArrowUp' });

      const deleteItem = screen.getByRole('menuitem', { name: /delete/i });
      expect(deleteItem).toHaveClass('bg-red-50', 'text-red-600'); // danger item active
    });

    it('skips separators during navigation', () => {
      const items: ContextMenuItem[] = [
        { label: 'First' },
        { separator: true },
        { label: 'Second' },
      ];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      const menu = screen.getByRole('menu');

      fireEvent.keyDown(menu, { key: 'ArrowDown' }); // First
      fireEvent.keyDown(menu, { key: 'ArrowDown' }); // Skip separator, go to Second

      const secondItem = screen.getByRole('menuitem', { name: /second/i });
      expect(secondItem).toHaveClass('bg-blue-50');
    });

    it('skips disabled items during navigation', () => {
      const items: ContextMenuItem[] = [
        { label: 'First' },
        { label: 'Disabled', disabled: true },
        { label: 'Third' },
      ];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      const menu = screen.getByRole('menu');

      fireEvent.keyDown(menu, { key: 'ArrowDown' }); // First
      fireEvent.keyDown(menu, { key: 'ArrowDown' }); // Skip Disabled, go to Third

      const thirdItem = screen.getByRole('menuitem', { name: /third/i });
      expect(thirdItem).toHaveClass('bg-blue-50');
    });

    it('wraps around when navigating past end', () => {
      const items: ContextMenuItem[] = [{ label: 'First' }, { label: 'Last' }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      const menu = screen.getByRole('menu');

      fireEvent.keyDown(menu, { key: 'ArrowDown' }); // First
      fireEvent.keyDown(menu, { key: 'ArrowDown' }); // Last
      fireEvent.keyDown(menu, { key: 'ArrowDown' }); // Wrap to First

      const firstItem = screen.getByRole('menuitem', { name: /first/i });
      expect(firstItem).toHaveClass('bg-blue-50');
    });

    it('selects item with Enter key', async () => {
      const onClickMock = vi.fn();
      const items: ContextMenuItem[] = [{ label: 'Select Me', onClick: onClickMock }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      const menu = screen.getByRole('menu');

      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      fireEvent.keyDown(menu, { key: 'Enter' });

      expect(onClickMock).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('selects item with Space key', async () => {
      const onClickMock = vi.fn();
      const items: ContextMenuItem[] = [{ label: 'Select Me', onClick: onClickMock }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      const menu = screen.getByRole('menu');

      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      fireEvent.keyDown(menu, { key: ' ' });

      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('does nothing when all items are separators or disabled', () => {
      const items: ContextMenuItem[] = [
        { separator: true },
        { label: 'Disabled', disabled: true },
        { separator: true },
      ];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      const menu = screen.getByRole('menu');

      // Should not throw or crash
      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      fireEvent.keyDown(menu, { key: 'ArrowUp' });

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('Mouse Hover', () => {
    it('highlights item on mouse enter', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const items: ContextMenuItem[] = [{ label: 'Hover Me' }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      const item = screen.getByRole('menuitem', { name: /hover me/i });

      await user.hover(item);

      expect(item).toHaveClass('bg-blue-50');
    });

    it('does not highlight disabled item on mouse enter', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const items: ContextMenuItem[] = [{ label: 'Disabled', disabled: true }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));
      const item = screen.getByRole('menuitem', { name: /disabled/i });

      await user.hover(item);

      expect(item).not.toHaveClass('bg-blue-50');
    });
  });

  describe('Key Generation', () => {
    it('uses provided key for items', () => {
      const items: ContextMenuItem[] = [
        { key: 'custom-key-1', label: 'Item 1' },
        { key: 'custom-key-2', label: 'Item 2' },
      ];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      // Items should render without warning about duplicate keys
      expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    });

    it('generates stable keys for duplicate labels', () => {
      const items: ContextMenuItem[] = [
        { label: 'Duplicate' },
        { label: 'Duplicate' },
        { label: 'Duplicate' },
      ];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      // All items should render (no key collision)
      expect(screen.getAllByRole('menuitem')).toHaveLength(3);
    });

    it('generates keys for multiple separators', () => {
      const items: ContextMenuItem[] = [
        { label: 'Item 1' },
        { separator: true },
        { label: 'Item 2' },
        { separator: true },
        { label: 'Item 3' },
      ];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      expect(screen.getAllByRole('separator')).toHaveLength(2);
    });
  });

  describe('Menu Position Calculation', () => {
    it('flips menu horizontally when near right edge', () => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', { value: 200, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });

      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'), { clientX: 150, clientY: 100 });

      const menu = screen.getByRole('menu');
      expect(menu).toHaveStyle({ transform: 'translate(-100%, 0)' });
    });

    it('flips menu vertically when near bottom edge', () => {
      Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 300, writable: true });

      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'), { clientX: 100, clientY: 250 });

      const menu = screen.getByRole('menu');
      expect(menu).toHaveStyle({ transform: 'translate(0, -100%)' });
    });

    it('flips menu both ways when near corner', () => {
      Object.defineProperty(window, 'innerWidth', { value: 200, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 300, writable: true });

      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'), { clientX: 150, clientY: 250 });

      const menu = screen.getByRole('menu');
      expect(menu).toHaveStyle({ transform: 'translate(-100%, -100%)' });
    });
  });

  describe('Accessibility', () => {
    it('menu has correct role and orientation', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('menu items have correct role', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      const items = screen.getAllByRole('menuitem');
      expect(items.length).toBeGreaterThan(0);
    });

    it('menu items are removed from tab order', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      const items = screen.getAllByRole('menuitem');
      items.forEach((item) => {
        expect(item).toHaveAttribute('tabIndex', '-1');
      });
    });

    it('separator has correct role', () => {
      render(
        <ContextMenu items={createBasicItems()}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      render(
        <ContextMenu items={[]}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    });

    it('handles items without onClick', () => {
      const items: ContextMenuItem[] = [{ label: 'No Click Handler' }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      fireEvent.contextMenu(screen.getByTestId('trigger'));

      const item = screen.getByRole('menuitem', { name: /no click handler/i });
      // Should not throw when clicked
      fireEvent.click(item);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('resets active index when menu reopens', () => {
      const items: ContextMenuItem[] = [{ label: 'Item' }];

      render(
        <ContextMenu items={items}>
          <div data-testid="trigger">Trigger</div>
        </ContextMenu>
      );

      const trigger = screen.getByTestId('trigger');

      // Open and navigate
      fireEvent.contextMenu(trigger);
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      expect(screen.getByRole('menuitem')).toHaveClass('bg-blue-50');

      // Close
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

      // Reopen - should have no active item
      fireEvent.contextMenu(trigger);
      expect(screen.getByRole('menuitem')).not.toHaveClass('bg-blue-50');
    });
  });
});
