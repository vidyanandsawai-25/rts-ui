import type {
  CertificateDesignDocument,
  CertificateDesignNode,
  CertificateSection,
} from "./schema";

const SAFE_IMAGE_SOURCE = /^(?:\/|https?:\/\/|data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$|\{\{(?:QRCode|DigitalSignature|Field:[^}]+)\}\})/i;

export function sanitizeCertificateHtml(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "");
}

export function isSafeCertificateImageSource(source: string): boolean {
  return SAFE_IMAGE_SOURCE.test(source.trim());
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function nodeStyle(node: CertificateDesignNode, inFlow: boolean): string {
  const style = node.style;
  const position = inFlow
    ? `position:relative;width:${node.width}mm;min-height:${node.height}mm;`
    : `position:absolute;left:${node.x}mm;top:${node.y}mm;width:${node.width}mm;height:${node.height}mm;`;
  const display = node.type === "container"
    ? `display:${node.layout === "grid" ? "grid" : "flex"};flex-direction:${node.layout === "row" ? "row" : "column"};${node.layout === "grid" ? `grid-template-columns:repeat(${node.columns},minmax(0,1fr));` : ""}gap:${node.gap}mm;`
    : "";

  return [
    position,
    display,
    `z-index:${node.zIndex}`,
    `transform:rotate(${node.rotation}deg)`,
    `opacity:${style.opacity}`,
    `color:${style.color}`,
    `background:${node.type === "divider" ? "transparent" : style.backgroundColor}`,
    node.type === "divider" || !style.borderEnabled
      ? "border:none"
      : `border:${style.borderWidth}mm ${style.borderStyle} ${style.borderColor}`,
    `border-radius:${node.type === "circle" ? "50%" : `${style.borderRadius}mm`}`,
    `font-family:${style.fontFamily}`,
    `font-size:${style.fontSize}px`,
    `font-weight:${style.fontWeight}`,
    `font-style:${style.fontStyle}`,
    `text-decoration:${style.textDecoration}`,
    `text-align:${style.textAlign}`,
    `line-height:${style.lineHeight}`,
    `padding:${style.padding}mm`,
    "box-sizing:border-box",
    "overflow:hidden",
  ].join(";");
}

function compileNode(
  document: CertificateDesignDocument,
  node: CertificateDesignNode,
  pageIndex: number,
  inFlow = false
): string {
  if (!node.visible) return "";
  const style = nodeStyle(node, inFlow);
  const children = node.childIds
    .map((id) => document.nodes[id])
    .filter(Boolean)
    .filter((child) => child.repeatOnAllPages || child.pageIndex === pageIndex)
    .map((child) => compileNode(document, child, pageIndex, node.layout !== "free"))
    .join("");

  if (node.type === "image") {
    const source = isSafeCertificateImageSource(node.source) ? node.source : "";
    return `<div data-certificate-node="${escapeAttribute(node.id)}" style="${style}">${source ? `<img src="${escapeAttribute(source)}" alt="${escapeAttribute(node.alt)}" style="width:100%;height:100%;object-fit:${node.style.objectFit};display:block" />` : ""}</div>`;
  }
  if (node.type === "qr" || node.type === "signature") {
    return `<div data-certificate-node="${escapeAttribute(node.id)}" style="${style};display:flex;align-items:center;justify-content:center">${sanitizeCertificateHtml(node.content)}</div>`;
  }
  if (node.type === "divider") {
    const lineStyle = node.dividerOrientation === "vertical"
      ? `position:absolute;left:50%;top:0;height:100%;border-left:${node.style.borderWidth}mm ${node.style.borderStyle} ${node.style.borderColor};transform:translateX(-50%)`
      : `position:absolute;left:0;top:50%;width:100%;border-top:${node.style.borderWidth}mm ${node.style.borderStyle} ${node.style.borderColor};transform:translateY(-50%)`;
    return `<div data-certificate-node="${escapeAttribute(node.id)}" style="${style};padding:0">${node.style.borderEnabled ? `<span style="${lineStyle}"></span>` : ""}</div>`;
  }
  if (node.type === "table") {
    return `<div data-certificate-node="${escapeAttribute(node.id)}" style="${style}"><table style="width:100%;height:100%;border-collapse:collapse"><tbody><tr><td style="border:1px solid ${node.style.borderColor};padding:2mm">{{Field:label}}</td><td style="border:1px solid ${node.style.borderColor};padding:2mm">{{Field:value}}</td></tr><tr><td style="border:1px solid ${node.style.borderColor};padding:2mm"></td><td style="border:1px solid ${node.style.borderColor};padding:2mm"></td></tr></tbody></table></div>`;
  }

  const content = node.type === "legacyHtml" || node.type === "text"
    ? sanitizeCertificateHtml(node.content)
    : "";
  return `<div data-certificate-node="${escapeAttribute(node.id)}" style="${style}">${content}${children}</div>`;
}

function compileRootNodes(
  document: CertificateDesignDocument,
  section: CertificateSection,
  pageIndex: number
): string {
  return document.rootIds
    .map((id) => document.nodes[id])
    .filter((node): node is CertificateDesignNode => Boolean(node))
    .filter((node) => node.section === section && (node.repeatOnAllPages || node.pageIndex === pageIndex))
    .sort((left, right) => left.zIndex - right.zIndex)
    .map((node) => compileNode(document, node, pageIndex))
    .join("");
}

function pageShell(document: CertificateDesignDocument, pageIndex: number): string {
  const header = document.page.headerEnabled ? compileRootNodes(document, "header", pageIndex) : "";
  const body = compileRootNodes(document, "body", pageIndex);
  const footer = document.page.footerEnabled ? compileRootNodes(document, "footer", pageIndex) : "";
  return `<section class="certificate-canvas-document" data-certificate-page="${pageIndex + 1}" style="position:relative;width:${document.page.widthMm}mm;height:${document.page.heightMm}mm;background:${document.page.backgroundColor};overflow:hidden;box-sizing:border-box;page-break-after:${pageIndex + 1 < document.page.pageCount ? "always" : "auto"}">${header}${body}${footer}</section>`;
}

function sectionShell(document: CertificateDesignDocument, section: "header" | "footer"): string {
  if (section === "header" && !document.page.headerEnabled) return "";
  if (section === "footer" && !document.page.footerEnabled) return "";
  const content = compileRootNodes(document, section, 0);
  return `<div class="certificate-repeatable-${section}" data-certificate-section="${section}" style="position:relative;width:${document.page.widthMm}mm;height:${document.page.heightMm}mm;overflow:hidden;box-sizing:border-box">${content}</div>`;
}

export interface CompiledCertificateDesign {
  headerContent: string;
  bodyContent: string;
  footerContent: string;
}

export function compileCertificateDesignSections(
  document: CertificateDesignDocument
): CompiledCertificateDesign {
  const pages = Array.from({ length: document.page.pageCount }, (_item, pageIndex) =>
    pageShell(document, pageIndex)
  ).join("");
  const bodyContent = `<div class="certificate-canvas-pages" data-certificate-multipage="true">${pages}</div>`;

  return {
    headerContent: sanitizeCertificateHtml(sectionShell(document, "header")),
    bodyContent: sanitizeCertificateHtml(bodyContent),
    footerContent: sanitizeCertificateHtml(sectionShell(document, "footer")),
  };
}

export function compileCertificateDesign(document: CertificateDesignDocument): string {
  return compileCertificateDesignSections(document).bodyContent;
}
