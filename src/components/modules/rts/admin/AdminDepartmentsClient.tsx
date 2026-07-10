"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Pencil, Plus, Search, XCircle } from "lucide-react";
import { departments } from "@/lib/mock/rts/departments";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function AdminDepartmentsClient() {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const filteredDepartments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return departments;

    return departments.filter((department) => {
      const text = [department.name.en, department.name.hi, department.name.mr].filter(Boolean).join(" ").toLowerCase();
      return text.includes(normalizedQuery);
    });
  }, [query]);

  const visibleDepartments = filteredDepartments.slice(0, pageSize);

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-7">
        <h1 className="text-4xl font-medium tracking-tight text-[#102b55]">Manage Departments</h1>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search departments..."
          className="h-11 flex-1 rounded-2xl border border-[#d4ddeb] px-4 text-sm text-[#20305c] outline-none transition focus:border-[#0f9f98] focus:ring-2 focus:ring-[#bfeeea]"
        />
        <div className="flex gap-3">
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0c9d96] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(12,157,150,0.22)]">
            <Search className="h-4 w-4" />
            Search
          </button>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#2359f0] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(35,89,240,0.22)]">
            <Plus className="h-4 w-4" />
            Add Department
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#dfe7ef] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-[#e8edf4] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3 text-sm text-[#304666]">
            <span>Show</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="h-10 appearance-none rounded-xl border border-[#d4ddeb] bg-white px-4 pr-10 text-sm font-medium text-[#102b55] outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73809b]" />
            </div>
            <span>entries</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-sm font-semibold text-[#18325f]">
                <th className="border-b border-[#e8edf4] px-6 py-4">Image</th>
                <th className="border-b border-[#e8edf4] px-6 py-4">Department Name</th>
                <th className="border-b border-[#e8edf4] px-6 py-4">Is Active</th>
                <th className="border-b border-[#e8edf4] px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleDepartments.map((department) => (
                <tr key={department.id} className="text-sm text-[#223863]">
                  <td className="border-b border-[#edf2f7] px-6 py-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#eceff4] text-xs text-[#8995ad]">
                      No img
                    </div>
                  </td>
                  <td className="border-b border-[#edf2f7] px-6 py-4 text-[1.05rem] font-medium">{department.name.en}</td>
                  <td className="border-b border-[#edf2f7] px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-base text-[#ff2a2a]">
                      <XCircle className="h-4 w-4" />
                      Inactive
                    </span>
                  </td>
                  <td className="border-b border-[#edf2f7] px-6 py-4">
                    <div className="flex items-center justify-end gap-5 text-[#2359f0]">
                      <button type="button" aria-label={`Edit ${department.name.en}`} className="transition hover:scale-110">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label={`Delete ${department.name.en}`} className="text-[#ff2323] transition hover:scale-110">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
