import { default as SocialAttributeForm } from '@/components/modules/property-tax/social-attribute-master/SocialAttributeForm';
import { fetchAllActiveSocialAttributesAction } from '../action';
import React from 'react';

export default async function AddPage(): Promise<React.ReactElement> {
  const activeAttributes = await fetchAllActiveSocialAttributesAction();
  return (
    <SocialAttributeForm id={null} initialData={undefined} parentAttributes={activeAttributes} />
  );
}
