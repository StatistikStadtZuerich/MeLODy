import {DatasetIdWithQuery} from "../DatasetIdWithQuery";

export function getImmigrationData(): DatasetIdWithQuery {
    return {
        id: 'immigration',
        file: 'src/data/Daten_Zuzug_Jahr-Geschlecht-Heimat.csv.zip'
    };
}
