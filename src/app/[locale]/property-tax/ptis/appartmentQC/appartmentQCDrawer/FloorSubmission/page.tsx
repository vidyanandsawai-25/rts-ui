
import { useTranslations } from "next-intl";

const FloorSubmissionPage = () => {
    const t = useTranslations("appartmentQC");

    return <div>{t("drawer.floorSubmission.title", { fallback: "Floor Submission" })}</div>;
};

export default FloorSubmissionPage;