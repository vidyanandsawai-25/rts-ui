import React from "react";
import { LocalizationStrings } from "@/components/modules/configuration-settings/alias-master/LocalizationStrings";
import {
  fetchAutoTranslationConfigAction,
  fetchMultilingualResourcesAction,
  fetchMultilingualTranslationsPagedAction,
} from "./action";
import {
  SUPPORTED_LANGUAGE_CODES,
  SupportedLanguageCode,
} from "@/types/alias-master.types";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    resource?: string;
    languages?: string | string[];
    autoTranslate?: string;
  }>;
}

const MIN_PAGE = 1;
const MAX_PAGE = 10_000;
const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

function sanitizeParams(raw: Awaited<PageProps["searchParams"]>) {
  const rawPage = parseInt(raw.page ?? "", 10);
  const pageNumber = Number.isFinite(rawPage)
    ? Math.min(Math.max(rawPage, MIN_PAGE), MAX_PAGE)
    : MIN_PAGE;

  const rawPageSize = parseInt(raw.pageSize ?? "", 10);
  const pageSize = Number.isFinite(rawPageSize)
    ? Math.min(Math.max(rawPageSize, MIN_PAGE_SIZE), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  const resource = raw.resource?.trim() || undefined;

  const rawLanguages = Array.isArray(raw.languages)
    ? raw.languages
    : typeof raw.languages === "string" && raw.languages.length > 0
      ? raw.languages.split(",")
      : [];

  const languages = Array.from(
    new Set(
      rawLanguages
        .map((l) => l.trim().toLowerCase())
        .filter((l): l is SupportedLanguageCode =>
          (SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(l)
        )
    )
  );

  const autoTranslate = raw.autoTranslate === "true" || raw.autoTranslate === "1";

  return { pageNumber, pageSize, resource, languages, autoTranslate };
}

export default async function Page({ searchParams }: PageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const { pageNumber, pageSize, resource, languages, autoTranslate } = sanitizeParams(params);

  // Backend gates IsAutoTranslate on TranslationServiceOptions.IsActive itself,
  // so it is safe to forward the URL value as-is here.
  const [resources, config, paged] = await Promise.all([
    fetchMultilingualResourcesAction(),
    fetchAutoTranslationConfigAction(),
    fetchMultilingualTranslationsPagedAction(pageNumber, pageSize, resource, languages, autoTranslate),
  ]);

  return (
    <LocalizationStrings
      data={paged.items}
      pageNumber={paged.pageNumber}
      pageSize={paged.pageSize}
      totalCount={paged.totalCount}
      totalPages={paged.totalPages}
      resources={resources}
      resource={resource}
      languages={languages}
      autoTranslationEnabled={config.isEnabled}
      autoTranslate={config.isEnabled && autoTranslate}
    />
  );
}
