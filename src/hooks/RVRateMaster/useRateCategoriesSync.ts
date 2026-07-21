import { useState, useEffect } from "react";
import { logger } from "@/lib/utils/logger";
import { toast } from "sonner";
import { getTypeOfUseDetailsAction, getRateMasterByFilters } from "@/app/[locale]/property-tax/rate-master/rvratemaster/action";
import { useConfirm } from "@/components/common/ConfirmProvider";
import type { RateCategory, ITypeOfUseDetails } from "@/types/RVRateMaster";

interface RateCategoriesSyncProps {
  rateCategories: RateCategory[];
  isOpenPlot: boolean;
  selectedZone: string;
  assessmentYear: string;
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

export function useRateCategoriesSync({
  rateCategories,
  isOpenPlot,
  selectedZone,
  assessmentYear,
  t,
}: RateCategoriesSyncProps) {
  const [hasConfiguredRates, setHasConfiguredRates] = useState(false);
  const [isConfigureRatesOpen, setIsConfigureRatesOpen] = useState(false);
  const [localRateCategories, setLocalRateCategories] = useState<RateCategory[]>(rateCategories);
  const { confirm } = useConfirm();

  const fetchLatestRateCategories = async () => {
    try {
      const detailsResult = await getTypeOfUseDetailsAction(1, -1);
      const details = detailsResult.items || [];
      const opCategory = details.find(t => t.typeOfUseCode === 'OP');

      const categoriesList: RateCategory[] = [];
      const seenGroupIds = new Set<number>();

      const getAssociatedTypes = (groupId?: number) => {
        if (!isOpenPlot || !groupId) return undefined;
        return details
          .filter(t => t.typeOfUseGroupId === groupId)
          .map(t => ({
            code: t.typeOfUseCode || "",
            description: t.description || ""
          }));
      };

      if (opCategory) {
        categoriesList.push({
          constructionId: String(opCategory.id),
          constructionCode: opCategory.typeOfUseCode || String(opCategory.id),
          description: opCategory.description || "",
          typeOfUseGroupId: opCategory.typeOfUseGroupId,
          associatedUseTypes: getAssociatedTypes(opCategory.typeOfUseGroupId)
        });
        if (opCategory.typeOfUseGroupId) {
          seenGroupIds.add(opCategory.typeOfUseGroupId);
        }
      }

      details.forEach(tu => {
        if (tu.typeOfUseCode === 'OP') return;

        const groupId = tu.typeOfUseGroupId;
        if (groupId && groupId > 0) {
          if (!seenGroupIds.has(groupId)) {
            seenGroupIds.add(groupId);
            categoriesList.push({
              constructionId: String(tu.id),
              constructionCode: tu.typeOfUseCode || String(tu.id),
              description: tu.description || "",
              typeOfUseGroupId: groupId,
              associatedUseTypes: getAssociatedTypes(groupId)
            });
          }
        }
      });

      setLocalRateCategories(categoriesList);
    } catch (err) {
      logger.error("Failed to load latest rate categories", { error: err as Error });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalRateCategories(rateCategories);
  }, [rateCategories]);

  const handleConfigureSelected = async (selectedTypes: ITypeOfUseDetails[]) => {
    setIsConfigureRatesOpen(false);

    // Clear URL parameters
    const params = new URLSearchParams(window.location.search);
    params.delete("configureRates");
    params.delete("checkedUseTypes");
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);

    try {
      const detailsResult = await getTypeOfUseDetailsAction(1, -1);
      const details = detailsResult.items || [];
      const opCategory = details.find(t => t.typeOfUseCode === 'OP');

      const categoriesList: RateCategory[] = [];
      const seenGroupIds = new Set<number>();

      if (isOpenPlot) {
        const existingRates = await getRateMasterByFilters(selectedZone, "ALL", assessmentYear);
        const existingGroupIds = new Set<number>();
        if (existingRates && existingRates.length > 0) {
          existingRates.forEach(rate => {
            if (rate.typeOfUseGroupId) {
              existingGroupIds.add(rate.typeOfUseGroupId);
            }
          });
        }

        const toAddCategories: RateCategory[] = [];
        const alreadyConfiguredCodes: string[] = [];

        const getAssociatedTypes = (groupId?: number) => {
          if (!groupId) return undefined;
          return details
            .filter(t => t.typeOfUseGroupId === groupId)
            .map(t => ({
              code: t.typeOfUseCode || "",
              description: t.description || ""
            }));
        };

        const processType = (tu: ITypeOfUseDetails) => {
          const groupId = tu.typeOfUseGroupId;
          const code = tu.typeOfUseCode || String(tu.id);
          const exists = groupId && existingGroupIds.has(groupId);

          if (exists) {
            if (!alreadyConfiguredCodes.includes(code)) {
              alreadyConfiguredCodes.push(code);
            }
          } else {
            if (groupId && groupId > 0) {
              if (!seenGroupIds.has(groupId)) {
                seenGroupIds.add(groupId);
                toAddCategories.push({
                  constructionId: String(tu.id),
                  constructionCode: code,
                  description: tu.description || "",
                  typeOfUseGroupId: groupId,
                  associatedUseTypes: getAssociatedTypes(groupId)
                });
              }
            } else {
              toAddCategories.push({
                constructionId: String(tu.id),
                constructionCode: code,
                description: tu.description || "",
                typeOfUseGroupId: groupId,
                associatedUseTypes: getAssociatedTypes(groupId)
              });
            }
          }
        };

        if (opCategory) processType(opCategory);
        selectedTypes.forEach(tu => {
          if (tu.typeOfUseCode === 'OP') return;
          processType(tu);
        });

        if (toAddCategories.length > 0) {
          setLocalRateCategories(toAddCategories);
          if (alreadyConfiguredCodes.length > 0) {
            const codesStr = `'${alreadyConfiguredCodes.join(", ")}'`;
            toast.success(t('messages.validationRatesAlreadyExistSome', { codes: codesStr }) || `Rates already exist for ${codesStr}. Only unconfigured use types are shown.`);
          }
        } else {
          const allCategories: RateCategory[] = [];
          const seenAll = new Set<number>();

          const processAllType = (tu: ITypeOfUseDetails) => {
            const groupId = tu.typeOfUseGroupId;
            const code = tu.typeOfUseCode || String(tu.id);
            if (groupId && groupId > 0) {
              if (!seenAll.has(groupId)) {
                seenAll.add(groupId);
                allCategories.push({
                  constructionId: String(tu.id),
                  constructionCode: code,
                  description: tu.description || "",
                  typeOfUseGroupId: groupId,
                  associatedUseTypes: getAssociatedTypes(groupId)
                });
              }
            } else {
              allCategories.push({
                constructionId: String(tu.id),
                constructionCode: code,
                description: tu.description || "",
                typeOfUseGroupId: groupId,
                associatedUseTypes: getAssociatedTypes(groupId)
              });
            }
          };

          if (opCategory) processAllType(opCategory);
          selectedTypes.forEach(tu => {
            if (tu.typeOfUseCode === 'OP') return;
            processAllType(tu);
          });

          setLocalRateCategories(allCategories);
          toast.error(t('messages.validationRatesAlreadyExist'));
        }
      } else {
        if (opCategory) {
          categoriesList.push({
            constructionId: String(opCategory.id),
            constructionCode: opCategory.typeOfUseCode || String(opCategory.id),
            description: opCategory.description || "",
            typeOfUseGroupId: opCategory.typeOfUseGroupId
          });
          if (opCategory.typeOfUseGroupId) {
            seenGroupIds.add(opCategory.typeOfUseGroupId);
          }
        }

        selectedTypes.forEach(tu => {
          if (tu.typeOfUseCode === 'OP') return;

          const groupId = tu.typeOfUseGroupId;
          if (groupId && groupId > 0) {
            if (!seenGroupIds.has(groupId)) {
              seenGroupIds.add(groupId);
              categoriesList.push({
                constructionId: String(tu.id),
                constructionCode: tu.typeOfUseCode || String(tu.id),
                description: tu.description || "",
                typeOfUseGroupId: groupId
              });
            }
          } else {
            categoriesList.push({
              constructionId: String(tu.id),
              constructionCode: tu.typeOfUseCode || String(tu.id),
              description: tu.description || "",
              typeOfUseGroupId: groupId
            });
          }
        });

        setLocalRateCategories(categoriesList);
      }

      setHasConfiguredRates(true);
    } catch (_err) {
      toast.error(t('configureRates.toast.saveError'));
    }
  };

  const handleConfigureRatesClick = async () => {
    if (!selectedZone || selectedZone === "ALL" || !assessmentYear || assessmentYear === "ALL") {
      toast.error(t('messages.selectRateSection'));
      return;
    }
    try {
      const detailsResult = await getTypeOfUseDetailsAction(1, -1);
      const details = detailsResult.items || [];
      const opExcluded = details.filter(t => t.typeOfUseCode !== 'OP');
      const descriptionList = opExcluded.map(t => t.description || t.typeOfUseCode).join(', ');

      confirm({
        title: t('dialogs.configureUseTypeTitle'),
        description: t('dialogs.configureUseTypeDescription', { descriptionList }),
        confirmText: t('dialogs.confirmYes'),
        cancelText: t('dialogs.confirmNo'),
        onConfirm: () => {
          setIsConfigureRatesOpen(true);
          const params = new URLSearchParams(window.location.search);
          params.set("configureRates", "true");
          window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
        },
        onCancel: () => {
          setHasConfiguredRates(true);
          const opCategory = details.find(t => t.typeOfUseCode === 'OP');
          if (opCategory) {
            const associated = details
              .filter(t => t.typeOfUseGroupId === opCategory.typeOfUseGroupId)
              .map(t => ({
                code: t.typeOfUseCode || "",
                description: t.description || ""
              }));
            const opCategories = [{
              constructionId: String(opCategory.id),
              constructionCode: opCategory.typeOfUseCode || String(opCategory.id),
              description: opCategory.description || "",
              typeOfUseGroupId: opCategory.typeOfUseGroupId,
              associatedUseTypes: isOpenPlot ? associated : undefined
            }];
            setLocalRateCategories(opCategories);
          }
        }
      });
    } catch (_err) {
      toast.error(t('configureRates.toast.loadTypesOfUseFailed'));
    }
  };

  const handleConfigureDrawerClose = async (savedAny: boolean) => {
    setIsConfigureRatesOpen(false);
    const params = new URLSearchParams(window.location.search);
    params.delete("configureRates");
    params.delete("checkedUseTypes");
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    if (savedAny) {
      setHasConfiguredRates(true);
      await fetchLatestRateCategories();
    }
  };

  return {
    hasConfiguredRates,
    setHasConfiguredRates,
    isConfigureRatesOpen,
    setIsConfigureRatesOpen,
    localRateCategories,
    setLocalRateCategories,
    fetchLatestRateCategories,
    handleConfigureSelected,
    handleConfigureRatesClick,
    handleConfigureDrawerClose,
  };
}
