"use client";

import TableHeader from "@/components/common/TableHeader";
import { AddButton } from "@/components/common/ActionButtons";
import { Button } from "@/components/common/ActionButton";
import { BookOpen } from "lucide-react";

interface TariffWorkbenchHeaderProps {
  t: (key: string) => string;
  onAdd: () => void;
  onOpenUserManual?: () => void;
}

export function TariffWorkbenchHeader({
  t,
  onAdd,
  onOpenUserManual,
}: TariffWorkbenchHeaderProps) {
  return (
    <TableHeader
      title={t("title")}
      subtitle={t("subtitle")}
      icon="layers"
      rightContent={
        <div className="flex items-center gap-2">
          {onOpenUserManual && (
            <Button variant="secondary" icon={BookOpen} onClick={onOpenUserManual}>
              {t("userManual.button")}
            </Button>
          )}
          <AddButton label={t("addTitle")} onClick={onAdd} />
        </div>
      }
    />
  );
}
