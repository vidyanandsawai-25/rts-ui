import { ConnectionTypeMaster } from "@/components/modules/water-bill/connection-type-master";
import { getConnectionTypePagedAction } from "./actions";

export const dynamic = "force-dynamic"; // dynamic since we need query params parsing if we pass them, though we can just fetch on page load

interface PageProps {
  readonly searchParams: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
    status?: string;
  }>;
}

export default async function ConnectionTypeMasterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pageNumber = Number(params?.page) || 1;
  const pageSize = Number(params?.pageSize) || 10;
  const searchTerm = params?.q || "";
  const statusFilter = params?.status || "all";

  const initialData = await getConnectionTypePagedAction(
    pageNumber,
    pageSize,
    searchTerm,
    statusFilter
  );

  return <ConnectionTypeMaster data={initialData} />;
}
