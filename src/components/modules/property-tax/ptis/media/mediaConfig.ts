import type { AdditionalImage } from './MediaImageCards';

/**
 * Helper to generate localized additional images collection.
 */
export function getAdditionalImages(t: (key: string) => string): AdditionalImage[] {
  return [
    {
      src: '',
      fullSrc: '',
      alt: t('media.rearElevation'),
      title: t('media.rearElevation'),
      photoTypeCode: 'BACK',
    },
    {
      src: '',
      fullSrc: '',
      alt: t('media.livingRoom'),
      title: t('media.livingRoom'),
      photoTypeCode: 'LIVING',
    },
    {
      src: '',
      fullSrc: '',
      alt: t('media.kitchen'),
      title: t('media.kitchen'),
      photoTypeCode: 'KITCHEN',
    },
    {
      src: '',
      fullSrc: '',
      alt: t('media.bedroom'),
      title: t('media.bedroom'),
      photoTypeCode: 'BEDROOM',
    },
    {
      src: '',
      fullSrc: '',
      alt: t('media.bathroom'),
      title: t('media.bathroom'),
      photoTypeCode: 'BATHROOM',
    },
    {
      src: '',
      fullSrc: '',
      alt: t('media.balcony'),
      title: t('media.balcony'),
      photoTypeCode: 'BALCONY',
    },
    {
      src: '',
      fullSrc: '',
      alt: t('media.terraceView'),
      title: t('media.terraceView'),
      photoTypeCode: 'TERRACE',
    },
    {
      src: '',
      fullSrc: '',
      alt: t('media.parkingView'),
      title: t('media.parkingView'),
      photoTypeCode: 'PARKING',
    },
  ];
}

/**
 * Helper to get the full gallery images collection.
 */
export function getGalleryImages(t: (key: string) => string): AdditionalImage[] {
  return [
    {
      src: '',
      fullSrc: '',
      alt: t('media.frontElevation'),
      title: t('media.frontElevation'),
      photoTypeCode: 'FRONT',
    },
    {
      src: '',
      fullSrc: '',
      alt: t('media.floorPlan'),
      title: t('media.floorPlan'),
      photoTypeCode: 'FLOOR',
    },
    {
      src: '',
      fullSrc: '',
      alt: t('media.satelliteTitle'),
      title: t('media.satelliteTitle'),
      photoTypeCode: 'GIS',
    },
    ...getAdditionalImages(t),
  ];
}
