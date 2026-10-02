"use client";

import { useTranslations } from "next-intl";
import TableHeader from "@/components/common/TableHeader";
import { AddButton } from "@/components/common/ActionButtons";
import { Button } from "@/components/common/ActionButton";
import { BookOpen } from "lucide-react";

interface ChargeHeadsHeaderProps {
  onAdd: () => void;
  onOpenUserManual?: () => void;
}

export function ChargeHeadsHeader({ onAdd, onOpenUserManual }: ChargeHeadsHeaderProps) {
  const t = useTranslations("chargeHeads");

  return (
    <TableHeader
      title={t("title")}
      subtitle={t("subtitle")}
      icon="database"
      rightContent={
        <div className="flex items-center gap-2">
          {onOpenUserManual && (
            <Button variant="secondary" icon={BookOpen} onClick={onOpenUserManual}>
              {t("userManual")}
            </Button>
          )}
          <AddButton label={t("addTitle")} onClick={onAdd} />
        </div>
      }
    />
  );
}
