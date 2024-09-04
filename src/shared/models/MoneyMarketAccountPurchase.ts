import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultMoneyMarketAccountPurchase: IMoneyMarketAccountPurchase = {
    id: "",
    clientId: "",
    instrumentType: "",
    clientName: "",
    moneyMarketAccountNumber: "",
    maturingNominal: 0,
    moneyMarketBalance: 0,
    availableBalance: 0,
    netBalance: 0,
    newNominal: 0,
    altTreasuryBill: "No",
    tenderRate: 0,
    margin: 0,
    clientRate: 0,
    counterParty: "IJG Securities",
    considerationBON: 0,
    considerationClient: 0,
    profit: 0,
    notes: "",
    contactPerson: "",
    confirmation: "",
    
}

export interface IMoneyMarketAccountPurchase {
    id: string,
    clientId?: string;
    instrumentType: string;
    clientName: string;
    moneyMarketAccountNumber: string;
    maturingNominal: number;
    moneyMarketBalance: number;
    availableBalance: number;
    netBalance: number;
    newNominal: number;
    altTreasuryBill: string;
    tenderRate: number;
    margin: number;
    clientRate: number;
    counterParty: string;
    considerationBON: number;
    considerationClient: number;
    profit: number;
    notes: string;
    contactPerson: string;
    confirmation: string;
}


export default class MoneyMarketAccountPurchaseModel {
    private account: IMoneyMarketAccountPurchase;

    constructor(private store: AppStore, account: IMoneyMarketAccountPurchase) {
        makeAutoObservable(this);
        this.account = account;
    }

    get asJson(): IMoneyMarketAccountPurchase {
        return toJS(this.account);
    }

    static groupByParentId(accounts: MoneyMarketAccountPurchaseModel[]): Record<string, MoneyMarketAccountPurchaseModel[]> {
        const groupedAccounts: Record<string, MoneyMarketAccountPurchaseModel[]> = {};

        for (const account of accounts) {
            const instrumentType = account.account.instrumentType;

            if (instrumentType in groupedAccounts) {
                groupedAccounts[instrumentType].push(account);
            } else {
                groupedAccounts[instrumentType] = [account];
            }
        }

        return groupedAccounts;
    }
}