/**
 * Runtime Config Script Component
 * 
 * This server component injects runtime configuration into the HTML
 * as a script tag, making it available to client components via window.__RUNTIME_CONFIG__
 */

import { getServerRuntimeConfig, validateRuntimeConfig } from './app.config';

export function RuntimeConfigScript() {
  const config = getServerRuntimeConfig();
  
  // Validate config on server side
  validateRuntimeConfig(config);
  
  // Serialize config to be injected into the page
  const configScript = `window.__RUNTIME_CONFIG__ = ${JSON.stringify(config)};`;
  
  return (
    <script
      id="runtime-config"
      dangerouslySetInnerHTML={{ __html: configScript }}
    />
  );
}
