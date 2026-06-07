"use client";

import { useState } from "react";
import {
  User,
  Database,
  Save,
  Lock
} from "lucide-react";
import {
  Card,
  CardContent,
  Badge,
  SearchInput,
  Select,
  Input,
} from "@/components/common";
import { Checkbox } from "@/components/common/checkbox";
import { cn } from "@/lib/utils/cn";

interface FieldRegistryProps {
  t: (key: string) => string;
}

// Empty state for field registry - no mock data, just UI structure
export const FieldRegistry = ({ t }: FieldRegistryProps) => {
  // Form state for "Add Field from Database"
  const [sourceModule, setSourceModule] = useState("");
  const [sourceTable, setSourceTable] = useState("");
  const [databaseColumn, setDatabaseColumn] = useState("");
  const [userFacingName, setUserFacingName] = useState("");
  const [allowGeneralUser, setAllowGeneralUser] = useState(false);
  const [approvalRequired, setApprovalRequired] = useState(false);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  const previewText = "";

  return (
    <div className="space-y-4">
      {/* Authorized User Workflow Header */}
      <div className="flex items-center justify-between bg-[#F8FAFF] border border-blue-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <User className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#1E3A8A]">
              {t("fieldRegistry.title")}
            </h3>
            <p className="text-xs text-gray-500">
              {t("fieldRegistry.subtitle")}
            </p>
          </div>
        </div>
        <Badge variant="secondary" size="sm" className="bg-amber-50 text-amber-700 border-amber-200">
          <Lock className="w-3 h-3 mr-1" />
          {t("fieldRegistry.authenticatedUserOnly")}
        </Badge>
      </div>

      {/* Add Field from Database Section */}
      <Card variant="default" padding="none" className="border border-blue-200 rounded-xl overflow-hidden">
        <div className="bg-[#F8FAFF] px-4 py-3 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#1E3A8A] flex items-center gap-2">
                <Database className="w-4 h-4" />
                {t("fieldRegistry.addFieldFromDb.title")}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {t("fieldRegistry.addFieldFromDb.subtitle")}
              </p>
            </div>
            <Badge variant="secondary" size="sm" className="bg-amber-50 text-amber-700 border-amber-200">
              <Lock className="w-3 h-3 mr-1" />
              {t("fieldRegistry.authenticatedUserOnly")}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 bg-blue-50/30">
          {/* Form Fields Row 1 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("fieldRegistry.addFieldFromDb.sourceModule")} <span className="text-red-500">*</span>
              </label>
              <Select
                value={sourceModule}
                onChange={(e) => setSourceModule(e.target.value)}
                options={[]}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("fieldRegistry.addFieldFromDb.sourceTable")} <span className="text-red-500">*</span>
              </label>
              <Select
                value={sourceTable}
                onChange={(e) => setSourceTable(e.target.value)}
                options={[]}
                className="w-full"
                disabled={!sourceModule}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("fieldRegistry.addFieldFromDb.databaseColumn")} <span className="text-red-500">*</span>
              </label>
              <Select
                value={databaseColumn}
                onChange={(e) => setDatabaseColumn(e.target.value)}
                options={[]}
                className="w-full"
                disabled={!sourceTable}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("fieldRegistry.addFieldFromDb.userFacingName")} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={userFacingName}
                onChange={(e) => setUserFacingName(e.target.value)}
                placeholder=""
                className="w-full"
              />
            </div>
          </div>

          {/* Form Fields Row 2 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("fieldRegistry.addFieldFromDb.fieldType")}
              </label>
              <Input
                type="text"
                value=""
                disabled
                className="w-full bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("fieldRegistry.addFieldFromDb.validationRule")}
              </label>
              <Input
                type="text"
                value=""
                disabled
                className="w-full bg-gray-50"
              />
            </div>
            <div className="flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <Checkbox
                  checked={allowGeneralUser}
                  onCheckedChange={(checked) => setAllowGeneralUser(Boolean(checked))}
                />
                {t("fieldRegistry.addFieldFromDb.allowGeneralUserUpdate")}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <Checkbox
                  checked={approvalRequired}
                  onCheckedChange={(checked) => setApprovalRequired(Boolean(checked))}
                />
                {t("fieldRegistry.addFieldFromDb.approvalRequired")}
              </label>
            </div>
          </div>

          {/* Add Button */}
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
            disabled={!sourceModule || !sourceTable || !databaseColumn || !userFacingName}
          >
            <Save className="w-4 h-4" />
            {t("fieldRegistry.addFieldFromDb.addToRegistry")}
          </button>

          {/* Preview */}
          {previewText && (
            <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
              <span className="text-xs font-medium text-gray-500 mr-2">
                {t("fieldRegistry.addFieldFromDb.preview")}:
              </span>
              <span className="text-sm font-semibold text-gray-800">{userFacingName}</span>
              <p className="text-xs text-gray-500 mt-1">{previewText}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter and Stats Section */}
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t("fieldRegistry.filters.category")}
            </label>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[]}
              className="w-44"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t("fieldRegistry.filters.status")}
            </label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[]}
              className="w-32"
            />
          </div>
          <div className="pt-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t("fieldRegistry.filters.searchPlaceholder")}
              className="w-64"
            />
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors mt-4"
        >
          <Database className="w-4 h-4" />
          {t("fieldRegistry.addFieldFromDb.addFromDb")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label={t("fieldRegistry.stats.totalEligible")}
          value="--"
          color="blue"
        />
        <StatCard
          label={t("fieldRegistry.stats.activeFields")}
          value="--"
          color="green"
        />
        <StatCard
          label={t("fieldRegistry.stats.generalUserAllowed")}
          value="--"
          color="amber"
        />
        <StatCard
          label={t("fieldRegistry.stats.approvalRequired")}
          value="--"
          color="purple"
        />
      </div>

      {/* Field Registry Table */}
      <Card variant="default" padding="none" className="border border-blue-200 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="bg-[#F8FAFF] border-b border-blue-200 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#1E3A8A]">
            {t("fieldRegistry.table.fieldName")}
          </span>
          <span className="text-sm font-semibold text-[#1E3A8A]">
            {t("fieldRegistry.table.active")}
          </span>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 mb-3 rounded-full bg-blue-50 flex items-center justify-center">
            <Database className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            {t("fieldRegistry.emptyState.title")}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t("fieldRegistry.emptyState.description")}
          </p>
        </div>
      </Card>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string | number;
  color: "blue" | "green" | "amber" | "purple";
}

const StatCard = ({ label, value, color }: StatCardProps) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    green: "text-green-600 bg-green-50 border-green-200",
    amber: "text-amber-600 bg-amber-50 border-amber-200",
    purple: "text-purple-600 bg-purple-50 border-purple-200",
  };

  return (
    <div className={cn("rounded-lg border p-4", colorClasses[color])}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

export default FieldRegistry;
