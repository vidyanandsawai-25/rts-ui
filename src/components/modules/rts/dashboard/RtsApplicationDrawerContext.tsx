"use client";

import {
  CheckCircle2,
  Clock3,
  Download,
  FileText
} from "lucide-react";

import { Button } from "@/components/common";

interface Props {
  record: any;
  t: any;
  onClose: () => void;
}

const stages = [
  {
    title: "Application Submitted",
    status: "COMPLETE",
    remark: "System: Application received successfully.",
    complete: true,
  },
  {
    title: "Document Verification",
    status: "PENDING",
    remark: "Pending review.",
    complete: false,
  },
  {
    title: "Final Approval",
    status: "PENDING",
    remark: "Pending.",
    complete: false,
  },
];

const documents = [
  {
    name: "Identity Proof (Aadhaar Card)",
    size: "1.2 MB",
  },
  {
    name: "Property Ownership Deed / Agreement",
    size: "3.4 MB",
  },
  {
    name: "NOC from Fire Department",
    size: "2.1 MB",
  },
];

export default function ApplicationDrawerContent({
  record,
  onClose,
}: Props) {

  return (

    <div className="flex h-full flex-col">

      <div className="space-y-6 p-5">

        {/* Details */}

        <section className="rounded-xl border bg-white p-5">

          <div className="mb-4 flex items-center justify-between">

            <h3 className="text-xs font-bold tracking-wide text-slate-700">
              APPLICATION DETAILS
            </h3>

          </div>

          <div className="grid grid-cols-2 gap-y-5 text-sm">

            <div>
              <div className="text-[11px] font-semibold text-slate-400">
                APPLICANT NAME
              </div>

              <div className="font-bold text-slate-800">
                {record.citizenName}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400">
                SUBMITTED DATE
              </div>

              <div className="text-[15px] font-bold text-slate-900">
                {record.submittedDate}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400">
                SLA TIMELINE
              </div>

              <div className="font-bold text-blue-600">
                {record.slaLimit} Days
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400">
                SLA DEADLINE
              </div>

              <div className="font-bold text-orange-600">
                2026-07-15
              </div>
            </div>

          </div>

        </section>

        {/* Approval */}

        <section>

          <div className="mb-4 flex items-center justify-between">

            <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">
              APPROVAL STAGES
            </h3>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              25% Done
            </span>

          </div>

          <div className="space-y-5">

            {stages.map((stage, index) => (

              <div
                key={stage.title}
                className="relative flex gap-4"
              >

                <div className="flex flex-col items-center">

                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold ${stage.complete
                        ? "bg-green-600"
                        : "bg-orange-500"
                      }`}
                  >
                    {index + 1}
                  </div>

                  {index !== stages.length - 1 && (
                    <div className="h-full w-[2px] bg-slate-200" />
                  )}

                </div>

                <div className="flex-1 rounded-xl border bg-white p-4">

                  <div className="mb-2 flex justify-between">

                    <h4 className="text-[14px] font-bold text-slate-900">
                      {stage.title}
                    </h4>

                    <span
                      className={`text-[11px] font-extrabold tracking-wide ${stage.complete
                          ? "text-green-600"
                          : "text-orange-600"
                        }`}
                    >
                      {stage.status}
                    </span>

                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm italic text-slate-700">
                    "{stage.remark}"
                  </div>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* Documents */}

        <section>

          <h3 className="mb-4 text-xs font-bold text-slate-900">
            SUBMITTED DOCUMENTS
          </h3>

          <div className="space-y-3">

            {documents.map((doc) => (

              <div
                key={doc.name}
                className="flex items-center justify-between rounded-xl border bg-white p-4"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border bg-blue-50">

                    <FileText className="h-5 w-5 text-blue-600" />

                  </div>

                  <div>

                    <div className="text-[14px] font-bold text-slate-900">
                      {doc.name}
                    </div>

                    <div className="text-xs font-medium text-slate-600">
                      {doc.size}
                    </div>

                  </div>

                </div>

                <button className="rounded-lg border p-2 hover:bg-slate-50">

                  <Download className="h-4 w-4 text-blue-600" />

                </button>

              </div>

            ))}

          </div>

        </section>

      </div>

      <div className="mt-auto border-t bg-white p-5">

        <div className="flex justify-end">

          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>

        </div>

      </div>

    </div>

  );
}