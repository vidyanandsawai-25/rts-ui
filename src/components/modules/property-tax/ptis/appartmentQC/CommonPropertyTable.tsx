"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";
import { MasterTable, Column } from "@/components/common/MasterTable";
import { Button, SearchInput } from "@/components/common";
import { ArrowUpDown, Eye, EyeOff, ExternalLink } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CommonPropertyTableProps<T extends Record<string, any>> = {
  columns: Array<{ key: string; label: string }>;
  data: T[];
  title: string;
  activeTab: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRowClick: (row: T) => void;
  loading?: boolean;
  isAutoScrolling: boolean;
  onToggleAutoScroll: () => void;
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  applyTypeColors?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CommonPropertyTable<T extends Record<string, any>>({
  columns,
  data,
  title,
  activeTab,
  searchQuery,
  onSearchChange,
  onRowClick,
  loading = false,
  isAutoScrolling,
  onToggleAutoScroll,
  pageNumber = 1,
  pageSize = 10,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  applyTypeColors = false,
}: CommonPropertyTableProps<T>) {
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scrollDirectionRef = useRef<number>(1);
  const targetScrollRef = useRef<number>(0);

  // Find and store the scrollable element
  const findScrollableElement = useCallback(() => {
    // Try multiple selectors to find the scrollable container
    const selectors = [
      '[class*="overflow-x-auto"]',
      '[class*="overflow-auto"]',
      '[style*="overflow"]',
      'div[class*="table"]',
      '.table-container',
      '#table-wrapper div[style*="overflow"]',
      '.master-table-container',
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const htmlEl = el as HTMLElement;
        if (htmlEl.scrollWidth > htmlEl.clientWidth) {
          console.log("Found scrollable element:", htmlEl);
          return htmlEl;
        }
      }
    }

    // Look specifically for the table container that MasterTable creates
    const tableWrappers = document.querySelectorAll('div[class*="table"]');
    for (const wrapper of tableWrappers) {
      const htmlWrapper = wrapper as HTMLElement;
      if (htmlWrapper.scrollWidth > htmlWrapper.clientWidth) {
        console.log("Found table wrapper:", htmlWrapper);
        return htmlWrapper;
      }
    }

    return null;
  }, []);

  // Start/Stop auto-scroll with smooth animation and pause on hover
  useEffect(() => {
    // Smooth scroll function using requestAnimationFrame
    const smoothScroll = () => {
      if (!scrollContainerRef.current || !isAutoScrolling) return;

      const el = scrollContainerRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;

      // Change direction at edges
      if (el.scrollLeft >= maxScroll - 1) {
        scrollDirectionRef.current = -1;
        targetScrollRef.current = maxScroll - 1;
      } else if (el.scrollLeft <= 1) {
        scrollDirectionRef.current = 1;
        targetScrollRef.current = 1;
      }

      // Calculate target scroll position
      const scrollStep = 1; // Smooth increment
      let newScrollLeft = el.scrollLeft + (scrollDirectionRef.current * scrollStep);

      // Clamp to bounds
      newScrollLeft = Math.max(0, Math.min(maxScroll, newScrollLeft));

      // Apply the scroll
      if (Math.abs(newScrollLeft - el.scrollLeft) > 0.1) {
        el.scrollLeft = newScrollLeft;
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(smoothScroll);
    };

    let container: HTMLElement | null = null;
    if (isAutoScrolling) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        container = findScrollableElement();

        if (!container) {
          console.warn("No scrollable container found!");
          return;
        }

        scrollContainerRef.current = container;
        scrollDirectionRef.current = 1;
        targetScrollRef.current = container.scrollLeft;

        // Add visual indicator
        container.style.outline = "1px solid #5a81ec";
        container.style.transition = "outline 0.2s ease";

        // Pause/resume on hover
        const handleMouseEnter = () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        };
        const handleMouseLeave = () => {
          if (!animationFrameRef.current && isAutoScrolling) {
            animationFrameRef.current = requestAnimationFrame(smoothScroll);
          }
        };
        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);
        // Start smooth scroll animation
        animationFrameRef.current = requestAnimationFrame(smoothScroll);
        // Cleanup listeners on effect cleanup
        return () => {
          container?.removeEventListener('mouseenter', handleMouseEnter);
          container?.removeEventListener('mouseleave', handleMouseLeave);
        };
      }, 150);
      return () => clearTimeout(timeoutId);
    } else {
      // Cleanup animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Remove visual indicator
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.outline = "none";
        scrollContainerRef.current = null;
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.outline = "none";
      }
    };
  }, [isAutoScrolling, findScrollableElement]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Transform columns to match MasterTable format with styling
  const styledColumns: Column<T>[] = useMemo(() => 
    columns.map((col) => ({
      ...col,

      // Header UI
      label: (
        <Button
          type="button"
          variant="secondary"
          size="xs"
          icon={ArrowUpDown}
          iconPosition="right"
          className="
            w-full h-6 flex items-center justify-center gap-1
            rounded-md border border-gray-300 bg-gray-100
            text-[11px] font-semibold text-gray-900
            hover:bg-gray-200
          "
        >
          <span className="truncate">{col.label as string}</span>
        </Button>
      ) as unknown as string,

      cellClassName: "px-1 py-1",

      // Cell UI with click handler
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (value: any, row: T) => {
        // Display "-" for null, undefined, or empty string
        const displayValue = value === null || value === undefined || value === "" ? "-" : value;
        
        return (
          <div
            className="
              group relative
              bg-white rounded border border-gray-300
              px-1 py-0.5 text-xs text-center
              hover:border-blue-400 transition cursor-pointer
              text-blue-700 hover:text-blue-900
            "
            onClick={() => onRowClick(row)}
          >
            <span className="group-hover:underline">{displayValue}</span>
            <ExternalLink
              className="
                inline-block w-3 h-3 ml-1 
                opacity-0 group-hover:opacity-100 
                transition-opacity duration-200
              "
            />
          </div>
        );
      },
    })), [columns, onRowClick]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(value =>
        value?.toString().toLowerCase().includes(query)
      )
    );
  }, [data, searchQuery]);

  // Get cell color classes based on Type
  const getCellColorClass = useCallback((type: string | undefined) => {
    // Only apply custom colors if applyTypeColors is true (for commercial/residential tabs)
    if (!applyTypeColors) {
      return 'bg-white border-gray-300 hover:border-blue-400 text-blue-700 hover:text-blue-900';
    }
    
    if (type === 'C') {
      return 'bg-rose-50 border-rose-300 hover:border-rose-400 text-rose-700 hover:text-rose-900';
    } else if (type === 'R') {
      return 'bg-indigo-100 border-indigo-300 hover:border-indigo-400 text-indigo-700 hover:text-indigo-900';
    } else if (type === 'N') {
      return 'bg-sky-100 border-sky-300 hover:border-sky-400 text-sky-700 hover:text-sky-900';
    } else if (type === 'I') {
      return 'bg-cyan-100 border-cyan-300 hover:border-cyan-400 text-cyan-700 hover:text-cyan-900';
    }
    return 'bg-white border-gray-300 hover:border-blue-400 text-blue-700 hover:text-blue-900';
  }, [applyTypeColors]);

  return (
    <div className="mb-2">
      <MasterTable
        columns={styledColumns.map(col => ({
          ...col,
          cellClassName: `${col.cellClassName || ""} whitespace-nowrap`,
          headerClassName: `${col.headerClassName || ""} !px-1.5 !py-1 border-l !border-gray-400/50`,
          // Override render to apply cell coloring based on type
          render: (value, row: T) => {
            const displayValue = value === null || value === undefined || value === "" ? "-" : String(value);
            const type = (row as { type?: string }).type;
            const colorClass = getCellColorClass(type);
            
            return (
              <div
                className={`
                  group relative
                  ${colorClass} rounded border
                  px-1 py-0.5 text-xs text-center
                  transition cursor-pointer
                `}
                onClick={() => onRowClick(row as T)}
              >
                <span className="group-hover:underline">{displayValue}</span>
                <ExternalLink
                  className="
                    inline-block w-3 h-3 ml-1 
                    opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200
                  "
                />
              </div>
            );
          },
        }))}
        data={filteredData}
        loading={loading}
        height="xs"
        paginationConfig={{ enabled: true, showPageSizeSelector: true }}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount ?? filteredData.length}
        totalPages={totalPages ?? Math.ceil(filteredData.length / pageSize)}
        onPageChange={onPageChange ?? ((p) => console.log("Page:", p))}
        onPageSizeChange={onPageSizeChange ?? ((s) => console.log("Size:", s))}
        headerExtra={
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex gap-2 items-center">
              <h3 className="text-sm font-semibold text-[#1E3A8A]">{title}</h3>
              <span className="text-[#6B7280]">-</span>
              <p className="text-sm text-[#6B7280]">
                {`Showing ${activeTab} data`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search properties..."
                className="w-80 mb-0"
              />
              <button
                onClick={onToggleAutoScroll}
                type="button"
                className={`
                  p-2 rounded-md border transition-all duration-200
                  flex items-center justify-center min-w-[36px] h-[36px]
                  ${isAutoScrolling
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md animate-pulse'
                    : 'bg-white text-[#6B7280] border-[#D1D5DB] hover:border-[#1E3A8A] hover:text-[#1E3A8A] hover:bg-gray-50'
                  }
                `}
                title={isAutoScrolling ? 'Stop auto-scroll' : 'Start auto-scroll'}
              >
                {isAutoScrolling ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        }
        tableClassName="text-xs w-max min-w-full"
        theadClassName="bg-[#d9e3ec] text-black !from-[#d9e3ec] !to-[#d9e3ec] !hover:from-[#d9e3ec] h-0 sticky top-0 z-20 [&_th]:whitespace-nowrap"
        
      />
    </div>
  );
}

export default CommonPropertyTable;
