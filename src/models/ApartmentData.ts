export interface ApartmentData {
    _id: number;
    StichtagDatJahr: string;

    /**
     * Data status code.
     */
    DatenstandCd: string;

    /**
     * Sort order for quarters.
     */
    QuarSort: string;

    /**
     * Code for quarters.
     */
    QuarCd: string;

    /**
     * Description of the quarter.
     */
    QuarLang: string;

    /**
     * Sort order for districts.
     */
    KreisSort: string;

    /**
     * Code for districts.
     */
    KreisCd: string;

    /**
     * Description of the district.
     */
    KreisLang: string;

    /**
     * Sort order for owners by type 1.
     */
    EigentuemerSSZPubl1Sort: string;

    /**
     * Code for owners by type 1.
     */
    EigentuemerSSZPubl1Cd: string;

    /**
     * Description of the owner by type 1.
     */
    EigentuemerSSZPubl1Lang: string;

    /**
     * Sort order for number of rooms (level 2).
     */
    AnzZimmerLevel2Sort_noDM: string;

    /**
     * Code for number of rooms (level 2).
     */
    AnzZimmerLevel2Cd_noDM: string;

    /**
     * Description of the number of rooms (level 2).
     */
    AnzZimmerLevel2Lang_noDM: string;

    /**
     * Statistical number of apartments.
     */
    AnzWhgStat: string;
}
