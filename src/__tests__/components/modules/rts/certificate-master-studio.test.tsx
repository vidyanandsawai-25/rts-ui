import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import RtsCertificateMasterStudio from "@/components/modules/rts/configuration/RtsCertificateMasterStudio";
import {
  createCertificateNode,
  createEmptyCertificateDesign,
  type CertificateDesignDocument,
} from "@/components/modules/rts/configuration/certificate-studio/schema";
import type { RTSCertificateTemplate } from "@/types/rts/certificate.types";

const actionMocks = vi.hoisted(() => ({
  fetchAvailableTags: vi.fn(async () => []),
  fetchServiceFields: vi.fn(async () => []),
  saveTemplate: vi.fn(),
}));

vi.mock("@/app/[locale]/rts/configuration-settings/rts-certificates/actions", () => ({
  fetchAvailableTagsAction: actionMocks.fetchAvailableTags,
  fetchCertificateServiceFieldsAction: actionMocks.fetchServiceFields,
  saveCertificateTemplateAction: actionMocks.saveTemplate,
}));

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

vi.mock("@/components/modules/rts/configuration/certificate-studio/CertificateCanvasEditor", () => ({
  default: (props: {
    initialDocument: CertificateDesignDocument;
    persistenceReady: boolean;
    templateName: string;
    templateCode: string;
    isActive: boolean;
    onSave: (value: {
      design: CertificateDesignDocument;
      bodyContent: string;
      headerContent: string;
      footerContent: string;
      templateName: string;
      templateCode: string;
      isActive: boolean;
      defaultConditions: string[];
      officerFields: [];
    }) => Promise<boolean>;
  }) => (
    <button
      type="button"
      data-testid="mock-service-certificate-editor"
      data-persistence-ready={String(props.persistenceReady)}
      data-design={JSON.stringify(props.initialDocument)}
      onClick={() => void props.onSave({
        design: props.initialDocument,
        bodyContent: "compiled service body",
        headerContent: "compiled service header",
        footerContent: "compiled service footer",
        templateName: props.templateName,
        templateCode: props.templateCode,
        isActive: props.isActive,
        defaultConditions: [],
        officerFields: [],
      })}
    >
      Save cloned certificate
    </button>
  ),
}));

describe("RtsCertificateMasterStudio reusable-template workflow", () => {
  it("clones a reusable design into a new service-specific certificate", async () => {
    const user = userEvent.setup();
    const starterDesign = createEmptyCertificateDesign("en");
    const title = createCertificateNode("text", { id: "library-title", content: "Reusable design" });
    starterDesign.nodes[title.id] = title;
    starterDesign.rootIds.push(title.id);

    const savedTemplate: RTSCertificateTemplate = {
      id: 101,
      serviceId: 42,
      templateName: "Reusable Certificate",
      templateCode: "CERT_42",
      bodyContent: "compiled service body",
      designJson: JSON.stringify(starterDesign),
      isActive: true,
      createdDate: "2026-09-01T00:00:00Z",
      officerFields: [],
      defaultConditions: [],
    };
    actionMocks.saveTemplate.mockResolvedValueOnce({ success: true, template: savedTemplate });
    const onTemplateSaved = vi.fn();

    render(
      <RtsCertificateMasterStudio
        initialTemplates={[]}
        services={[{ id: "42", name: "Birth Certificate", departmentName: "Health" }]}
        initialServiceId="42"
        starterTemplate={{
          id: 7,
          templateName: "Reusable Certificate",
          templateCode: "REUSABLE_CERT",
          bodyContent: "library body",
          designJson: JSON.stringify(starterDesign),
          isActive: true,
          createdDate: "2026-09-01T00:00:00Z",
        }}
        onTemplateSaved={onTemplateSaved}
      />
    );

    const editor = screen.getByTestId("mock-service-certificate-editor");
    expect(editor).toHaveAttribute("data-persistence-ready", "true");
    expect(JSON.parse(editor.getAttribute("data-design") || "{}").nodes[title.id].content).toBe("Reusable design");

    await user.click(editor);
    await waitFor(() => expect(actionMocks.saveTemplate).toHaveBeenCalledTimes(1));
    expect(actionMocks.saveTemplate).toHaveBeenCalledWith(expect.objectContaining({
      id: undefined,
      serviceId: "42",
      templateName: "Reusable Certificate",
      templateCode: "CERT_42",
      headerContent: "compiled service header",
      bodyContent: "compiled service body",
      footerContent: "compiled service footer",
      designJson: JSON.stringify(starterDesign),
    }));
    expect(onTemplateSaved).toHaveBeenCalledWith(savedTemplate);
  });
});
