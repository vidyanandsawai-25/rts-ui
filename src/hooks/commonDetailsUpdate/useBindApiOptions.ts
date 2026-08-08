/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { BulkUpdateFieldConfig, SelectOption } from "@/types/common-details-update/common-details-update.types";
import { getDynamicOptionsAction } from "@/app/[locale]/property-tax/common-details-update/actions";

export const useBindApiOptions = (fieldConfigs: BulkUpdateFieldConfig[]) => {
  const [optionsMap, setOptionsMap] = useState<Record<string, SelectOption[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!fieldConfigs || fieldConfigs.length === 0) {
      setOptionsMap({});
      return;
    }

    const fetchOptions = async () => {
      const newOptionsMap: Record<string, SelectOption[]> = {};
      const newLoadingMap: Record<string, boolean> = {};

      // Mark all fields with bindApi as loading initially
      fieldConfigs.forEach(c => {
        if (c.bindApi) newLoadingMap[c.fieldName] = true;
      });
      setLoadingMap(prev => ({ ...prev, ...newLoadingMap }));

      const fetchPromises = fieldConfigs.map(async (config) => {
        if (config.bindApi) {
          try {
            // Trigger dynamic API call via Server Action
            const response = await getDynamicOptionsAction(config.bindApi);
            
            if (response.success && response.data) {
              // Extract array data. Adjust according to standard API response format (e.g. response.data.items if paginated)
              const apiData = Array.isArray(response.data) ? response.data : ((response.data as any).items || [response.data]);
              
              let keyField = "id"; // Default fallback
              let valueField = "name"; // Default fallback
              
              if ((config as any).apiResponse) {
                const apiResStr = String((config as any).apiResponse);
                try {
                  const parsed = JSON.parse(apiResStr);
                  if (parsed.key || parsed.Key) keyField = parsed.key || parsed.Key;
                  if (parsed.value || parsed.Value) valueField = parsed.value || parsed.Value;
                } catch (e) {
                  // Extremely forgiving regex fallback for malformed JSON like {"key":"id" "Value":"subFloorCode"}
                  const keyMatch = apiResStr.match(/['"]?(?:key|Key)['"]?\s*:\s*['"]([^'"]+)['"]/);
                  const valMatch = apiResStr.match(/['"]?(?:value|Value)['"]?\s*:\s*['"]([^'"]+)['"]/);
                  if (keyMatch) keyField = keyMatch[1];
                  if (valMatch) valueField = valMatch[1];
                }
              }

              newOptionsMap[config.fieldName] = apiData.map((item: any, index: number) => {
                let labelVal = item?.[valueField];
                let keyVal = item?.[keyField];
                
                // Smart fallback for flat arrays (e.g., ["Category1", "Category2"])
                if (typeof item !== 'object' && item !== null) {
                  labelVal = item;
                  keyVal = item;
                } 
                // Smart fallback for objects with incorrect apiResponse configuration
                else if (item && typeof item === 'object') {
                  const keys = Object.keys(item);
                  
                  if (labelVal === undefined && keys.length > 0) {
                    // Guess the label field: look for 'name', 'label', 'desc', or the first string property
                    const nameKey = keys.find(k => /name|label|desc|title/i.test(k)) || keys.find(k => typeof item[k] === 'string') || keys[0];
                    labelVal = item[nameKey];
                  }
                  
                  if (keyVal === undefined && keys.length > 0) {
                    // Guess the id field: look for 'id', 'code', 'key', or the first number property
                    const idKey = keys.find(k => /^id$|code|key/i.test(k)) || keys.find(k => typeof item[k] === 'number') || keys[0];
                    keyVal = item[idKey];
                  }
                }
                
                return {
                  label: String(labelVal ?? `Missing Label (${index})`),
                  value: String(keyVal ?? index.toString())
                };
              });
            } else {
              newOptionsMap[config.fieldName] = [];
            }
          } catch (error) {
            newOptionsMap[config.fieldName] = [];

          } finally {
            newLoadingMap[config.fieldName] = false;
          }
        }
      });

      await Promise.all(fetchPromises);
      setOptionsMap(prev => ({ ...prev, ...newOptionsMap }));
      setLoadingMap(prev => ({ ...prev, ...newLoadingMap }));
    };

    fetchOptions();
  }, [fieldConfigs]);

  return { optionsMap, loadingMap };
};
