
// services/location.ts

/**
 * Simulates a lookup service to convert US Zip Codes to USDA Hardiness Zones.
 * in a real app, this would hit an API like the USDA ARS service.
 */
export const locationService = {
  
  async getZoneFromZip(zip: string): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const prefix = parseInt(zip.substring(0, 1));
    const sub = parseInt(zip.substring(1, 2));

    // Rough approximation based on US Zip Code regions
    // 0 = Northeast (CT, MA, ME, NH, NJ, RI, VT) -> Cold
    if (prefix === 0) return sub > 5 ? '6a' : '5b';
    
    // 1 = NY, PA, DE -> Cold/Moderate
    if (prefix === 1) return '6b';
    
    // 2 = DC, MD, NC, SC, VA, WV -> Moderate
    if (prefix === 2) return '7b';
    
    // 3 = AL, FL, GA, MS, TN -> Warm
    if (prefix === 3) return sub < 5 ? '8b' : '9a'; // FL is warmer
    
    // 4 = KY, MI, IN, OH -> Cold
    if (prefix === 4) return '5b';
    
    // 5 = IA, MN, MT, ND, SD, WI -> Very Cold
    if (prefix === 5) return '4a';
    
    // 6 = IL, KS, MO, NE -> Varied
    if (prefix === 6) return '6a';
    
    // 7 = AR, LA, OK, TX -> Warm
    if (prefix === 7) return '8a';
    
    // 8 = AZ, CO, ID, NM, NV, UT, WY -> Varied/Desert
    if (prefix === 8) return '6b'; // Averaged
    
    // 9 = AK, CA, HI, OR, WA -> West Coast (Warm/Temperate)
    if (prefix === 9) {
        if (zip.startsWith('99')) return '3a'; // Alaska
        if (zip.startsWith('96')) return '11a'; // Hawaii
        return '9b'; // California/Oregon
    }

    return '7a'; // Default fallback
  }
};
