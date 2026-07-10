"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus, Search } from "lucide-react";
import { departments } from "@/lib/mock/rts/departments";
import type { StoredAdminServiceFormRecord } from "./types";

type AdminServicesListClientProps = {
  initialRecords: StoredAdminServiceFormRecord[];
  locale: string;
};

export default function AdminServicesListClient({
  initialRecords,
  locale,
}: AdminServicesListClientProps) {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return initialRecords.filter((record) => {
      const matchesSearch =
        !normalizedSearch ||
        record.serviceName.toLowerCase().includes(normalizedSearch) ||
        record.departmentName.toLowerCase().includes(normalizedSearch);

      const matchesDepartment = departmentFilter === "all" || record.departmentId === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [departmentFilter, initialRecords, search]);

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-7">
        <h1 className="text-4xl font-medium tracking-tight text-[#102b55]">Manage Services</h1>
        <p className="mt-2 text-base text-[#47607e]">
          Maintain generated service forms and launch the form builder for new service definitions.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8ba6]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services or departments..."
              className="h-12 w-full rounded-2xl border border-[#d4ddeb] bg-white pl-11 pr-4 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
            />
          </div>

          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="h-12 w-full appearance-none rounded-2xl border border-[#d4ddeb] bg-white px-4 pr-10 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-4 focus:ring-[#c6f1ec]"
            >
              <option value="all">All Departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name.en}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c8ba6]" />
          </div>
        </div>

        <Link
          href={`/${locale}/rts/admin/services/new`}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#2359f0] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(35,89,240,0.22)]"
        >
          <Plus className="h-4 w-4" />
          Create Service
        </Link>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-[#dfe7ef] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
        <div className="border-b border-[#e8edf4] px-6 py-4">
          <p className="text-sm text-[#4f6484]">
            Showing <span className="font-semibold text-[#102b55]">{filteredRecords.length}</span> generated service forms
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-sm font-semibold text-[#18325f]">
                <th className="border-b border-[#e8edf4] px-6 py-4">Service Name</th>
                <th className="border-b border-[#e8edf4] px-6 py-4">Department</th>
                <th className="border-b border-[#e8edf4] px-6 py-4">Sections</th>
                <th className="border-b border-[#e8edf4] px-6 py-4">Fields</th>
                <th className="border-b border-[#e8edf4] px-6 py-4">Status</th>
                <th className="border-b border-[#e8edf4] px-6 py-4">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => {
                const fieldCount = record.sections.reduce((count, section) => count + section.fields.length, 0);

                return (
                  <tr key={record.id} className="text-sm text-[#223863]">
                    <td className="border-b border-[#edf2f7] px-6 py-4">
                      <div>
                        <p className="text-[1.02rem] font-medium text-[#102b55]">{record.serviceName}</p>
                        <p className="mt-1 text-xs text-[#6d7f99]">{record.description || "No description added yet."}</p>
                      </div>
                    </td>
                    <td className="border-b border-[#edf2f7] px-6 py-4">{record.departmentName}</td>
                    <td className="border-b border-[#edf2f7] px-6 py-4">{record.sections.length}</td>
                    <td className="border-b border-[#edf2f7] px-6 py-4">{fieldCount}</td>
                    <td className="border-b border-[#edf2f7] px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          record.status === "Published"
                            ? "bg-[#e1faf1] text-[#0c8f65]"
                            : "bg-[#eef3ff] text-[#2856cf]"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="border-b border-[#edf2f7] px-6 py-4 text-[#6d7f99]">
                      {new Date(record.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-[#63748e]">
                    No service forms match your search or department filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
