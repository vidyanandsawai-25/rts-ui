import { getTranslations } from 'next-intl/server';
import { WeightageMasterHeader } from '../../../../components/modules/property-tax/weightage-mastercv/WeightageMasterTabs';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

const Layout = async ({ children, params }: LayoutProps) => {
  const { locale } = await params;
  const t = await getTranslations('weightageMaster');

  const tabLabels = {
    floor: t('tabs.floor'),
    nature: t('tabs.nature'),
    subType: t('tabs.subType'),
    age: t('tabs.age'),
  };

  return (
    <div className='text-gray-900'>
      <WeightageMasterHeader 
        locale={locale} 
        title={t('title')}
        subtitle={t('subtitle')}
        labels={tabLabels} 
      />
      <div className="mt-0">
        {children}
      </div>
    </div>
  );
};

export default Layout;