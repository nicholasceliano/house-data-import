import mysql from 'mysql2';
import { environment } from '../../environment/environment.prod';
import { HouseData } from '../../models/houseData';
import { HouseDetails } from '../../models/houseDetails';

export class MySqlService {

    private connection: mysql.Connection;

    constructor() {
        this.connection = mysql.createConnection(environment.db);
    }

    private execQuery(query: string, values?: any) {
        return this.connection.promise().query(query, values);
    }

    insertHouseDataRecords(hd: HouseData) {    
        return this.execQuery(`INSERT INTO RawHouseData 
            (PropZpId, PropArea, PropBaths, PropBeds, Address, DetailUrl, HomeZpId, Bathrooms, Bedrooms, City, Country, DateSold, DaysOnZillow, HomeStatus, HomeStatusForHDP,
                HomeType, IsPreforclosureAuction, Latitude, LivingArea, Longitude, LotAreaUnit, LotArea, Price, PriceForHDP, RentZestimate, State, TaxAssessedValue, Zestimate,
                ZipCode, ImgSrc, ListingType, PriceText, PriceLabel, StreeViewMetadataUrl, StreeViewUrl) VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [hd.propZpId, hd.propArea, hd.propBaths, hd.propBeds, hd.address, hd.detailUrl, hd.homeZpId, hd.bathrooms, hd.bedrooms, hd.city, hd.country, hd.dateSold, hd.daysOnZillow, hd.homeStatus, hd.homeStatusForHDP,
            hd.homeType, hd.isPreforclosureAuction, hd.latitude, hd.livingArea, hd.longitude, hd.lotAreaUnit, hd.lotArea, hd.price, hd.priceForHDP, hd.rentZestimate, hd.state, hd.taxAssessedValue, hd.zestimate,
            hd.zipCode, hd.imgSrc, hd.listingType, hd.priceText, hd.priceLabel, hd.streeViewMetadataUrl, hd.streeViewUrl]
        );
    }

    insertHouseDetailsRecords(hd: HouseDetails) {    
        return this.execQuery(`INSERT INTO RawHouseDetails 
            (ZpId, DateSold, DateSoldString, \`Description\`, IsNonOwnerOccupied, LastSoldPrice, MlsId, MonthlyHoaFee, ParcelId, PhotoCount, ParentRegion, PriceHistory, ResoFacts,
                Schools, StreetAddress, TaxAssessedValue, TaxAssessedYear, TaxHistory, YearBuilt) VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [hd.zpid, hd.dateSold, hd.dateSoldString, hd.description, hd.isNonOwnerOccupied, hd.lastSoldPrice, hd.mlsid, hd.monthlyHoaFee, hd.parcelId, hd.photoCount, hd.parentRegion, hd.priceHistory, hd.resoFacts,
            hd.schools, hd.streetAddress, hd.taxAssessedValue, hd.taxAssessedYear, hd.taxHistory, hd.yearBuilt]
        );
    }

    getHouseDataZpIdsWithoutHouseDetailRecords() {
        return this.execQuery(`SELECT DISTINCT HomeZpId FROM RawHouseData WHERE HomeZpId NOT IN (SELECT DISTINCT ZpId FROM RawHouseDetails)`);
    }
}