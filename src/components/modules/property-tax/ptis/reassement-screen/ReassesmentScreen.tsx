'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImageWithFallback } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';
import {
  TrendingUp,
  FileText,
  Layers,
} from 'lucide-react';
import {
  MasterTable,
  RetrospectiveDetailsButton,
  Section129Button,
} from '@/components/common';
import { RetrospectiveTaxModal } from './RetrospectiveTaxModal';
import { Section129Modal } from './Section129Modal';
import { OldFloorDetails } from './components/OldFloorDetails';
import { NewFloorDetails } from './components/NewFloorDetails';
import { TaxSummaryCards } from './components/TaxSummaryCards';
import type {
  MappedFloorDetail,
  ReassessmentTaxRow,
  MappedRetrospectiveColumn,
  MappedRetrospectiveRow,
  ReassessmentPhoto,
} from '@/types/reassessment.types';
import { useReassessmentSummaryCards } from '@/hooks/ptis/reassessment/useReassessmentSummaryCards';
import { useReassessmentTaxTable } from '@/hooks/ptis/reassessment/useReassessmentTaxTable';
import { useReassessmentAutoScroll } from '@/hooks/ptis/reassessment/useReassessmentAutoScroll';
import { useSynchronizedScrolling } from '@/hooks/ptis/reassessment/useSynchronizedScrolling';
import { cn } from '@/lib/utils/cn';

// ============================================
// INTERFACES
// ============================================

interface TaxColumn {
  key: string;
  label: string;
  displayOrder: number;
}

interface ReassesmentScreenProps {
  oldFloorDetails?: MappedFloorDetail[];
  newFloorDetails?: MappedFloorDetail[];
  taxColumns?: TaxColumn[];
  taxRows?: ReassessmentTaxRow[];
  retrospectiveTaxColumns?: MappedRetrospectiveColumn[];
  retrospectiveTaxRows?: MappedRetrospectiveRow[];
  retrospectiveError?: string;
  photos?: ReassessmentPhoto[];
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ReassesmentScreen({
  oldFloorDetails = [],
  newFloorDetails = [],
  taxColumns = [],
  taxRows = [],
  retrospectiveTaxColumns = [],
  retrospectiveTaxRows = [],
  retrospectiveError,
  photos = [],
}: ReassesmentScreenProps) {
  // Translations
  const t = useTranslations('reassessment');
  
  // Modal states
  const [showRetroModal, setShowRetroModal] = useState(false);
  const [showSec129Modal, setShowSec129Modal] = useState(false);

  // Auto scrolling states
  const [isOldAutoScrolling, setIsOldAutoScrolling] = useState(false);
  const [isNewAutoScrolling, setIsNewAutoScrolling] = useState(false);

  // ============================================
  // HOOKS
  // ============================================
  useReassessmentAutoScroll({
    isAutoScrolling: isOldAutoScrolling,
    containerId: '#old-table-container',
  });
  useReassessmentAutoScroll({
    isAutoScrolling: isNewAutoScrolling,
    containerId: '#new-table-container',
  });

  const summaryCardsData = useReassessmentSummaryCards({
    oldFloorDetails,
    newFloorDetails,
    taxRows,
    t,
  });

  const { detailedTaxesColumns, detailedTaxesData } = useReassessmentTaxTable({
    taxColumns,
    taxRows,
  });
  
  const { oldTableRef, newTableRef } = useSynchronizedScrolling();

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="w-full bg-[#f8fafc] p-4 flex flex-col gap-6 rounded-xl border border-gray-200">
      {/* ==========================================
      TOP PANELS CONTAINER
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ==========================================
        LEFT PANEL: Municipal Registration
        ========================================== */}
        <div className="bg-white rounded-xl shadow-md border border-sky-100 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-sky-900 text-sm md:text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-600" />
              {t('sectionHeaders.municipalRegistration')}
            </h3>
          </div>

          <div className="p-4 flex flex-col gap-4 flex-grow">
            {/* Photos */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 mb-2">
                {t('photoLabels.photoAsPerOld')}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {(() => {
                  const oldPropertyPhoto = photos.find(
                    (p) => p.type === 'OLD_PROPERTY_PHOTO'
                  );
                  const oldPlanPhoto = photos.find((p) => p.type === 'OLD_PLAN_PHOTO');
                  return (
                    <>
                      <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[16/10] bg-gray-100 flex items-center justify-center">
                        {oldPropertyPhoto ? (
                          <ImageWithFallback
                            src={`/api/documents/${oldPropertyPhoto.documentGuid}/view`}
                            alt={t('photoLabels.oldPropertyPhoto')}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">{t('photoLabels.oldPropertyPhoto')}</span>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                          {t('photoLabels.oldPropertyPhoto')}
                        </div>
                      </div>
                      <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[16/10] bg-[#0f2342] flex items-center justify-center">
                        {oldPlanPhoto ? (
                          <ImageWithFallback
                            src={`/api/documents/${oldPlanPhoto.documentGuid}/view`}
                            alt={t('photoLabels.oldPlanPhoto')}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-gray-300 text-xs">{t('photoLabels.oldPlanPhoto')}</span>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                          {t('photoLabels.oldPlanPhoto')}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Old Floor Details */}
            <OldFloorDetails
              scrollContainerRef={oldTableRef}
              data={oldFloorDetails}
              isAutoScrolling={isOldAutoScrolling}
              onToggleAutoScroll={() => setIsOldAutoScrolling(!isOldAutoScrolling)}
            />
          </div>
        </div>

        {/* ==========================================
        RIGHT PANEL: New Survey
        ========================================== */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-blue-900 text-sm md:text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              {t('sectionHeaders.newSurvey')}
            </h3>
          </div>

          <div className="p-4 flex flex-col gap-4 flex-grow">
            {/* Photos */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 mb-2">
                {t('photoLabels.photoAsPerNew')}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {(() => {
                  const newPropertyPhoto = photos.find(
                    (p) => p.type === 'NEW_PROPERTY_PHOTO'
                  );
                  const newPlanPhoto = photos.find((p) => p.type === 'NEW_PLAN_PHOTO');
                  return (
                    <>
                      <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[16/10] bg-gray-100 flex items-center justify-center">
                        {newPropertyPhoto ? (
                          <ImageWithFallback
                            src={`/api/documents/${newPropertyPhoto.documentGuid}/view`}
                            alt={t('photoLabels.newPropertyPhoto')}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">{t('photoLabels.newPropertyPhoto')}</span>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                          {t('photoLabels.newPropertyPhoto')}
                        </div>
                      </div>
                      <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[16/10] bg-gray-100 flex items-center justify-center">
                        {newPlanPhoto ? (
                          <ImageWithFallback
                            src={`/api/documents/${newPlanPhoto.documentGuid}/view`}
                            alt={t('photoLabels.newPlanPhoto')}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">{t('photoLabels.newPlanPhoto')}</span>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                          {t('photoLabels.newPlanPhoto')}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* New Floor Details */}
            <NewFloorDetails
              scrollContainerRef={newTableRef}
              data={newFloorDetails}
              isAutoScrolling={isNewAutoScrolling}
              onToggleAutoScroll={() => setIsNewAutoScrolling(!isNewAutoScrolling)}
            />
          </div>
        </div>
      </div>

      {/* ==========================================
      BOTTOM PANEL: Tax Details & Reassessment Summary
      ========================================== */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <h3 className="font-bold text-sky-950 text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-600" />
            {t('sectionHeaders.taxDetails')}
          </h3>
          <div className="flex gap-2">
            <RetrospectiveDetailsButton
              onClick={() => setShowRetroModal(true)}
              label={t('buttons.retrospectiveDetails')}
              className="font-bold active:scale-98 shadow-sm"
            />
            <Section129Button
              onClick={() => setShowSec129Modal(true)}
              label={t('buttons.section129')}
              hidden
              className="font-bold active:scale-98 shadow-sm"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <TaxSummaryCards cards={summaryCardsData} />

        {/* Detailed Taxes Table Grid - Dynamic */}
        {detailedTaxesData.length > 0 && (
          <div className="min-w-0">
            <MasterTable
              columns={detailedTaxesColumns}
              data={detailedTaxesData}
              paginationConfig={{ enabled: false }}
              tableClassName="w-full border-collapse text-left text-xs"
              theadClassName="bg-slate-50 text-slate-900 font-bold border-b border-gray-200 text-center [&_th]:whitespace-nowrap [&_th]:p-3 [&_th]:border-r [&_th]:border-gray-200"
              rowClassName={(row) =>
                cn(
                  'divide-y divide-gray-200 text-gray-700 font-semibold [&_td]:p-1.5 [&_td]:border-r [&_td]:border-gray-200',
                  row.isTotal ? 'bg-blue-50 [&_td]:border-blue-100' : 'hover:bg-slate-50/50'
                )
              }
            />
          </div>
        )}
      </div>

      {/* ==========================================
      MODALS
      ========================================== */}

      {/* Retrospective Tax Details Modal */}
      <RetrospectiveTaxModal
        open={showRetroModal}
        onClose={() => setShowRetroModal(false)}
        columns={retrospectiveTaxColumns}
        rows={retrospectiveTaxRows}
        error={retrospectiveError}
      />

      {/* Section 129 Progressive Calc Modal */}
      <Section129Modal
        open={showSec129Modal}
        onClose={() => setShowSec129Modal(false)}
      />
    </div>
  );
}
