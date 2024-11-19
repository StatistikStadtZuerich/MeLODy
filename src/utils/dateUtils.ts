import {DateTime} from 'luxon';

export const parseMonthFromString = (dateStr: string, fromFormat: string = "yyyy.MM.dd"): number | undefined => {
    const dt = DateTime.fromFormat(dateStr, fromFormat);
    if (dt.isValid) {
        return dt.month;
    }
};
export type DateString = 'iso' | 'sql' | 'http';

export const dateTimeFromString = (
    input: string,
    timezone?: string,
    dateStringTypes: DateString[] = ['iso', 'sql', 'http']
): DateTime | undefined => {
    for (const dateStringType of dateStringTypes) {
        let dateTime: DateTime;
        switch (dateStringType) {
            case 'iso':
                dateTime = DateTime.fromISO(input, {zone: timezone});
                break;
            case 'sql':
                dateTime = DateTime.fromSQL(input, {zone: timezone});
                break;
            case 'http':
                dateTime = DateTime.fromHTTP(input, {zone: timezone});
                break;
            default:
                continue;
        }
        if (dateTime.isValid) {
            return dateTime;
        }
    }
    return undefined;
};
