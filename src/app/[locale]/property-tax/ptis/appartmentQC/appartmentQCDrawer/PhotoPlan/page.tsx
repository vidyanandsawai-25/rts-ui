
import { useTranslations } from "next-intl";

const PhotoPlanPage = () => {
    const t = useTranslations("appartmentQC");

    return <div>{t("drawer.photoPlan.title", { fallback: "Photo Plan" })}</div>;
};

export default PhotoPlanPage;