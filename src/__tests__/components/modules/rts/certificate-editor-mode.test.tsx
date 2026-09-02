import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import CertificateCanvasEditor from "@/components/modules/rts/configuration/certificate-studio/CertificateCanvasEditor";
import { createCertificateNode, createEmptyCertificateDesign } from "@/components/modules/rts/configuration/certificate-studio/schema";

const commonProps = {
  initialDocument: createEmptyCertificateDesign("en"),
  templateName: "Test template",
  templateCode: "TEST_TEMPLATE",
  isActive: true,
  persistenceReady: true,
  saving: false,
  onSave: vi.fn(async () => true),
};

function renderEditor(editor: React.ReactNode) {
  return render(
    <NextIntlClientProvider
      locale="en"
      messages={{ common: { buttons: { close: "Close" }, messages: { total: "{count} total" } } }}
    >
      {editor}
    </NextIntlClientProvider>
  );
}

describe("CertificateCanvasEditor modes", () => {
  it("hides service tags and service-only settings in reusable-template mode", () => {
    renderEditor(<CertificateCanvasEditor {...commonProps} editorMode="template" />);

    expect(screen.queryByRole("button", { name: "tags" })).not.toBeInTheDocument();
    expect(screen.queryByText("Default conditions")).not.toBeInTheDocument();
    expect(screen.queryByText("Officer inputs")).not.toBeInTheDocument();
    expect(screen.getByText("Reusable template library")).toBeInTheDocument();
  });

  it("retains tags and service-only settings in service mode", () => {
    renderEditor(
      <CertificateCanvasEditor
        {...commonProps}
        editorMode="service"
        serviceName="Birth Certificate"
        departmentName="Health"
      />
    );

    expect(screen.getByRole("button", { name: "tags" })).toBeInTheDocument();
    expect(screen.getByText("Default conditions")).toBeInTheDocument();
    expect(screen.getByText("Officer inputs")).toBeInTheDocument();
  });

  it("groups layers by repeated sections and confirms component deletion", async () => {
    const user = userEvent.setup();
    const initialDocument = createEmptyCertificateDesign("en");
    const node = createCertificateNode("rectangle", { id: "shape-to-delete", name: "Approval box", section: "body" });
    initialDocument.nodes[node.id] = node;
    initialDocument.rootIds.push(node.id);

    renderEditor(<CertificateCanvasEditor {...commonProps} initialDocument={initialDocument} editorMode="template" />);
    await user.click(screen.getByRole("button", { name: "layers" }));

    expect(screen.getAllByText("Header").length).toBeGreaterThan(0);
    expect(screen.getByText("Main body — page 1")).toBeInTheDocument();
    expect(screen.getAllByText("Footer").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Rotate Approval box" }));
    expect(screen.getByText("Rotation").closest("label")?.querySelector("input")).toHaveValue(15);
    await user.click(screen.getByRole("button", { name: "Delete Approval box" }));
    expect(screen.getByRole("heading", { name: "Delete component?" })).toBeInTheDocument();
    expect(screen.getAllByText(/Approval box/).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("heading", { name: "Delete component?" })).not.toBeInTheDocument();
  });

  it("supports double-click and toolbar text editing while preserving formatted content", async () => {
    const user = userEvent.setup();
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", { configurable: true, value: execCommand });
    const initialDocument = createEmptyCertificateDesign("en");
    const node = createCertificateNode("text", { id: "editable-text", content: "Original text" });
    initialDocument.nodes[node.id] = node;
    initialDocument.rootIds.push(node.id);
    const { container } = renderEditor(<CertificateCanvasEditor {...commonProps} initialDocument={initialDocument} editorMode="template" />);
    const editable = container.querySelector<HTMLElement>('[data-edit-node="editable-text"]');
    expect(editable).not.toBeNull();

    await user.click(editable!);
    expect(editable).toHaveAttribute("contenteditable", "false");
    expect(screen.queryByLabelText("Text HTML")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
    await user.dblClick(editable!);
    expect(editable).toHaveAttribute("contenteditable", "true");
    await waitFor(() => expect(editable).toHaveFocus());
    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(execCommand).toHaveBeenCalledWith("bold", false, undefined);
    await user.click(screen.getByRole("button", { name: "Bulleted list" }));
    await user.click(screen.getByRole("button", { name: "Align center" }));
    expect(execCommand).toHaveBeenCalledWith("insertUnorderedList", false, undefined);
    expect(execCommand).toHaveBeenCalledWith("justifyCenter", false, undefined);
    expect(editable).toHaveFocus();
    editable!.innerHTML = "Saved edited text";
    fireEvent.input(editable!);
    await user.keyboard("{Escape}");

    expect(editable).toHaveAttribute("contenteditable", "false");
    expect(editable).toHaveTextContent("Saved edited text");

    await user.click(screen.getByRole("button", { name: "Edit Text" }));
    await waitFor(() => expect(editable).toHaveFocus());
    await user.click(screen.getByRole("button", { name: "Italic" }));
    expect(execCommand).toHaveBeenCalledWith("italic", false, undefined);
    editable!.innerHTML = "Saved by outside click";
    fireEvent.input(editable!);
    await user.click(screen.getByRole("button", { name: "elements" }));
    expect(editable).toHaveAttribute("contenteditable", "false");
    expect(editable).toHaveTextContent("Saved by outside click");

    await user.dblClick(editable!);
    await waitFor(() => expect(editable).toHaveFocus());
    editable!.innerHTML = "Saved while adding another component";
    fireEvent.input(editable!);
    await user.click(screen.getByRole("button", { name: "Rectangle" }));
    expect(editable).toHaveTextContent("Saved while adding another component");
  });

  it("can disable header and footer regions from page settings", async () => {
    const user = userEvent.setup();
    renderEditor(<CertificateCanvasEditor {...commonProps} editorMode="template" />);

    expect(screen.getByRole("button", { name: "Resize header" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resize footer" })).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Enable header" }));
    await user.click(screen.getByRole("checkbox", { name: "Enable footer" }));
    expect(screen.queryByRole("button", { name: "Resize header" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Resize footer" })).not.toBeInTheDocument();
  });
});
