/**
 * Runtime Config Script Component
 * 
 * This server component injects runtime configuration into the HTML
 * as a script tag, making it available to client components via window.__RUNTIME_CONFIG__
 */

import { getServerRuntimeConfig, validateRuntimeConfig } from './runtime-config';
import { RuntimeConfigInject } from './RuntimeConfigInject';

export function RuntimeConfigScript() {
  const config = getServerRuntimeConfig();
  
  // Validate config on server side
  validateRuntimeConfig(config);
  
  // Serialize config to be injected into the page
  const configScript = `window.__RUNTIME_CONFIG__ = ${JSON.stringify(config)};`;
  
  return <RuntimeConfigInject configScript={configScript} />;
}
