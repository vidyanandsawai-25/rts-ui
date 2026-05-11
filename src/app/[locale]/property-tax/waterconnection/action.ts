"use server";

import type { WaterConnectionPageData } from "@/types/waterconnection.types";

const MOCK_DATA: WaterConnectionPageData = {
  property: {
    id: 1,
    propertyNo: "FR09-2024-001",
    ownerName: "Rajesh Kumar",
    customerId: "CID-12454",
    customerType: "Individual",
    contact: "+91 90743 42210",
    email: "rajesh.kumar@email.com",
    address: "123 MG Road, Koramangala, Bangalore - 560034",
    zone: "Zone-3",
    ward: "Ward-21",
    buildingType: "Residential",
  },
  connections: [
    {
      id: 1,
      connectionNo: "WC-2024-001",
      meterNo: "MN-001",
      type: "Domestic",
      tapSize: "15 Inch",
      applicableRate: 150,
      category: "Yearly",
      applicableCharges: 1800,
      installDate: "2022-03-15",
      activatedDate: "15/03/2022",
      isActive: true,
      status: true,
    },
    {
      id: 2,
      connectionNo: "WC-2024-002",
      meterNo: "MN-002",
      type: "Commercial",
      tapSize: "20 Inch",
      applicableRate: 200,
      category: "Yearly",
      applicableCharges: 2400,
      installDate: "2023-06-20",
      activatedDate: "20/06/2023",
      isActive: true,
      status: true,
    },
    {
      id: 3,
      connectionNo: "WC-2024-003",
      meterNo: "MN-003",
      type: "Domestic",
      tapSize: "15 Inch",
      applicableRate: 150,
      category: "Yearly",
      applicableCharges: 0,
      installDate: "2024-10-01",
      stoppedDate: "01/10/2024",
      isActive: false,
      status: false,
    },
  ],
};

export async function getWaterConnectionPageData(): Promise<WaterConnectionPageData> {
  return MOCK_DATA;
}
