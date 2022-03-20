import { HouseDataProvider } from '../../models/enums';
import { HouseData } from '../../models/HouseData';
import { MapResults } from '../../models/zillowObjec/mapResults';
import { FileService } from './file.service';
import { MySqlService } from './mysql.service';

export class HouseDataService {
    private fileService: FileService;
    
    constructor(private db: MySqlService) {
        this.fileService = new FileService();
    }

    importHouseData(provider: HouseDataProvider) {
        let houseData = [];

        if (provider === HouseDataProvider.Zillow) {
            const mapResults = this.fileService.getZillowMapResultsData();
            houseData = this.fromZillowMapResults(mapResults);
        } else {
            throw('Provider not supported');
        }

        this.insertHouseDataRecords(houseData);
    }

    private insertHouseDataRecords(houseData: HouseData[]) {
        houseData.forEach(x => {
            this.db.insertHouseDataRecords(x).then(([rows]) => {
                console.log(rows);
            }).catch(err => {
                console.log(err);
            });
        });
    }

    private fromZillowMapResults(mapResults: MapResults[]) {
        const houseData: HouseData[] = [];

        mapResults.forEach(x => {
            houseData.push({
                propZpId: x.zpid,
                propArea: x.area,
                propBaths: x.baths,
                propBeds: x.beds,
                address: this.getAddressFromDetailsUrl(x.detailUrl),
                detailUrl: x.detailUrl,
                homeZpId: x.hdpData.homeInfo.zpid,
                bathrooms: x.hdpData.homeInfo.bathrooms,
                bedrooms: x.hdpData.homeInfo.bedrooms,
                city: x.hdpData.homeInfo.city,
                country: x.hdpData.homeInfo.country,
                dateSold: x.hdpData.homeInfo.dateSold ? new Date(x.hdpData.homeInfo.dateSold) : null,
                daysOnZillow: x.hdpData.homeInfo.daysOnZillow,
                homeStatus: x.hdpData.homeInfo.homeStatus,
                homeStatusForHDP: x.hdpData.homeInfo.homeStatusForHDP,
                homeType: x.hdpData.homeInfo.homeType,
                isPreforclosureAuction: x.hdpData.homeInfo.isPreforeclosureAuction,
                latitude: x.hdpData.homeInfo.latitude,
                livingArea: x.hdpData.homeInfo.livingArea,
                longitude: x.hdpData.homeInfo.longitude,
                lotAreaUnit: x.hdpData.homeInfo.lotAreaUnit,
                lotArea: x.hdpData.homeInfo.lotAreaValue,
                price: x.hdpData.homeInfo.price,
                priceForHDP: x.hdpData.homeInfo.priceForHDP,
                rentZestimate: x.hdpData.homeInfo.rentZestimate,
                state: x.hdpData.homeInfo.state,
                taxAssessedValue: x.hdpData.homeInfo.taxAssessedValue,
                zestimate: x.hdpData.homeInfo.zestimate,
                zipCode: x.hdpData.homeInfo.zipcode,
                imgSrc: x.imgSrc,
                listingType: x.listingType,
                priceText: x.price,
                priceLabel: x.priceLabel,
                streeViewMetadataUrl: x.streetViewMetadataURL,
                streeViewUrl: x.streetViewURL,
            } as HouseData);
        });

        return houseData;
    }

    private getAddressFromDetailsUrl(detailUrl: string) {
        const urlSplit = detailUrl.split('/');
        const addressItems = urlSplit[2].split('-');
        let address = '';
        for (let i = 0; i < addressItems.length - 3; i++) {
            address += ` ${addressItems[i]}`;
        }

        return address.trim();
    }
}