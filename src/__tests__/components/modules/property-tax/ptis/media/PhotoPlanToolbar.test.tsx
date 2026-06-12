import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoPlanToolbar } from '@/components/modules/property-tax/ptis/media/PhotoPlanToolbar';

const mockT = (key: string, values?: Record<string, unknown>) => {
  if (key === 'media.imageOf') {
    const vals = values as { current: number; total: number } | undefined;
    return `Image ${vals?.current} of ${vals?.total}`;
  }
  return key;
};

vi.mock('next-intl', () => ({
  useTranslations: () => mockT,
}));

describe('PhotoPlanToolbar Component', () => {
  const defaultProps = {
    title: 'Test Photo',
    currentIndex: 0,
    totalCount: 3,
    hasImage: true,
    rotation: 0,
    onRotateLeft: vi.fn(),
    onRotateRight: vi.fn(),
    onReset: vi.fn(),
    onDownload: vi.fn(),
    onUpload: vi.fn(),
    onReplace: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders correctly with default props', () => {
    render(<PhotoPlanToolbar {...defaultProps} />);
    expect(screen.getByText('Test Photo')).toBeInTheDocument();
    expect(screen.getByText('Image 1 of 3')).toBeInTheDocument();
  });

  it('triggers rotate left, rotate right, and reset buttons when clicked', () => {
    const { rerender } = render(<PhotoPlanToolbar {...defaultProps} />);
    
    const rotateLeftBtn = screen.getByLabelText('media.rotateLeft');
    fireEvent.click(rotateLeftBtn);
    expect(defaultProps.onRotateLeft).toHaveBeenCalled();

    const rotateRightBtn = screen.getByLabelText('media.rotateRight');
    fireEvent.click(rotateRightBtn);
    expect(defaultProps.onRotateRight).toHaveBeenCalled();

    // Reset button should be disabled when rotation is 0
    const resetBtn = screen.getByLabelText('media.reset');
    expect(resetBtn).toBeDisabled();

    // Rerender with rotation > 0 to test reset enable
    rerender(<PhotoPlanToolbar {...defaultProps} rotation={90} />);
    expect(resetBtn).not.toBeDisabled();
    fireEvent.click(resetBtn);
    expect(defaultProps.onReset).toHaveBeenCalled();
  });

  it('triggers replace, delete, download when hasImage is true', () => {
    render(<PhotoPlanToolbar {...defaultProps} />);
    
    const replaceBtn = screen.getByLabelText('media.replaceImage');
    fireEvent.click(replaceBtn);
    expect(defaultProps.onReplace).toHaveBeenCalled();

    const deleteBtn = screen.getByLabelText('actions.delete');
    fireEvent.click(deleteBtn);
    expect(defaultProps.onDelete).toHaveBeenCalled();

    const downloadBtn = screen.getByLabelText('media.download');
    fireEvent.click(downloadBtn);
    expect(defaultProps.onDownload).toHaveBeenCalled();
  });

  it('triggers upload when hasImage is false', () => {
    render(<PhotoPlanToolbar {...defaultProps} hasImage={false} />);
    
    const uploadBtn = screen.getByLabelText('media.uploadImage');
    fireEvent.click(uploadBtn);
    expect(defaultProps.onUpload).toHaveBeenCalled();
  });

  it('disables all buttons and displays spinners / dynamic text during mutations', () => {
    const { rerender } = render(
      <PhotoPlanToolbar {...defaultProps} isReplacing={true} />
    );

    // Manipulation controls should be disabled
    expect(screen.getByLabelText('media.rotateLeft')).toBeDisabled();
    expect(screen.getByLabelText('media.rotateRight')).toBeDisabled();
    expect(screen.getByLabelText('media.reset')).toBeDisabled();

    // Replace button should show spinner/replacing text and be disabled
    const replaceBtn = screen.getByLabelText('media.replaceImage');
    expect(replaceBtn).toBeDisabled();
    expect(screen.getByText('media.replacing')).toBeInTheDocument();

    // Delete and Download should be disabled
    expect(screen.getByLabelText('actions.delete')).toBeDisabled();
    expect(screen.getByLabelText('media.download')).toBeDisabled();

    // Test isDeleting state
    rerender(<PhotoPlanToolbar {...defaultProps} isDeleting={true} />);
    expect(screen.getByLabelText('actions.delete')).toBeDisabled();

    // Test isAdding state on upload mode
    rerender(<PhotoPlanToolbar {...defaultProps} hasImage={false} isAdding={true} />);
    const uploadBtn = screen.getByLabelText('media.uploadImage');
    expect(uploadBtn).toBeDisabled();
    expect(screen.getByText('media.uploading')).toBeInTheDocument();
  });
});
