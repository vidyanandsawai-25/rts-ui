// src/data/plumber.ts
import type { SelectOption } from "@/data/Dept/formTypes";
 
export const plumberMaster = [
  {
    value: "rahul_patil",
    label: { en: "Rahul Patil", hi: "राहुल पाटील", mr: "राहुल पाटील" },
    licenseNo: "PLB-MH-2024-01873",
  },
  {
    value: "anita_sharma",
    label: { en: "Anita Sharma", hi: "अनीता शर्मा", mr: "अनीता शर्मा" },
    licenseNo: "PLB-MH-2023-09214",
  },
  {
    value: "suresh_jadhav",
    label: { en: "Suresh Jadhav", hi: "सुरेश जाधव", mr: "सुरेश जाधव" },
    licenseNo: "PLB-MH-2025-00456",
  },
];
 
export const plumberNameOptions: SelectOption[] = plumberMaster.map((p) => ({
  value: p.value,
  label: p.label,
}));