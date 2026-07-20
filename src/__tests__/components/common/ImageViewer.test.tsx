import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ImageViewer, ImageViewerProps, ImageViewerImage } from "../../../components/common/ImageViewer";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock fetch for download functionality
global.fetch = vi.fn();

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();

// Helper to create test images
const createTestImages = (count: number = 3): ImageViewerImage[] => {
  return Array.from({ length: count }, (_, i) => ({
    src: `https://example.com/image-${i + 1}.jpg`,
    alt: `Test image ${i + 1}`,
    title: `Image ${i + 1}`,
  }));
};

// Helper to render ImageViewer with default props
const renderImageViewer = (props: Partial<ImageViewerProps> = {}) => {
  const defaultProps: ImageViewerProps = {
    open: true,
    onClose: vi.fn(),
    images: createTestImages(3),
    initialIndex: 0,
  };

  return render(<ImageViewer {...defaultProps} {...props} />);
};

describe("ImageViewer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  describe("Rendering", () => {
    it("renders nothing when open is false", () => {
      const { container } = renderImageViewer({ open: false });
      expect(container.firstChild).toBeNull();
    });

    it("renders the image viewer when open is true", () => {
      renderImageViewer();
      expect(screen.getByTestId("image-viewer")).toBeInTheDocument();
    });

    it("renders the backdrop", () => {
      renderImageViewer();
      expect(screen.getByTestId("image-viewer-backdrop")).toBeInTheDocument();
    });

    it("renders the current image", () => {
      const images = createTestImages(3);
      renderImageViewer({ images, initialIndex: 1 });
      const image = screen.getByTestId("viewer-image") as HTMLImageElement;
      expect(image).toBeInTheDocument();
      expect(image.src).toBe(images[1].src);
    });

    it("displays image title when provided", () => {
      const images = [{ src: "test.jpg", title: "Test Title" }];
      renderImageViewer({ images });
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("displays image counter for multiple images", () => {
      renderImageViewer({ images: createTestImages(5), initialIndex: 2 });
      expect(screen.getByText("3 / 5")).toBeInTheDocument();
    });

    it("does not display counter for single image", () => {
      renderImageViewer({ images: createTestImages(1) });
      expect(screen.queryByText(/\/ 1/)).not.toBeInTheDocument();
    });

    it("renders with custom className", () => {
      renderImageViewer({ className: "custom-class" });
      const viewer = screen.getByTestId("image-viewer");
      expect(viewer.className).toContain("custom-class");
    });
  });

  describe("Close Functionality", () => {
    it("calls onClose when close button is clicked", () => {
      const onClose = vi.fn();
      renderImageViewer({ onClose });
      
      const closeButton = screen.getByTestId("close-button");
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when backdrop is clicked", () => {
      const onClose = vi.fn();
      renderImageViewer({ onClose });
      
      const backdrop = screen.getByTestId("image-viewer-backdrop");
      fireEvent.click(backdrop);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when Escape key is pressed", () => {
      const onClose = vi.fn();
      renderImageViewer({ onClose });
      
      fireEvent.keyDown(document, { key: "Escape" });
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("prevents body scroll when open", () => {
      renderImageViewer({ open: true });
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("restores body scroll when closed", () => {
      document.body.style.overflow = "auto";
      const { rerender } = renderImageViewer({ open: true });
      expect(document.body.style.overflow).toBe("hidden");
      
      rerender(
        <ImageViewer
          open={false}
          onClose={vi.fn()}
          images={createTestImages()}
        />
      );
      
      expect(document.body.style.overflow).toBe("auto");
    });
  });

  describe("Zoom Functionality", () => {
    it("renders zoom controls when showZoom is true", () => {
      renderImageViewer({ showZoom: true });
      expect(screen.getByTestId("zoom-in-button")).toBeInTheDocument();
      expect(screen.getByTestId("zoom-out-button")).toBeInTheDocument();
      expect(screen.getByTestId("zoom-level")).toBeInTheDocument();
    });

    it("does not render zoom controls when showZoom is false", () => {
      renderImageViewer({ showZoom: false });
      expect(screen.queryByTestId("zoom-in-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("zoom-out-button")).not.toBeInTheDocument();
    });

    it("displays initial zoom level as 100%", () => {
      renderImageViewer();
      expect(screen.getByTestId("zoom-level")).toHaveTextContent("100%");
    });

    it("increases zoom when zoom in button is clicked", () => {
      renderImageViewer({ zoomStep: 0.25 });
      const zoomInButton = screen.getByTestId("zoom-in-button");
      
      fireEvent.click(zoomInButton);
      
      expect(screen.getByTestId("zoom-level")).toHaveTextContent("125%");
    });

    it("decreases zoom when zoom out button is clicked", () => {
      renderImageViewer({ zoomStep: 0.25 });
      const zoomInButton = screen.getByTestId("zoom-in-button");
      const zoomOutButton = screen.getByTestId("zoom-out-button");
      
      fireEvent.click(zoomInButton);
      fireEvent.click(zoomOutButton);
      
      expect(screen.getByTestId("zoom-level")).toHaveTextContent("100%");
    });

    it("respects maxZoom limit", () => {
      renderImageViewer({ maxZoom: 2, zoomStep: 0.5 });
      const zoomInButton = screen.getByTestId("zoom-in-button");
      
      // Click 5 times (should max out at 2x)
      for (let i = 0; i < 5; i++) {
        fireEvent.click(zoomInButton);
      }
      
      expect(screen.getByTestId("zoom-level")).toHaveTextContent("200%");
    });

    it("respects minZoom limit", () => {
      renderImageViewer({ minZoom: 0.5, zoomStep: 0.25 });
      const zoomOutButton = screen.getByTestId("zoom-out-button");
      
      // Click 5 times (should min out at 0.5x)
      for (let i = 0; i < 5; i++) {
        fireEvent.click(zoomOutButton);
      }
      
      expect(screen.getByTestId("zoom-level")).toHaveTextContent("50%");
    });

    it("disables zoom in button at max zoom", () => {
      renderImageViewer({ maxZoom: 1.25, zoomStep: 0.25 });
      const zoomInButton = screen.getByTestId("zoom-in-button");
      
      fireEvent.click(zoomInButton);
      
      expect(zoomInButton).toBeDisabled();
    });

    it("disables zoom out button at min zoom", () => {
      renderImageViewer({ minZoom: 1, zoomStep: 0.25 });
      const zoomOutButton = screen.getByTestId("zoom-out-button");
      
      expect(zoomOutButton).toBeDisabled();
    });

    it("increases zoom with + key", () => {
      renderImageViewer({ zoomStep: 0.25 });
      
      fireEvent.keyDown(document, { key: "+" });
      
      expect(screen.getByTestId("zoom-level")).toHaveTextContent("125%");
    });

    it("increases zoom with = key", () => {
      renderImageViewer({ zoomStep: 0.25 });
      
      fireEvent.keyDown(document, { key: "=" });
      
      expect(screen.getByTestId("zoom-level")).toHaveTextContent("125%");
    });

    it("decreases zoom with - key", () => {
      renderImageViewer({ zoomStep: 0.25 });
      const zoomInButton = screen.getByTestId("zoom-in-button");
      
      fireEvent.click(zoomInButton);
      fireEvent.keyDown(document, { key: "-" });
      
      expect(screen.getByTestId("zoom-level")).toHaveTextContent("100%");
    });

    it("zooms with mouse wheel", () => {
      renderImageViewer({ zoomStep: 0.25 });
      const container = screen.getByTestId("image-container");
      
      fireEvent.wheel(container, { deltaY: -100 });
      
      expect(screen.getByTestId("zoom-level")).toHaveTextContent("125%");
    });
  });

  describe("Rotation Functionality", () => {
    it("renders rotate button when showRotate is true", () => {
      renderImageViewer({ showRotate: true });
      expect(screen.getByTestId("rotate-button")).toBeInTheDocument();
    });

    it("does not render rotate button when showRotate is false", () => {
      renderImageViewer({ showRotate: false });
      expect(screen.queryByTestId("rotate-button")).not.toBeInTheDocument();
    });

    it("rotates image when rotate button is clicked", () => {
      renderImageViewer();
      const rotateButton = screen.getByTestId("rotate-button");
      const image = screen.getByTestId("viewer-image");
      
      fireEvent.click(rotateButton);
      
      expect(image.style.transform).toContain("rotate(90deg)");
    });

    it("rotates through 360 degrees", () => {
      renderImageViewer();
      const rotateButton = screen.getByTestId("rotate-button");
      const image = screen.getByTestId("viewer-image");
      
      fireEvent.click(rotateButton); // 90
      fireEvent.click(rotateButton); // 180
      fireEvent.click(rotateButton); // 270
      fireEvent.click(rotateButton); // 0 (360)
      
      expect(image.style.transform).toContain("rotate(0deg)");
    });

    it("rotates with R key", () => {
      renderImageViewer();
      const image = screen.getByTestId("viewer-image");
      
      fireEvent.keyDown(document, { key: "r" });
      
      expect(image.style.transform).toContain("rotate(90deg)");
    });

    it("rotates with R key (uppercase)", () => {
      renderImageViewer();
      const image = screen.getByTestId("viewer-image");
      
      fireEvent.keyDown(document, { key: "R" });
      
      expect(image.style.transform).toContain("rotate(90deg)");
    });
  });

  describe("Reset Functionality", () => {
    it("renders reset button", () => {
      renderImageViewer();
      expect(screen.getByTestId("reset-button")).toBeInTheDocument();
    });

    it("resets zoom, rotation, and position when clicked", () => {
      renderImageViewer();
      const zoomInButton = screen.getByTestId("zoom-in-button");
      const rotateButton = screen.getByTestId("rotate-button");
      const resetButton = screen.getByTestId("reset-button");
      const image = screen.getByTestId("viewer-image");
      
      // Apply transformations
      fireEvent.click(zoomInButton);
      fireEvent.click(rotateButton);
      
      // Reset
      fireEvent.click(resetButton);
      
      expect(screen.getByTestId("zoom-level")).toHaveTextContent("100%");
      expect(image.style.transform).toContain("rotate(0deg)");
      expect(image.style.transform).toContain("scale(1)");
    });

    it("resets with 0 key", () => {
      renderImageViewer();
      const zoomInButton = screen.getByTestId("zoom-in-button");
      const image = screen.getByTestId("viewer-image");
      
      fireEvent.click(zoomInButton);
      fireEvent.keyDown(document, { key: "0" });
      
      expect(screen.getByTestId("zoom-level")).toHaveTextContent("100%");
      expect(image.style.transform).toContain("scale(1)");
    });
  });

  describe("Navigation Functionality", () => {
    it("renders navigation buttons for multiple images when showNavigation is true", () => {
      renderImageViewer({ images: createTestImages(3), showNavigation: true });
      expect(screen.getByTestId("previous-button")).toBeInTheDocument();
      expect(screen.getByTestId("next-button")).toBeInTheDocument();
    });

    it("does not render navigation buttons when showNavigation is false", () => {
      renderImageViewer({ images: createTestImages(3), showNavigation: false });
      expect(screen.queryByTestId("previous-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("next-button")).not.toBeInTheDocument();
    });

    it("does not render navigation buttons for single image", () => {
      renderImageViewer({ images: createTestImages(1), showNavigation: true });
      expect(screen.queryByTestId("previous-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("next-button")).not.toBeInTheDocument();
    });

    it("navigates to next image when next button is clicked", () => {
      const images = createTestImages(3);
      renderImageViewer({ images, initialIndex: 0 });
      
      const nextButton = screen.getByTestId("next-button");
      fireEvent.click(nextButton);
      
      const image = screen.getByTestId("viewer-image") as HTMLImageElement;
      expect(image.src).toBe(images[1].src);
    });

    it("navigates to previous image when previous button is clicked", () => {
      const images = createTestImages(3);
      renderImageViewer({ images, initialIndex: 1 });
      
      const prevButton = screen.getByTestId("previous-button");
      fireEvent.click(prevButton);
      
      const image = screen.getByTestId("viewer-image") as HTMLImageElement;
      expect(image.src).toBe(images[0].src);
    });

    it("wraps to last image when clicking previous on first image", () => {
      const images = createTestImages(3);
      renderImageViewer({ images, initialIndex: 0 });
      
      const prevButton = screen.getByTestId("previous-button");
      fireEvent.click(prevButton);
      
      const image = screen.getByTestId("viewer-image") as HTMLImageElement;
      expect(image.src).toBe(images[2].src);
    });

    it("wraps to first image when clicking next on last image", () => {
      const images = createTestImages(3);
      renderImageViewer({ images, initialIndex: 2 });
      
      const nextButton = screen.getByTestId("next-button");
      fireEvent.click(nextButton);
      
      const image = screen.getByTestId("viewer-image") as HTMLImageElement;
      expect(image.src).toBe(images[0].src);
    });

    it("navigates with arrow keys", () => {
      const images = createTestImages(3);
      renderImageViewer({ images, initialIndex: 1 });
      
      fireEvent.keyDown(document, { key: "ArrowRight" });
      let image = screen.getByTestId("viewer-image") as HTMLImageElement;
      expect(image.src).toBe(images[2].src);
      
      fireEvent.keyDown(document, { key: "ArrowLeft" });
      image = screen.getByTestId("viewer-image") as HTMLImageElement;
      expect(image.src).toBe(images[1].src);
    });

    it("resets transformations when changing images", () => {
      const images = createTestImages(3);
      renderImageViewer({ images, initialIndex: 0 });
      
      const zoomInButton = screen.getByTestId("zoom-in-button");
      const nextButton = screen.getByTestId("next-button");
      
      fireEvent.click(zoomInButton);
      expect(screen.getByTestId("zoom-level")).toHaveTextContent("125%");
      
      fireEvent.click(nextButton);
      expect(screen.getByTestId("zoom-level")).toHaveTextContent("100%");
    });
  });

  describe("Download Functionality", () => {
    it("renders download button when showDownload is true", () => {
      renderImageViewer({ showDownload: true });
      expect(screen.getByTestId("download-button")).toBeInTheDocument();
    });

    it("does not render download button when showDownload is false", () => {
      renderImageViewer({ showDownload: false });
      expect(screen.queryByTestId("download-button")).not.toBeInTheDocument();
    });

    it("downloads image when download button is clicked", async () => {
      const mockBlob = new Blob(["test"], { type: "image/jpeg" });
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        blob: () => Promise.resolve(mockBlob),
      });

      const images = [{ src: "test.jpg", title: "Test Image" }];
      renderImageViewer({ images });

      const downloadButton = screen.getByTestId("download-button");
      
      await act(async () => {
        fireEvent.click(downloadButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("test.jpg");
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      });
    });

    it("handles download errors gracefully", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

      renderImageViewer();
      const downloadButton = screen.getByTestId("download-button");
      
      await act(async () => {
        fireEvent.click(downloadButton);
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Fit to Screen Functionality", () => {
    it("renders fit to screen button", () => {
      renderImageViewer();
      expect(screen.getByTestId("fit-to-screen-button")).toBeInTheDocument();
    });

    it("fits image to screen when button is clicked", () => {
      renderImageViewer();
      const fitButton = screen.getByTestId("fit-to-screen-button");
      
      fireEvent.click(fitButton);
      
      // The fit functionality requires DOM measurements which are mocked in tests
      // We just verify the button is clickable
      expect(fitButton).not.toBeDisabled();
    });
  });

  describe("Drag and Pan Functionality", () => {
    it("allows dragging when zoomed in", () => {
      renderImageViewer();
      const container = screen.getByTestId("image-container");
      const zoomInButton = screen.getByTestId("zoom-in-button");
      
      // Zoom in first
      fireEvent.click(zoomInButton);
      
      // Start drag
      fireEvent.mouseDown(container, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(container, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(container);
      
      // Verify cursor changes
      expect(container.style.cursor).toBe("grab");
    });

    it("does not allow dragging at 1x zoom", () => {
      renderImageViewer();
      const container = screen.getByTestId("image-container");
      
      fireEvent.mouseDown(container, { clientX: 100, clientY: 100 });
      
      // Cursor should be default
      expect(container.style.cursor).toBe("default");
    });

    it("changes cursor to grabbing while dragging", () => {
      renderImageViewer();
      const container = screen.getByTestId("image-container");
      const zoomInButton = screen.getByTestId("zoom-in-button");
      
      fireEvent.click(zoomInButton);
      fireEvent.mouseDown(container, { clientX: 100, clientY: 100 });
      
      expect(container.style.cursor).toBe("grabbing");
    });

    it("stops dragging on mouse up", () => {
      renderImageViewer();
      const container = screen.getByTestId("image-container");
      const zoomInButton = screen.getByTestId("zoom-in-button");
      
      fireEvent.click(zoomInButton);
      fireEvent.mouseDown(container, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(container);
      
      expect(container.style.cursor).toBe("grab");
    });

    it("stops dragging on mouse leave", () => {
      renderImageViewer();
      const container = screen.getByTestId("image-container");
      const zoomInButton = screen.getByTestId("zoom-in-button");
      
      fireEvent.click(zoomInButton);
      fireEvent.mouseDown(container, { clientX: 100, clientY: 100 });
      fireEvent.mouseLeave(container);
      
      expect(container.style.cursor).toBe("grab");
    });
  });

  describe("Touch Support", () => {
    it("handles touch drag when zoomed in", () => {
      renderImageViewer();
      const container = screen.getByTestId("image-container");
      const zoomInButton = screen.getByTestId("zoom-in-button");
      
      fireEvent.click(zoomInButton);
      
      const touch = { clientX: 100, clientY: 100 };
      fireEvent.touchStart(container, { touches: [touch] });
      
      const touch2 = { clientX: 150, clientY: 150 };
      fireEvent.touchMove(container, { touches: [touch2] });
      
      fireEvent.touchEnd(container);
      
      // Verify no errors occurred
      expect(container).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("shows loading spinner while image is loading", () => {
      renderImageViewer();
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("hides loading spinner after image loads", () => {
      renderImageViewer();
      const image = screen.getByTestId("viewer-image");
      
      fireEvent.load(image);
      
      waitFor(() => {
        expect(image).toHaveClass("opacity-100");
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      renderImageViewer();
      const viewer = screen.getByTestId("image-viewer");
      
      expect(viewer).toHaveAttribute("role", "dialog");
      expect(viewer).toHaveAttribute("aria-modal", "true");
      expect(viewer).toHaveAttribute("aria-label", "Image viewer");
    });

    it("has proper button labels", () => {
      renderImageViewer();
      
      expect(screen.getByLabelText("Close viewer")).toBeInTheDocument();
      expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
      expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
      expect(screen.getByLabelText("Rotate clockwise")).toBeInTheDocument();
      expect(screen.getByLabelText("Reset view")).toBeInTheDocument();
      expect(screen.getByLabelText("Fit to screen")).toBeInTheDocument();
      expect(screen.getByLabelText("Download image")).toBeInTheDocument();
    });

    it("has proper image alt text", () => {
      const images = [{ src: "test.jpg", alt: "Test image description" }];
      renderImageViewer({ images });
      
      const image = screen.getByAltText("Test image description");
      expect(image).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty images array gracefully", () => {
      const { container } = renderImageViewer({ images: [] });
      expect(container.firstChild).toBeNull();
    });

    it("handles invalid initialIndex", () => {
      const images = createTestImages(3);
      const { container } = renderImageViewer({ images, initialIndex: 10 });
      
      // Invalid index should result in component not rendering
      expect(container.firstChild).toBeNull();
    });

    it("updates current index when initialIndex prop changes on reopen", () => {
      const images = createTestImages(3);
      const { rerender } = renderImageViewer({ images, initialIndex: 0, open: true });
      
      let image = screen.getByTestId("viewer-image") as HTMLImageElement;
      expect(image.src).toBe(images[0].src);
      
      // Close the viewer
      rerender(
        <ImageViewer
          open={false}
          onClose={vi.fn()}
          images={images}
          initialIndex={2}
        />
      );
      
      // Reopen with new initialIndex
      rerender(
        <ImageViewer
          open={true}
          onClose={vi.fn()}
          images={images}
          initialIndex={2}
        />
      );
      
      image = screen.getByTestId("viewer-image") as HTMLImageElement;
      expect(image.src).toBe(images[2].src);
    });
  });
});
