import {DatasetIdWithQuery} from "../DatasetIdWithQuery";
import {populationDatasetDefinitionWithQuery} from "./population";
import {apartmentData} from "./apartment";
import {demographicData} from "./demographic";
import {employmentData} from "./employment";
import {incomeData} from "./income";
import {birthData} from "./births";
import {deathData} from "./death";
import {fertilityData} from "./fertility";
import {immigrationData} from "./immigration";
import {emigrationData} from "./emigration";
import {mietData} from "./mieten";

export const allDatasets: DatasetIdWithQuery[] = [
    populationDatasetDefinitionWithQuery,
    apartmentData,
    demographicData,
    employmentData,
    incomeData,
    birthData,
    deathData,
    fertilityData,
    immigrationData,
    emigrationData,
    mietData
]