import { ValueDisplay } from './components/ValueDisplay';
import { Building2, FileText } from 'lucide-react';
import FieldShell from '@/components/common/FieldShell';
import type { PropertyDetailsData } from '@/types/ptis.types';
import { useTranslations } from 'next-intl';

export interface PropertyDetailsTabProps {
  data: PropertyDetailsData;
}

const PropertyDetailsTab = ({ data }: PropertyDetailsTabProps) => {
  const t = useTranslations('ptis');

  return (
    <div className="p-0.5">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-0.5">
        {/* Row 1 */}
        <FieldShell
          id="division"
          label={t('fields.division')}
          icon={Building2}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.division} />
        </FieldShell>

        <FieldShell
          id="category"
          label={t('fields.category')}
          icon={Building2}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.category} />
        </FieldShell>

        <FieldShell
          id="wingNo"
          label={t('fields.wing')}
          icon={Building2}
          className="col-span-1 lg:col-span-1"
        >
          <ValueDisplay value={data.wingName || data.wingNo} />
        </FieldShell>

        <FieldShell
          id="flatOrShopNo"
          label={t('fields.flatNoShopNo')}
          icon={Building2}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.flatOrShopNo} />
        </FieldShell>

        <FieldShell
          id="plotNo"
          label={
            <>
              <FileText className="w-2.5 h-2.5 inline mr-0.5 text-blue-600" />
              {t('fields.plotNo')}
            </>
          }
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.plotNo} />
        </FieldShell>

        <FieldShell
          id="plotArea"
          label={t('fields.plotArea')}
          icon={Building2}
          className="col-span-1 lg:col-span-1"
        >
          <ValueDisplay value={data.plotArea} />
        </FieldShell>

        <FieldShell
          id="taxZoneNo"
          label={t('fields.taxZoneNo')}
          icon={Building2}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.taxZoneNo} />
        </FieldShell>

        {/* Row 2 */}
        <FieldShell
          id="moujaDescription"
          label={t('fields.moujaDescription')}
          icon={FileText}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.moujaDescription} />
        </FieldShell>

        <FieldShell
          id="surveyNo"
          label={
            <>
              <FileText className="w-2.5 h-2.5 inline mr-0.5 text-blue-600" />
              {t('fields.surveyNo')}
            </>
          }
          className="col-span-1 sm:col-span-2 lg:col-span-1"
        >
          <ValueDisplay value={data.surveyNo} />
        </FieldShell>

        <FieldShell
          id="subZoneNo"
          label={t('fields.subZoneNo')}
          icon={Building2}
          className="col-span-1 sm:col-span-2 lg:col-span-1"
        >
          <ValueDisplay value={data.subZoneNo} />
        </FieldShell>

        <FieldShell
          id="residentialToilet"
          label={t('fields.residentialToilet')}
          icon={Building2}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.noOfResidentialToilets} />
        </FieldShell>

        <FieldShell
          id="commercialToilet"
          label={t('fields.commercialToilet')}
          icon={Building2}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.noOfCommercialToilets} />
        </FieldShell>

        <FieldShell
          id="totalCarpetArea"
          label={t('fields.totalCarpetAreaWithUnit')}
          className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2"
        >
          <ValueDisplay value={data.totalCarpetArea} />
        </FieldShell>

        <FieldShell
          id="builtupArea"
          label={t('fields.builtupAreaWithUnit')}
          className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2"
        >
          <ValueDisplay value={data.builtupArea} />
        </FieldShell>
      </div>
    </div>
  );
};

export default PropertyDetailsTab;
