// src/data/consumers.ts

import type { LangLabel, SelectOption } from "@/data/Dept/formTypes";
 
export type ConsumerMasterItem = {

  value: string;

  label: LangLabel;

  address: LangLabel;

  zoneValue: string; // ✅ must match your zoneNo select option values (e.g. "zone1")

};
 
export const consumerMaster: ConsumerMasterItem[] = [

  {

    value: "consumerno1",

    label: { en: "CN-2026-000123", hi: "सी एन-२०२६-०००१२३", mr: "सी एन-२०२६-०००१२३" },

    address: {

      en: "Flat 12, Sai Plaza, MG Road, Pune 411001",

      hi: "फ्लैट 12, साईं प्लाज़ा, एमजी रोड, पुणे 411001",

      mr: "फ्लॅट 12, साई प्लाझा, एमजी रोड, पुणे 411001",

    },

    zoneValue: "zone1",

  },

  {

    value: "consumerno2",

    label: { en: "CN-9876543210", hi: "सी एन-९८७६५४३२१०", mr: "सी एन-९८७६५४३२१०" },

    address: {

      en: "Bldg B, Lane 3, Kothrud, Pune 411038",

      hi: "बिल्डिंग B, लेन 3, कोथरूड, पुणे 411038",

      mr: "बिल्डिंग B, लेन 3, कोथरुड, पुणे 411038",

    },

    zoneValue: "zone2",

  },

  {

    value: "consumerno3",

    label: { en: "WTR-7162-00145", hi: "डब्ल्यू टी आर-७१६२-००१४५", mr: "डब्ल्यू टी आर-७१६२-००१४५" },

    address: {

      en: "Shop 5, Market Yard, Pune 411037",

      hi: "दुकान 5, मार्केट यार्ड, पुणे 411037",

      mr: "दुकान 5, मार्केट यार्ड, पुणे 411037",

    },

    zoneValue: "zone3",

  },

  {

    value: "consumerno4",

    label: { en: "PUNE-CN-000789", hi: "पुणे-सीएन-०००७८९", mr: "पुणे-सीएन-०००७८९" },

    address: {

      en: "Row House 7, Baner, Pune 411045",

      hi: "रो हाउस 7, बानेर, पुणे 411045",

      mr: "रो हाऊस 7, बानेर, पुणे 411045",

    },

    zoneValue: "zone1",

  },

];
 
export const consumerNumberOptions: SelectOption[] = consumerMaster.map((c) => ({

  value: c.value,

  label: c.label,

}));
 
// ✅ Helpers (use these in handleInputChange)

export const getConsumerByValue = (value: string) =>

  consumerMaster.find((c) => c.value === value);
 
export const getConsumerText = (lbl: LangLabel, lang: keyof LangLabel) =>

  lbl?.[lang] ?? lbl?.en ?? "";

 