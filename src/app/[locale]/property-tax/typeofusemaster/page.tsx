
import {
  getSubTypesPaged,
  getAllUseGroups,
  getAllUseTypes, // ✅ Keep for counting across all groups
  getTypesByGroupPaged,
  resolveTypeId, // ✅ NEW - lightweight type lookup
} from "./actions";

import TypeOfUseMaster from
  "@/components/modules/property-tax/typeofusemaster/TypeOfUseMaster";

// Force this page to be dynamic (don't pre-render at build time)
export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    groupId?: string;    // 🆕 Group ID
    typeId?: string;
    pn?: string;         // SubType page number
    ps?: string;         // SubType page size
    typePn?: string;     // 🆕 Type page number
    typePs?: string;     // 🆕 Type page size
    q?: string;          // 🔍 SubType search
    typeSearch?: string; // 🔍 Type search (BACKEND)
  }>;
}) {
  // ✅ unwrap params (Next.js requirement)
  const params = await searchParams;

  /* ---------------------------------------------------
   * 1️⃣ Resolve paging + searches
   * --------------------------------------------------- */
  // SubType pagination
  const pageNumber = Number(params.pn ?? 1);
  const pageSize = Number(params.ps ?? 5);

  // Type pagination (server-side)
  const typePageNumber = Number(params.typePn ?? 1);
  const typePageSize = Number(params.typePs ?? 10);

  const subTypeSearch = params.q ?? "";
  const typeSearch = params.typeSearch ?? "";
  const groupId = params.groupId ?? "";

  /* ---------------------------------------------------
   * 2️⃣ Load GROUPS (always full)
   * --------------------------------------------------- */
  const groupsResp = await getAllUseGroups();

  /* ---------------------------------------------------
   * 3️⃣ Fetch ALL types for counting & selection logic
   * --------------------------------------------------- */
  // ✅ Needed for: 
  //    - Displaying accurate type counts for ALL groups (not just selected)
  //    - Selection logic in hooks (useTypeOfUseMasterSelection, etc.)
  //    - First type lookup when switching groups
  // Note: This is fetched ONCE per page load and cached in initialData
  const allTypesResp = await getAllUseTypes();

  /* ---------------------------------------------------
   * 4️⃣ Resolve SELECTED TYPE ID (from all types or URL)
   * --------------------------------------------------- */
  const selectedTypeId = await (async () => {
    const typeParam = params.typeId;
    const groupParam = params.groupId;

    // 🔥 EXPLICIT "no type selected"
    if (typeParam === "__NONE__") {
      return "";
    }

    // ✅ If we have explicit groupId but no typeId, it's an intentional empty group selection
    if (groupParam && !typeParam) {
      return "";
    }

    // ✅ If we have typeId in URL, try to find it in allTypes first (fast)
    if (typeParam) {
      const directMatch = allTypesResp.items.find(
        (t) => String(t.typeOfUseId) === typeParam
      );
      if (directMatch) return String(directMatch.typeOfUseId);

      const codeMatch = allTypesResp.items.find(
        (t) => t.typeOfUseCode === typeParam
      );
      if (codeMatch) return String(codeMatch.typeOfUseId);
      
      // ✅ Fallback: If not found in allTypes, try API lookup
      const resolvedId = await resolveTypeId(typeParam);
      if (resolvedId) return resolvedId;
    }

    // ✅ Default to first type only if no params at all (initial load)
    if (!typeParam && !groupParam) {
      return String(allTypesResp.items?.[0]?.typeOfUseId ?? "");
    }

    return "";
  })();

  /* ---------------------------------------------------
   * 5️⃣ Load TYPES (PAGINATED BY GROUP for display)
   * --------------------------------------------------- */
  // ✅ PERFORMANCE: Fetch only current page of types for the selected group
  // This reduces data transfer when displaying the type list
  const effectiveGroupId = groupId || (groupsResp.items?.[0])?.typeOfUseGroupId || "";
  
  const typesResp = effectiveGroupId
    ? await getTypesByGroupPaged({
        pageNumber: typePageNumber,
        pageSize: typePageSize,
        typeOfUseGroupId: Number(effectiveGroupId) || undefined,
        searchTerm: typeSearch || undefined,
      })
    : { items: [], totalCount: 0, totalPages: 1 };

  /* ---------------------------------------------------
   * 6️⃣ Build master data
   * --------------------------------------------------- */
  // ✅ Pass ALL types for counting and selection logic
  // ✅ Pagination happens in the UI layer for type display
  const masterData = {
    groups: groupsResp.items,
    types: allTypesResp.items, // ✅ ALL types for accurate counts across all groups
    subTypes: [],
  };

  /* ---------------------------------------------------
   * 7️⃣ Load SUBTYPES (SERVER PAGED + SEARCH)
   * --------------------------------------------------- */
  const subTypeResp = selectedTypeId
    ? await getSubTypesPaged({
        pageNumber,
        pageSize,
        typeOfUseId: Number(selectedTypeId),
        searchTerm: subTypeSearch || undefined,
      })
    : {
        items: [],
        totalCount: 0,
        totalPages: 1,
      };

  /* ---------------------------------------------------
   * 8️⃣ Render UI
   * --------------------------------------------------- */
  return (
    <TypeOfUseMaster
      initialData={masterData}
      typesPagination={{
        paginatedTypes: typesResp.items,
        totalCount: typesResp.totalCount,
        totalPages: typesResp.totalPages,
        pageNumber: typePageNumber,
        pageSize: typePageSize,
        searchFromServer: typeSearch,
      }}
      subTypesPagination={{
        subTypes: subTypeResp.items,
        totalCount: subTypeResp.totalCount,
        totalPages: subTypeResp.totalPages,
        pageNumber: pageNumber,
        pageSize: pageSize,
      }}
      selectedTypeId={selectedTypeId}
    />
  );
}

