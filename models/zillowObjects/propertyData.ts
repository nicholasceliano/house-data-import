import { ParentRegion } from './parentRegion';

export class PropertyData {
    dateSold: number;
    dateSoldString: string;
    description: string;
    isNonOwnerOccupied: boolean;
    lastSoldPrice: number
    mlsid: string
    monthlyHoaFee: string
    parcelId: string
    photoCount: number
    parentRegion: ParentRegion;
    priceHistory: any[];
    resoFacts: any[];
    schools: any[];
    streetAddress: string;
    taxAssessedValue: number;
    taxAssessedYear: number;
    taxHistory: any[];
    yearBuilt: number;
    zpid: number;
}