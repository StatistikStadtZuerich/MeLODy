import {Router} from "express";
import {ApartmentData} from "../models/ApartmentData";
import {bodyToApartmentDataRequest, filterApartmentData} from "../utils/apartmentDataUtils";
import {groupDataByQueryParamsCombined} from "../utils/dataUtils";
import queryMediator from "../services/QueryMediator";
import {parseCSVFromAPI} from "../utils/csvUtils";

const sszUrl = "https://data.stadt-zuerich.ch/api/3/action/datastore_search?resource_id=493d9be8-6511-4555-b09a-08d07741d5bd&limit=100000"
let data: ApartmentData[] = []
// sszDataFetcher<ApartmentData>(sszUrl).then(result => {
//     console.log(
//         `Downloaded ${result.length} apartment data from SSZ.`)
//     data = result
// })

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

queryMediator.executeSparqlQuery(query).then(async result => {
    if (result) {
        data = await parseCSVFromAPI<ApartmentData>(result);
    }
}).catch((error) => {
    console.error(error);
})
const router = Router();

/**
 * @swagger
 * /apartments:
 *   post:
 *     summary: Filter and group apartment data
 *     operationId: filterAndGroupApartmentData
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApartmentDataRequest'
 *     responses:
 *       200:
 *         description: Filtered and optionally grouped apartment data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataResponse'
 *       404:
 *         description: No data found for the specified parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'No data found for the specified parameters'
 */
router.post('/', async (req, res) => {
    const requestBody = bodyToApartmentDataRequest(req);
    const filteredData = filterApartmentData(data, requestBody);

    if (filteredData.length === 0) {
        res.status(404).json({error: 'No data found for the specified parameters'});
        return;
    } else if (requestBody.groupBy.length === 0) {
        res.status(200).json(filteredData);
        return;
    }
    let subroutes = requestBody.groupBy || [];
    if (!subroutes.includes('Anzahl_Wohnungen')) {
        subroutes.push('Anzahl_Wohnungen');
    }
    res.status(200).json({...groupDataByQueryParamsCombined(filteredData, subroutes, {sum: true}), source: sszUrl});
})

export default router;