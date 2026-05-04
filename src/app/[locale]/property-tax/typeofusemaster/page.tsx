
import {
  getSubTypesPaged,
  getAllUseTypes,   // ✅ New
  getAllUseGroups,  // ✅ New
  getTypesByGroupPaged, // ✅ New - paginated types by group
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
   * 3️⃣ Load TYPES (PAGINATED BY GROUP)
   * --------------------------------------------------- */
  // If groupId is provided, fetch paginated types for that group
  // Otherwise, fetch first group's types
  const effectiveGroupId = groupId || (groupsResp.items?.[0])?.typeOfUseGroupId || "";
  
  const typesResp = effectiveGroupId
    ? await getTypesByGroupPaged({
        pageNumber: typePageNumber,
        pageSize: typePageSize,
        typeOfUseGroupId: Number(effectiveGroupId) || undefined,
        searchTerm: typeSearch || undefined,
      })
    : { items: [], totalCount: 0, totalPages: 1 };

  // Also fetch ALL types for resolving selectedTypeId (needed for cross-group type selection)
  const allTypesResp = await getAllUseTypes();

  /* ---------------------------------------------------
   * 4️⃣ Build master data
   * --------------------------------------------------- */
  const masterData = {
    groups: groupsResp.items,
    types: allTypesResp.items, // Keep all types for selection logic
    subTypes: [],
  };


  const selectedTypeId = (() => {
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

    // ✅ If we have typeId in URL, use it
    if (typeParam) {
      const directMatch = masterData.types.find(
        (t) => String(t.typeOfUseId) === typeParam
      );
      if (directMatch) return String(directMatch.typeOfUseId);

      const codeMatch = masterData.types.find(
        (t) => t.typeOfUseCode === typeParam
      );
      if (codeMatch) return String(codeMatch.typeOfUseId);
    }

    // ✅ Default to first type only if no params at all (initial load)
    if (!typeParam && !groupParam) {
      return String(masterData.types?.[0]?.typeOfUseId ?? "");
    }

    return "";
  })();



  /* ---------------------------------------------------
   * 6️⃣ Load SUBTYPES (SERVER PAGED + SEARCH)
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
   * 7️⃣ Render UI
   * --------------------------------------------------- */
  return (
    <TypeOfUseMaster
      initialData={masterData}
      // SubType pagination
      subTypes={subTypeResp.items}
      subTotalCount={subTypeResp.totalCount}
      subTotalPages={subTypeResp.totalPages}
      pageNumber={pageNumber}
      pageSize={pageSize}
      // Type pagination (server-side)
      paginatedTypes={typesResp.items}
      typesTotalCount={typesResp.totalCount}
      typesTotalPages={typesResp.totalPages}
      typePageNumber={typePageNumber}
      typePageSize={typePageSize}
      // Selected type
      selectedTypeId={selectedTypeId}
      typeSearchFromServer={typeSearch}
    />
  );
}

