import {DatasetIdWithQuery} from "../DatasetIdWithQuery";

export function getEmigrationData(): DatasetIdWithQuery {
    return {
        id: 'emigration',
        file: 'src/data/Daten_Wegzug_Jahr-Geschlecht-Heimat.csv.zip'
    };
}
