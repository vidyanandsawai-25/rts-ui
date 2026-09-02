export type CertificateNodeType =
  | "container"
  | "text"
  | "image"
  | "rectangle"
  | "square"
  | "circle"
  | "divider"
  | "table"
  | "qr"
  | "signature"
  | "legacyHtml";

export type CertificateLayoutMode = "free" | "row" | "column" | "grid";
export type CertificateSection = "header" | "body" | "footer";
export type CertificateDividerOrientation = "horizontal" | "vertical";

export interface CertificateNodeStyle {
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderEnabled: boolean;
  borderStyle: "solid" | "dashed" | "dotted" | "double";
  borderRadius: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline" | "line-through";
  textAlign: "left" | "center" | "right" | "justify";
  lineHeight: number;
  opacity: number;
  padding: number;
  objectFit: "contain" | "cover" | "fill";
}

export interface CertificateDesignNode {
  id: string;
  type: CertificateNodeType;
  name: string;
  parentId: string | null;
  childIds: string[];
  layout: CertificateLayoutMode;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation: number;
  visible: boolean;
  locked: boolean;
  content: string;
  source: string;
  alt: string;
  columns: number;
  gap: number;
  section: CertificateSection;
  pageIndex: number;
  repeatOnAllPages: boolean;
  dividerOrientation: CertificateDividerOrientation;
  style: CertificateNodeStyle;
}

export interface CertificateDesignDocument {
  page: {
    widthMm: 210;
    heightMm: 297;
    marginMm: number;
    backgroundColor: string;
    showGrid: boolean;
    snapToGrid: boolean;
    gridSizeMm: number;
    pageCount: number;
    headerEnabled: boolean;
    footerEnabled: boolean;
    headerHeightMm: number;
    footerHeightMm: number;
  };
  rootIds: string[];
  nodes: Record<string, CertificateDesignNode>;
  metadata: {
    language: "en" | "hi" | "mr";
    migratedFromLegacy: boolean;
  };
}

export const DEFAULT_NODE_STYLE: CertificateNodeStyle = {
  color: "#0f172a",
  backgroundColor: "transparent",
  borderColor: "#1e3a8a",
  borderWidth: 0,
  borderEnabled: false,
  borderStyle: "solid",
  borderRadius: 0,
  fontFamily: "Noto Sans Devanagari, Segoe UI, sans-serif",
  fontSize: 12,
  fontWeight: 400,
  fontStyle: "normal",
  textDecoration: "none",
  textAlign: "left",
  lineHeight: 1.4,
  opacity: 1,
  padding: 2,
  objectFit: "contain",
};

export function createCertificateNode(
  type: CertificateNodeType,
  overrides: Omit<Partial<CertificateDesignNode>, "style"> & {
    style?: Partial<CertificateNodeStyle>;
  } = {}
): CertificateDesignNode {
  const id = overrides.id || `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const defaults: Record<CertificateNodeType, Pick<CertificateDesignNode, "name" | "width" | "height" | "content">> = {
    container: { name: "Container", width: 180, height: 45, content: "" },
    text: { name: "Text", width: 90, height: 18, content: "Double-click to edit text" },
    image: { name: "Image", width: 35, height: 35, content: "" },
    rectangle: { name: "Rectangle", width: 60, height: 30, content: "" },
    square: { name: "Square", width: 30, height: 30, content: "" },
    circle: { name: "Circle", width: 30, height: 30, content: "" },
    divider: { name: "Divider", width: 100, height: 6, content: "" },
    table: { name: "Table", width: 120, height: 36, content: "" },
    qr: { name: "QR Code", width: 28, height: 28, content: "{{QRCode}}" },
    signature: { name: "Signature", width: 45, height: 22, content: "{{DigitalSignature}}" },
    legacyHtml: { name: "Legacy content", width: 180, height: 220, content: "" },
  };

  const base = defaults[type];
  const { style: styleOverrides, ...nodeOverrides } = overrides;
  const typeStyle: Partial<CertificateNodeStyle> = {
    ...(type === "rectangle" || type === "square" || type === "circle"
      ? { backgroundColor: "#dbeafe", borderWidth: 0.5, borderEnabled: true }
      : {}),
    ...(type === "divider" ? { backgroundColor: "transparent", borderWidth: 0.5, borderEnabled: true, padding: 0 } : {}),
    ...(type === "container" ? { borderWidth: 0.3, borderColor: "#cbd5e1", borderEnabled: true, padding: 4 } : {}),
  };

  return {
    type,
    name: base.name,
    parentId: null,
    childIds: [],
    layout: "free",
    x: 15,
    y: 15,
    width: base.width,
    height: base.height,
    zIndex: 1,
    rotation: 0,
    visible: true,
    locked: type === "legacyHtml",
    content: base.content,
    source: "",
    alt: base.name,
    columns: 2,
    gap: 3,
    section: "body",
    pageIndex: 0,
    repeatOnAllPages: false,
    dividerOrientation: "horizontal",
    ...nodeOverrides,
    id,
    style: { ...DEFAULT_NODE_STYLE, ...typeStyle, ...styleOverrides },
  };
}

export function createEmptyCertificateDesign(
  language: "en" | "hi" | "mr" = "en"
): CertificateDesignDocument {
  return {
    page: {
      widthMm: 210,
      heightMm: 297,
      marginMm: 10,
      backgroundColor: "#ffffff",
      showGrid: true,
      snapToGrid: true,
      gridSizeMm: 2,
      pageCount: 1,
      headerEnabled: true,
      footerEnabled: true,
      headerHeightMm: 42,
      footerHeightMm: 35,
    },
    rootIds: [],
    nodes: {},
    metadata: { language, migratedFromLegacy: false },
  };
}

export function isCertificateDesignDocument(value: unknown): value is CertificateDesignDocument {
  if (!value || typeof value !== "object") return false;
  const document = value as Partial<CertificateDesignDocument>;
  return (
    Array.isArray(document.rootIds) &&
    !!document.nodes &&
    typeof document.nodes === "object" &&
    !!document.page
  );
}

export function parseCertificateDesign(value?: string | null): CertificateDesignDocument | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;
    const document = { ...(parsed as Record<string, unknown>) };
    delete document.version;
    if (!isCertificateDesignDocument(document)) return null;

    document.page = {
      ...document.page,
      pageCount: Math.max(1, Math.floor(Number(document.page.pageCount) || 1)),
      headerEnabled: document.page.headerEnabled ?? true,
      footerEnabled: document.page.footerEnabled ?? true,
      headerHeightMm: Number(document.page.headerHeightMm) || 42,
      footerHeightMm: Number(document.page.footerHeightMm) || 35,
    };

    Object.values(document.nodes).forEach((node) => {
      node.section = node.section || (node.y < 42 ? "header" : node.y > 245 ? "footer" : "body");
      node.pageIndex = Math.max(0, Math.floor(Number(node.pageIndex) || 0));
      node.repeatOnAllPages = node.repeatOnAllPages ?? false;
      node.dividerOrientation = node.dividerOrientation || "horizontal";
      node.style = {
        ...DEFAULT_NODE_STYLE,
        ...node.style,
        borderEnabled: node.style?.borderEnabled ?? Number(node.style?.borderWidth || 0) > 0,
      };
    });

    return document;
  } catch {
    return null;
  }
}
