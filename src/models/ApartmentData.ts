export interface ApartmentData {
    /**
     * Year extracted from the date
     */
    Datum_nach_Jahr: string;

    /**
     * Name of the city quarter
     */
    Stadtquartier: string;

    /**
     * Number of rooms
     */
    Zimmerzahl: string;

    /**
     * Type of ownership
     */
    Eigentumsart: string;

    /**
     * Construction period
     */
    Bauperiode: string;

    /**
     * Whether the property is for rent or ownership
     */
    Miete_oder_Eigentum: string;

    /**
     * Number of apartments
     */
    Anzahl_Wohnungen: number;
}