import { HouseDataProvider } from '../models/enums';
import { HouseDataService } from './services/house-data-service';
import { MySqlService } from './services/mysql.service';

export class  App {
    private db: MySqlService;
    private houseDataService: HouseDataService;

    constructor() {
        this.db = new MySqlService();
        this.houseDataService = new HouseDataService(this.db);
    }

    init() {
        // this.houseDataService.importHouseData(HouseDataProvider.Zillow);

        this.db.getHouseDataZpIdsWithoutHouseDetailRecords().then(([rows]) => {
            (rows as any[]).forEach((x, idx) => {
                setTimeout(() => this.houseDataService.retreiveZillowHousingDetails(x.HomeZpId), 2000 * idx);
            });
        }).catch(err => {
            console.log(err);
        });

        //latitude/longitude messed up in HouseData
    }
}

new App().init();