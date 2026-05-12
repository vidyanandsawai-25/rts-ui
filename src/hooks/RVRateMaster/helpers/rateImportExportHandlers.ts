import { toast } from "sonner";
import type { IZoneDescription, RateCategory } from "@/types/RVRateMaster";
import {
  generateCsvTemplate,
  downloadFile,
  parseCsvContent,
  applyImportedEditsToMatrix,
  validateFileType,
} from "./index";

type MatrixRow = {
  id: number;
  zone?: string;
  zoneNo?: string;
  taxZoneId?: number;
  [key: string]: number | string | undefined;
};

interface TemplateDownloadParams {
  selectedZone: string;
  selectedUseGroup: string;
  assessmentYear: string;
  allZones: IZoneDescription[];
  rateCategories: RateCategory[];
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

export function handleTemplateDownload(params: TemplateDownloadParams) {
  const { selectedZone, selectedUseGroup, assessmentYear, allZones, rateCategories, t } = params;

  if (!assessmentYear) {
    toast.error(t('messages.selectAssessmentYearRange'));
    return;
  }
  if (!selectedZone) {
    toast.error(t('messages.selectRateSection'));
    return;
  }
  if (!selectedUseGroup) {
    toast.error(t('messages.selectUseGroup'));
    return;
  }
  if (!allZones || !Array.isArray(allZones)) {
    toast.error('Zones data not available for template.');
    return;
  }
  
  try {
    const csvContent = generateCsvTemplate(allZones, rateCategories);
    const filename = `rate-master-template-${selectedZone}-${selectedUseGroup}.csv`;
    downloadFile(csvContent, filename);
    toast.success('Template downloaded successfully!');
  } catch (_error) {
    toast.error('Failed to download template');
  }
}

interface FileUploadParams {
  allZones: IZoneDescription[];
  rateCategories: RateCategory[];
  matrixData: MatrixRow[];
  allZoneEdits: Record<string, Record<string, number>>;
  showMatrix: boolean;
  setMatrixData: (data: MatrixRow[]) => void;
  setAllZoneEdits: (edits: Record<string, Record<string, number>>) => void;
  setShowMatrix: (show: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

export function handleFileUpload(
  event: React.ChangeEvent<HTMLInputElement>,
  params: FileUploadParams
) {
  const { allZones, rateCategories, matrixData, allZoneEdits, showMatrix, setMatrixData, setAllZoneEdits, setShowMatrix, fileInputRef, t } = params;

  const file = event.target.files?.[0];
  if (!file) return;

  if (!validateFileType(file)) {
    toast.error(t('messages.csvOnly'));
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const text = e.target?.result as string;
      const { zoneEdits, importedRateCount } = parseCsvContent(text, allZones, rateCategories);
      
      const newEdits: Record<string, Record<string, number>> = { ...allZoneEdits, ...zoneEdits };
      setAllZoneEdits(newEdits);

      const updatedMatrix = applyImportedEditsToMatrix(matrixData, zoneEdits);
      setMatrixData(updatedMatrix);
      
      toast.success(t('messages.importedRecordsSuccess', { count: importedRateCount }));
      
      if (!showMatrix) {
        setShowMatrix(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('messages.validationParseFailed'));
      }
    }
  };

  reader.onerror = () => {
    toast.error(t('messages.validationReadFileFailed'));
  };

  reader.readAsText(file);
  
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
}
