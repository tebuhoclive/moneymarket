import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";
import { sortAlphabetically } from "../../utils/utils";
import { isDateOlderThanOneYear } from "../../functions/compliance/Compliance";

export const defaultMoneyMarketAccount: IMoneyMarketAccount = {
    id: "",
    parentEntity: "",
    accountNumber: "",
    accountName: "",
    accountType: "",
    baseRate: 0,
    feeRate: 0,
    cession: 0,
    balance: 0,
    runningBalance: 0,
    displayOnEntityStatement: true,
    status: "Active",
    monthTotalInterest: 0,
    previousBalance: 0,
    backUpMonthTotalInterest: 0,
    previousInterestEarned: 0,
    clientRate: 0
}

export interface IMoneyMarketAccount {
    id: string;
    parentEntity: string;
    oldCPNumber?: string; // from Tasman
    accountNumber: string;
    accountName: string;
    accountType: string;
    baseRate: number;
    feeRate: number;
    availableBalance?: number; // used to track how much money is reserved for pending transactions 
    clientRate: number;
    backUpClientRate?: number;
    cession: number;
    balance: number;
    backUpBalance?: number;
    runningBalance: number;
    displayOnEntityStatement: boolean;
    status: string;
    monthTotalInterest?: number;
    previousBalance?: number;
    backUpMonthTotalInterest?: number;
    previousInterestEarned?: number;
    description?: string;
    createdBy?: string;
    days?: number;
    sourceOfFunds?: string;
    incomeDistribution?: string;
    fees?: number
    rolledBack?: boolean
}

export default class MoneyMarketAccountModel {
    private account: IMoneyMarketAccount;

    items = new Map<string, MoneyMarketAccountModel>();

    constructor(private store: AppStore, account: IMoneyMarketAccount) {
        makeAutoObservable(this);
        this.account = account;
    }

    get asJson(): IMoneyMarketAccount {
        return toJS(this.account);
    }

    get accountTypeObject() {
        return this.store.product.getItemById(this.account.accountType);
    }

    static groupByParentId(accounts: MoneyMarketAccountModel[]): Record<string, MoneyMarketAccountModel[]> {
        const groupedAccounts: Record<string, MoneyMarketAccountModel[]> = {};

        for (const account of accounts) {
            const parentId = account.account.parentEntity;

            if (parentId in groupedAccounts) {
                groupedAccounts[parentId].push(account);
            } else {
                groupedAccounts[parentId] = [account];
            }
        }
        return groupedAccounts;
    }

    static groupByAccountType(accounts: MoneyMarketAccountModel[]): Record<string, MoneyMarketAccountModel[]> {
        const groupedAccounts: Record<string, MoneyMarketAccountModel[]> = {};

        for (const account of accounts) {
            const accountType = account.account.accountType;

            if (accountType in groupedAccounts) {
                groupedAccounts[accountType].push(account);
            } else {
                groupedAccounts[accountType] = [account];
            }
        }
        return groupedAccounts;
    }

    get all() {
        return Array.from(toJS(this.items.values())).sort((a, b) => sortAlphabetically(a.asJson.accountNumber, b.asJson.accountNumber));
    }

    getProductType(accountType: string) {
        return this.all.find((item) => item.asJson.accountType === accountType);
    }

    getEntityDisplayName(entityId: string) {
        const clients = [
            ...this.store.client.naturalPerson.all,
            ...this.store.client.legalEntity.all,
        ];
        return clients.find((item) => item.asJson.entityId === entityId)?.asJson.entityDisplayName;
    }

    getClientInfo(entityId: string) {
        const clients = [
            ...this.store.client.naturalPerson.all,
            ...this.store.client.legalEntity.all,
        ];
        const clientInfo = clients.find((item) => item.asJson.entityId === entityId);
        if (clientInfo) {
            return clientInfo.asJson
        } else {
            return undefined
        }
    }

    getClientComplianceStatus(entityId: string) {
        const clients = [
            ...this.store.client.naturalPerson.all,
            // ...this.store.client.legalEntity.all,
        ];
        const clientInfo = clients.find((item) => item.asJson.entityId === entityId);
        if (clientInfo) {
            const dateOfLastFIA = isDateOlderThanOneYear(clientInfo.asJson.dateOfLastFIA);
            return dateOfLastFIA
        } else {
            return undefined
        }
    }

    getByProduct(accountType: string) {
        return this.all.filter((item) => item.asJson.accountType === accountType);
    }
}