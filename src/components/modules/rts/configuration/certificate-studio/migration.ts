import {
  createCertificateNode,
  createEmptyCertificateDesign,
  type CertificateDesignDocument,
} from "./schema";

const KNOWN_LEGACY_SECTIONS = [
  ["header", /header-letterhead/i],
  ["dispatch", /dispatch|outward/i],
  ["recipient", /recipient|applicant/i],
  ["subject", /subject|reference/i],
  ["body", /narrative|certificate-body/i],
  ["conditions", /conditions/i],
  ["signature", /signature|seal/i],
  ["footer", /security-footer|certificate-footer/i],
] as const;

export function createStarterCertificateDesign(
  language: "en" | "hi" | "mr",
  serviceName: string,
  departmentName: string,
  logoSource: string,
  includeServiceTags = true
): CertificateDesignDocument {
  const document = createEmptyCertificateDesign(language);
  const logo = createCertificateNode("image", {
    name: "Municipal logo",
    x: 16,
    y: 12,
    width: 24,
    height: 24,
    source: logoSource,
  });
  const heading = createCertificateNode("text", {
    name: "Certificate heading",
    x: 43,
    y: 12,
    width: 150,
    height: 28,
    content: includeServiceTags
      ? `<div style="text-align:center"><strong>{{ULBName}}</strong><br><span>${departmentName}</span><br><strong>${serviceName}</strong></div>`
      : `<div style="text-align:center"><strong>Municipal Corporation</strong><br><span>${departmentName}</span><br><strong>${serviceName}</strong></div>`,
    style: { fontSize: 16, fontWeight: 600, textAlign: "center", lineHeight: 1.35 },
  });
  const divider = createCertificateNode("divider", {
    x: 15,
    y: 43,
    width: 180,
    height: 1,
  });
  const title = createCertificateNode("text", {
    name: "Certificate title",
    x: 45,
    y: 50,
    width: 120,
    height: 16,
    content: `<div style="text-align:center"><strong>${serviceName}</strong></div>`,
    style: { fontSize: 18, fontWeight: 700, textAlign: "center", lineHeight: 1.3 },
  });
  const body = createCertificateNode("text", {
    name: "Certificate body",
    x: 20,
    y: 75,
    width: 170,
    height: 90,
    content: includeServiceTags
      ? "This is to certify that <strong>{{ApplicantName}}</strong>, application number <strong>{{ApplicationNo}}</strong>, has completed the requirements for {{ServiceName}}. This certificate is issued on {{IssueDate}}."
      : "Certificate content area. Apply this template to an RTS service, then add the required service and citizen fields.",
    style: { fontSize: 13, textAlign: "justify", lineHeight: 1.7 },
  });
  const signature = createCertificateNode("signature", {
    name: "Digital signature",
    x: 145,
    y: 220,
    width: 45,
    height: 28,
  });
  const officer = createCertificateNode("text", {
    name: "Officer details",
    x: 125,
    y: 250,
    width: 65,
    height: 22,
    content: includeServiceTags
      ? '<div style="text-align:center"><strong>{{ApprovedByOfficer}}</strong><br>{{OfficerDesignation}}</div>'
      : '<div style="text-align:center"><strong>Authorised Officer</strong><br>Designation</div>',
    style: { fontSize: 11, fontWeight: 500, textAlign: "center", lineHeight: 1.4 },
  });
  const qr = createCertificateNode("qr", { x: 20, y: 238, width: 28, height: 28 });

  [logo, heading, divider, title, body, signature, officer, qr].forEach((node) => {
    node.section = node === logo || node === heading || node === divider
      ? "header"
      : node === signature || node === officer || node === qr
        ? "footer"
        : "body";
    document.nodes[node.id] = node;
    document.rootIds.push(node.id);
  });
  return document;
}

export function migrateLegacyCertificateHtml(
  bodyContent: string,
  language: "en" | "hi" | "mr"
): CertificateDesignDocument {
  const document = createEmptyCertificateDesign(language);
  if (!bodyContent.trim()) return document;

  const parser = typeof DOMParser !== "undefined" ? new DOMParser() : null;
  const parsed = parser?.parseFromString(bodyContent, "text/html");
  const claimed = new Set<Element>();
  let y = 12;

  if (parsed) {
    for (const [name, pattern] of KNOWN_LEGACY_SECTIONS) {
      const element = Array.from(parsed.body.querySelectorAll("div,section,header,footer")).find(
        (candidate) => pattern.test(candidate.className) && !claimed.has(candidate)
      );
      if (!element) continue;
      claimed.add(element);
      const node = createCertificateNode("text", {
        name: `Imported ${name}`,
        x: 15,
        y,
        width: 180,
        height: name === "body" ? 70 : 24,
        content: element.innerHTML,
        section: name === "header" ? "header" : name === "footer" || name === "signature" ? "footer" : "body",
      });
      document.nodes[node.id] = node;
      document.rootIds.push(node.id);
      y += node.height + 4;
      element.remove();
    }
  }

  const remainder = parsed?.body.innerHTML.trim() || bodyContent;
  const hasMeaningfulRemainder = parsed
    ? Boolean(parsed.body.textContent?.trim() || parsed.body.querySelector("img,table,svg,canvas"))
    : Boolean(bodyContent.trim());
  if (hasMeaningfulRemainder) {
    const legacy = createCertificateNode("legacyHtml", {
      name: document.rootIds.length ? "Unrecognized legacy content" : "Legacy certificate",
      x: 15,
      y: document.rootIds.length ? Math.min(y, 245) : 12,
      width: 180,
      height: document.rootIds.length ? Math.max(20, 277 - y) : 265,
      content: remainder,
      locked: true,
      section: "body",
    });
    document.nodes[legacy.id] = legacy;
    document.rootIds.push(legacy.id);
  }
  document.metadata.migratedFromLegacy = true;
  return document;
}
