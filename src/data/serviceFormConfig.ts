import { ServiceFormConfig } from "./Dept/formTypes"; 

// 2. Import Department Configs
import { birthDeathFormConfigs } from "./Dept/birthDeathFormConfig";
import { educationFormConfigs } from "./Dept/educationFormConfig";
import { marriageFormConfigs } from "./Dept/marriageFormConfig";
import { nocFormConfigs } from "./Dept/nocFormConfig";
import { townplanningFormConfigs } from "./Dept/townplanningFormConfig";
import { treeFormConfigs } from "./Dept/treeFormConfig";
import { sanitationFormConfigs } from "./Dept/sanitationFormConfig";

// 3. Combine Configurations
// Note: Spreading (...) merges the objects.
const serviceConfigurations: Record<string, ServiceFormConfig> = {
  ...birthDeathFormConfigs,
  ...educationFormConfigs,
  ...marriageFormConfigs,
  ...nocFormConfigs,
  ...townplanningFormConfigs,
  ...treeFormConfigs,
  ...sanitationFormConfigs,
};

// 4. Export the Accessor Function
export function getServiceFormConfig(
  serviceId: string | undefined
): ServiceFormConfig | undefined { // Return the Type, not the function name
  if (!serviceId) return undefined;
  return serviceConfigurations[serviceId];
}
