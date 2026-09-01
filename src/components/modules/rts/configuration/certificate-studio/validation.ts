import { isSafeCertificateImageSource } from "./compiler";
import type { CertificateDesignDocument } from "./schema";

export interface CertificateDesignIssue {
  severity: "error" | "warning";
  nodeId?: string;
  message: string;
}

export function validateCertificateDesign(
  document: CertificateDesignDocument
): CertificateDesignIssue[] {
  const issues: CertificateDesignIssue[] = [];
  const tagPattern = /\{\{[^}]+\}\}|\[\[[^\]]+\]\]/g;

  Object.values(document.nodes).forEach((node) => {
    if (node.x < 0 || node.y < 0 || node.x + node.width > 210 || node.y + node.height > 297) {
      issues.push({ severity: "warning", nodeId: node.id, message: `${node.name} exceeds the A4 page boundary.` });
    }
    if (node.type === "image" && node.source && !isSafeCertificateImageSource(node.source)) {
      issues.push({ severity: "error", nodeId: node.id, message: `${node.name} uses an unsafe image URL.` });
    }
    if (!node.repeatOnAllPages && node.pageIndex >= document.page.pageCount) {
      issues.push({ severity: "error", nodeId: node.id, message: `${node.name} points to a page that does not exist.` });
    }
    if (document.page.headerEnabled && !node.parentId && node.section === "header" && node.y + node.height > document.page.headerHeightMm) {
      issues.push({ severity: "warning", nodeId: node.id, message: `${node.name} extends below the repeated header area.` });
    }
    if (document.page.footerEnabled && !node.parentId && node.section === "footer" && node.y < document.page.heightMm - document.page.footerHeightMm) {
      issues.push({ severity: "warning", nodeId: node.id, message: `${node.name} starts above the repeated footer area.` });
    }
    if (node.type === "divider" && node.style.borderEnabled && node.style.borderWidth <= 0) {
      issues.push({ severity: "warning", nodeId: node.id, message: `${node.name} has no visible line width.` });
    }
    const malformedTags = node.content.match(/\{\{[^}]*$|\[\[[^\]]*$/g);
    if (malformedTags) {
      issues.push({ severity: "error", nodeId: node.id, message: `${node.name} contains an incomplete dynamic tag.` });
    }
    const tags = node.content.match(tagPattern) || [];
    tags.forEach((tag) => {
      if (/\s{2,}/.test(tag)) {
        issues.push({ severity: "warning", nodeId: node.id, message: `${node.name} contains a suspicious tag: ${tag}` });
      }
    });
  });

  return issues;
}
