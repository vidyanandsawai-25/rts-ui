import CmsRolesAccess from "@/components/modules/cms/CmsRolesAccess";

export default async function CmsRolesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="w-full">
      <CmsRolesAccess locale={locale} />
    </div>
  );
}
