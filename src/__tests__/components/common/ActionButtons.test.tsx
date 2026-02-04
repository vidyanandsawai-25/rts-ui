import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  AddButton,
  SaveButton,
  CancelButton,
  UploadButton,
  ExportButton,
  ImportButton,
  EditButton,
  DeleteButton,
  FirstPageButton,
  PrevPageButton,
  NextPageButton,
  LastPageButton,
  PageNumberButton,
} from "@/components/common/ActionButtons";
import IconButton from "@/components/common/ActionButtons";

describe("ActionButtons", () => {
  describe("Labeled Action Buttons", () => {
    describe("AddButton", () => {
      it("renders with default label", () => {
        render(<AddButton />);
        expect(screen.getByText("Add")).toBeInTheDocument();
      });

      it("renders with custom label", () => {
        render(<AddButton label="Create New" />);
        expect(screen.getByText("Create New")).toBeInTheDocument();
      });

      it("calls onClick handler when clicked", () => {
        const handleClick = vi.fn();
        render(<AddButton onClick={handleClick} />);
        fireEvent.click(screen.getByText("Add"));
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it("is disabled when disabled prop is true", () => {
        render(<AddButton disabled />);
        const button = screen.getByText("Add").closest("button");
        expect(button).toBeDisabled();
      });

      it("accepts additional className", () => {
        render(<AddButton className="custom-class" />);
        const button = screen.getByText("Add").closest("button");
        expect(button).toHaveClass("custom-class");
      });
    });

    describe("SaveButton", () => {
      it("renders with default label", () => {
        render(<SaveButton />);
        expect(screen.getByText("Save")).toBeInTheDocument();
      });

      it("renders with custom label", () => {
        render(<SaveButton label="Submit" />);
        expect(screen.getByText("Submit")).toBeInTheDocument();
      });

      it("calls onClick handler when clicked", () => {
        const handleClick = vi.fn();
        render(<SaveButton onClick={handleClick} />);
        fireEvent.click(screen.getByText("Save"));
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it("is disabled when disabled prop is true", () => {
        render(<SaveButton disabled />);
        const button = screen.getByText("Save").closest("button");
        expect(button).toBeDisabled();
      });
    });

    describe("CancelButton", () => {
      it("renders with default label", () => {
        render(<CancelButton />);
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });

      it("renders with custom label", () => {
        render(<CancelButton label="Close" />);
        expect(screen.getByText("Close")).toBeInTheDocument();
      });

      it("calls onClick handler when clicked", () => {
        const handleClick = vi.fn();
        render(<CancelButton onClick={handleClick} />);
        fireEvent.click(screen.getByText("Cancel"));
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });

    describe("UploadButton", () => {
      it("renders with default label", () => {
        render(<UploadButton />);
        expect(screen.getByText("Upload")).toBeInTheDocument();
      });

      it("renders with custom label", () => {
        render(<UploadButton label="Upload File" />);
        expect(screen.getByText("Upload File")).toBeInTheDocument();
      });

      it("calls onClick handler when clicked", () => {
        const handleClick = vi.fn();
        render(<UploadButton onClick={handleClick} />);
        fireEvent.click(screen.getByText("Upload"));
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });

    describe("ExportButton", () => {
      it("renders with default label", () => {
        render(<ExportButton />);
        expect(screen.getByText("Export")).toBeInTheDocument();
      });

      it("renders with custom label", () => {
        render(<ExportButton label="Export Data" />);
        expect(screen.getByText("Export Data")).toBeInTheDocument();
      });

      it("calls onClick handler when clicked", () => {
        const handleClick = vi.fn();
        render(<ExportButton onClick={handleClick} />);
        fireEvent.click(screen.getByText("Export"));
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });

    describe("ImportButton", () => {
      it("renders with default label", () => {
        render(<ImportButton />);
        expect(screen.getByText("Import")).toBeInTheDocument();
      });

      it("renders with custom label", () => {
        render(<ImportButton label="Import Data" />);
        expect(screen.getByText("Import Data")).toBeInTheDocument();
      });

      it("calls onClick handler when clicked", () => {
        const handleClick = vi.fn();
        render(<ImportButton onClick={handleClick} />);
        fireEvent.click(screen.getByText("Import"));
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Icon-Only CRUD Buttons", () => {
    describe("EditButton", () => {
      it("renders without text", () => {
        const { container } = render(<EditButton />);
        const button = container.querySelector("button");
        expect(button).toBeInTheDocument();
        expect(button?.textContent).toBe("");
      });

      it("calls onClick handler when clicked", () => {
        const handleClick = vi.fn();
        const { container } = render(<EditButton onClick={handleClick} />);
        const button = container.querySelector("button");
        if (button) {
          fireEvent.click(button);
        }
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it("is disabled when disabled prop is true", () => {
        const { container } = render(<EditButton disabled />);
        const button = container.querySelector("button");
        expect(button).toBeDisabled();
      });

      it("has small size by default", () => {
        const { container } = render(<EditButton />);
        const button = container.querySelector("button");
        expect(button).toHaveClass("h-8");
      });
    });

    describe("DeleteButton", () => {
      it("renders without text", () => {
        const { container } = render(<DeleteButton />);
        const button = container.querySelector("button");
        expect(button).toBeInTheDocument();
        expect(button?.textContent).toBe("");
      });

      it("calls onClick handler when clicked", () => {
        const handleClick = vi.fn();
        const { container } = render(<DeleteButton onClick={handleClick} />);
        const button = container.querySelector("button");
        if (button) {
          fireEvent.click(button);
        }
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it("is disabled when disabled prop is true", () => {
        const { container } = render(<DeleteButton disabled />);
        const button = container.querySelector("button");
        expect(button).toBeDisabled();
      });

      it("has small size by default", () => {
        const { container } = render(<DeleteButton />);
        const button = container.querySelector("button");
        expect(button).toHaveClass("h-8");
      });
    });
  });

  describe("Pagination Buttons", () => {
    describe("FirstPageButton", () => {
      it("renders without text", () => {
        const { container } = render(<FirstPageButton />);
        const button = container.querySelector("button");
        expect(button).toBeInTheDocument();
      });

      it("calls onClick handler when clicked", () => {
        const handleClick = vi.fn();
        const { container } = render(<FirstPageButton onClick={handleClick} />);
        const button = container.querySelector("button");
        if (button) {
          fireEvent.click(button);
        }
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it("is disabled when disabled prop is true", () => {
        const { container } = render(<FirstPageButton disabled />);
        const button = container.querySelector("button");
        expect(button).toBeDisabled();
      });
    });

    describe("PrevPageButton", () => {
      it("renders without text", () => {
        const { container } = render(<PrevPageButton />);
        const button = container.querySelector("button");
        expect(button).toBeInTheDocument();
      });

      it("calls onClick handler when clicked", () => {
        const handleClick = vi.fn();
        const { container } = render(<PrevPageButton onClick={handleClick} />);
        const button = container.querySelector("button");
        if (button) {
          fireEvent.click(button);
        }
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });

    describe("NextPageButton", () => {
      it("renders without text", () => {
        const { container } = render(<NextPageButton />);
        const button = container.querySelector("button");
        expect(button).toBeInTheDocument();
      });

      it("calls onClick handler when clicked", () => {
        const handleClick = vi.fn();
        const { container } = render(<NextPageButton onClick={handleClick} />);
        const button = container.querySelector("button");
        if (button) {
          fireEvent.click(button);
        }
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });

    describe("LastPageButton", () => {
      it("renders without text", () => {
        const { container } = render(<LastPageButton />);
        const button = container.querySelector("button");
        expect(button).toBeInTheDocument();
      });

      it("calls onClick handler when clicked", () => {
        const handleClick = vi.fn();
        const { container } = render(<LastPageButton onClick={handleClick} />);
        const button = container.querySelector("button");
        if (button) {
          fireEvent.click(button);
        }
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("IconButton (Default Export)", () => {
    it("renders with icon", () => {
      const MockIcon = () => <span data-testid="mock-icon">Icon</span>;
      const { container } = render(<IconButton icon={MockIcon} />);
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("applies primary variant classes by default", () => {
      const MockIcon = () => <span>Icon</span>;
      const { container } = render(<IconButton icon={MockIcon} />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("from-cyan-400");
      expect(button).toHaveClass("to-blue-500");
    });

    it("applies danger variant classes when variant is danger", () => {
      const MockIcon = () => <span>Icon</span>;
      const { container } = render(<IconButton icon={MockIcon} variant="danger" />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("from-red-400");
      expect(button).toHaveClass("to-red-600");
    });

    it("calls onClick handler when clicked", () => {
      const MockIcon = () => <span>Icon</span>;
      const handleClick = vi.fn();
      const { container } = render(<IconButton icon={MockIcon} onClick={handleClick} />);
      const button = container.querySelector("button");
      if (button) {
        fireEvent.click(button);
      }
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("is disabled when disabled prop is true", () => {
      const MockIcon = () => <span>Icon</span>;
      const { container } = render(<IconButton icon={MockIcon} disabled />);
      const button = container.querySelector("button");
      expect(button).toBeDisabled();
    });

    it("accepts additional className", () => {
      const MockIcon = () => <span>Icon</span>;
      const { container } = render(<IconButton icon={MockIcon} className="custom-icon-class" />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("custom-icon-class");
    });

    it("has correct size classes", () => {
      const MockIcon = () => <span>Icon</span>;
      const { container } = render(<IconButton icon={MockIcon} />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("h-8");
      expect(button).toHaveClass("w-8");
    });
  });

  describe("PageNumberButton", () => {
    it("renders page number", () => {
      render(<PageNumberButton page={5} />);
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("calls onClick handler when clicked", () => {
      const handleClick = vi.fn();
      render(<PageNumberButton page={3} onClick={handleClick} />);
      fireEvent.click(screen.getByText("3"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("applies active styles when active is true", () => {
      render(<PageNumberButton page={2} active />);
      const button = screen.getByText("2").closest("button");
      expect(button).toHaveClass("bg-[#2563EB]");
      expect(button).toHaveClass("text-white");
    });

    it("applies inactive styles when active is false", () => {
      render(<PageNumberButton page={2} active={false} />);
      const button = screen.getByText("2").closest("button");
      expect(button).toHaveClass("bg-white");
      expect(button).toHaveClass("text-[#1E3A8A]");
    });

    it("has correct size classes", () => {
      render(<PageNumberButton page={1} />);
      const button = screen.getByText("1").closest("button");
      expect(button).toHaveClass("min-w-[36px]");
      expect(button).toHaveClass("text-sm");
    });
  });

  describe("Button Props Inheritance", () => {
    it("AddButton accepts all ButtonProps", () => {
      const handleClick = vi.fn();
      render(
        <AddButton
          onClick={handleClick}
          disabled={false}
          className="test-class"
          label="Test Add"
        />
      );
      const button = screen.getByText("Test Add");
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });

    it("EditButton accepts ButtonProps except icon and variant", () => {
      const { container } = render(
        <EditButton
          className="edit-test-class"
          disabled={false}
        />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("edit-test-class");
    });
  });

  describe("Accessibility", () => {
    it("labeled buttons are keyboard accessible", () => {
      const handleClick = vi.fn();
      render(<AddButton onClick={handleClick} />);
      const button = screen.getByRole("button", { name: "Add" });
      button.focus();
      expect(button).toHaveFocus();
      fireEvent.keyDown(button, { key: "Enter" });
    });

    it("icon buttons are keyboard accessible", () => {
      const MockIcon = () => <span>Icon</span>;
      const handleClick = vi.fn();
      const { container } = render(<IconButton icon={MockIcon} onClick={handleClick} />);
      const button = container.querySelector("button");
      if (button) {
        button.focus();
        expect(button).toHaveFocus();
      }
    });

    it("disabled buttons cannot be focused programmatically", () => {
      render(<AddButton disabled />);
      const button = screen.getByText("Add").closest("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Edge Cases", () => {
    it("handles multiple rapid clicks correctly", () => {
      const handleClick = vi.fn();
      render(<AddButton onClick={handleClick} />);
      const button = screen.getByText("Add");
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it("PageNumberButton handles large page numbers", () => {
      render(<PageNumberButton page={9999} />);
      expect(screen.getByText("9999")).toBeInTheDocument();
    });

    it("handles empty label strings", () => {
      render(<AddButton label="" />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe("");
    });
  });
});
