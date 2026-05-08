import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock server-only for tests
vi.mock('server-only', () => ({}));

// Mock next/headers for tests
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    getAll: vi.fn(() => []),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    forEach: vi.fn(),
    entries: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    toString: vi.fn(() => ''),
  }),
  usePathname: () => '/',
}));

// Mock lucide-react with all icons used in the project
vi.mock('lucide-react', () => {
  const Icon = () => null;
  return {
    Layers: Icon,
    FileText: Icon,
    Users: Icon,
    Settings: Icon,
    Home: Icon,
    Database: Icon,
    Building: Icon,
    Building2: Icon,
    Calculator: Icon,
    GitMerge: Icon,
    IndianRupee: Icon,
    Search: Icon,
    ChevronLeft: Icon,
    ChevronRight: Icon,
    ChevronsLeft: Icon,
    ChevronsRight: Icon,
    Play: Icon,
    Pause: Icon,
    X: Icon,
    ChevronDown: Icon,
    ChevronUp: Icon,
    Trash: Icon,
    Edit: Icon,
    Eye: Icon,
    Plus: Icon,
    Check: Icon,
    AlertCircle: Icon,
    Info: Icon,
    ArrowUpDown: Icon,
    User: Icon,
    MapPin: Icon,
    Activity: Icon,
    Briefcase: Icon,
    Clock: Icon,
    ArrowRight: Icon,
    Type: Icon,
    Image: Icon,
    ImageIcon: Icon,
    Map: Icon,
    Maximize: Icon,
    Minimize: Icon,
    RefreshCw: Icon,
    PenTool: Icon,
    LayoutGrid: Icon,
    CheckCircle2: Icon,
    Calendar: Icon,
    Download: Icon,
    Upload: Icon,
    Filter: Icon,
    MoreHorizontal: Icon,
    MoreVertical: Icon,
    Trash2: Icon,
    File: Icon,
    Folder: Icon,
    Menu: Icon,
    LogOut: Icon,
    UserCircle: Icon,
    Bell: Icon,
    HelpCircle: Icon,
    ExternalLink: Icon,
    Copy: Icon,
    RefreshCcw: Icon,
    History: Icon,
    Save: Icon,
    Printer: Icon,
    Mail: Icon,
    Phone: Icon,
    Globe: Icon,
    MessageSquare: Icon,
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

