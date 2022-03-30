import { HDPData } from './hdpData';
import { LatLong } from './latLong';

export class MapResults {
    zpid: string;
    price: string;
    priceLabel: string;
    beds: number;
    baths: number;
    area: number;
    latLong: LatLong;
    statusType: string;
    statusText: string;
    isFavorite: boolean;
    isUserClaimingOwner: boolean;
    isUserConfirmedClaim: boolean;
    streetViewMetadataURL: string;
    streetViewURL: string;
    imgSrc: string;
    hasImage: boolean;
    visited: boolean;
    listingType: string;
    variableData: any;
    hdpData: HDPData;
    detailUrl: string;
    pgapt: string;
    sgapt: string;
    has3DModel: boolean;
    hasVideo: boolean;
    isHomeRec: boolean;
    address: string;
    hasAdditionalAttributions: boolean;
    isFeaturedListing: boolean;
    availabilityDate?: Date;
}