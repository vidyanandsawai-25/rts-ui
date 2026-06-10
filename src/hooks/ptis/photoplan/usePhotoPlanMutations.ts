import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  uploadPropertyPhotoAction,
  replacePropertyPhotoAction,
  deletePropertyPhotoAction,
} from '@/app/[locale]/property-tax/ptis/PhotoPlan.action';
import { getViewDocumentUrl } from '@/lib/utils/document-utils';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';
import type { AdditionalImage } from '@/components/modules/property-tax/ptis/media/MediaImageCards';
import { useConfirm } from '@/components/common';

export interface UsePhotoPlanMutationsProps {
  propertyId?: number;
  categories: PhotoCategory[];
  onCategoriesChange: (categories: PhotoCategory[]) => void;
  selectedCategoryIndex: number;
  selectedImageIndex: number | null;
  setSelectedImageIndex: (index: number | null) => void;
  viewMode: 'grid' | 'viewer';
  setViewMode: (mode: 'grid' | 'viewer') => void;
}

function patchCategory(cats: PhotoCategory[], idx: number, images: AdditionalImage[]): PhotoCategory[] {
  return cats.map((c, i) => (i === idx ? { ...c, images, photoCount: images.length } : c));
}

function sortByOrder(imgs: AdditionalImage[]): AdditionalImage[] {
  return [...imgs].sort((a, b) => {
    const diff = (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
    if (diff !== 0) return diff;
    return (a.propertyPhotoId ?? 0) - (b.propertyPhotoId ?? 0);
  });
}

export function usePhotoPlanMutations({
  propertyId, categories, onCategoriesChange,
  selectedCategoryIndex, selectedImageIndex, setSelectedImageIndex, setViewMode,
}: UsePhotoPlanMutationsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm } = useConfirm();
  const [isNamingOpen, setIsNamingOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isReplacement, setIsReplacement] = useState(false);
  const [activeIndexToReplace, setActiveIndexToReplace] = useState<number | null>(null);

  const activeCategory = categories[selectedCategoryIndex];

  const handleAddPhoto = useCallback(() => {
    setIsReplacement(false);
    setIsNamingOpen(true);
  }, []);

  const handleReplacePhoto = useCallback((index: number) => {
    setActiveIndexToReplace(index);
    setIsReplacement(true);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;
    const file = e.target.files?.[0];
    if (!file || activeIndexToReplace === null || !activeCategory) return;
    const targetImg = activeCategory.images[activeIndexToReplace];
    const propertyPhotoId = targetImg?.propertyPhotoId;
    if (!propertyPhotoId) return;
    e.target.value = '';
    if (!propertyId) { toast.error('PropertyId is required to upload files.'); return; }

    confirm({
      title: 'Replace Photo',
      description: `Are you sure you want to replace "${targetImg.title}" with "${file.name}"?`,
      onConfirm: async () => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('File', file);
        formData.append('Remarks', targetImg.remarks || targetImg.title);
        try {
          const res = await replacePropertyPhotoAction(propertyPhotoId, formData);
          if (res.success && res.data) {
            const url = res.data.viewUrl || getViewDocumentUrl(res.data.documentGuid);
            const updated = activeCategory.images.map((img: AdditionalImage, i: number) => i === activeIndexToReplace ? { ...img, src: url, fullSrc: url } : img);
            onCategoriesChange(patchCategory(categories, selectedCategoryIndex, updated));
            toast.success('Photo replaced successfully');
          } else { toast.error(res.error || 'Failed to replace photo'); }
        } catch { toast.error('An unexpected error occurred.'); }
        finally { setIsUploading(false); }
      },
    });
  }, [activeIndexToReplace, activeCategory, categories, selectedCategoryIndex, onCategoriesChange, propertyId, confirm, isUploading]);

  const handleNamingSubmit = useCallback(async (
    name: string, displayOrder: number, photoTypeId: number, file?: File, remarks?: string,
  ) => {
    if (isUploading) return;
    if (!activeCategory) return;
    const combinedRemarks = remarks ? `${name} | ${remarks}` : name;

    if (!file) { toast.error('Photo file is required'); return; }
    if (!propertyId) { toast.error('PropertyId is required to upload files.'); setIsNamingOpen(false); return; }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('File', file);
    formData.append('PropertyId', propertyId.toString());
    formData.append('PhotoTypeId', photoTypeId.toString());
    formData.append('DisplayOrder', displayOrder.toString());
    formData.append('Remarks', combinedRemarks);
    try {
      const res = await uploadPropertyPhotoAction(formData);
      if (res.success && res.data) {
        const url = res.data.viewUrl || getViewDocumentUrl(res.data.documentGuid);
        const newImg: AdditionalImage = {
          src: url, fullSrc: url, alt: name, title: name,
          photoTypeId, propertyPhotoId: res.data.propertyPhotoId,
          photoTypeCode: activeCategory.photoTypeCode,
          hasPhoto: true, remarks: remarks || '', displayOrder,
        };
        onCategoriesChange(patchCategory(categories, selectedCategoryIndex, sortByOrder([...activeCategory.images, newImg])));
        toast.success('Photo uploaded successfully');
      } else { toast.error(res.error || 'Failed to upload photo'); }
    } catch { toast.error('An unexpected error occurred.'); }
    finally { setIsUploading(false); }
    setIsNamingOpen(false);
  }, [activeCategory, categories, selectedCategoryIndex, onCategoriesChange, propertyId, isUploading]);

  const handleDeletePhoto = useCallback(async (indexToDelete: number) => {
    if (isUploading) return;
    if (!activeCategory) return;
    const imgToDelete = activeCategory.images[indexToDelete];
    if (propertyId && imgToDelete?.propertyPhotoId) {
      setIsUploading(true);
      try {
        const res = await deletePropertyPhotoAction(imgToDelete.propertyPhotoId);
        if (!res.success) { toast.error(res.error || 'Failed to delete photo'); setIsUploading(false); return; }
        toast.success('Photo deleted successfully');
      } catch { toast.error('An unexpected error occurred.'); setIsUploading(false); return; }
      finally { setIsUploading(false); }
    }
    const updatedImages = activeCategory.images.filter((_: AdditionalImage, idx: number) => idx !== indexToDelete);
    onCategoriesChange(patchCategory(categories, selectedCategoryIndex, updatedImages));
    if (selectedImageIndex === indexToDelete) { setSelectedImageIndex(null); setViewMode('grid'); }
    else if (selectedImageIndex !== null && selectedImageIndex > indexToDelete) { setSelectedImageIndex(selectedImageIndex - 1); }
  }, [activeCategory, categories, selectedCategoryIndex, onCategoriesChange, propertyId, selectedImageIndex, setSelectedImageIndex, setViewMode, isUploading]);

  return {
    fileInputRef, isNamingOpen, setIsNamingOpen, isUploading,
    isReplacement,
    handleAddPhoto, handleReplacePhoto,
    handleFileChange, handleNamingSubmit, handleDeletePhoto,
  };
}
