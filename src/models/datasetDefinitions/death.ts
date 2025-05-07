import {DatasetIdWithQuery} from "../DatasetIdWithQuery";

export function getDeathData(): DatasetIdWithQuery {
    return {
        id: 'death',
        file: 'src/data/Daten_Sterbefaelle_Jahr-Geschlecht-Heimat.csv.zip'
    };
}
