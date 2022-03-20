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
        this.houseDataService.importHouseData(HouseDataProvider.Zillow);
    }
}

new App().init();