export interface CitizenProperty {
  ownerId: number;
  upicNo: string;
  ownerNameMarathi: string;
  propertyNo: string;
  mobileNo: string;
  category: string;
  propertyDescription: string;
}

/**
 * Fetches citizen property details from the Akola Municipal Corporation Property Tax API
 * @param searchType - 'MobileNo' | 'UpicId' | 'PropertyNo'
 * @param value - search query value
 */
export async function fetchCitizenPropertiesFromApi(
  searchType: 'MobileNo' | 'UpicId' | 'PropertyNo',
  value: string
): Promise<CitizenProperty[]> {
  try {
    const url = 'https://akolamc.in/PropertyTaxMicroService/PropertyTaxApi/Landing/GetCitizensDetails';
    
    const payload: any = {
      searchType,
      TD: '',
      ServiceId: '',
    };

    if (searchType === 'MobileNo') {
      payload.mobileNo = value;
    } else if (searchType === 'UpicId') {
      payload.upicNo = value;
    } else if (searchType === 'PropertyNo') {
      const parts = value.split('-');
      payload.newWardNo = parts[0] || '';
      payload.newPropertyNo = parts[1] || '';
      payload.partitionNo = parts[2] || '';
      
      payload.NewWardNo = parts[0] || '';
      payload.NewPropertyNo = parts[1] || '';
      payload.PartitionNo = parts[2] || '';
    }

    console.log(`[API] Fetching properties dynamically from Akola MC API: ${searchType}: ${value}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`[API] GetCitizensDetails API error: HTTP status ${res.status}`);
      return [];
    }

    const data = await res.json();
    console.log('[API] GetCitizensDetails API response loaded.');

    let list: any[] = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (data && Array.isArray(data.data)) {
      list = data.data;
    } else if (data && Array.isArray(data.result)) {
      list = data.result;
    } else if (data && typeof data === 'object') {
      list = [data];
    }

    return list.map((item) => ({
      ownerId: Number(item.ownerID || item.OwnerID || 0),
      upicNo: String(item.upicNo || item.UpicNo || item.unicdeAddress || item.UnicdeAddress || '').trim(),
      ownerNameMarathi: String(item.ownerNameMarathi || item.OwnerNameMarathi || item.marathiOwnerPrathamNav || item.MarathiOwnerPrathamNav || '').trim(),
      propertyNo: String(item.propertyNo || item.PropertyNo || '').trim(),
      mobileNo: String(item.mobileNo || item.MobileNo || '').trim(),
      category: String(item.category || item.Category || '').trim(),
      propertyDescription: String(item.propertyDescription || item.PropertyDescription || '').trim(),
    }));
  } catch (error) {
    console.error('[API] Error in fetchCitizenPropertiesFromApi:', error);
    return [];
  }
}
