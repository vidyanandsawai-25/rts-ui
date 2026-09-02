import { describe, expect, it } from "vitest";

import { compileCertificateDesign, compileCertificateDesignSections, isSafeCertificateImageSource, sanitizeCertificateHtml } from "@/components/modules/rts/configuration/certificate-studio/compiler";
import { migrateLegacyCertificateHtml } from "@/components/modules/rts/configuration/certificate-studio/migration";
import {
  createCertificateNode,
  createEmptyCertificateDesign,
  parseCertificateDesign,
} from "@/components/modules/rts/configuration/certificate-studio/schema";
import { validateCertificateDesign } from "@/components/modules/rts/configuration/certificate-studio/validation";

describe("certificate canvas document", () => {
  it("round-trips a design document", () => {
    const document = createEmptyCertificateDesign("mr");
    const node = createCertificateNode("text", { content: "Hello {{ApplicantName}}" });
    expect(node.repeatOnAllPages).toBe(false);
    document.nodes[node.id] = node;
    document.rootIds.push(node.id);

    expect(parseCertificateDesign(JSON.stringify(document))).toEqual(document);
    expect(parseCertificateDesign('{"rootIds":[],"nodes":{},"page":{}}')).not.toBeNull();
    expect(parseCertificateDesign('{"version":1,"rootIds":[],"nodes":{},"page":{}}')).not.toHaveProperty("version");
  });

  it("compiles positioned nodes and preserves dynamic tags", () => {
    const document = createEmptyCertificateDesign("en");
    const node = createCertificateNode("text", {
      id: "applicant",
      x: 20,
      y: 30,
      content: "Certificate for <strong>{{ApplicantName}}</strong>",
    });
    document.nodes[node.id] = node;
    document.rootIds.push(node.id);

    const html = compileCertificateDesign(document);
    expect(html).not.toContain("data-design-version");
    expect(html).toContain("left:20mm");
    expect(html).toContain("{{ApplicantName}}");
  });

  it("removes executable HTML from generated output", () => {
    const unsafe = '<script>alert(1)</script><div onclick="alert(2)">Safe</div>';
    expect(sanitizeCertificateHtml(unsafe)).toBe("<div>Safe</div>");
  });

  it("flags page overflow and unsafe image URLs", () => {
    const document = createEmptyCertificateDesign("en");
    const image = createCertificateNode("image", {
      x: 190,
      y: 285,
      width: 30,
      height: 20,
      source: "javascript:alert(1)",
    });
    document.nodes[image.id] = image;
    document.rootIds.push(image.id);

    const issues = validateCertificateDesign(document);
    expect(issues.some((issue) => issue.message.includes("boundary"))).toBe(true);
    expect(issues.some((issue) => issue.message.includes("unsafe image"))).toBe(true);
  });

  it("preserves unknown legacy markup in a locked node", () => {
    const document = migrateLegacyCertificateHtml(
      '<article class="custom-certificate">Existing certificate</article>',
      "en"
    );
    const legacyNode = Object.values(document.nodes).find((node) => node.type === "legacyHtml");

    expect(document.metadata.migratedFromLegacy).toBe(true);
    expect(legacyNode?.locked).toBe(true);
    expect(legacyNode?.content).toContain("Existing certificate");
  });

  it("normalizes older designs with section, page, and independent border settings", () => {
    const document = createEmptyCertificateDesign("en");
    const node = createCertificateNode("rectangle", { id: "legacy-shape", y: 20 });
    const legacy = JSON.parse(JSON.stringify(document));
    delete legacy.page.pageCount;
    delete legacy.page.headerHeightMm;
    delete legacy.page.footerHeightMm;
    delete legacy.nodes;
    legacy.nodes = { [node.id]: node };
    legacy.rootIds = [node.id];
    delete legacy.nodes[node.id].section;
    delete legacy.nodes[node.id].pageIndex;
    delete legacy.nodes[node.id].style.borderEnabled;

    const parsed = parseCertificateDesign(JSON.stringify(legacy));
    expect(parsed?.page.pageCount).toBe(1);
    expect(parsed?.nodes[node.id].section).toBe("header");
    expect(parsed?.nodes[node.id].style.borderEnabled).toBe(true);
  });

  it("compiles repeatable header and footer components into every page", () => {
    const document = createEmptyCertificateDesign("en");
    document.page.pageCount = 2;
    const header = createCertificateNode("text", { id: "shared-header", section: "header", repeatOnAllPages: true, content: "Shared header" });
    const firstPage = createCertificateNode("text", { id: "first-page", section: "body", pageIndex: 0, content: "First page" });
    const secondPage = createCertificateNode("text", { id: "second-page", section: "body", pageIndex: 1, content: "Second page" });
    const footer = createCertificateNode("text", { id: "shared-footer", section: "footer", repeatOnAllPages: true, content: "Shared footer" });
    [header, firstPage, secondPage, footer].forEach((node) => {
      document.nodes[node.id] = node;
      document.rootIds.push(node.id);
    });

    const compiled = compileCertificateDesignSections(document);
    expect(compiled.bodyContent).toContain('data-certificate-multipage="true"');
    expect(compiled.bodyContent.match(/Shared header/g)).toHaveLength(2);
    expect(compiled.bodyContent.match(/Shared footer/g)).toHaveLength(2);
    expect(compiled.bodyContent.match(/First page/g)).toHaveLength(1);
    expect(compiled.bodyContent.match(/Second page/g)).toHaveLength(1);
    expect(compiled.headerContent).toContain("Shared header");
    expect(compiled.footerContent).toContain("Shared footer");
  });

  it("keeps ordinary components page-specific and removes disabled page sections", () => {
    const document = createEmptyCertificateDesign("en");
    document.page.pageCount = 2;
    const local = createCertificateNode("text", { id: "local", pageIndex: 0, content: "Local only" });
    const repeated = createCertificateNode("text", { id: "repeated", pageIndex: 0, repeatOnAllPages: true, content: "Every page" });
    const header = createCertificateNode("text", { id: "disabled-header", section: "header", repeatOnAllPages: true, content: "Hidden header" });
    [local, repeated, header].forEach((node) => {
      document.nodes[node.id] = node;
      document.rootIds.push(node.id);
    });
    document.page.headerEnabled = false;

    const compiled = compileCertificateDesignSections(document);
    expect(compiled.bodyContent.match(/Local only/g)).toHaveLength(1);
    expect(compiled.bodyContent.match(/Every page/g)).toHaveLength(2);
    expect(compiled.bodyContent).not.toContain("Hidden header");
    expect(compiled.headerContent).toBe("");
  });

  it("renders dividers as editable lines and permits safe uploaded images", () => {
    const document = createEmptyCertificateDesign("en");
    const divider = createCertificateNode("divider", { id: "line", dividerOrientation: "vertical", style: { borderStyle: "dashed", borderWidth: 1.2, borderColor: "#ff0000" } });
    document.nodes[divider.id] = divider;
    document.rootIds.push(divider.id);

    const html = compileCertificateDesign(document);
    expect(html).toContain("border-left:1.2mm dashed #ff0000");
    expect(html).toContain("background:transparent");
    expect(isSafeCertificateImageSource("data:image/png;base64,aGVsbG8=")).toBe(true);
  });
});
