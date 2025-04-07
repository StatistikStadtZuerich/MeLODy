import {DatasetIdWithQuery} from "../DatasetIdWithQuery";

const query = `SELECT (year(?Datum) AS ?Datum_nach_Jahr) ?Stadtquartier ?Alter ?Heimatland ?Geschlecht ?Wirtschaftliche_Wohnbevoelkerung WHERE {
    <https://ld.stadt-zuerich.ch/statistics/000238/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Jahr;
        sszP:RAUM/schema:inDefinedTermSet sszTS:QuartiereZH;
        sszP:RAUM/schema:name ?Stadtquartier;
        sszP:TIME ?Datum;
        sszP:ALT/schema:name ?Alter;
        sszP:HEL/schema:name ?Heimatland;
        sszP:SEX/schema:name ?Geschlecht;
        sszM:BEW ?Wirtschaftliche_Wohnbevoelkerung
    ]
    FILTER(regex(str(?Datum),".*-12-31","i")) # TODO should be removed when fix is done
} ORDER BY ?Datum_nach_Jahr ?Stadtquartier ?Alter ?Heimatland ?Geschlecht`;

export const demographicData: DatasetIdWithQuery = {
    id: 'demographic',
    sparqlQuery: query,
    source: "https://ld.integ.stzh.ch/statistics/view/BEV390OD3903"
};