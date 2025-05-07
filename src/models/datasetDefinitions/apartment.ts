import {DatasetIdWithQuery} from "../DatasetIdWithQuery";
import {DATA_SOURCE_BASE_URL} from "../../server";


const query = `SELECT (year(?Datum) AS ?Datum_nach_Jahr) ?Stadtquartier ?Zimmerzahl ?Eigentumsart ?Bauperiode ?Miete_oder_Eigentum (xsd:integer(?Anzahl_Wohnungen_decimal) AS ?Anzahl_Wohnungen) WHERE {
    <https://ld.stadt-zuerich.ch/statistics/000579/observation> cube:observation [
        sszP:ZEIT/schema:inDefinedTermSet sszTS:Jahr;
        sszP:RAUM/schema:inDefinedTermSet sszTS:QuartiereZH;
        sszP:RAUM/schema:name ?Stadtquartier;
        sszP:TIME ?Datum;
        sszP:ZIM/schema:name ?Zimmerzahl;
        sszP:EIG/schema:name ?Eigentumsart;
        sszP:BAP/schema:name ?Bauperiode;
        sszP:MWF ?Mietflag;
        sszM:WHG ?Anzahl_Wohnungen_decimal
    ]
    BIND(IF(?Mietflag = <https://ld.stadt-zuerich.ch/statistics/code/MWF0001>, "Miete", "Eigentum") AS ?Miete_oder_Eigentum)
    FILTER(regex(str(?Datum),".*-12-31","i")) # TODO should be removed when fix is done
} ORDER BY ?Stadtquartier ?Zimmerzahl ?Eigentumsart ?Bauperiode ?Miete_oder_Eigentum`;

export function getApartmentData(): DatasetIdWithQuery {
    return {
        id: 'apartment',
        sparqlQuery: query,
        source: `${DATA_SOURCE_BASE_URL}BAU583OD5831`
    };
}
