import CmsModulesManager from "@/components/modules/cms/CmsModulesManager";

export default async function CmsModulesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="w-full">
      <CmsModulesManager locale={locale} />
    </div>
  );
}
