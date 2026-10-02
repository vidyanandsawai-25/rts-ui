export function getChargeHeadsUrl(locale: string, path = ""): string {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `/${locale}/water-bill/charge-heads${cleanPath}`;
}

export function getTariffWorkbenchUrl(locale: string, path = ""): string {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `/${locale}/water-bill/tariff-workbench${cleanPath}`;
}
