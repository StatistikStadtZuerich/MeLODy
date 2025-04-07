import {DatasetIdWithQuery} from "../DatasetIdWithQuery";

const query = `SELECT (year(?Datum) AS ?Datum_nach_Jahr) ?Stadtquartier ?Haushaltstyp ?Haushaltsäquivalenzeinkommen_Median_in_1000_CHF WHERE {
    <https://ld.stadt-zuerich.ch/statistics/000608/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Jahr;
        sszP:RAUM/schema:inDefinedTermSet sszTS:QuartiereZH;
        sszP:RAUM/schema:name ?Stadtquartier;
        sszP:TIME ?Datum;
        sszP:HTY/schema:name ?Haushaltstyp;
        sszM:HAE ?Haushaltsäquivalenzeinkommen_Median_in_1000_CHF
    ]
    FILTER(regex(str(?Datum),".*-12-31","i")) # TODO should be removed when fix is done
} ORDER BY ?Datum_nach_Jahr ?Stadtquartier ?Haushaltstyp`;

export const incomeData: DatasetIdWithQuery = {
    id: 'income',
    sparqlQuery: query,
    source: "https://ld.integ.stzh.ch/statistics/view/WIR100OD100A"
};