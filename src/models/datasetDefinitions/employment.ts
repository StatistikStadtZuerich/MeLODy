import {DatasetIdWithQuery} from "../DatasetIdWithQuery";
import {DATA_SOURCE_BASE_URL} from "../../server";

const query = `SELECT ?Datum_nach_Quartal ?Beschaeftigungsgrad ?Anzahl_Beschaeftigte WHERE {
  <https://ld.stadt-zuerich.ch/statistics/800022/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Quartal;
        sszP:TIME ?Datum_nach_Quartal;
        sszP:BEG/schema:name ?Beschaeftigungsgrad;
        sszM:BBS ?Anzahl_Beschaeftigte
  ]
} 
ORDER BY ?Datum_nach_Quartal ?Beschaeftigungsgrad`;

export const employmentData: DatasetIdWithQuery = {
    id: 'employment',
    sparqlQuery: query,
    source: `${DATA_SOURCE_BASE_URL}WIR400OD4004`
};