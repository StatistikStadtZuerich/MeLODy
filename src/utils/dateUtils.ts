import {DateTime} from 'luxon';

export const parseMonthFromString = (dateStr: string, fromFormat: string = "yyyy.MM.dd"): number | undefined => {
    const dt = DateTime.fromFormat(dateStr, fromFormat);
    if (dt.isValid) {
        return dt.month;
    }
};
