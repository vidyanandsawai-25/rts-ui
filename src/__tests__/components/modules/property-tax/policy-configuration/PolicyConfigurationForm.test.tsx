import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import * as actions from "@/app/[locale]/property-tax/policy-configuration/action";
import PolicyConfigurationForm from "@/components/modules/property-tax/policy-configuration/PolicyConfigurationForm";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn((ns?: string) => (key: string) => ns ? `${ns}.${key}` : key),
  useLocale: vi.fn(() => "en"),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

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

vi.mock("@/components/common", () => ({
  Input: ({ name, label, fullWidth: _fullWidth, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { name: string; label?: string; fullWidth?: boolean }) => (
    <input {...props} name={name} data-testid={name} aria-label={label || name} />
  ),
  TextArea: ({ name, label, error: _error, errorMessage: _errorMessage, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { name: string; label?: string; error?: boolean; errorMessage?: string }) => (
    <textarea {...props} name={name} data-testid={name} aria-label={label || name} />
  ),
  ValidationMessage: ({ message, visible }: { message?: string; visible?: boolean }) => visible && message ? <div>{message}</div> : null,
  CancelButton: ({ label, fullWidth: _fullWidth, isLoading: _isLoading, ...rest }: { label: string; fullWidth?: boolean; isLoading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...rest}>{label}</button>,
  SaveButton: ({ label, fullWidth: _fullWidth, isLoading: _isLoading, ...rest }: { label: string; fullWidth?: boolean; isLoading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...rest}>{label}</button>,
  ToggleSwitch: ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      data-testid="status-toggle" 
      aria-label="Toggle status"
    />
  ),
  Select: ({
    name,
    label,
    options,
    value,
    onChange,
    onBlur,
    placeholder,
    ...props
  }: {
    name: string;
    label?: string;
    options?: { label: string; value: string }[];
    value?: string | null;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>, val: string) => void;
    onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
    placeholder?: string;
  }) => (
    <select
      {...props}
      name={name}
      value={value ?? ""}
      data-testid={name}
      onChange={(e) => {
        onChange?.(e, e.target.value);
      }}
      onBlur={onBlur}
      aria-label={label || name}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((opt: { label: string; value: string }) => (
        <option key={opt.value} value={opt.value}>
          {opt.label || opt.value}
        </option>
      ))}
    </select>
  ),
  RequiredFieldsNote: ({ text }: { text: string }) => <div>{text}</div>,
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

const mockSavePolicy = vi.spyOn(actions, "savePolicyConfiguration").mockResolvedValue({ ok: true, mode: "create" });

describe("PolicyConfigurationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders add form and submits successfully", async () => {
    render(<PolicyConfigurationForm initialData={null} />);
    
    // Fill all required fields
    fireEvent.change(screen.getByTestId("policyCode"), { target: { value: "PT_RATE" } });
    fireEvent.blur(screen.getByTestId("policyCode"));
    fireEvent.change(screen.getByTestId("category"), { target: { value: "TAXATION" } });
    fireEvent.blur(screen.getByTestId("category"));
    fireEvent.change(screen.getByTestId("displayName"), { target: { value: "Property Tax Rate" } });
    fireEvent.blur(screen.getByTestId("displayName"));
    fireEvent.change(screen.getByTestId("description"), { target: { value: "Standard Tax Rate" } });
    fireEvent.blur(screen.getByTestId("description"));
    fireEvent.change(screen.getByTestId("dataType"), { target: { value: "DECIMAL" } });
    fireEvent.blur(screen.getByTestId("dataType"));
    fireEvent.change(screen.getByTestId("policyValue"), { target: { value: "15" } });
    fireEvent.blur(screen.getByTestId("policyValue"));
    fireEvent.change(screen.getByTestId("defaultValue"), { target: { value: "10" } });
    fireEvent.blur(screen.getByTestId("defaultValue"));
    fireEvent.change(screen.getByTestId("unit"), { target: { value: "%" } });
    fireEvent.blur(screen.getByTestId("unit"));
    fireEvent.change(screen.getByTestId("effectiveFrom"), { target: { value: "2026-06-03" } });
    fireEvent.blur(screen.getByTestId("effectiveFrom"));

    // Submit
    fireEvent.submit(screen.getByTestId("form"));
    
    await waitFor(() => {
      expect(mockSavePolicy).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalled();
      expect(mockRouterRefresh).toHaveBeenCalled();
    });
  });

  it("renders edit form and submits successfully", async () => {
    const initialData = {
      id: 1,
      policyCode: "PT_RATE_EXISTING",
      category: "TAXATION",
      displayName: "Existing Rate",
      description: "Existing policy description",
      dataType: "DECIMAL",
      policyValue: "15",
      defaultValue: "10",
      unit: "%",
      effectiveFrom: "2026-06-03T00:00:00Z",
      effectiveTo: null,
      isActive: true,
      allowedValues: null,
    };
    
    render(<PolicyConfigurationForm initialData={initialData} />);
    
    // Verify data is loaded
    expect(screen.getByTestId("policyCode")).toHaveValue("PT_RATE_EXISTING");
    expect(screen.getByTestId("displayName")).toHaveValue("Existing Rate");
    
    // Change a field
    fireEvent.change(screen.getByTestId("displayName"), { target: { value: "Updated Rate" } });
    fireEvent.blur(screen.getByTestId("displayName"));
    
    // Submit
    fireEvent.submit(screen.getByTestId("form"));
    
    await waitFor(() => {
      expect(mockSavePolicy).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalled();
      expect(mockRouterRefresh).toHaveBeenCalled();
    });
  });

  it("shows validation errors on empty submit", async () => {
    render(<PolicyConfigurationForm initialData={null} />);
    fireEvent.submit(screen.getByTestId("form"));
    
    expect(mockSavePolicy).not.toHaveBeenCalled();
  });

  it("toggles active status in edit mode", async () => {
    const initialData = {
      id: 1,
      policyCode: "PT_RATE_EXISTING",
      category: "TAXATION",
      displayName: "Existing Rate",
      description: "Existing policy description",
      dataType: "DECIMAL",
      policyValue: "15",
      defaultValue: "10",
      unit: "%",
      effectiveFrom: "2026-06-03T00:00:00Z",
      effectiveTo: null,
      isActive: true,
      allowedValues: null,
    };
    
    render(<PolicyConfigurationForm initialData={initialData} />);
    const toggle = screen.getByTestId("status-toggle");
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it("cancels and closes drawer", async () => {
    render(<PolicyConfigurationForm initialData={null} />);
    const cancelBtn = screen.getByText("policyConfiguration.form.actions.cancel");
    fireEvent.click(cancelBtn);
    expect(mockRouterPush).not.toHaveBeenCalled(); // Goes back, which is window history based in this component
  });

  it("sanitizes policyCode input to uppercase alphanumeric and underscores only", async () => {
    render(<PolicyConfigurationForm initialData={null} />);
    const input = screen.getByTestId("policyCode") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ab c-12@#$_" } });
    expect(input.value).toBe("ABC12_");
  });

  it("limits policyCode length to 40 characters", async () => {
    render(<PolicyConfigurationForm initialData={null} />);
    const input = screen.getByTestId("policyCode") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "A".repeat(60) } });
    expect(input.value).toHaveLength(40);
  });
});
