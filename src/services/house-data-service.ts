import { HouseDataProvider } from '../../models/enums';
import { HouseData } from '../../models/HouseData';
import { MapResults } from '../../models/zillowObjects/mapResults';
import { FileService } from './file.service';
import { MySqlService } from './mysql.service';
import * as https from 'https';
import * as fs from 'fs';
import { PropertyData } from '../../models/zillowObjects/propertyData';
import { HouseDetails } from '../../models/houseDetails';

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

    retreiveZillowHousingDetails(zpId: string | number) {
        const postData = {
            operationName: 'NotForSaleShopperPlatformFullRenderQuery',
            variables: {
                zpid: zpId,
                contactFormRenderParameter: {
                    zpid: zpId,
                    platform: 'desktop',
                    isDoubleScroll: true
                }
            },
            clientVersion: 'home-details/6.1.88.master.2781dfe',
            queryId: '70c269a8aeb9cc122c847a8203d3afd1'
        };

        const _this = this;
        const req = https.request({
            host: 'zillow.com',
            path: `/graphql/?zpid=${zpId}&contactFormRenderParameter=&queryId=70c269a8aeb9cc122c847a8203d3afd1&operationName=NotForSaleShopperPlatformFullRenderQuery`,
            method: 'POST',
            headers: {
                'Host': 'www.zillow.com',
                'Connection': 'keep-alive',
                'Content-Length': JSON.stringify(postData).length,
                'client-id': 'home-details_t',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36,',
                'content-type': 'application/json',
                'Accept': '*/*',
                'Sec-GPC': '1',
                'Origin': 'https://www.zillow.com',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://www.zillow.com/homedetails/3349-Kingsbury-Cir-SW-Roanoke-VA-24014/49646268_zpid/',
                'Accept-Encoding': 'null',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cookie': 'zguid=23|%24d614746d-e5ba-4b9e-b7d7-893885bdf53c; zgsession=1|8e3c12c0-7d57-4459-9793-116daab2e65b; g_state={"i_p":1647786237235,"i_l":2}; JSESSIONID=FB615C93C5B6A92A839185B003ABC431; search=6|1650409446135%7Crect%3D37.30703428047949%252C-79.79584693908691%252C37.21631754340355%252C-80.10655403137207%26disp%3Dmap%26mdm%3Dauto%26p%3D1%26sort%3Ddays%26z%3D1%26fs%3D0%26fr%3D0%26mmm%3D0%26rs%3D1%26ah%3D0%26singlestory%3D0%26housing-connector%3D0%26abo%3D0%26garage%3D0%26pool%3D0%26ac%3D0%26waterfront%3D0%26finished%3D0%26unfinished%3D0%26cityview%3D0%26mountainview%3D0%26parkview%3D0%26waterview%3D0%26hoadata%3D1%26zillow-owned%3D0%263dhome%3D0%26featuredMultiFamilyBuilding%3D0%09%0967919%09%09%09%09%09%09; AWSALB=eJMWP24rtJkRpDTz+/xzGUzrS2N9bFMBcDAR/9HbxlVmZxgxXoabYLSJ8ZXDeip36bmt0YokowWsxtlTee1k2nZUoerLI4h+EdGzFKm/xUiinuJ+zlAlDNI73/Dr; AWSALBCORS=eJMWP24rtJkRpDTz+/xzGUzrS2N9bFMBcDAR/9HbxlVmZxgxXoabYLSJ8ZXDeip36bmt0YokowWsxtlTee1k2nZUoerLI4h+EdGzFKm/xUiinuJ+zlAlDNI73/Dr'
            }
        } as https.RequestOptions, (res) => {
            let responseData = '';
            res.on('data', (d) => {
                responseData += d;
            }).on('end', function() {                    
                const json = JSON.parse(responseData);
                const propertyData = json?.data?.property as PropertyData;

                if (propertyData) {
                    const houseDetails = _this.fromZillowPropertyData(propertyData);
                    _this.insertHouseDetailsRecord(houseDetails);
                } else {
                    console.log(`Failed getting Property Data for ZpId: ${zpId}`)
                }
            });
        })
        req.write(JSON.stringify(postData));
        req.on('error', (e) => console.error(e));
        req.end();
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

    private insertHouseDetailsRecord(houseDetails: HouseDetails) {
        this.db.insertHouseDetailsRecords(houseDetails).then(([rows]) => {
            console.log(rows);
        }).catch(err => {
            console.log(err);
        });
    }

    private fromZillowPropertyData(propertyData: PropertyData) {
        const houseDetails = {
            zpid: propertyData.zpid,
            dateSold: propertyData.dateSold ? new Date(propertyData.dateSold) : null,
            dateSoldString: propertyData.dateSoldString,
            description: propertyData.description,
            isNonOwnerOccupied: propertyData.isNonOwnerOccupied,
            lastSoldPrice: propertyData.lastSoldPrice,
            mlsid: propertyData.mlsid,
            monthlyHoaFee: propertyData.monthlyHoaFee,
            parcelId: propertyData.parcelId,
            photoCount: propertyData.photoCount,
            parentRegion: propertyData?.parentRegion?.name,
            priceHistory: JSON.stringify(propertyData.priceHistory ?? ''),
            resoFacts: JSON.stringify(propertyData.resoFacts ?? ''),
            schools: JSON.stringify(propertyData.schools ?? ''),
            streetAddress:  propertyData.streetAddress,
            taxAssessedValue: propertyData.taxAssessedValue,
            taxAssessedYear: propertyData.taxAssessedYear,
            taxHistory: JSON.stringify(propertyData.taxHistory ?? ''),
            yearBuilt: propertyData.yearBuilt
        } as HouseDetails;

        return houseDetails
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