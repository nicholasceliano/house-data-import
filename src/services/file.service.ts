import { readFileSync } from 'fs';
import { environment } from '../../environment/environment.prod';

export class FileService {
    constructor() {}

    getZillowMapResultsData() {
        const mapResults = readFileSync(environment.getZillowMapResultsDataFile, 'utf8');

        return JSON.parse(mapResults);
    }
}