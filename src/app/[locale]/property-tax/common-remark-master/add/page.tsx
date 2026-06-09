import { CommonRemarkForm } from "@/components/modules/property-tax/common-remark-master";
import React from "react";
import { fetchRemarkCategoriesAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AddPage(): Promise<React.ReactElement> {
  const categories = await fetchRemarkCategoriesAction();
  return <CommonRemarkForm id={null} initialData={undefined} categories={categories} />;
}
