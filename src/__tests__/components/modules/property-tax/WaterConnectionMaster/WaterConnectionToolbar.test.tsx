import { render, screen, fireEvent } from "@testing-library/react";
import { WaterConnectionToolbar } from "@/components/modules/property-tax/WaterConnectionMaster/WaterConnectionToolbar";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";


jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock("next-intl", () => ({
  useLocale: jest.fn(),
  useTranslations: () => (key: string) => key,
}));

describe("WaterConnectionToolbar", () => {

  beforeEach(() => {
    (useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue({ push: jest.fn() });
    (usePathname as jest.MockedFunction<typeof usePathname>).mockReturnValue("/en/property-tax/water-connection-master/tap-type");
    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockReturnValue({ get: () => "" });
    (useLocale as jest.MockedFunction<typeof useLocale>).mockReturnValue("en");
  });

  it("renders tabs and search input", () => {
    render(<WaterConnectionToolbar />);
    expect(screen.getByPlaceholderText("tapType.searchPlaceholder")).toBeInTheDocument();
    expect(screen.getByText("tabs.tapType")).toBeInTheDocument();
    expect(screen.getByText("tabs.tapStatus")).toBeInTheDocument();
    expect(screen.getByText("tabs.tapSize")).toBeInTheDocument();
  });

  it("calls router.push when tab is changed", () => {
    const push = jest.fn();
    (useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue({ push });
    render(<WaterConnectionToolbar />);
    fireEvent.click(screen.getByText("tabs.tapStatus"));
    expect(push).toHaveBeenCalled();
  });

  it("sanitizes search input", () => {
    render(<WaterConnectionToolbar />);
    const input = screen.getByPlaceholderText("tapType.searchPlaceholder");
    fireEvent.change(input, { target: { value: "test@!#" } });
    expect((input as HTMLInputElement).value).toBe("test");
  });

  it("calls router.push when Add button is clicked", () => {
    const push = jest.fn();
    (useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue({ push });
    render(<WaterConnectionToolbar />);
    fireEvent.click(screen.getByText("tapType.addTitle"));
    expect(push).toHaveBeenCalled();
  });
});
