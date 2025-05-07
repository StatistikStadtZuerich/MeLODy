import {DatasetIdWithQuery} from "../DatasetIdWithQuery";

export function getFertilityData(): DatasetIdWithQuery {
    return {
        id: 'fertility',
        file: 'src/data/Daten_GeburtenFertilitaet_Jahr-Alter-Heimat.csv.zip'
    };
}
