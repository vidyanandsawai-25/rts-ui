import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import PortalFooter from "@/components/modules/water-bill/portal/components/PortalFooter";
import { mockPortalConfig } from "./portalTestFixtures";

const t = (en: string, _local: string) => en;

describe("PortalFooter Component", () => {
  it("renders nothing when showFooter is false", () => {
    const config = { ...mockPortalConfig, footer: { ...mockPortalConfig.footer, showFooter: false } };
    const { container } = render(<PortalFooter config={config} lang="en" t={t} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the about section and copyright text", () => {
    render(<PortalFooter config={mockPortalConfig} lang="en" t={t} />);

    expect(screen.getByText("Panvel Municipal Corporation")).toBeInTheDocument();
    expect(
      screen.getByText("Official citizen services portal of Panvel Municipal Corporation.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Copyright © 2026 Panvel Municipal Corporation. All Rights Reserved.")
    ).toBeInTheDocument();
  });

  it("renders footer links sorted by displayOrder", () => {
    render(<PortalFooter config={mockPortalConfig} lang="en" t={t} />);

    expect(screen.getByText("Quick Links")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy").closest("a")).toHaveAttribute("href", "/privacy-policy");
    expect(screen.getByText("Disclaimer").closest("a")).toHaveAttribute("href", "/disclaimer");
  });

  it("renders the contact section with email and helpline", () => {
    render(<PortalFooter config={mockPortalConfig} lang="en" t={t} />);

    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText(mockPortalConfig.contact.email)).toBeInTheDocument();
    expect(screen.getByText(mockPortalConfig.contact.helplineNo)).toBeInTheDocument();
  });
});
