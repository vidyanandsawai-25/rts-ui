import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UpicLinkCell } from "@/components/modules/property-tax/search-property/results/UpicLinkCell";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("UpicLinkCell", () => {
  it("navigates with propertyId instead of ward/property/partition params", () => {
    render(
      <UpicLinkCell
        upicId=""
        propertyId={4242}
        locale="en"
        copyLabel="UPIC ID"
      />
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "/en/property-tax/ptis?propertyId=4242&searchState=clear"
    );
    expect(link).toHaveAttribute("title", "Open in PTIS");
    expect(link.getAttribute("href")).not.toContain("wardNo=");
    expect(link.getAttribute("href")).not.toContain("propertyNo=");
    expect(link.getAttribute("href")).not.toContain("partitionNo=");
  });

  it("shows a display placeholder without putting it in the URL", () => {
    render(
      <UpicLinkCell
        upicId=""
        propertyId={4242}
        locale="en"
        copyLabel="UPIC ID"
      />
    );

    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/en/property-tax/ptis?propertyId=4242&searchState=clear"
    );
  });

  it("renders plain text when propertyId is missing", () => {
    render(
      <UpicLinkCell
        upicId="UPIC-101"
        propertyId={0}
        locale="en"
        copyLabel="UPIC ID"
      />
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("UPIC-101")).toBeInTheDocument();
  });
});
