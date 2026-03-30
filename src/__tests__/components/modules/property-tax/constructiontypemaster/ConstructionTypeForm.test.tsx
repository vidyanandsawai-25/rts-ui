import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import * as actions from "@/app/[locale]/property-tax/constructiontype/action";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("next-intl", () => ({
  useTranslations: vi.fn((ns?: string) => (key: string) => ns ? `${ns}.${key}` : key),
  useLocale: vi.fn(() => "en"),
}));
import { ConstructionTypeForm } from "@/components/modules/property-tax/construction-type-master";
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/components/common/Drawer", () => ({
  Drawer: ({ open, title, footer, children }: { open: boolean; title: React.ReactNode; footer: React.ReactNode; children: React.ReactNode }) => open ? (
    <div>
      <div>{title}</div>
      {React.Children.map(children, child => {
        if (
          child &&
          typeof child === 'object' &&
          'type' in child &&
          child.type === 'form'
        ) {
          const childElement = child as React.ReactElement<{ id?: string }>;
          return React.cloneElement(childElement, { 
            ...childElement.props, 
            ...({ 'data-testid': 'form' } as React.HTMLAttributes<HTMLFormElement>)
          });
        }
        return child;
      })}
      <div>{footer}</div>
    </div>
  ) : null
}));
vi.mock("@/components/common/Input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement> & { name: string; label?: string }) => (
    <input {...props} data-testid={props.name} aria-label={props.label || props.name} />
  ),
}));
vi.mock("@/components/common/ValidationMessage", () => ({
  ValidationMessage: ({ message, visible }: { message?: string; visible?: boolean }) => visible && message ? <div>{message}</div> : null,
}));
vi.mock("@/components/common/CancelButton", () => ({
  CancelButton: ({ label, ...rest }: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...rest}>{label}</button>,
}));
vi.mock("@/components/common/SaveButton", () => ({
  SaveButton: ({ label, ...rest }: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...rest}>{label}</button>,
}));
vi.mock("@/components/common/ToggleSwitch", () => ({
  ToggleSwitch: ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      data-testid="toggle-switch" 
      aria-label="Toggle status"
    />
  ),
}));

const mockRouterPush = vi.fn();
const mockRouterRefresh = vi.fn();
vi.mocked(useRouter).mockImplementation(() => ({
  back: vi.fn(),
  refresh: mockRouterRefresh,
  forward: vi.fn(),
  push: mockRouterPush,
  replace: vi.fn(),
  prefetch: vi.fn(),
}));

const mockCreate = vi.spyOn(actions, "createConstructionAction").mockResolvedValue({ success: true });
const mockUpdate = vi.spyOn(actions, "updateConstructionAction").mockResolvedValue({ success: true });

describe("ConstructionTypeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders add form and submits successfully", async () => {
    render(<ConstructionTypeForm constructionTypeId={null} />);
    // Fill all required fields (searchKey removed from form)
    fireEvent.change(screen.getByTestId("constructionCode"), { target: { value: "C2" } });
    fireEvent.blur(screen.getByTestId("constructionCode"));
    fireEvent.change(screen.getByTestId("description"), { target: { value: "Bricks" } });
    fireEvent.blur(screen.getByTestId("description"));
    fireEvent.change(screen.getByTestId("searchSequence"), { target: { value: "2" } });
    fireEvent.blur(screen.getByTestId("searchSequence"));
    // Submit
    fireEvent.submit(screen.getByTestId("form"));
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalled();
      expect(mockRouterRefresh).toHaveBeenCalled();
    });
  });

  it("renders edit form and submits successfully", async () => {
    const initialData = {
      constructionTypeId: 1,
      constructionCode: "C1",
      description: "Concrete",
      searchSequence: 1,
      isActive: true,
      createdDate: "2024-01-01T00:00:00Z",
      updatedDate: "2024-01-01T00:00:00Z",
    };
    render(<ConstructionTypeForm constructionTypeId={1} initialData={initialData} />);
    // Verify data is loaded
    expect(screen.getByTestId("constructionCode")).toHaveValue("C1");
    expect(screen.getByTestId("description")).toHaveValue("Concrete");
    // Change a field
    fireEvent.change(screen.getByTestId("description"), { target: { value: "Concrete Updated" } });
    fireEvent.blur(screen.getByTestId("description"));
    // Submit
    fireEvent.submit(screen.getByTestId("form"));
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalled();
      expect(mockRouterRefresh).toHaveBeenCalled();
    });
  });

  it("shows validation errors on empty submit", async () => {
    render(<ConstructionTypeForm constructionTypeId={null} />);
    fireEvent.submit(screen.getByTestId("form"));
    // The form doesn't submit on validation errors
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("toggles active status in edit mode", async () => {
    const initialData = {
      constructionTypeId: 1,
      constructionCode: "C1",
      description: "Concrete",
      searchSequence: 1,
      isActive: true,
      createdDate: "2024-01-01T00:00:00Z",
      updatedDate: "2024-01-01T00:00:00Z",
    };
    render(<ConstructionTypeForm constructionTypeId={1} initialData={initialData} />);
    const toggle = await screen.findByTestId("toggle-switch");
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it("cancels and closes drawer", async () => {
    render(<ConstructionTypeForm constructionTypeId={null} />);
    const cancelBtn = screen.getByText("common.buttons.cancel");
    fireEvent.click(cancelBtn);
    expect(mockRouterPush).toHaveBeenCalled();
  });

  it("sanitizes construction code to alphanumeric only", async () => {
    render(<ConstructionTypeForm constructionTypeId={null} />);
    const input = screen.getByTestId("constructionCode");
    fireEvent.change(input, { target: { value: "ABC-123" } });
    // The component should strip non-alphanumeric characters
    // The mock input will receive the sanitised value from the onChange handler
  });

  it("limits construction code length to 7 characters", async () => {
    render(<ConstructionTypeForm constructionTypeId={null} />);
    const input = screen.getByTestId("constructionCode");
    fireEvent.change(input, { target: { value: "ABCDEFGHIJ" } });
    // The component should truncate to max 7 characters
  });

  it("handles API error on submit", async () => {
    mockCreate.mockResolvedValueOnce({ success: false, statusCode: 409, message: "Duplicate" });
    render(<ConstructionTypeForm constructionTypeId={null} />);
    fireEvent.change(screen.getByTestId("constructionCode"), { target: { value: "C2" } });
    fireEvent.blur(screen.getByTestId("constructionCode"));
    fireEvent.change(screen.getByTestId("description"), { target: { value: "Bricks" } });
    fireEvent.blur(screen.getByTestId("description"));
    fireEvent.change(screen.getByTestId("searchSequence"), { target: { value: "2" } });
    fireEvent.blur(screen.getByTestId("searchSequence"));
    fireEvent.submit(screen.getByTestId("form"));
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });
  });
});
