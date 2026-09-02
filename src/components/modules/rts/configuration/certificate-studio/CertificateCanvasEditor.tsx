"use client";
/* eslint-disable i18next/no-literal-string, @next/next/no-img-element */

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Box,
  BringToFront,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Columns3,
  Copy,
  Eye,
  EyeOff,
  Grid2X2,
  Image as ImageIcon,
  Layers3,
  Lock,
  Minus,
  MousePointer2,
  PanelBottom,
  PanelTop,
  Pencil,
  Plus,
  QrCode,
  RectangleHorizontal,
  Redo2,
  Rows3,
  RotateCw,
  Save,
  Search,
  SendToBack,
  ShieldAlert,
  Signature,
  Square,
  Table2,
  Trash2,
  Type,
  Undo2,
  Unlock,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  type CSSProperties,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button, Input, Modal } from "@/components/common";
import type { CertificateAvailableTag, OfficerFieldConfig } from "@/types/rts/certificate.types";

import { compileCertificateDesignSections, isSafeCertificateImageSource } from "./compiler";
import {
  createCertificateNode,
  type CertificateDesignDocument,
  type CertificateDesignNode,
  type CertificateLayoutMode,
  type CertificateNodeType,
  type CertificateSection,
} from "./schema";
import { useCertificateHistory } from "./useCertificateHistory";
import { validateCertificateDesign } from "./validation";

interface CertificateCanvasEditorProps {
  editorMode?: "service" | "template";
  initialDocument: CertificateDesignDocument;
  availableTags?: CertificateAvailableTag[];
  serviceName?: string;
  departmentName?: string;
  templateName: string;
  templateCode: string;
  description?: string;
  isActive: boolean;
  defaultConditions?: string[];
  officerFields?: OfficerFieldConfig[];
  persistenceReady: boolean;
  saving: boolean;
  onBack?: () => void;
  onSave: (value: {
    design: CertificateDesignDocument;
    bodyContent: string;
    headerContent: string;
    footerContent: string;
    templateName: string;
    templateCode: string;
    description?: string;
    isActive: boolean;
    defaultConditions: string[];
    officerFields: OfficerFieldConfig[];
  }) => Promise<boolean>;
}

type Interaction = {
  nodeId: string;
  kind: "move" | "resize";
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
};

type SectionResizeInteraction = {
  section: "header" | "footer";
  startY: number;
  initialHeight: number;
};

const TOOL_ITEMS: Array<{ type: CertificateNodeType; label: string; icon: typeof Type }> = [
  { type: "text", label: "Text", icon: Type },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "container", label: "Container", icon: Box },
  { type: "rectangle", label: "Rectangle", icon: RectangleHorizontal },
  { type: "square", label: "Square", icon: Square },
  { type: "circle", label: "Circle", icon: Circle },
  { type: "divider", label: "Divider", icon: Minus },
  { type: "table", label: "Table", icon: Table2 },
  { type: "qr", label: "QR code", icon: QrCode },
  { type: "signature", label: "Signature", icon: Signature },
];

const BUILTIN_TAGS: CertificateAvailableTag[] = [
  { tagKey: "{{ApplicationNo}}", tagLabelEnglish: "Application number", tagLabelMarathi: "अर्ज क्रमांक", sourceType: "System" },
  { tagKey: "{{ApplicantName}}", tagLabelEnglish: "Applicant name", tagLabelMarathi: "अर्जदाराचे नाव", sourceType: "Citizen" },
  { tagKey: "{{ApplicantMobile}}", tagLabelEnglish: "Applicant mobile", tagLabelMarathi: "मोबाईल क्रमांक", sourceType: "Citizen" },
  { tagKey: "{{AppliedDate}}", tagLabelEnglish: "Applied date", tagLabelMarathi: "अर्ज दिनांक", sourceType: "System" },
  { tagKey: "{{IssueDate}}", tagLabelEnglish: "Issue date", tagLabelMarathi: "निर्गमन दिनांक", sourceType: "System" },
  { tagKey: "{{currentData}}", tagLabelEnglish: "Current date", tagLabelMarathi: "चालू दिनांक", sourceType: "System" },
  { tagKey: "{{currentDataMinusOne}}", tagLabelEnglish: "Current date minus one day", tagLabelMarathi: "चालू दिनांकाच्या एक दिवस आधी", sourceType: "System" },
  { tagKey: "{{currentDataMinusTwo}}", tagLabelEnglish: "Current date minus two days", tagLabelMarathi: "चालू दिनांकाच्या दोन दिवस आधी", sourceType: "System" },
  { tagKey: "{{currentDataPlusOne}}", tagLabelEnglish: "Current date plus one day", tagLabelMarathi: "चालू दिनांकानंतर एक दिवस", sourceType: "System" },
  { tagKey: "{{currentDataPlusTwo}}", tagLabelEnglish: "Current date plus two days", tagLabelMarathi: "चालू दिनांकानंतर दोन दिवस", sourceType: "System" },
  { tagKey: "{{CertificateNo}}", tagLabelEnglish: "Certificate number", tagLabelMarathi: "प्रमाणपत्र क्रमांक", sourceType: "System" },
  { tagKey: "{{ServiceName}}", tagLabelEnglish: "Service name", tagLabelMarathi: "सेवेचे नाव", sourceType: "System" },
  { tagKey: "{{DepartmentName}}", tagLabelEnglish: "Department name", tagLabelMarathi: "विभागाचे नाव", sourceType: "System" },
  { tagKey: "{{ULBName}}", tagLabelEnglish: "ULB name", tagLabelMarathi: "महानगरपालिका", sourceType: "System" },
  { tagKey: "{{ApprovedByOfficer}}", tagLabelEnglish: "Approving officer", tagLabelMarathi: "मंजूर करणारे अधिकारी", sourceType: "Officer" },
  { tagKey: "{{OfficerDesignation}}", tagLabelEnglish: "Officer designation", tagLabelMarathi: "अधिकारी पदनाम", sourceType: "Officer" },
  { tagKey: "{{OfficerRemark}}", tagLabelEnglish: "Officer remark", tagLabelMarathi: "अधिकाऱ्याचा शेरा", sourceType: "Officer" },
  { tagKey: "{{QRCode}}", tagLabelEnglish: "QR code", tagLabelMarathi: "क्यूआर कोड", sourceType: "System" },
  { tagKey: "{{DigitalSignature}}", tagLabelEnglish: "Digital signature", tagLabelMarathi: "डिजिटल स्वाक्षरी", sourceType: "Officer" },
];

const PUBLIC_IMAGE_ASSETS = [
  { label: "Municipal logo", source: "/images/logo.png" },
  { label: "Municipal seal", source: "/images/ulb-seal.png" },
  { label: "Akola seal", source: "/images/akola-seal.png" },
  { label: "RTS logo", source: "/images/rts-logo.png" },
] as const;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function numericValue(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function escapeHtmlText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function nodeCss(node: CertificateDesignNode, inFlow: boolean): CSSProperties {
  const style: CSSProperties = {
    position: inFlow ? "relative" : "absolute",
    left: inFlow ? undefined : `${node.x}mm`,
    top: inFlow ? undefined : `${node.y}mm`,
    width: `${node.width}mm`,
    height: `${node.height}mm`,
    zIndex: node.zIndex,
    transform: `rotate(${node.rotation}deg)`,
    opacity: node.style.opacity,
    color: node.style.color,
    backgroundColor: node.style.backgroundColor,
    borderColor: node.style.borderColor,
    borderWidth: node.type === "divider" || !node.style.borderEnabled ? 0 : `${node.style.borderWidth}mm`,
    borderStyle: node.style.borderStyle,
    borderRadius: node.type === "circle" ? "50%" : `${node.style.borderRadius}mm`,
    fontFamily: node.style.fontFamily,
    fontSize: `${node.style.fontSize}px`,
    fontWeight: node.style.fontWeight,
    fontStyle: node.style.fontStyle,
    textDecoration: node.style.textDecoration,
    textAlign: node.style.textAlign,
    lineHeight: node.style.lineHeight,
    padding: `${node.style.padding}mm`,
    boxSizing: "border-box",
    overflow: "hidden",
  };
  if (node.type === "container") {
    style.display = node.layout === "grid" ? "grid" : "flex";
    style.flexDirection = node.layout === "row" ? "row" : "column";
    style.gridTemplateColumns = node.layout === "grid" ? `repeat(${node.columns}, minmax(0, 1fr))` : undefined;
    style.gap = `${node.gap}mm`;
  }
  return style;
}

export default function CertificateCanvasEditor({
  editorMode = "service",
  initialDocument,
  availableTags = [],
  serviceName = "",
  departmentName = "",
  templateName: initialTemplateName,
  templateCode: initialTemplateCode,
  description: initialDescription = "",
  isActive: initialIsActive,
  defaultConditions = [],
  officerFields = [],
  persistenceReady,
  saving,
  onBack,
  onSave,
}: CertificateCanvasEditorProps) {
  const history = useCertificateHistory(initialDocument);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialDocument.rootIds[0] || null);
  const [zoom, setZoom] = useState(85);
  const [layerSearch, setLayerSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [activeLeftTab, setActiveLeftTab] = useState<"elements" | "layers" | "tags">("elements");
  const [activeSection, setActiveSection] = useState<CertificateSection>("body");
  const [currentPage, setCurrentPage] = useState(0);
  const [collapsedSections, setCollapsedSections] = useState<Set<CertificateSection>>(new Set());
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [collapsedTagSources, setCollapsedTagSources] = useState<Set<CertificateAvailableTag["sourceType"]>>(new Set());
  const [templateName, setTemplateName] = useState(initialTemplateName);
  const [templateCode, setTemplateCode] = useState(initialTemplateCode);
  const [description, setDescription] = useState(initialDescription);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [conditions, setConditions] = useState(defaultConditions);
  const [configuredOfficerFields, setConfiguredOfficerFields] = useState(officerFields);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [sectionResize, setSectionResize] = useState<SectionResizeInteraction | null>(null);
  const [editingTextNodeId, setEditingTextNodeId] = useState<string | null>(null);
  const [pendingDeleteNodeId, setPendingDeleteNodeId] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageReplaceInputRef = useRef<HTMLInputElement>(null);
  const rangeRef = useRef<Range | null>(null);
  const activeEditableNodeRef = useRef<string | null>(null);

  const selectedNode = selectedNodeId ? history.document.nodes[selectedNodeId] : undefined;
  const issues = useMemo(() => validateCertificateDesign(history.document), [history.document]);
  const compiledSections = useMemo(() => compileCertificateDesignSections(history.document), [history.document]);
  const compiledHtml = compiledSections.bodyContent;

  const tags = useMemo(() => {
    const seen = new Set<string>();
    return [...BUILTIN_TAGS, ...availableTags].filter((tag) => {
      const key = tag.tagKey.trim();
      if (!key || seen.has(key.toLowerCase())) return false;
      seen.add(key.toLowerCase());
      return true;
    });
  }, [availableTags]);

  const filteredTags = tags.filter((tag) => {
    const search = tagSearch.trim().toLowerCase();
    return !search || `${tag.tagKey} ${tag.tagLabelEnglish} ${tag.tagLabelMarathi}`.toLowerCase().includes(search);
  });

  const commitDocument = useCallback((next: CertificateDesignDocument) => {
    const editingNodeId = activeEditableNodeRef.current;
    if (editingNodeId && next.nodes[editingNodeId]) {
      const editable = document.querySelector<HTMLElement>(`[data-edit-node="${CSS.escape(editingNodeId)}"]`);
      if (editable) next.nodes[editingNodeId].content = editable.innerHTML;
    }
    history.setDocument(next);
    setIsDirty(true);
  }, [history]);

  const patchNode = useCallback((nodeId: string, patch: Partial<CertificateDesignNode>) => {
    const next = clone(history.document);
    const node = next.nodes[nodeId];
    if (!node) return;
    next.nodes[nodeId] = {
      ...node,
      ...patch,
      style: patch.style ? { ...node.style, ...patch.style } : node.style,
    };
    commitDocument(next);
  }, [commitDocument, history.document]);

  const addNode = useCallback((type: CertificateNodeType) => {
    const next = clone(history.document);
    const selectedContainer = selectedNode?.type === "container" ? selectedNode : undefined;
    const section = selectedContainer?.section || activeSection;
    const pageIndex = selectedContainer?.pageIndex ?? currentPage;
    const topBySection: Record<CertificateSection, number> = {
      header: 10,
      body: history.document.page.headerHeightMm + 8,
      footer: history.document.page.heightMm - history.document.page.footerHeightMm + 6,
    };
    const highestLayer = Math.max(0, ...Object.values(next.nodes).map((item) => item.zIndex));
    const node = createCertificateNode(type, {
      parentId: selectedContainer?.id || null,
      section,
      pageIndex,
      x: 18 + (next.rootIds.length % 5) * 5,
      y: selectedContainer ? 0 : topBySection[section] + (next.rootIds.length % 4) * 4,
      zIndex: highestLayer + 1,
    });
    if (section === "header") next.page.headerEnabled = true;
    if (section === "footer") next.page.footerEnabled = true;
    next.nodes[node.id] = node;
    if (selectedContainer) next.nodes[selectedContainer.id].childIds.push(node.id);
    else next.rootIds.push(node.id);
    commitDocument(next);
    setSelectedNodeId(node.id);
  }, [activeSection, commitDocument, currentPage, history.document, selectedNode]);

  const deleteNode = useCallback((nodeId: string) => {
    const next = clone(history.document);
    const remove = (id: string) => {
      next.nodes[id]?.childIds.forEach(remove);
      delete next.nodes[id];
    };
    const node = next.nodes[nodeId];
    if (!node) return;
    if (node.parentId && next.nodes[node.parentId]) {
      next.nodes[node.parentId].childIds = next.nodes[node.parentId].childIds.filter((id) => id !== nodeId);
    } else {
      next.rootIds = next.rootIds.filter((id) => id !== nodeId);
    }
    remove(nodeId);
    commitDocument(next);
    setSelectedNodeId(null);
  }, [commitDocument, history.document]);

  const duplicateNode = useCallback((nodeId: string) => {
    const next = clone(history.document);
    const source = next.nodes[nodeId];
    if (!source) return;
    const duplicateBranch = (id: string, parentId: string | null): string => {
      const original = next.nodes[id];
      const copy = createCertificateNode(original.type, {
        ...clone(original),
        id: undefined,
        name: `${original.name} copy`,
        parentId,
        childIds: [],
        x: original.x + 4,
        y: original.y + 4,
      });
      next.nodes[copy.id] = copy;
      copy.childIds = original.childIds.map((childId) => duplicateBranch(childId, copy.id));
      return copy.id;
    };
    const copyId = duplicateBranch(nodeId, source.parentId);
    if (source.parentId && next.nodes[source.parentId]) next.nodes[source.parentId].childIds.push(copyId);
    else next.rootIds.push(copyId);
    commitDocument(next);
    setSelectedNodeId(copyId);
  }, [commitDocument, history.document]);

  const changeZOrder = useCallback((nodeId: string, action: "front" | "forward" | "backward" | "back") => {
    const next = clone(history.document);
    const node = next.nodes[nodeId];
    if (!node) return;
    const siblingIds = (node.parentId ? next.nodes[node.parentId]?.childIds : next.rootIds) || [];
    const siblings = siblingIds.map((id) => next.nodes[id]).filter(Boolean);
    const minimum = Math.min(0, ...siblings.map((item) => item.zIndex));
    const maximum = Math.max(0, ...siblings.map((item) => item.zIndex));
    if (action === "front") node.zIndex = maximum + 1;
    if (action === "forward") node.zIndex += 1;
    if (action === "backward") node.zIndex -= 1;
    if (action === "back") node.zIndex = minimum - 1;
    commitDocument(next);
  }, [commitDocument, history.document]);

  const moveNodeToParent = useCallback((nodeId: string, targetId: string) => {
    if (nodeId === targetId) return;
    const next = clone(history.document);
    const node = next.nodes[nodeId];
    const target = next.nodes[targetId];
    if (!node || !target) return;
    const descendants = new Set<string>();
    const walk = (id: string) => {
      descendants.add(id);
      next.nodes[id]?.childIds.forEach(walk);
    };
    walk(nodeId);
    if (descendants.has(targetId)) return;

    const previousIds = node.parentId ? next.nodes[node.parentId]?.childIds : next.rootIds;
    if (previousIds) {
      const filtered = previousIds.filter((id) => id !== nodeId);
      if (node.parentId) next.nodes[node.parentId].childIds = filtered;
      else next.rootIds = filtered;
    }
    if (target.type === "container") {
      node.parentId = target.id;
      target.childIds.push(nodeId);
    } else {
      node.parentId = target.parentId;
      const ids = target.parentId ? next.nodes[target.parentId].childIds : next.rootIds;
      ids.splice(ids.indexOf(targetId) + 1, 0, nodeId);
    }
    const section = target.section;
    if (section === "header") next.page.headerEnabled = true;
    if (section === "footer") next.page.footerEnabled = true;
    const pageIndex = target.pageIndex;
    const updateBranchSection = (id: string) => {
      const item = next.nodes[id];
      if (!item) return;
      item.section = section;
      item.pageIndex = pageIndex;
      item.childIds.forEach(updateBranchSection);
    };
    updateBranchSection(nodeId);
    commitDocument(next);
  }, [commitDocument, history.document]);

  const moveNodeToSection = useCallback((nodeId: string, section: CertificateSection) => {
    const next = clone(history.document);
    const node = next.nodes[nodeId];
    if (!node) return;
    if (section === "header") next.page.headerEnabled = true;
    if (section === "footer") next.page.footerEnabled = true;
    if (node.parentId && next.nodes[node.parentId]) {
      next.nodes[node.parentId].childIds = next.nodes[node.parentId].childIds.filter((id) => id !== nodeId);
    } else {
      next.rootIds = next.rootIds.filter((id) => id !== nodeId);
    }
    node.parentId = null;
    const updateBranchSection = (id: string) => {
      const item = next.nodes[id];
      if (!item) return;
      item.section = section;
      item.pageIndex = currentPage;
      item.childIds.forEach(updateBranchSection);
    };
    updateBranchSection(nodeId);
    if (section === "header" && node.y + node.height > next.page.headerHeightMm) node.y = 8;
    if (section === "body" && (node.y < next.page.headerHeightMm || node.y + node.height > next.page.heightMm - next.page.footerHeightMm)) node.y = next.page.headerHeightMm + 8;
    if (section === "footer" && node.y < next.page.heightMm - next.page.footerHeightMm) node.y = next.page.heightMm - next.page.footerHeightMm + 6;
    next.rootIds.push(nodeId);
    commitDocument(next);
    setActiveSection(section);
  }, [commitDocument, currentPage, history.document]);

  const addImageFile = useCallback((file: File, position?: { x: number; y: number }, replaceNodeId?: string) => {
    setImageError("");
    if (!/^image\/(png|jpeg|webp|gif)$/i.test(file.type)) {
      setImageError("Choose a PNG, JPEG, WebP, or GIF image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image size must be 2 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const source = typeof reader.result === "string" ? reader.result : "";
      if (!source) return;
      if (replaceNodeId) {
        patchNode(replaceNodeId, { source, alt: file.name });
        return;
      }
      const next = clone(history.document);
      const highestLayer = Math.max(0, ...Object.values(next.nodes).map((item) => item.zIndex));
      const section = activeSection;
      if (section === "header") next.page.headerEnabled = true;
      if (section === "footer") next.page.footerEnabled = true;
      const node = createCertificateNode("image", {
        name: file.name,
        source,
        alt: file.name,
        section,
        pageIndex: currentPage,
        x: Math.max(0, Math.min(170, position?.x ?? 25)),
        y: Math.max(0, Math.min(267, position?.y ?? (section === "header" ? 10 : section === "footer" ? 260 : 70))),
        zIndex: highestLayer + 1,
      });
      next.nodes[node.id] = node;
      next.rootIds.push(node.id);
      commitDocument(next);
      setSelectedNodeId(node.id);
    };
    reader.readAsDataURL(file);
  }, [activeSection, commitDocument, currentPage, history.document, patchNode]);

  const handleCanvasDrop = useCallback((event: ReactDragEvent<HTMLDivElement>) => {
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    const position = rect
      ? { x: (event.clientX - rect.left) * 210 / rect.width, y: (event.clientY - rect.top) * 297 / rect.height }
      : undefined;
    addImageFile(file, position);
  }, [addImageFile]);

  const applyActiveTextEdit = useCallback((document: CertificateDesignDocument) => {
    if (!editingTextNodeId) return;
    const editable = window.document.querySelector<HTMLElement>(`[data-edit-node="${CSS.escape(editingTextNodeId)}"]`);
    if (editable && document.nodes[editingTextNodeId]) document.nodes[editingTextNodeId].content = editable.innerHTML;
    setEditingTextNodeId(null);
    activeEditableNodeRef.current = null;
    rangeRef.current = null;
  }, [editingTextNodeId]);

  const addPage = useCallback(() => {
    const next = clone(history.document);
    applyActiveTextEdit(next);
    next.page.pageCount += 1;
    commitDocument(next);
    setCurrentPage(next.page.pageCount - 1);
    setActiveSection("body");
    setSelectedNodeId(null);
    setEditingTextNodeId(null);
  }, [applyActiveTextEdit, commitDocument, history.document]);

  const removeCurrentPage = useCallback(() => {
    if (history.document.page.pageCount <= 1) return;
    if (!window.confirm(`Delete page ${currentPage + 1} and all non-repeating components on it?`)) return;
    const next = clone(history.document);
    applyActiveTextEdit(next);
    const removeBranch = (id: string) => {
      next.nodes[id]?.childIds.forEach(removeBranch);
      delete next.nodes[id];
    };
    next.rootIds
      .filter((id) => !next.nodes[id]?.repeatOnAllPages && next.nodes[id]?.pageIndex === currentPage)
      .forEach(removeBranch);
    next.rootIds = next.rootIds.filter((id) => Boolean(next.nodes[id]));
    Object.values(next.nodes).forEach((node) => {
      if (!node.repeatOnAllPages && node.pageIndex > currentPage) node.pageIndex -= 1;
    });
    next.page.pageCount -= 1;
    commitDocument(next);
    setSelectedNodeId(null);
    setCurrentPage(Math.min(currentPage, next.page.pageCount - 1));
  }, [applyActiveTextEdit, commitDocument, currentPage, history.document]);

  const startInteraction = (
    event: ReactPointerEvent,
    node: CertificateDesignNode,
    kind: "move" | "resize"
  ) => {
    if (node.locked || node.parentId && history.document.nodes[node.parentId]?.layout !== "free") return;
    if (node.type === "text" && editingTextNodeId === node.id) return;
    const target = event.target as HTMLElement;
    if (target.closest("[contenteditable=true]") && kind === "move") return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedNodeId(node.id);
    setInteraction({
      nodeId: node.id,
      kind,
      startX: event.clientX,
      startY: event.clientY,
      initialX: node.x,
      initialY: node.y,
      initialWidth: node.width,
      initialHeight: node.height,
    });
  };

  useEffect(() => {
    if (!interaction) return;
    const handleMove = (event: PointerEvent) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      const mmPerPixel = 210 / canvasRect.width;
      const deltaX = (event.clientX - interaction.startX) * mmPerPixel;
      const deltaY = (event.clientY - interaction.startY) * mmPerPixel;
      const node = history.document.nodes[interaction.nodeId];
      if (!node) return;
      const grid = history.document.page.snapToGrid ? history.document.page.gridSizeMm : 0.1;
      const snap = (value: number) => Math.round(value / grid) * grid;
      const next = clone(history.document);
      if (interaction.kind === "move") {
        next.nodes[node.id].x = snap(Math.max(0, interaction.initialX + deltaX));
        next.nodes[node.id].y = snap(Math.max(0, interaction.initialY + deltaY));
      } else {
        next.nodes[node.id].width = snap(Math.max(5, interaction.initialWidth + deltaX));
        next.nodes[node.id].height = snap(Math.max(3, interaction.initialHeight + deltaY));
      }
      history.setDocument(next);
      setIsDirty(true);
    };
    const handleUp = () => setInteraction(null);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [history, interaction]);

  useEffect(() => {
    if (!sectionResize) return;
    const handleMove = (event: PointerEvent) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      const deltaY = (event.clientY - sectionResize.startY) * 297 / canvasRect.height;
      const next = clone(history.document);
      const otherHeight = sectionResize.section === "header" ? next.page.footerHeightMm : next.page.headerHeightMm;
      const maximum = Math.max(15, next.page.heightMm - otherHeight - 30);
      const rawHeight = sectionResize.section === "header"
        ? sectionResize.initialHeight + deltaY
        : sectionResize.initialHeight - deltaY;
      const height = Math.round(Math.max(15, Math.min(maximum, rawHeight)) * 10) / 10;
      if (sectionResize.section === "header") next.page.headerHeightMm = height;
      else next.page.footerHeightMm = height;
      history.setDocument(next);
      setIsDirty(true);
    };
    const handleUp = () => setSectionResize(null);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [history, sectionResize]);

  const finishTextEditing = useCallback((focusCanvas = false) => {
    if (!editingTextNodeId) return;
    const editable = document.querySelector<HTMLElement>(`[data-edit-node="${CSS.escape(editingTextNodeId)}"]`);
    const html = editable?.innerHTML;
    if (html !== undefined && history.document.nodes[editingTextNodeId]?.content !== html) {
      patchNode(editingTextNodeId, { content: html });
    }
    setEditingTextNodeId(null);
    activeEditableNodeRef.current = null;
    rangeRef.current = null;
    if (focusCanvas) requestAnimationFrame(() => canvasRef.current?.focus());
  }, [editingTextNodeId, history.document.nodes, patchNode]);

  useEffect(() => {
    if (!editingTextNodeId) return;
    const frame = requestAnimationFrame(() => {
      const editable = document.querySelector<HTMLElement>(`[data-edit-node="${CSS.escape(editingTextNodeId)}"]`);
      if (!editable) return;
      editable.focus();
      const range = document.createRange();
      range.selectNodeContents(editable);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      rangeRef.current = range.cloneRange();
      activeEditableNodeRef.current = editingTextNodeId;
    });
    return () => cancelAnimationFrame(frame);
  }, [editingTextNodeId]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const editing = target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (event.key === "Escape" && editingTextNodeId) {
        event.preventDefault();
        event.stopPropagation();
        finishTextEditing(true);
      } else if (!editing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) history.redo();
        else history.undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        history.redo();
      } else if (!editing && selectedNodeId && (event.key === "Delete" || event.key === "Backspace")) {
        event.preventDefault();
        setPendingDeleteNodeId(selectedNodeId);
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [editingTextNodeId, finishTextEditing, history, selectedNodeId]);

  const rememberSelection = (nodeId: string) => {
    activeEditableNodeRef.current = nodeId;
    const selection = window.getSelection();
    if (selection?.rangeCount) rangeRef.current = selection.getRangeAt(0).cloneRange();
  };

  const syncEditableContent = (nodeId: string) => {
    const editable = document.querySelector<HTMLElement>(`[data-edit-node="${CSS.escape(nodeId)}"]`);
    if (editable) patchNode(nodeId, { content: editable.innerHTML });
  };

  const insertTag = (tagKey: string) => {
    const nodeId = activeEditableNodeRef.current;
    const editable = nodeId
      ? document.querySelector<HTMLElement>(`[data-edit-node="${CSS.escape(nodeId)}"]`)
      : null;
    const range = rangeRef.current;
    if (nodeId && editable && range && editable.contains(range.commonAncestorContainer)) {
      const token = document.createElement("span");
      token.setAttribute("data-certificate-tag", tagKey);
      token.setAttribute("contenteditable", "false");
      token.className = "rounded bg-blue-100 px-1 font-semibold text-blue-800";
      token.textContent = tagKey;
      range.deleteContents();
      range.insertNode(token);
      range.setStartAfter(token);
      range.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      rangeRef.current = range.cloneRange();
      syncEditableContent(nodeId);
      return;
    }
    const next = clone(history.document);
    if (activeSection === "header") next.page.headerEnabled = true;
    if (activeSection === "footer") next.page.footerEnabled = true;
    const node = createCertificateNode("text", {
      name: `Dynamic field ${tagKey}`,
      content: `<span data-certificate-tag="${tagKey}" contenteditable="false">${tagKey}</span>`,
      x: 25,
      y: 80,
      width: 80,
      height: 12,
      section: activeSection,
      pageIndex: currentPage,
    });
    next.nodes[node.id] = node;
    next.rootIds.push(node.id);
    commitDocument(next);
    setSelectedNodeId(node.id);
  };

  const applyTextCommand = (command: string, value?: string) => {
    const nodeId = editingTextNodeId || activeEditableNodeRef.current;
    if (!nodeId) return;
    const editable = document.querySelector<HTMLElement>(`[data-edit-node="${CSS.escape(nodeId)}"]`);
    if (!editable || editable.getAttribute("contenteditable") !== "true") return;

    editable.focus({ preventScroll: true });
    const selection = window.getSelection();
    const savedRange = rangeRef.current;
    if (selection && savedRange && editable.contains(savedRange.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(savedRange.cloneRange());
    }

    if (typeof document.execCommand === "function") {
      document.execCommand(command, false, value);
    }

    if (selection?.rangeCount) rangeRef.current = selection.getRangeAt(0).cloneRange();
    syncEditableContent(nodeId);

    requestAnimationFrame(() => {
      const currentEditable = document.querySelector<HTMLElement>(`[data-edit-node="${CSS.escape(nodeId)}"]`);
      if (!currentEditable || editingTextNodeId !== nodeId) return;
      currentEditable.focus({ preventScroll: true });
      const currentSelection = window.getSelection();
      const currentRange = rangeRef.current;
      if (currentSelection && currentRange && currentEditable.contains(currentRange.commonAncestorContainer)) {
        currentSelection.removeAllRanges();
        currentSelection.addRange(currentRange.cloneRange());
      }
    });
  };

  const handleSave = async () => {
    if (!persistenceReady || issues.some((issue) => issue.severity === "error")) return;
    const saved = await onSave({
      design: history.document,
      bodyContent: compiledHtml,
      headerContent: compiledSections.headerContent,
      footerContent: compiledSections.footerContent,
      templateName,
      templateCode,
      description,
      isActive,
      defaultConditions: conditions,
      officerFields: configuredOfficerFields,
    });
    if (saved) setIsDirty(false);
  };

  const printPreview = () => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) return;
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtmlText(templateName)}</title><style>@page{size:A4 portrait;margin:0}html,body{margin:0;background:#fff}*{box-sizing:border-box}</style></head><body>${compiledHtml}<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script></body></html>`);
    printWindow.document.close();
  };

  const handleBack = () => {
    if (isDirty && !window.confirm("You have unpublished certificate changes. Leave without saving?")) return;
    onBack?.();
  };

  const beginTextEditing = (nodeId: string) => {
    const node = history.document.nodes[nodeId];
    if (!node || node.type !== "text" || node.locked) return;
    setSelectedNodeId(nodeId);
    setEditingTextNodeId(nodeId);
    activeEditableNodeRef.current = nodeId;
    requestAnimationFrame(() => {
      const editable = document.querySelector<HTMLElement>(`[data-edit-node="${CSS.escape(nodeId)}"]`);
      if (!editable) return;
      editable.focus({ preventScroll: true });
      const selection = window.getSelection();
      const savedRange = rangeRef.current;
      if (selection && savedRange && editable.contains(savedRange.commonAncestorContainer)) {
        selection.removeAllRanges();
        selection.addRange(savedRange.cloneRange());
        return;
      }
      const range = document.createRange();
      range.selectNodeContents(editable);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
      rangeRef.current = range.cloneRange();
    });
  };

  const renderNode = (nodeId: string, inFlow = false): React.ReactNode => {
    const node = history.document.nodes[nodeId];
    if (!node || !node.visible) return null;
    const isSelected = selectedNodeId === node.id;
    const unsafeImage = node.type === "image" && node.source && !isSafeCertificateImageSource(node.source);
    const style = nodeCss(node, inFlow);
    if (isSelected) {
      style.overflow = "visible";
    }
    const contentLayoutStyle: CSSProperties = node.type === "container"
      ? {
          display: node.layout === "grid" ? "grid" : "flex",
          flexDirection: node.layout === "row" ? "row" : "column",
          gridTemplateColumns: node.layout === "grid" ? `repeat(${node.columns}, minmax(0, 1fr))` : undefined,
          gap: `${node.gap}mm`,
        }
      : {};
    const toolbarAbove = node.section === "footer" && node.y + node.height > 288;
    const className = `group/node ${isSelected ? "ring-2 ring-blue-500 ring-offset-1" : "hover:ring-1 hover:ring-blue-300"} ${node.locked ? "cursor-not-allowed" : "cursor-move"}`;

    return (
      <div
        key={node.id}
        data-canvas-node={node.id}
        style={style}
        className={className}
        onPointerDown={(event) => startInteraction(event, node, "move")}
        onClick={(event) => {
          event.stopPropagation();
          setSelectedNodeId(node.id);
        }}
        onDoubleClick={(event) => {
          if (node.type !== "text" || node.locked) return;
          event.preventDefault();
          event.stopPropagation();
          beginTextEditing(node.id);
        }}
      >
        <div className="relative h-full w-full overflow-hidden" style={{ ...contentLayoutStyle, borderRadius: "inherit" }}>
          {node.type === "text" && (
            <div
              data-edit-node={node.id}
              contentEditable={editingTextNodeId === node.id && !node.locked}
              suppressContentEditableWarning
              className={`h-full w-full outline-none ${editingTextNodeId === node.id ? "cursor-text" : "cursor-move select-none"}`}
              dangerouslySetInnerHTML={{ __html: node.content }}
              onFocus={() => rememberSelection(node.id)}
              onKeyUp={() => rememberSelection(node.id)}
              onMouseUp={() => rememberSelection(node.id)}
              onInput={() => rememberSelection(node.id)}
              onBlur={(event) => {
                const html = event.currentTarget.innerHTML;
                if (history.document.nodes[node.id]?.content !== html) patchNode(node.id, { content: html });
                setEditingTextNodeId((current) => current === node.id ? null : current);
                activeEditableNodeRef.current = null;
                rangeRef.current = null;
              }}
            />
          )}
          {node.type === "legacyHtml" && (
            <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: node.content }} />
          )}
          {node.type === "image" && (
            node.source && !unsafeImage
              ? <img src={node.source} alt={node.alt} className="h-full w-full" style={{ objectFit: node.style.objectFit }} />
              : <div className="flex h-full items-center justify-center border border-dashed border-slate-300 bg-slate-50 text-center text-[10px] text-slate-500">{unsafeImage ? "Unsafe image URL" : "Choose an image"}</div>
          )}
          {node.type === "qr" && <div className="flex h-full items-center justify-center bg-slate-50 font-mono text-[9px]">{node.content}</div>}
          {node.type === "signature" && <div className="flex h-full items-center justify-center text-[9px] italic text-slate-500">{node.content}</div>}
          {node.type === "divider" && node.style.borderEnabled && (
            <span
              className="pointer-events-none absolute"
              style={node.dividerOrientation === "vertical"
                ? { height: "100%", left: "50%", top: 0, borderLeft: `${node.style.borderWidth}mm ${node.style.borderStyle} ${node.style.borderColor}`, transform: "translateX(-50%)" }
                : { width: "100%", left: 0, top: "50%", borderTop: `${node.style.borderWidth}mm ${node.style.borderStyle} ${node.style.borderColor}`, transform: "translateY(-50%)" }}
            />
          )}
          {node.type === "table" && (
            <table className="h-full w-full border-collapse text-[9px]"><tbody><tr><td className="border border-slate-400 p-1">Field</td><td className="border border-slate-400 p-1">Value</td></tr><tr><td className="border border-slate-400 p-1" /><td className="border border-slate-400 p-1" /></tr></tbody></table>
          )}
          {node.childIds.map((id) => renderNode(id, node.layout !== "free"))}
        </div>
        {isSelected && (
          <div
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            className={`absolute left-1/2 z-[70] flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-lg ${toolbarAbove ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"}`}
          >
            {node.type === "text" && <button type="button" aria-label={`Edit ${node.name}`} title="Edit text" disabled={node.locked} onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); }} onClick={() => beginTextEditing(node.id)} className={`rounded-full p-1.5 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 ${editingTextNodeId === node.id ? "bg-blue-100" : ""}`}><Pencil className="h-3.5 w-3.5" /></button>}
            <button type="button" aria-label={`Delete ${node.name}`} title="Delete component" onClick={() => setPendingDeleteNodeId(node.id)} className="rounded-full p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
            <button type="button" aria-label={`Rotate ${node.name}`} title="Rotate 15 degrees" disabled={node.locked} onClick={() => patchNode(node.id, { rotation: (node.rotation + 15) % 360 })} className="rounded-full p-1.5 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"><RotateCw className="h-3.5 w-3.5" /></button>
          </div>
        )}
        {isSelected && !node.locked && (!node.parentId || history.document.nodes[node.parentId]?.layout === "free") && (
          <button
            type="button"
            aria-label="Resize element"
            onPointerDown={(event) => startInteraction(event, node, "resize")}
            className="absolute -bottom-1.5 -right-1.5 z-50 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border border-white bg-blue-600 shadow"
          />
        )}
      </div>
    );
  };

  const layerMatches = (node: CertificateDesignNode) =>
    !layerSearch.trim() || `${node.name} ${node.type}`.toLowerCase().includes(layerSearch.toLowerCase());

  const branchMatches = (nodeId: string): boolean => {
    const node = history.document.nodes[nodeId];
    return Boolean(node && (layerMatches(node) || node.childIds.some(branchMatches)));
  };

  const renderLayer = (nodeId: string, depth = 0): React.ReactNode => {
    const node = history.document.nodes[nodeId];
    if (!node) return null;
    if (!branchMatches(nodeId)) return null;
    const isCollapsed = collapsedNodes.has(node.id) && !layerSearch.trim();
    return (
      <div key={node.id} className={depth ? "ml-3 border-l border-slate-200 pl-1" : ""}>
        <div
          draggable={!node.locked}
          onDragStart={(event) => event.dataTransfer.setData("text/certificate-node", node.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const sourceId = event.dataTransfer.getData("text/certificate-node");
            if (sourceId) moveNodeToParent(sourceId, node.id);
          }}
          className={`group/layer flex w-full items-center gap-1 rounded-md py-1 pr-1 text-left text-[11px] ${selectedNodeId === node.id ? "bg-blue-100 font-bold text-blue-800" : "text-slate-700 hover:bg-slate-100"}`}
        >
          <button
            type="button"
            aria-label={node.childIds.length ? `${isCollapsed ? "Expand" : "Collapse"} ${node.name}` : undefined}
            onClick={(event) => {
              event.stopPropagation();
              if (!node.childIds.length) return;
              setCollapsedNodes((current) => {
                const next = new Set(current);
                if (next.has(node.id)) next.delete(node.id);
                else next.add(node.id);
                return next;
              });
            }}
            className="p-0.5 text-slate-400"
          >
            {node.childIds.length ? (isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <span className="block h-3 w-3" />}
          </button>
          <button type="button" onClick={() => setSelectedNodeId(node.id)} className="min-w-0 flex-1 truncate text-left">{node.name}</button>
          <span className="ml-auto text-[9px] uppercase text-slate-400">{node.type}</span>
          {node.repeatOnAllPages && <span className="rounded bg-blue-100 px-1 text-[8px] font-bold text-blue-700" title="Repeats on all pages">ALL</span>}
          <span className="font-mono text-[8px] text-slate-400">z{node.zIndex}</span>
          {node.locked && <Lock className="h-3 w-3 text-amber-600" />}
          {!node.visible && <EyeOff className="h-3 w-3 text-slate-400" />}
          <button type="button" onClick={() => setPendingDeleteNodeId(node.id)} className="hidden p-0.5 text-red-600 group-hover/layer:block" title="Delete component"><Trash2 className="h-3 w-3" /></button>
        </div>
        {!isCollapsed && [...node.childIds].sort((a, b) => (history.document.nodes[b]?.zIndex || 0) - (history.document.nodes[a]?.zIndex || 0)).map((id) => renderLayer(id, depth + 1))}
      </div>
    );
  };

  const sectionDefinitions: Array<{ key: CertificateSection; label: string; icon: typeof Layers3 }> = [
    { key: "header", label: "Header", icon: PanelTop },
    { key: "body", label: `Main body — page ${currentPage + 1}`, icon: Layers3 },
    { key: "footer", label: "Footer", icon: PanelBottom },
  ];

  const sectionRootIds = (section: CertificateSection) => history.document.rootIds
    .filter((id) => {
      const node = history.document.nodes[id];
      return node?.section === section && (node.repeatOnAllPages || node.pageIndex === currentPage);
    })
    .sort((a, b) => (history.document.nodes[b]?.zIndex || 0) - (history.document.nodes[a]?.zIndex || 0));

  const inspectorNumber = (label: string, key: "x" | "y" | "width" | "height" | "rotation" | "zIndex", min?: number) => (
    <label className="space-y-1 text-[10px] font-bold text-slate-600">
      <span>{label}</span>
      <Input
        type="number"
        value={String(selectedNode?.[key] ?? 0)}
        min={min}
        onChange={(event) => selectedNode && patchNode(selectedNode.id, { [key]: numericValue(event.target.value, selectedNode[key]) })}
        className="h-8 text-xs"
      />
    </label>
  );

  return (
    <div className="flex h-[calc(100vh-65px)] min-h-[650px] flex-col overflow-hidden bg-slate-100 text-slate-900">
      <header className="z-30 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-white px-4 py-2 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && <Button variant="secondary" size="sm" onClick={handleBack}>{editorMode === "template" ? "Back to template library" : "Back to certificates"}</Button>}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-800 text-white"><MousePointer2 className="h-5 w-5" /></div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-extrabold">{editorMode === "template" ? "Certificate Template Studio" : "Certificate Canvas Studio"}</h1>
            <p className="truncate text-[10px] font-semibold text-slate-500">{editorMode === "template" ? "Reusable template library" : `${departmentName} / ${serviceName}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={history.undo} disabled={!history.canUndo} className="rounded-md border p-2 disabled:opacity-30" title="Undo"><Undo2 className="h-4 w-4" /></button>
          <button type="button" onClick={history.redo} disabled={!history.canRedo} className="rounded-md border p-2 disabled:opacity-30" title="Redo"><Redo2 className="h-4 w-4" /></button>
          <button type="button" onClick={() => setIsPreviewOpen(true)} className="inline-flex items-center gap-1 rounded-md border border-blue-200 px-3 py-2 text-xs font-bold text-blue-800"><Eye className="h-4 w-4" /> Preview</button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!persistenceReady || saving || issues.some((issue) => issue.severity === "error")}
            title={!persistenceReady ? "The certificate API must persist and return designJson before publishing is enabled." : undefined}
            className="gap-1.5 bg-blue-800"
          >
            <Save className="h-4 w-4" /> {saving ? "Publishing..." : "Save & Publish"}
          </Button>
        </div>
      </header>

      {!persistenceReady && (
        <div className="flex shrink-0 items-center gap-2 border-b border-amber-300 bg-amber-50 px-4 py-2 text-[11px] font-semibold text-amber-900">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Canvas editing is available, but publishing is locked until the template API returns the new <code>designJson</code> field. No browser-only fallback is used.
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-[250px_minmax(480px,1fr)_285px]">
        <aside className="min-h-0 overflow-y-auto border-r border-slate-300 bg-white">
          <div className={`sticky top-0 z-10 grid ${editorMode === "template" ? "grid-cols-2" : "grid-cols-3"} border-b bg-white p-2`}>
            {(editorMode === "template" ? (["elements", "layers"] as const) : (["elements", "layers", "tags"] as const)).map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveLeftTab(tab)} className={`rounded-md px-2 py-1.5 text-[10px] font-extrabold capitalize ${activeLeftTab === tab ? "bg-blue-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{tab}</button>
            ))}
          </div>

          {activeLeftTab === "elements" && (
            <div className="p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Add to section</p>
              <div className="mb-3 grid grid-cols-3 gap-1">
                {sectionDefinitions.map((section) => {
                  const Icon = section.icon;
                  return <button key={section.key} type="button" onClick={() => setActiveSection(section.key)} className={`flex flex-col items-center gap-1 rounded-md border px-1 py-2 text-[9px] font-bold ${activeSection === section.key ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600"}`} title={section.label}><Icon className="h-4 w-4" />{section.key === "body" ? "Main body" : section.key[0].toUpperCase() + section.key.slice(1)}</button>;
                })}
              </div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Add elements</p>
              <div className="grid grid-cols-2 gap-2">
                {TOOL_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return <button key={item.type} type="button" onClick={() => addNode(item.type)} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-700 hover:border-blue-400 hover:bg-blue-50"><Icon className="h-5 w-5 text-blue-700" />{item.label}</button>;
                })}
              </div>
              <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) addImageFile(file); event.currentTarget.value = ""; }} />
              <button type="button" onClick={() => imageInputRef.current?.click()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-800"><Upload className="h-4 w-4" /> Browse image</button>
              {imageError && <p className="mt-2 rounded bg-red-50 p-2 text-[9px] font-semibold text-red-700">{imageError}</p>}
              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-[10px] leading-relaxed text-blue-900">
                Select a target section, or select a container to nest the new element. You can also drag an image file directly onto the canvas.
              </div>
            </div>
          )}

          {activeLeftTab === "layers" && (
            <div className="p-2">
              <div className="relative mb-2"><Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" /><Input value={layerSearch} onChange={(event) => setLayerSearch(event.target.value)} placeholder="Search layers" className="h-8 pl-7 text-xs" /></div>
              <div className="space-y-1">
                {sectionDefinitions.map((section) => {
                  const Icon = section.icon;
                  const isCollapsed = collapsedSections.has(section.key) && !layerSearch.trim();
                  const rootIds = sectionRootIds(section.key);
                  const sectionEnabled = section.key === "body" ? true : section.key === "header" ? history.document.page.headerEnabled : history.document.page.footerEnabled;
                  return <section key={section.key} className={`rounded-lg border border-slate-200 bg-slate-50/70 ${sectionEnabled ? "" : "opacity-55"}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const sourceId = event.dataTransfer.getData("text/certificate-node"); if (sourceId) moveNodeToSection(sourceId, section.key); }}><div className="flex items-center gap-1 p-1"><button type="button" onClick={() => setCollapsedSections((current) => { const next = new Set(current); if (next.has(section.key)) next.delete(section.key); else next.add(section.key); return next; })} className="p-1 text-slate-500">{isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</button><Icon className="h-3.5 w-3.5 text-blue-700" /><button type="button" onClick={() => { setActiveSection(section.key); setSelectedNodeId(null); }} className="min-w-0 flex-1 truncate text-left text-[10px] font-extrabold text-slate-700">{section.label}</button>{!sectionEnabled && <span className="text-[8px] font-bold uppercase text-slate-400">Off</span>}<span className="rounded-full bg-white px-1.5 text-[8px] text-slate-500">{rootIds.length}</span></div>{!isCollapsed && <div className="border-t border-slate-200 bg-white p-1">{rootIds.length ? rootIds.map((id) => renderLayer(id)) : <p className="px-2 py-2 text-[9px] italic text-slate-400">Drop components here</p>}</div>}</section>;
                })}
              </div>
              <p className="mt-3 text-[9px] leading-relaxed text-slate-400">Drag components between Header, Main body, and Footer. Higher z values render above lower layers.</p>
            </div>
          )}

          {editorMode === "service" && activeLeftTab === "tags" && (
            <div className="p-2">
              <div className="relative mb-2"><Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" /><Input value={tagSearch} onChange={(event) => setTagSearch(event.target.value)} placeholder="Search dynamic tags" className="h-8 pl-7 text-xs" /></div>
              <div className="space-y-3">
                {(["Citizen", "System", "Officer"] as const).map((source) => {
                  const sourceTags = filteredTags.filter((tag) => tag.sourceType === source || (source === "System" && tag.tagKey.includes("Field:")));
                  if (!sourceTags.length) return null;
                  const isCollapsed = collapsedTagSources.has(source);
                  const sourceLabel = source === "System" ? "System & form fields" : source;
                  return (
                    <section key={source} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <button
                        type="button"
                        aria-expanded={!isCollapsed}
                        aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${sourceLabel} tags`}
                        onClick={() => setCollapsedTagSources((current) => {
                          const next = new Set(current);
                          if (next.has(source)) next.delete(source);
                          else next.add(source);
                          return next;
                        })}
                        className="flex w-full items-center gap-2 bg-slate-50 px-2 py-2 text-left hover:bg-slate-100"
                      >
                        {isCollapsed
                          ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                          : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
                        <span className="min-w-0 flex-1 truncate text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
                          {sourceLabel}
                        </span>
                        <span className="rounded-full bg-white px-1.5 py-0.5 text-[8px] font-bold text-slate-500">
                          {sourceTags.length}
                        </span>
                      </button>
                      {!isCollapsed && (
                        <div className="space-y-1 border-t border-slate-200 p-1.5">
                          {sourceTags.map((tag) => (
                            <button
                              key={`${source}-${tag.tagKey}`}
                              type="button"
                              onClick={() => insertTag(tag.tagKey)}
                              className="w-full rounded-md border border-slate-200 p-2 text-left hover:border-blue-300 hover:bg-blue-50"
                            >
                              <span className="block truncate font-mono text-[10px] font-bold text-blue-800">{tag.tagKey}</span>
                              <span className="block truncate text-[9px] text-slate-500">{tag.tagLabelEnglish}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        <main className="relative min-h-0 overflow-auto bg-[#dbe3ee]">
          <div className="sticky left-0 top-0 z-20 flex h-10 items-center justify-between border-b border-slate-300 bg-white/95 px-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setZoom((value) => Math.max(40, value - 10))} className="rounded p-1 hover:bg-slate-100"><ZoomOut className="h-4 w-4" /></button>
              <span className="w-12 text-center font-mono text-[10px] font-bold">{zoom}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(150, value + 10))} className="rounded p-1 hover:bg-slate-100"><ZoomIn className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1 py-0.5">
              <button type="button" onClick={() => { finishTextEditing(); setCurrentPage((page) => Math.max(0, page - 1)); setSelectedNodeId(null); }} disabled={currentPage === 0} className="rounded p-1 disabled:opacity-30" title="Previous page"><ChevronLeft className="h-3.5 w-3.5" /></button>
              <span className="min-w-20 text-center text-[10px] font-bold">Page {currentPage + 1} of {history.document.page.pageCount}</span>
              <button type="button" onClick={() => { finishTextEditing(); setCurrentPage((page) => Math.min(history.document.page.pageCount - 1, page + 1)); setSelectedNodeId(null); }} disabled={currentPage >= history.document.page.pageCount - 1} className="rounded p-1 disabled:opacity-30" title="Next page"><ChevronRight className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={addPage} className="rounded p-1 text-blue-700 hover:bg-blue-100" title="Add page"><Plus className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={removeCurrentPage} disabled={history.document.page.pageCount <= 1} className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-30" title="Delete current page"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500"><span>A4 210 x 297 mm</span>{issues.length > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">{issues.length} issue{issues.length === 1 ? "" : "s"}</span>}</div>
          </div>
          <div className="flex min-h-full justify-center p-10">
            <div style={{ width: `${210 * 3.78 * zoom / 100}px`, height: `${297 * 3.78 * zoom / 100}px` }}>
              <div
                ref={canvasRef}
                tabIndex={-1}
                onClick={(event) => { finishTextEditing(); setSelectedNodeId(null); event.currentTarget.focus(); }}
                onDragOver={(event) => { if (event.dataTransfer.types.includes("Files")) event.preventDefault(); }}
                onDrop={handleCanvasDrop}
                className="relative origin-top-left overflow-hidden bg-white shadow-2xl"
                style={{
                  width: "210mm",
                  height: "297mm",
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top left",
                  backgroundColor: history.document.page.backgroundColor,
                  backgroundImage: history.document.page.showGrid ? "radial-gradient(circle, #cbd5e1 0.35px, transparent 0.45px)" : undefined,
                  backgroundSize: history.document.page.showGrid ? `${history.document.page.gridSizeMm}mm ${history.document.page.gridSizeMm}mm` : undefined,
                }}
              >
                <div className="pointer-events-none absolute border border-dashed border-blue-200" style={{ inset: `${history.document.page.marginMm}mm` }} />
                {history.document.page.headerEnabled && <div className="pointer-events-none absolute inset-x-0 z-40 border-b border-dashed border-cyan-500/70 bg-cyan-50/20" style={{ top: 0, height: `${history.document.page.headerHeightMm}mm` }}><span className="absolute left-1 top-1 rounded bg-cyan-700 px-1 text-[7px] font-bold uppercase text-white">Header</span><button type="button" title="Resize header" aria-label="Resize header" className="pointer-events-auto absolute -bottom-1.5 left-1/2 h-3 w-16 -translate-x-1/2 cursor-ns-resize rounded-full border border-cyan-600 bg-white shadow" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); setSectionResize({ section: "header", startY: event.clientY, initialHeight: history.document.page.headerHeightMm }); }} /></div>}
                {history.document.page.footerEnabled && <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 border-t border-dashed border-violet-500/70 bg-violet-50/20" style={{ height: `${history.document.page.footerHeightMm}mm` }}><span className="absolute bottom-1 left-1 rounded bg-violet-700 px-1 text-[7px] font-bold uppercase text-white">Footer</span><button type="button" title="Resize footer" aria-label="Resize footer" className="pointer-events-auto absolute -top-1.5 left-1/2 h-3 w-16 -translate-x-1/2 cursor-ns-resize rounded-full border border-violet-600 bg-white shadow" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); setSectionResize({ section: "footer", startY: event.clientY, initialHeight: history.document.page.footerHeightMm }); }} /></div>}
                {history.document.rootIds
                  .filter((id) => {
                    const node = history.document.nodes[id];
                    if (!node || node.section === "header" && !history.document.page.headerEnabled || node.section === "footer" && !history.document.page.footerEnabled) return false;
                    return node.repeatOnAllPages || node.pageIndex === currentPage;
                  })
                  .sort((a, b) => (history.document.nodes[a]?.zIndex || 0) - (history.document.nodes[b]?.zIndex || 0))
                  .map((id) => renderNode(id))}
              </div>
            </div>
          </div>
        </main>

        <aside className="min-h-0 overflow-y-auto border-l border-slate-300 bg-white">
          <div className="sticky top-0 z-10 border-b bg-slate-50 px-3 py-2"><h2 className="text-xs font-extrabold">Properties</h2><p className="truncate text-[9px] text-slate-500">{selectedNode ? `${selectedNode.name} / ${selectedNode.type}` : "Page settings"}</p></div>
          {!selectedNode ? (
            <div className="space-y-4 p-3">
              <label className="block space-y-1 text-[10px] font-bold text-slate-600"><span>Template name</span><Input value={templateName} onChange={(event) => { setTemplateName(event.target.value); setIsDirty(true); }} className="h-8 text-xs" /></label>
              <label className="block space-y-1 text-[10px] font-bold text-slate-600"><span>Template code</span><Input value={templateCode} onChange={(event) => { setTemplateCode(event.target.value); setIsDirty(true); }} className="h-8 text-xs" /></label>
              {editorMode === "template" && <label className="block space-y-1 text-[10px] font-bold text-slate-600"><span>Description</span><textarea value={description} onChange={(event) => { setDescription(event.target.value); setIsDirty(true); }} rows={3} maxLength={500} className="w-full rounded-md border border-slate-300 p-2 text-[10px]" placeholder="Describe when this reusable template should be used" /></label>}
              <label className="flex items-center justify-between text-[10px] font-bold text-slate-600"><span>Active template</span><input type="checkbox" checked={isActive} onChange={(event) => { setIsActive(event.target.checked); setIsDirty(true); }} /></label>
              <label className="block space-y-1 text-[10px] font-bold text-slate-600"><span>Page background</span><input type="color" value={history.document.page.backgroundColor} onChange={(event) => { const next = clone(history.document); next.page.backgroundColor = event.target.value; commitDocument(next); }} className="h-8 w-full" /></label>
              <label className="flex items-center justify-between text-[10px] font-bold text-slate-600"><span>Show grid</span><input type="checkbox" checked={history.document.page.showGrid} onChange={(event) => { const next = clone(history.document); next.page.showGrid = event.target.checked; commitDocument(next); }} /></label>
              <label className="flex items-center justify-between text-[10px] font-bold text-slate-600"><span>Snap to grid</span><input type="checkbox" checked={history.document.page.snapToGrid} onChange={(event) => { const next = clone(history.document); next.page.snapToGrid = event.target.checked; commitDocument(next); }} /></label>
              <section className="space-y-2 rounded-lg border border-slate-200 p-2"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold text-slate-700">Header</p><p className="text-[8px] text-slate-400">Drag its canvas boundary or enter a height.</p></div><input aria-label="Enable header" type="checkbox" checked={history.document.page.headerEnabled} onChange={(event) => { const next = clone(history.document); next.page.headerEnabled = event.target.checked; commitDocument(next); if (!event.target.checked && activeSection === "header") setActiveSection("body"); }} /></div><label className="space-y-1 text-[10px] font-bold text-slate-600"><span>Height (mm)</span><Input type="number" min={15} max={120} disabled={!history.document.page.headerEnabled} value={String(history.document.page.headerHeightMm)} onChange={(event) => { const next = clone(history.document); next.page.headerHeightMm = numericValue(event.target.value, 42); commitDocument(next); }} className="h-8" /></label></section>
              <section className="space-y-2 rounded-lg border border-slate-200 p-2"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold text-slate-700">Footer</p><p className="text-[8px] text-slate-400">Drag its canvas boundary or enter a height.</p></div><input aria-label="Enable footer" type="checkbox" checked={history.document.page.footerEnabled} onChange={(event) => { const next = clone(history.document); next.page.footerEnabled = event.target.checked; commitDocument(next); if (!event.target.checked && activeSection === "footer") setActiveSection("body"); }} /></div><label className="space-y-1 text-[10px] font-bold text-slate-600"><span>Height (mm)</span><Input type="number" min={15} max={120} disabled={!history.document.page.footerEnabled} value={String(history.document.page.footerHeightMm)} onChange={(event) => { const next = clone(history.document); next.page.footerHeightMm = numericValue(event.target.value, 35); commitDocument(next); }} className="h-8" /></label></section>
              {editorMode === "service" && <section className="space-y-2 border-t pt-3"><h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Default conditions</h3><textarea value={conditions.join("\n")} onChange={(event) => { setConditions(event.target.value.split("\n")); setIsDirty(true); }} rows={5} className="w-full rounded-md border border-slate-300 p-2 text-[10px]" placeholder="One condition per line" /></section>}
              {editorMode === "service" && <section className="space-y-2 border-t pt-3"><div className="flex items-center justify-between"><h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Officer inputs</h3><button type="button" onClick={() => { setConfiguredOfficerFields((current) => [...current, { fieldKey: `OfficerField${current.length + 1}`, fieldLabelEnglish: "Officer field", fieldLabelMarathi: "अधिकारी नोंद", fieldType: "text", isMandatory: false }]); setIsDirty(true); }} className="rounded border border-blue-200 px-2 py-1 text-[9px] font-bold text-blue-700">Add field</button></div>{configuredOfficerFields.map((field, index) => <div key={`${field.fieldKey}-${index}`} className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-2"><Input value={field.fieldKey} onChange={(event) => { setConfiguredOfficerFields((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, fieldKey: event.target.value } : item)); setIsDirty(true); }} placeholder="Field key" className="h-7 font-mono text-[10px]" /><Input value={field.fieldLabelEnglish} onChange={(event) => { setConfiguredOfficerFields((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, fieldLabelEnglish: event.target.value } : item)); setIsDirty(true); }} placeholder="English label" className="h-7 text-[10px]" /><Input value={field.fieldLabelMarathi} onChange={(event) => { setConfiguredOfficerFields((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, fieldLabelMarathi: event.target.value } : item)); setIsDirty(true); }} placeholder="Local label" className="h-7 text-[10px]" /><div className="flex items-center gap-2"><select value={field.fieldType} onChange={(event) => { const fieldType = event.target.value as OfficerFieldConfig["fieldType"]; setConfiguredOfficerFields((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, fieldType } : item)); setIsDirty(true); }} className="h-7 flex-1 rounded border border-slate-300 bg-white px-1 text-[9px]"><option value="text">Text</option><option value="textarea">Textarea</option><option value="number">Number</option><option value="date">Date</option><option value="select">Select</option></select><label className="flex items-center gap-1 text-[9px] font-bold"><input type="checkbox" checked={field.isMandatory} onChange={(event) => { setConfiguredOfficerFields((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, isMandatory: event.target.checked } : item)); setIsDirty(true); }} /> Required</label><button type="button" onClick={() => { setConfiguredOfficerFields((current) => current.filter((_item, itemIndex) => itemIndex !== index)); setIsDirty(true); }} className="rounded p-1 text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div></div>)}</section>}
            </div>
          ) : (
            <div className="space-y-4 p-3">
              <label className="block space-y-1 text-[10px] font-bold text-slate-600"><span>Layer name</span><Input value={selectedNode.name} onChange={(event) => patchNode(selectedNode.id, { name: event.target.value })} className="h-8 text-xs" /></label>
              <label className="block space-y-1 text-[10px] font-bold text-slate-600"><span>Section</span><select value={selectedNode.section} onChange={(event) => moveNodeToSection(selectedNode.id, event.target.value as CertificateSection)} className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-[10px]"><option value="header">Header</option><option value="body">Main body</option><option value="footer">Footer</option></select></label>
              <label className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-2 text-[10px] font-bold text-blue-900"><span><span className="block">Repeat on all pages</span><span className="block text-[8px] font-normal text-blue-600">Off by default. Current page: {selectedNode.pageIndex + 1}</span></span><input aria-label="Repeat component on all pages" type="checkbox" checked={selectedNode.repeatOnAllPages} onChange={(event) => patchNode(selectedNode.id, { repeatOnAllPages: event.target.checked, pageIndex: event.target.checked ? selectedNode.pageIndex : currentPage })} /></label>
              <div className="grid grid-cols-2 gap-2">{inspectorNumber("X (mm)", "x")}{inspectorNumber("Y (mm)", "y")}{inspectorNumber("Width (mm)", "width", 5)}{inspectorNumber("Height (mm)", "height", 3)}{inspectorNumber("Rotation", "rotation")}{inspectorNumber("Layer", "zIndex")}</div>

              <div className="flex flex-wrap gap-1 border-y py-2">
                <button type="button" onClick={() => patchNode(selectedNode.id, { locked: !selectedNode.locked })} className="rounded border p-1.5" title={selectedNode.locked ? "Unlock" : "Lock"}>{selectedNode.locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}</button>
                <button type="button" onClick={() => patchNode(selectedNode.id, { visible: !selectedNode.visible })} className="rounded border p-1.5" title="Toggle visibility">{selectedNode.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
                <button type="button" onClick={() => duplicateNode(selectedNode.id)} className="rounded border p-1.5" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => changeZOrder(selectedNode.id, "front")} className="rounded border p-1.5" title="Bring to front"><BringToFront className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => changeZOrder(selectedNode.id, "forward")} className="rounded border p-1.5" title="Move one layer forward"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => changeZOrder(selectedNode.id, "backward")} className="rounded border p-1.5" title="Move one layer backward"><ChevronDown className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => changeZOrder(selectedNode.id, "back")} className="rounded border p-1.5" title="Send to back"><SendToBack className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setPendingDeleteNodeId(selectedNode.id)} className="ml-auto rounded border border-red-200 p-1.5 text-red-600" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>

              {selectedNode.type === "container" && (
                <section className="space-y-2"><h3 className="text-[10px] font-extrabold uppercase text-slate-400">Layout</h3><div className="grid grid-cols-4 gap-1">{(["free", "row", "column", "grid"] as CertificateLayoutMode[]).map((layout) => { const Icon = layout === "free" ? MousePointer2 : layout === "row" ? Columns3 : layout === "column" ? Rows3 : Grid2X2; return <button key={layout} type="button" onClick={() => patchNode(selectedNode.id, { layout })} title={layout} className={`flex items-center justify-center rounded border p-2 ${selectedNode.layout === layout ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200"}`}><Icon className="h-4 w-4" /></button>; })}</div><div className="grid grid-cols-2 gap-2">{selectedNode.layout === "grid" && <label className="space-y-1 text-[10px] font-bold"><span>Columns</span><Input type="number" min={1} max={6} value={String(selectedNode.columns)} onChange={(event) => patchNode(selectedNode.id, { columns: numericValue(event.target.value, 2) })} className="h-8" /></label>}<label className="space-y-1 text-[10px] font-bold"><span>Gap (mm)</span><Input type="number" min={0} value={String(selectedNode.gap)} onChange={(event) => patchNode(selectedNode.id, { gap: numericValue(event.target.value, 3) })} className="h-8" /></label></div></section>
              )}

              {selectedNode.type === "text" && (
                <section className="space-y-2"><h3 className="text-[10px] font-extrabold uppercase text-slate-400">Rich text</h3><p className="text-[9px] leading-relaxed text-slate-500">Double-click the text on the canvas and select the words you want to format.</p><div className="flex flex-wrap gap-1"><button type="button" aria-label="Bold" title="Bold" disabled={editingTextNodeId !== selectedNode.id} onPointerDown={(event) => event.preventDefault()} onClick={() => applyTextCommand("bold")} className="rounded border px-2 py-1 text-xs font-bold disabled:opacity-40">B</button><button type="button" aria-label="Italic" title="Italic" disabled={editingTextNodeId !== selectedNode.id} onPointerDown={(event) => event.preventDefault()} onClick={() => applyTextCommand("italic")} className="rounded border px-2 py-1 text-xs italic disabled:opacity-40">I</button><button type="button" aria-label="Underline" title="Underline" disabled={editingTextNodeId !== selectedNode.id} onPointerDown={(event) => event.preventDefault()} onClick={() => applyTextCommand("underline")} className="rounded border px-2 py-1 text-xs underline disabled:opacity-40">U</button><button type="button" aria-label="Bulleted list" title="Bulleted list" disabled={editingTextNodeId !== selectedNode.id} onPointerDown={(event) => event.preventDefault()} onClick={() => applyTextCommand("insertUnorderedList")} className="rounded border px-2 py-1 text-xs disabled:opacity-40">List</button>{(["justifyLeft", "justifyCenter", "justifyRight", "justifyFull"] as const).map((command, index) => { const Icon = [AlignLeft, AlignCenter, AlignRight, AlignJustify][index]; const labels = ["Align left", "Align center", "Align right", "Justify"] as const; return <button key={command} type="button" aria-label={labels[index]} title={labels[index]} disabled={editingTextNodeId !== selectedNode.id} onPointerDown={(event) => event.preventDefault()} onClick={() => applyTextCommand(command)} className="rounded border p-1.5 disabled:opacity-40"><Icon className="h-3.5 w-3.5" /></button>; })}</div></section>
              )}

              {selectedNode.type === "image" && (
                <section className="space-y-2"><h3 className="text-[10px] font-extrabold uppercase text-slate-400">Image</h3><input ref={imageReplaceInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) addImageFile(file, undefined, selectedNode.id); event.currentTarget.value = ""; }} /><button type="button" onClick={() => imageReplaceInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-blue-300 bg-blue-50 px-2 py-2 text-[10px] font-bold text-blue-800"><Upload className="h-3.5 w-3.5" /> Browse or replace image</button>{imageError && <p className="rounded bg-red-50 p-2 text-[9px] font-semibold text-red-700">{imageError}</p>}<div><span className="mb-1 block text-[10px] font-bold">Public asset library</span><div className="grid grid-cols-2 gap-1">{PUBLIC_IMAGE_ASSETS.map((asset) => <button key={asset.source} type="button" onClick={() => patchNode(selectedNode.id, { source: asset.source, alt: asset.label })} className={`rounded border px-2 py-1 text-[9px] font-bold ${selectedNode.source === asset.source ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200"}`}>{asset.label}</button>)}</div></div><label className="block space-y-1 text-[10px] font-bold"><span>Public path, HTTPS URL, or uploaded image</span><Input value={selectedNode.source} onChange={(event) => patchNode(selectedNode.id, { source: event.target.value })} placeholder="/images/logo.png" className="h-8 text-xs" /></label><label className="block space-y-1 text-[10px] font-bold"><span>Alternative text</span><Input value={selectedNode.alt} onChange={(event) => patchNode(selectedNode.id, { alt: event.target.value })} className="h-8 text-xs" /></label><div className="grid grid-cols-3 gap-1">{(["contain", "cover", "fill"] as const).map((fit) => <button key={fit} type="button" onClick={() => patchNode(selectedNode.id, { style: { ...selectedNode.style, objectFit: fit } })} className={`rounded border px-1 py-1 text-[9px] font-bold ${selectedNode.style.objectFit === fit ? "border-blue-500 bg-blue-50 text-blue-700" : ""}`}>{fit}</button>)}</div></section>
              )}

              {selectedNode.type === "divider" && (
                <section className="space-y-2 rounded-lg border border-blue-100 bg-blue-50 p-2">
                  <h3 className="text-[10px] font-extrabold uppercase text-blue-800">Line settings</h3>
                  <div className="grid grid-cols-2 gap-1">
                    {(["horizontal", "vertical"] as const).map((orientation) => <button key={orientation} type="button" onClick={() => patchNode(selectedNode.id, { dividerOrientation: orientation, width: orientation === "horizontal" ? Math.max(selectedNode.width, 40) : 6, height: orientation === "vertical" ? Math.max(selectedNode.height, 40) : 6 })} className={`rounded border px-2 py-1 text-[9px] font-bold capitalize ${selectedNode.dividerOrientation === orientation ? "border-blue-500 bg-white text-blue-800" : "border-blue-100"}`}>{orientation}</button>)}
                  </div>
                  <p className="text-[9px] text-blue-700">Resize the component to change line length. Border width below controls line thickness.</p>
                </section>
              )}

              <section className="space-y-3">
                <h3 className="text-[10px] font-extrabold uppercase text-slate-400">Appearance</h3>
                {selectedNode.type === "text" && <label className="block space-y-1 text-[10px] font-bold"><span>Font family</span><select value={selectedNode.style.fontFamily} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, fontFamily: event.target.value } })} className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-[10px]"><option value="Noto Sans Devanagari, Segoe UI, sans-serif">Noto Sans Devanagari</option><option value="Georgia, Times New Roman, serif">Georgia / Times</option><option value="Courier New, monospace">Courier New</option></select></label>}
                <div className="grid grid-cols-2 gap-2">
                  <label className="space-y-1 text-[10px] font-bold"><span>Text color</span><input type="color" value={selectedNode.style.color} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, color: event.target.value } })} className="h-8 w-full" /></label>
                  <label className="space-y-1 text-[10px] font-bold"><span>Opacity</span><Input type="number" min={0} max={1} step={0.1} value={String(selectedNode.style.opacity)} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, opacity: numericValue(event.target.value, 1) } })} className="h-8" /></label>
                  <label className="space-y-1 text-[10px] font-bold"><span>Background</span><input type="color" disabled={selectedNode.style.backgroundColor === "transparent" || selectedNode.type === "divider"} value={selectedNode.style.backgroundColor === "transparent" ? "#ffffff" : selectedNode.style.backgroundColor} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, backgroundColor: event.target.value } })} className="h-8 w-full disabled:opacity-40" /></label>
                  <label className="flex items-end gap-2 pb-1 text-[10px] font-bold"><input type="checkbox" checked={selectedNode.style.backgroundColor === "transparent"} disabled={selectedNode.type === "divider"} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, backgroundColor: event.target.checked ? "transparent" : "#ffffff" } })} /> Transparent fill</label>
                  {selectedNode.type === "text" && <><label className="space-y-1 text-[10px] font-bold"><span>Font size</span><Input type="number" min={6} max={72} value={String(selectedNode.style.fontSize)} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, fontSize: numericValue(event.target.value, 12) } })} className="h-8" /></label><label className="space-y-1 text-[10px] font-bold"><span>Font weight</span><Input type="number" min={100} max={900} step={100} value={String(selectedNode.style.fontWeight)} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, fontWeight: numericValue(event.target.value, 400) } })} className="h-8" /></label><label className="space-y-1 text-[10px] font-bold"><span>Line height</span><Input type="number" min={0.8} max={3} step={0.1} value={String(selectedNode.style.lineHeight)} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, lineHeight: numericValue(event.target.value, 1.4) } })} className="h-8" /></label></>}
                  <label className="space-y-1 text-[10px] font-bold"><span>Radius (mm)</span><Input type="number" min={0} value={String(selectedNode.style.borderRadius)} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, borderRadius: numericValue(event.target.value, 0) } })} className="h-8" /></label>
                  <label className="space-y-1 text-[10px] font-bold"><span>Padding (mm)</span><Input type="number" min={0} value={String(selectedNode.style.padding)} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, padding: numericValue(event.target.value, 0) } })} className="h-8" /></label>
                </div>
                <div className="space-y-2 rounded-lg border border-slate-200 p-2">
                  <label className="flex items-center justify-between text-[10px] font-extrabold"><span>{selectedNode.type === "divider" ? "Show line" : "Show border"}</span><input type="checkbox" checked={selectedNode.style.borderEnabled} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, borderEnabled: event.target.checked } })} /></label>
                  {selectedNode.style.borderEnabled && <div className="grid grid-cols-2 gap-2"><label className="space-y-1 text-[10px] font-bold"><span>Format</span><select value={selectedNode.style.borderStyle} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, borderStyle: event.target.value as CertificateDesignNode["style"]["borderStyle"] } })} className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-[10px]"><option value="solid">Plain</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option><option value="double">Double</option></select></label><label className="space-y-1 text-[10px] font-bold"><span>Width (mm)</span><Input type="number" min={0.1} step={0.1} value={String(selectedNode.style.borderWidth)} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, borderWidth: numericValue(event.target.value, 0.5) } })} className="h-8" /></label><label className="col-span-2 space-y-1 text-[10px] font-bold"><span>Color</span><input type="color" value={selectedNode.style.borderColor} onChange={(event) => patchNode(selectedNode.id, { style: { ...selectedNode.style, borderColor: event.target.value } })} className="h-8 w-full" /></label></div>}
                </div>
              </section>

              {issues.filter((issue) => issue.nodeId === selectedNode.id).map((issue) => <div key={issue.message} className={`rounded-md p-2 text-[10px] font-semibold ${issue.severity === "error" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>{issue.message}</div>)}
            </div>
          )}
        </aside>
      </div>

      <Modal open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} maxWidth="2xl" title="Certificate preview" subtitle={editorMode === "template" ? templateName : `${departmentName} / ${serviceName}`} footer={<div className="flex gap-2"><Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>Close</Button><Button variant="primary" onClick={printPreview}>Print A4</Button></div>}>
        <div className="max-h-[75vh] overflow-auto bg-slate-200 p-6"><div className="mx-auto bg-white shadow-xl" style={{ width: "210mm", minHeight: "297mm" }} dangerouslySetInnerHTML={{ __html: compiledHtml }} /></div>
      </Modal>
      <Modal open={Boolean(pendingDeleteNodeId)} onClose={() => setPendingDeleteNodeId(null)} maxWidth="sm" title="Delete component?" subtitle="This removes the component and every nested child from the certificate design." footer={<div className="flex gap-2"><Button variant="secondary" onClick={() => setPendingDeleteNodeId(null)}>Cancel</Button><Button variant="primary" className="bg-red-600 hover:bg-red-700" onClick={() => { if (pendingDeleteNodeId) deleteNode(pendingDeleteNodeId); setPendingDeleteNodeId(null); }}>Delete component</Button></div>}>
        <p className="text-sm text-slate-700">Delete <strong>{pendingDeleteNodeId ? history.document.nodes[pendingDeleteNodeId]?.name : "this component"}</strong>? This action can be reversed with Undo.</p>
      </Modal>
    </div>
  );
}
