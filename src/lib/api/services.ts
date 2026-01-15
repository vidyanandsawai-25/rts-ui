/**
 * Services API
 * Handles fetching services data from the backend API
 */

import { appConfig } from '@/config/app.config';
import { Service } from '@/types/service.types';

/**
 * Fetches the list of available services from the API
 * @returns Promise<Service[]> - Array of service objects
 */
export async function getServices(): Promise<Service[]> {
  try {
    const apiUrl = `${appConfig.api.baseUrl}/Services`;

    // In Next.js, we need to configure the fetch differently for self-signed certs
    const fetchOptions: RequestInit = {
      cache: 'no-store', // Use 'force-cache' for static data or 'no-store' for dynamic data
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // For development with self-signed certificates, we need to use a custom agent
    if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
      // Server-side only
      const https = await import('https');
      const agent = new https.Agent({
        rejectUnauthorized: false,
      });
      // @ts-expect-error - Node.js fetch accepts agent
      fetchOptions.agent = agent;
    }

    const response = await fetch(apiUrl, fetchOptions);

    if (!response.ok) {
      console.error(`Failed to fetch services: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: Service[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}
