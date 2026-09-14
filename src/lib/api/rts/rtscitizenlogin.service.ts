import 'server-only';

export type CitizenLoginPropertyOption = {
  value: string;
  items: string;
};

function getOneSolutionBaseUrl(): string {
  const url =
    process.env.AKOLA_ONESOLUTION_BASE_URL?.trim() ||
    process.env.AKOLA_CITIZEN_PROPERTY_DETAILS_API_URL?.trim();

  if (!url) {
    throw new Error(
      'AKOLA_ONESOLUTION_BASE_URL is not configured in environment variables. Please check your .env file.'
    );
  }

  return url.replace(/\/+$/, '');
}

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

async function fetchPropertyCombo(
  payload: Record<string, string>
): Promise<CitizenLoginPropertyOption[]> {
  let response: Response;

  try {
    const baseUrl = getOneSolutionBaseUrl();
    const endpointUrl = `${baseUrl}/PropertyTax/FillComboForPayment/FillComboForPayments`;

    response = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch (error) {
    throw new Error(toErrorMessage(error, 'Unable to reach the property lookup service.'));
  }

  if (!response.ok) {
    throw new Error(`Property lookup request failed with status ${response.status}.`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Property lookup returned an invalid response.');
  }

  return data.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];

    const option = item as Record<string, unknown>;
    const value = typeof option.value === 'string' ? option.value.trim() : '';
    const label = typeof option.items === 'string' ? option.items.trim() : '';

    return value && label ? [{ value, items: label }] : [];
  });
}

/** Loads the Zone/Node options for citizen property-number login. */
export function getCitizenLoginNodes(): Promise<CitizenLoginPropertyOption[]> {
  return fetchPropertyCombo({ Flag: 'GetNode' });
}

/** Loads the Ward/Sector options for the selected Zone/Node. */
export function getCitizenLoginSectors(
  node: string
): Promise<CitizenLoginPropertyOption[]> {
  const normalizedNode = node.trim();
  if (!normalizedNode) {
    return Promise.resolve([]);
  }

  return fetchPropertyCombo({ Flag: 'GetSector', Node: normalizedNode });
}
