import {DatasetIdWithQuery} from "../DatasetIdWithQuery";


export function getBirthData(): DatasetIdWithQuery {
    return {
        id: 'births',
        file: 'src/data/Daten_Geburten_Jahr-Geschlecht-Heimat.csv.zip'
    };
}
