import {DatasetIdWithQuery} from "../DatasetIdWithQuery";
import {getPopulationDatasetDefinitionWithQuery} from "./population";
import {getApartmentData} from "./apartment";
import {getDemographicData} from "./demographic";
import {getEmploymentData} from "./employment";
import {getIncomeData} from "./income";
import {getBirthData} from "./births";
import {getDeathData} from "./death";
import {getFertilityData} from "./fertility";
import {getImmigrationData} from "./immigration";
import {getEmigrationData} from "./emigration";
import {getMietData} from "./mieten";

export function getAllDatasets(): DatasetIdWithQuery[] {
    return [
        getPopulationDatasetDefinitionWithQuery(),
        getApartmentData(),
        getDemographicData(),
        getEmploymentData(),
        getIncomeData(),
        getBirthData(),
        getDeathData(),
        getFertilityData(),
        getImmigrationData(),
        getEmigrationData(),
        getMietData()
    ];
}
