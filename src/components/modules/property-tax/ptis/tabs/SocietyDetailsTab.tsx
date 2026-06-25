import { ValueDisplay } from './components/ValueDisplay';
import { Building2, Mail, Phone, User, MessageCircle } from 'lucide-react';
import FieldShell from '@/components/common/FieldShell';
import type { SocietyDetailsData } from '@/types/ptis.types';
import { useTranslations } from 'next-intl';

export interface SocietyDetailsTabProps {
  data: SocietyDetailsData;
}

const SocietyDetailsTab = ({ data }: SocietyDetailsTabProps) => {
  const t = useTranslations('ptis');

  return (
    <div className="p-0.5">
      <div className={'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-0.5'}>
        {/* Row 1 */}

        <FieldShell
          id="landOwner"
          label={t('fields.landOwner')}
          icon={User}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.landOwner} />
        </FieldShell>

        <FieldShell
          id="builderName"
          icon={Building2}
          label={t('fields.builderName')}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.builderName} />
        </FieldShell>

        <FieldShell
          id="buildingSocietyName"
          icon={Building2}
          label={t('fields.societyName')}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.buildingSocietyName} />
        </FieldShell>

        <FieldShell
          id="societyEmailMain"
          icon={Mail}
          label={t('fields.societyEmail')}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.societyEmailMain} />
        </FieldShell>
        <FieldShell
          id="secretaryName"
          icon={User}
          label={t('fields.secretaryName')}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.secretaryName} />
        </FieldShell>

        <FieldShell
          id="secretaryMobileNo"
          icon={Phone}
          label={t('fields.secretaryMobile')}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.secretaryMobileNo} prefixIcon={MessageCircle} />
        </FieldShell>

        {/* Row 2 */}

        <FieldShell
          id="secretaryEmail"
          icon={Mail}
          label={t('fields.secretaryEmail')}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.secretaryEmail} />
        </FieldShell>

        <FieldShell
          id="managerName"
          icon={User}
          label={t('fields.managerName')}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.managerName} />
        </FieldShell>
        <FieldShell
          id="managerMobileNo"
          icon={Phone}
          label={t('fields.managerMobile')}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.managerMobileNo} prefixIcon={MessageCircle} />
        </FieldShell>

        <FieldShell
          id="managerEmail"
          icon={Mail}
          label={t('fields.managerEmail')}
          className="col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <ValueDisplay value={data.managerEmail} />
        </FieldShell>
        <FieldShell
          id="societyAddress"
          icon={Building2}
          className="col-span-2 sm:col-span-4 lg:col-span-4"
          label={t('fields.societyAddress')}
        >
          <ValueDisplay value={data.societyAddress} />
        </FieldShell>
      </div>
    </div>
  );
};

export default SocietyDetailsTab;
