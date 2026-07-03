
import { useTranslations } from "next-intl";

const AppartmentQCTaxDetailsPage = () => {
    const t = useTranslations("appartmentQC");

    return <div>{t("drawer.taxDetails.title", { fallback: "Tax Details" })}</div>;
};

export default AppartmentQCTaxDetailsPage;