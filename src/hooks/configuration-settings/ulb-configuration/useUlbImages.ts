'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  deleteUlbImageAction,
  updateUlbImageTypeAction,
  uploadUlbImageAction,
  replaceUlbImageAction,
} from '@/app/[locale]/configuration-settings/ulb-configuration/actions';
import { clearDocumentCacheEntry } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';
import type { ULBImage, UlbImageMasterDto } from '@/types/ulbconfig-master.types';

export function useUlbImages(initialImages: UlbImageMasterDto[], onLogoChange: (url: string | null) => void) {
  const [images, setImages] = useState<ULBImage[]>(() =>
    initialImages.map((img) => ({
      id: String(img.id),
      url: `/api/UlbImageMaster/${img.documentGuid}/view`,
      name: img.imageType || `Image-${img.id}`,
      size: 0,
      isBackgroundImage: img.imageType?.toLowerCase().includes('background') || false,
      uploadedDate: img.createdDate || new Date().toISOString(),
      documentId: img.imageId || undefined,
    }))
  );
  const [isUploading, setIsUploading] = useState(false);

  const deleteImage = useCallback(async (id: string, category: 'Logo' | 'Background' | 'Gallery') => {
    const toastId = toast.loading('Deleting image...');
    try {
      const res = await deleteUlbImageAction(Number(id));
      if (!res.success) throw new Error(res.error || 'Delete failed');
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (category === 'Logo') onLogoChange(null);
      toast.success('Image deleted successfully', { id: toastId });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      toast.error(message, { id: toastId });
    }
  }, [onLogoChange]);

  const setAsBackground = useCallback(async (id: string) => {
    const target = images.find((img) => img.id === id);
    if (!target) return;
    const prevBg = images.find((img) => img.name === 'Background' || img.isBackgroundImage);
    const toastId = toast.loading('Updating background...');
    try {
      const res1 = await updateUlbImageTypeAction(Number(id), 'Background', target.documentId || 0);
      if (!res1.success) throw new Error(res1.error || 'Update failed');

      if (prevBg) {
        await updateUlbImageTypeAction(Number(prevBg.id), 'BackgroundLibrary', prevBg.documentId || 0);
      }

      setImages((prev) =>
        prev.map((img) => {
          if (img.id === id) return { ...img, isBackgroundImage: true, name: 'Background' };
          if (prevBg && img.id === prevBg.id) return { ...img, isBackgroundImage: false, name: 'BackgroundLibrary' };
          return img;
        })
      );
      toast.success('Background updated successfully', { id: toastId });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      toast.error(message, { id: toastId });
    }
  }, [images]);

  const uploadOrReplaceImage = useCallback(
    async (mode: 'upload' | 'replace', category: 'Logo' | 'Background' | 'Gallery', file: File | null, replaceId: string | null) => {
      if (!file) return toast.error('Please select an image file');
      if (file.size > 5 * 1024 * 1024) return toast.error('File size exceeds 5MB limit');

      const targetType = category === 'Background' ? 'Background' : category;
      setIsUploading(true);
      const toastId = toast.loading(mode === 'replace' ? 'Replacing image...' : 'Uploading image...');

      try {
        const formData = new FormData();
        formData.append('File', file);

        if (mode === 'upload') {
          formData.append('ImageType', targetType);
          const res = await uploadUlbImageAction(formData);
          if (!res.success || !res.data) throw new Error(res.error || 'Upload failed');

          const newImg: ULBImage = {
            id: String(res.data.ulbImageMasterId),
            url: `/api/UlbImageMaster/${res.data.documentGuid}/view`,
            name: targetType,
            size: file.size,
            isBackgroundImage: targetType === 'Background',
            uploadedDate: new Date().toISOString(),
            documentId: res.data.documentId,
          };

          let prevBgId = null;
          if (category === 'Background') {
            const prevBg = images.find((i) => i.name === 'Background' || i.isBackgroundImage);
            if (prevBg) {
              prevBgId = prevBg.id;
              await updateUlbImageTypeAction(Number(prevBg.id), 'BackgroundLibrary', prevBg.documentId || 0);
            }
          }

          setImages((prev) =>
            prev.map((i) => i.id === prevBgId ? { ...i, name: 'BackgroundLibrary', isBackgroundImage: false } : i).concat(newImg)
          );
          if (category === 'Logo') onLogoChange(newImg.url);
          toast.success('Image uploaded successfully', { id: toastId });
        } else {
          if (!replaceId) throw new Error('Replace target id missing');
          const target = images.find((i) => i.id === replaceId);
          if (!target) throw new Error('Target image not found');

          const res = await replaceUlbImageAction(Number(replaceId), formData);
          if (!res.success || !res.data) throw new Error(res.error || 'Replace failed');

          const newUrl = `/api/UlbImageMaster/${res.data.documentGuid}/view`;
          if (target.url) clearDocumentCacheEntry(target.url);

          const upRes = await updateUlbImageTypeAction(Number(replaceId), targetType, res.data.documentId);
          if (!upRes.success) throw new Error(upRes.error || 'Update category failed');

          setImages((prev) =>
            prev.map((i) =>
              i.id === replaceId
                ? { ...i, url: newUrl, name: targetType, size: file.size, isBackgroundImage: targetType === 'Background', documentId: res.data?.documentId }
                : i
            )
          );
          if (category === 'Logo') {
            onLogoChange(newUrl);
          } else if (target.name === 'Logo') {
            onLogoChange(null);
          }
          toast.success('Image replaced successfully', { id: toastId });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Operation failed';
        toast.error(message, { id: toastId });
      } finally {
        setIsUploading(false);
      }
    },
    [images, onLogoChange]
  );

  return { images, isUploading, deleteImage, setAsBackground, uploadOrReplaceImage };
}
