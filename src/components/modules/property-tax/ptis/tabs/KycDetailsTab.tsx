import { ValueDisplay } from './components/ValueDisplay';
import { User, UserCheck, FileText, Phone, Mail, Building2 } from 'lucide-react';
import FieldShell from '@/components/common/FieldShell';
import type { KYCDetailsData } from '@/types/ptis.types';
import { useTranslations } from 'next-intl';

export interface KycDetailsTabProps {
  data: KYCDetailsData;
}

const KycDetailsTab = ({ data }: KycDetailsTabProps) => {
  const t = useTranslations('ptis');

  return (
    <div className="p-0.5">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-0.5">
        {/* Row 1: Owner Type, Title, Property Holder Name, Occupier Name, Shop Name, Building Name */}
        <FieldShell
          id="ownerType"
          label={t('fields.ownerType')}
          icon={User}
          className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-2 2xl:col-span-1"
        >
          <ValueDisplay value={data.ownerType} />
        </FieldShell>

        <FieldShell
          id="title"
          label={t('fields.title')}
          icon={User}
          className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-2 2xl:col-span-1"
        >
          <ValueDisplay value={data.title} />
        </FieldShell>

        <FieldShell
          id="propertyHolderName"
          icon={UserCheck}
          className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-4 2xl:col-span-4"
          label={t('fields.propertyHolderName')}
        >
          <ValueDisplay value={data.propertyHolderName} />
        </FieldShell>

        <FieldShell
          id="occupierName"
          icon={UserCheck}
          className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-4 2xl:col-span-4"
          label={t('fields.occupierName')}
        >
          <ValueDisplay value={data.occupierName} />
        </FieldShell>

        <FieldShell
          id="shopName"
          label={t('fields.shopName')}
          icon={Building2}
          className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-3 2xl:col-span-2"
        >
          <ValueDisplay value={data.shopName} />
        </FieldShell>

        {/* Row 2: Building Name, Aadhar, Mobile, Email, Address */}
        <FieldShell
          id="buildingName"
          label={t('fields.buildingName')}
          icon={Building2}
          className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-3 2xl:col-span-2"
        >
          <ValueDisplay value={data.buildingName} />
        </FieldShell>
        <FieldShell
          id="aadharCardNo"
          label={t('fields.aadharCardNo')}
          icon={FileText}
          className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-3 2xl:col-span-1"
        >
          <ValueDisplay value={data.aadharCardNo} />
        </FieldShell>

        <FieldShell
          id="mobileNumber"
          label={t('fields.mobileNumber')}
          icon={Phone}
          className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-3 2xl:col-span-1"
        >
          <ValueDisplay value={data.mobileNumber} />
        </FieldShell>

        <FieldShell
          id="emailId"
          label={t('fields.emailId')}
          icon={Mail}
          className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-4 2xl:col-span-2"
        >
          <ValueDisplay value={data.email} />
        </FieldShell>

        <FieldShell
          id="address"
          label={t('fields.address')}
          icon={Building2}
          className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-8 2xl:col-span-6"
        >
          <ValueDisplay value={data.address} />
        </FieldShell>
      </div>
    </div>
  );
};

export default KycDetailsTab;
