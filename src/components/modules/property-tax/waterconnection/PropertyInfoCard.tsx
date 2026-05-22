import React from "react";
import { Mail, MapPin, Phone, User } from "lucide-react";
import type { PropertyInfo } from "@/types/waterconnection.types";

interface PropertyInfoCardProps {
  property: PropertyInfo;
  labels: {
    owner: string;
    contact: string;
    email: string;
    address: string;
    propertyNo: string;
    zone: string;
    ward: string;
    buildingType: string;
  };
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <div className="text-sm font-medium text-gray-800">{value}</div>
    </div>
  );
}

export function PropertyInfoCard({ property, labels }: PropertyInfoCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Owner */}
        <div className="flex gap-3 items-start">
          <User size={16} className="text-gray-400 mt-0.5 shrink-0" />
          <InfoField
            label={labels.owner}
            value={
              <div>
                <div className="font-semibold text-gray-900">{property.ownerName}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-gray-500">{property.customerId}</span>
                  <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded border border-blue-300 text-blue-600 bg-blue-50">
                    {property.customerType}
                  </span>
                </div>
              </div>
            }
          />
        </div>

        {/* Contact */}
        <div className="flex gap-3 items-start">
          <Phone size={16} className="text-green-500 mt-0.5 shrink-0" />
          <InfoField label={labels.contact} value={property.contact} />
        </div>

        {/* Email */}
        <div className="flex gap-3 items-start">
          <Mail size={16} className="text-purple-400 mt-0.5 shrink-0" />
          <InfoField label={labels.email} value={property.email} />
        </div>

        {/* Address */}
        <div className="flex gap-3 items-start">
          <MapPin size={16} className="text-red-400 mt-0.5 shrink-0" />
          <InfoField label={labels.address} value={property.address} />
        </div>
      </div>

      <div className="border-t border-gray-100 mt-4 pt-4 grid grid-cols-2 md:grid-cols-4 gap-5">
        <InfoField
          label={labels.propertyNo}
          value={
            <span className="text-blue-600 font-semibold">{property.propertyNo}</span>
          }
        />
        <InfoField label={labels.zone} value={property.zone} />
        <InfoField label={labels.ward} value={property.ward} />
        <InfoField
          label={labels.buildingType}
          value={
            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded border border-gray-300 text-gray-600 bg-gray-50">
              {property.buildingType}
            </span>
          }
        />
      </div>
    </div>
  );
}
