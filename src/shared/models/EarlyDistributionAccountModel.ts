import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";
import { sortAlphabetically } from "../utils/utils";

export const defaultProduct: IEarlyDistributionAccount = {
    id: "",
    productCode: "",
    openingBalance: 0,
    closingBalance: 0,
    accountName: "",
    balance: 0,
    isApproved: false
}

export interface IEarlyDistributionAccount {
    id: string;
    productCode: string;
    accountName: string;
    openingBalance: number,
    balance: number,
    closingBalance: number;
    isApproved: boolean;
}

export interface IEarlyDistributionAccountPayments {
    id: string;
    datePaid: string;
    account: string;
    interestPaid: number;
}

export interface IEarlyDistributionAccountPaymentsReceived {
    id: string;
    dateReceived: string;
    account: string;
    interestReceived: number;
}

export default class EarlyDistributionAccountModel {
    private _earlyDistributionAccount: IEarlyDistributionAccount;

    items = new Map<string, EarlyDistributionAccountModel>();

    constructor(private store: AppStore, earlyDistributionAccount: IEarlyDistributionAccount) {
        makeAutoObservable(this);
        this._earlyDistributionAccount = earlyDistributionAccount;
    }

    get all() {
        return Array.from(toJS(this.items.values())).sort((a, b) => sortAlphabetically(a.asJson.accountName, b.asJson.accountName));
    }

    get asJson(): IEarlyDistributionAccount {
        return toJS(this._earlyDistributionAccount);
    }

    getProductType(productCode: string) {
        return this.all.find((item) => item.asJson.productCode === productCode);
    }
}