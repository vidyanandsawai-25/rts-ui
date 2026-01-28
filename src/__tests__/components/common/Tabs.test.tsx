import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  Tabs,
  TabItem,
  TabVariant,
  TabSize,
  TabJustify,
} from '@/components/common/Tabs';

// Use compound API pattern (Tabs.TabList, Tabs.Tab, Tabs.TabPanel)
// Both direct imports and compound pattern are supported
const { TabList, Tab, TabPanel } = Tabs;

// Mock icon component for testing
const MockIcon = ({ className }: { className?: string }) => (
  <svg data-testid="mock-icon" className={className} />
);

// Helper to create basic tab items
const createBasicItems = (): TabItem[] => [
  { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
  { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
  { value: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
];

describe('Tabs', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('Shortcut API (items prop)', () => {
    it('renders all tabs from items', () => {
      render(<Tabs items={createBasicItems()} />);

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
    });

    it('shows first tab content by default', () => {
      render(<Tabs items={createBasicItems()} />);

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('selects first non-disabled tab by default', () => {
      const items: TabItem[] = [
        { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div>, disabled: true },
        { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
        { value: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
      ];

      render(<Tabs items={items} />);

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('renders tabs with icons', () => {
      const items: TabItem[] = [
        { value: 'tab1', label: 'Tab 1', content: <div>Content</div>, icon: MockIcon },
      ];

      render(<Tabs items={items} />);

      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('renders disabled tabs', () => {
      const items: TabItem[] = [
        { value: 'tab1', label: 'Tab 1', content: <div>Content</div> },
        { value: 'tab2', label: 'Tab 2', content: <div>Content</div>, disabled: true },
      ];

      render(<Tabs items={items} />);

      const disabledTab = screen.getByRole('tab', { name: 'Tab 2' });
      expect(disabledTab).toBeDisabled();
      expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
    });

    it('applies custom className to tabs', () => {
      const items: TabItem[] = [
        { value: 'tab1', label: 'Tab 1', content: <div>Content</div>, className: 'custom-tab' },
      ];

      render(<Tabs items={items} />);

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveClass('custom-tab');
    });

    it('applies custom panelClassName to panels', () => {
      const items: TabItem[] = [
        {
          value: 'tab1',
          label: 'Tab 1',
          content: <div>Content</div>,
          panelClassName: 'custom-panel',
        },
      ];

      render(<Tabs items={items} />);

      expect(screen.getByRole('tabpanel')).toHaveClass('custom-panel');
    });

    it('applies tabListClassName to TabList', () => {
      render(<Tabs items={createBasicItems()} tabListClassName="custom-list" />);

      expect(screen.getByRole('tablist')).toHaveClass('custom-list');
    });

    it('applies tabPanelClassName to TabPanels', () => {
      render(<Tabs items={createBasicItems()} tabPanelClassName="shared-panel-class" />);

      expect(screen.getByRole('tabpanel')).toHaveClass('shared-panel-class');
    });
  });

  describe('Compound API', () => {
    it('renders compound children correctly', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">First</Tab>
            <Tab value="tab2">Second</Tab>
          </TabList>
          <TabPanel value="tab1">First Content</TabPanel>
          <TabPanel value="tab2">Second Content</TabPanel>
        </Tabs>
      );

      expect(screen.getByRole('tab', { name: 'First' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Second' })).toBeInTheDocument();
      expect(screen.getByText('First Content')).toBeInTheDocument();
    });

    it('throws error when used outside Tabs context', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<Tab value="test">Test</Tab>)).toThrow(
        'Tabs components must be used inside <Tabs />'
      );

      consoleErrorSpy.mockRestore();
    });

    it('warns when no initial value is provided in compound API', () => {
      render(
        <Tabs>
          <TabList>
            <Tab value="tab1">Tab</Tab>
          </TabList>
          <TabPanel value="tab1">Content</TabPanel>
        </Tabs>
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No initial value provided')
      );
    });
  });

  describe('Controlled Mode', () => {
    it('uses controlled value', () => {
      render(<Tabs items={createBasicItems()} value="tab2" onChange={() => {}} />);

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('calls onChange when tab is clicked', async () => {
      const user = userEvent.setup();
      const onChangeMock = vi.fn();

      render(<Tabs items={createBasicItems()} value="tab1" onChange={onChangeMock} />);

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(onChangeMock).toHaveBeenCalledWith('tab2');
    });

    it('warns when controlled without onChange', () => {
      render(<Tabs items={createBasicItems()} value="tab1" />);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('without an `onChange` handler')
      );
    });

    it('does not warn when controlled value updates correctly after onChange', async () => {
      const user = userEvent.setup();
      let currentValue = 'tab1';
      const onChangeMock = vi.fn((val) => {
        currentValue = val;
      });

      const { rerender } = render(
        <Tabs items={createBasicItems()} value={currentValue} onChange={onChangeMock} />
      );

      // Click a different tab
      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      // Parent properly updates the value
      rerender(<Tabs items={createBasicItems()} value={currentValue} onChange={onChangeMock} />);

      // Should not warn since value was properly updated
      await waitFor(() => {
        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('did not update')
        );
      });
    });
  });

  describe('Uncontrolled Mode', () => {
    it('uses defaultValue', () => {
      render(<Tabs items={createBasicItems()} defaultValue="tab2" />);

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('switches tabs when clicked in uncontrolled mode', async () => {
      const user = userEvent.setup();

      render(<Tabs items={createBasicItems()} />);

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('calls onChange in uncontrolled mode', async () => {
      const user = userEvent.setup();
      const onChangeMock = vi.fn();

      render(<Tabs items={createBasicItems()} onChange={onChangeMock} />);

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(onChangeMock).toHaveBeenCalledWith('tab2');
    });
  });

  describe('Variants', () => {
    const variants: TabVariant[] = ['line', 'pills'];

    variants.forEach((variant) => {
      it(`renders ${variant} variant`, () => {
        render(<Tabs items={createBasicItems()} variant={variant} />);

        const tablist = screen.getByRole('tablist');
        if (variant === 'line') {
          expect(tablist).toHaveClass('border-b', 'border-gray-200');
        } else {
          expect(tablist).toHaveClass('bg-gray-100', 'rounded-xl');
        }
      });
    });

    it('applies line variant styles to active tab', () => {
      render(<Tabs items={createBasicItems()} variant="line" />);

      const activeTab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(activeTab).toHaveClass('border-blue-600', 'text-blue-600');
    });

    it('applies pills variant styles to active tab', () => {
      render(<Tabs items={createBasicItems()} variant="pills" />);

      const activeTab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(activeTab).toHaveClass('bg-white', 'text-blue-600', 'shadow-sm');
    });
  });

  describe('Sizes', () => {
    const sizes: { size: TabSize; expectedClasses: string[] }[] = [
      { size: 'sm', expectedClasses: ['px-3', 'py-1.5', 'text-xs'] },
      { size: 'md', expectedClasses: ['px-4', 'py-2', 'text-sm'] },
      { size: 'lg', expectedClasses: ['px-6', 'py-3', 'text-base'] },
    ];

    sizes.forEach(({ size, expectedClasses }) => {
      it(`renders ${size} size with correct styles`, () => {
        render(<Tabs items={createBasicItems()} size={size} />);

        const tab = screen.getByRole('tab', { name: 'Tab 1' });
        expectedClasses.forEach((cls) => {
          expect(tab).toHaveClass(cls);
        });
      });
    });

    it('applies correct icon size for each tab size', () => {
      const items: TabItem[] = [
        { value: 'sm', label: 'Small', content: <div />, icon: MockIcon },
      ];

      const { rerender } = render(<Tabs items={items} size="sm" />);
      expect(screen.getByTestId('mock-icon')).toHaveClass('w-3.5', 'h-3.5');

      rerender(<Tabs items={items} size="md" />);
      expect(screen.getByTestId('mock-icon')).toHaveClass('w-4', 'h-4');

      rerender(<Tabs items={items} size="lg" />);
      expect(screen.getByTestId('mock-icon')).toHaveClass('w-5', 'h-5');
    });
  });

  describe('Orientation', () => {
    it('renders horizontal orientation by default', () => {
      render(<Tabs items={createBasicItems()} />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
      expect(tablist).toHaveClass('flex-row');
    });

    it('renders vertical orientation', () => {
      render(<Tabs items={createBasicItems()} orientation="vertical" />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
      expect(tablist).toHaveClass('flex-col');
    });

    it('applies vertical variant styles', () => {
      render(<Tabs items={createBasicItems()} orientation="vertical" variant="line" />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveClass('border-r');
    });

    it('adds margin-top to panel in horizontal mode', () => {
      render(<Tabs items={createBasicItems()} orientation="horizontal" />);

      expect(screen.getByRole('tabpanel')).toHaveClass('mt-4');
    });

    it('does not add margin-top to panel in vertical mode', () => {
      render(<Tabs items={createBasicItems()} orientation="vertical" />);

      expect(screen.getByRole('tabpanel')).not.toHaveClass('mt-4');
    });
  });

  describe('Justify', () => {
    const justifyOptions: { justify: TabJustify; expectedClass: string }[] = [
      { justify: 'start', expectedClass: 'justify-start' },
      { justify: 'center', expectedClass: 'justify-center' },
      { justify: 'end', expectedClass: 'justify-end' },
      { justify: 'between', expectedClass: 'justify-between' },
    ];

    justifyOptions.forEach(({ justify, expectedClass }) => {
      it(`applies ${justify} justification`, () => {
        render(<Tabs items={createBasicItems()} justify={justify} />);

        expect(screen.getByRole('tablist')).toHaveClass(expectedClass);
      });
    });
  });

  describe('Full Width', () => {
    it('tabs have flex-1 when fullWidth is true', () => {
      render(<Tabs items={createBasicItems()} fullWidth />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveClass('flex-1');
      });
    });

    it('tabs do not have flex-1 when fullWidth is false', () => {
      render(<Tabs items={createBasicItems()} fullWidth={false} />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).not.toHaveClass('flex-1');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates with ArrowRight', async () => {
      const user = userEvent.setup();

      render(<Tabs items={createBasicItems()} />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('navigates with ArrowLeft', async () => {
      const user = userEvent.setup();

      render(<Tabs items={createBasicItems()} defaultValue="tab2" />);

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      tab2.focus();

      await user.keyboard('{ArrowLeft}');

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();
    });

    it('navigates with ArrowDown in vertical orientation', async () => {
      const user = userEvent.setup();

      render(<Tabs items={createBasicItems()} orientation="vertical" />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus();
    });

    it('navigates with ArrowUp in vertical orientation', async () => {
      const user = userEvent.setup();

      render(<Tabs items={createBasicItems()} orientation="vertical" defaultValue="tab2" />);

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      tab2.focus();

      await user.keyboard('{ArrowUp}');

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();
    });

    it('jumps to first tab with Home key', async () => {
      const user = userEvent.setup();

      render(<Tabs items={createBasicItems()} defaultValue="tab3" />);

      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      tab3.focus();

      await user.keyboard('{Home}');

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();
    });

    it('jumps to last tab with End key', async () => {
      const user = userEvent.setup();

      render(<Tabs items={createBasicItems()} />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{End}');

      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus();
    });

    it('wraps around when navigating past end', async () => {
      const user = userEvent.setup();

      render(<Tabs items={createBasicItems()} defaultValue="tab3" />);

      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      tab3.focus();

      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();
    });

    it('wraps around when navigating past start', async () => {
      const user = userEvent.setup();

      render(<Tabs items={createBasicItems()} />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowLeft}');

      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus();
    });

    it('skips disabled tabs during navigation', async () => {
      const user = userEvent.setup();
      const items: TabItem[] = [
        { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
        { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div>, disabled: true },
        { value: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
      ];

      render(<Tabs items={items} />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus();
    });
  });

  describe('Disabled Tabs', () => {
    it('disabled tab cannot be clicked', async () => {
      const user = userEvent.setup();
      const items: TabItem[] = [
        { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
        { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div>, disabled: true },
      ];

      render(<Tabs items={items} />);

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('disabled tab has correct tabIndex', () => {
      const items: TabItem[] = [
        { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div>, disabled: true },
        { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
      ];

      render(<Tabs items={items} />);

      const disabledTab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(disabledTab).toHaveAttribute('tabIndex', '-1');
    });

    it('disabled tab has visual indication', () => {
      const items: TabItem[] = [
        { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
        { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div>, disabled: true },
      ];

      render(<Tabs items={items} />);

      const disabledTab = screen.getByRole('tab', { name: 'Tab 2' });
      expect(disabledTab).toHaveClass('cursor-not-allowed', 'opacity-50');
    });
  });

  describe('Tab Component', () => {
    it('passes onClick handler', async () => {
      const user = userEvent.setup();
      const onClickMock = vi.fn();

      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1" onClick={onClickMock}>
              Tab 1
            </Tab>
          </TabList>
          <TabPanel value="tab1">Content</TabPanel>
        </Tabs>
      );

      await user.click(screen.getByRole('tab', { name: 'Tab 1' }));

      expect(onClickMock).toHaveBeenCalled();
    });

    it('forwards ref', () => {
      const ref = createRef<HTMLButtonElement>();

      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1" ref={ref}>
              Tab 1
            </Tab>
          </TabList>
          <TabPanel value="tab1">Content</TabPanel>
        </Tabs>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('has correct ARIA attributes', () => {
      render(<Tabs items={createBasicItems()} />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1).toHaveAttribute('aria-selected', 'true');
      expect(tab1).toHaveAttribute('aria-controls');
      expect(tab1).toHaveAttribute('id');

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      expect(tab2).toHaveAttribute('aria-selected', 'false');
    });

    it('active tab has tabIndex 0, inactive has -1', () => {
      render(<Tabs items={createBasicItems()} />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1).toHaveAttribute('tabIndex', '0');

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      expect(tab2).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('TabList Component', () => {
    it('has role tablist', () => {
      render(<Tabs items={createBasicItems()} />);

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>();

      render(
        <Tabs defaultValue="tab1">
          <TabList ref={ref}>
            <Tab value="tab1">Tab 1</Tab>
          </TabList>
          <TabPanel value="tab1">Content</TabPanel>
        </Tabs>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('is scrollable by default', () => {
      render(<Tabs items={createBasicItems()} />);

      expect(screen.getByRole('tablist')).toHaveClass('overflow-x-auto');
    });

    it('can disable scrollable', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabList scrollable={false}>
            <Tab value="tab1">Tab 1</Tab>
          </TabList>
          <TabPanel value="tab1">Content</TabPanel>
        </Tabs>
      );

      expect(screen.getByRole('tablist')).not.toHaveClass('overflow-x-auto');
    });
  });

  describe('TabPanel Component', () => {
    it('has role tabpanel', () => {
      render(<Tabs items={createBasicItems()} />);

      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>();

      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
          </TabList>
          <TabPanel value="tab1" ref={ref}>
            Content
          </TabPanel>
        </Tabs>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('has correct ARIA attributes', () => {
      render(<Tabs items={createBasicItems()} />);

      const panel = screen.getByRole('tabpanel');
      expect(panel).toHaveAttribute('aria-labelledby');
      expect(panel).toHaveAttribute('id');
    });

    it('only active panel is rendered', () => {
      render(<Tabs items={createBasicItems()} />);

      expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    });

    it('applies custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabList>
            <Tab value="tab1">Tab 1</Tab>
          </TabList>
          <TabPanel value="tab1" className="custom-panel">
            Content
          </TabPanel>
        </Tabs>
      );

      expect(screen.getByRole('tabpanel')).toHaveClass('custom-panel');
    });
  });

  describe('Forwarded Ref', () => {
    it('Tabs forwards ref to root div', () => {
      const ref = createRef<HTMLDivElement>();

      render(<Tabs items={createBasicItems()} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Custom className', () => {
    it('applies custom className to root', () => {
      render(<Tabs items={createBasicItems()} className="custom-tabs" />);

      // The root div should have the custom class
      const root = screen.getByRole('tablist').parentElement;
      expect(root).toHaveClass('custom-tabs');
    });
  });

  describe('Accessibility', () => {
    it('tab panel is linked to tab via aria-controls/aria-labelledby', () => {
      render(<Tabs items={createBasicItems()} />);

      const tab = screen.getByRole('tab', { name: 'Tab 1' });
      const panel = screen.getByRole('tabpanel');

      const tabId = tab.getAttribute('id');
      const panelId = panel.getAttribute('id');

      expect(tab).toHaveAttribute('aria-controls', panelId);
      expect(panel).toHaveAttribute('aria-labelledby', tabId);
    });

    it('tabs have type button', () => {
      render(<Tabs items={createBasicItems()} />);

      screen.getAllByRole('tab').forEach((tab) => {
        expect(tab).toHaveAttribute('type', 'button');
      });
    });

    it('has focus-visible ring styles', () => {
      render(<Tabs items={createBasicItems()} />);

      const tab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-blue-500');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      render(<Tabs items={[]} />);

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    });

    it('handles numeric tab values', async () => {
      const user = userEvent.setup();
      const items: TabItem[] = [
        { value: 1, label: 'Tab 1', content: <div>Content 1</div> },
        { value: 2, label: 'Tab 2', content: <div>Content 2</div> },
      ];

      render(<Tabs items={items} />);

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('handles ReactNode labels', () => {
      const items: TabItem[] = [
        {
          value: 'tab1',
          label: (
            <span>
              <strong>Bold</strong> Tab
            </span>
          ),
          content: <div>Content</div>,
        },
      ];

      render(<Tabs items={items} />);

      expect(screen.getByText('Bold')).toBeInTheDocument();
    });

    it('handles single tab', () => {
      const items: TabItem[] = [{ value: 'only', label: 'Only Tab', content: <div>Content</div> }];

      render(<Tabs items={items} />);

      expect(screen.getByRole('tab', { name: 'Only Tab' })).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles all tabs disabled', () => {
      const items: TabItem[] = [
        { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div>, disabled: true },
        { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div>, disabled: true },
      ];

      render(<Tabs items={items} />);

      // No panel should be visible since no tab can be active by default
      expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
    });
  });
});
