import AppStore from "../../../stores/AppStore";
import { accountType } from "./SimpleFunctions";

interface MonthEndReportInterface {
    id: string;
    accountNumber: string;
    accountName: string;
    clientName: string;
    entityNumber: string;
    interest: number;
    days: number;
    lastRate: number;
    lastBalance: number;
}

export function groupDataByFund(data: MonthEndReportInterface[], store: AppStore): { [key: string]: MonthEndReportInterface[] } {
    const groupedData: { [key: string]: MonthEndReportInterface[] } = {};
    const accountTypeCache: { [key: string]: string } = {};

    // Pre-allocate keys in the groupedData object
    data.forEach((item) => {
        const fund = accountTypeCache[item.accountNumber] || (accountTypeCache[item.accountNumber] = accountType(item.accountNumber, store));
        groupedData[fund] = groupedData[fund] || [];
        groupedData[fund].push(item);
    });
    return groupedData;
}
