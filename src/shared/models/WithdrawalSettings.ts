import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultWithdrawalSettings: IWithdrawalSetting = {
    id: "WithdrawalSettings",
    withdrawalThreshold: {
        enabled: false,
        value: null
    },
    monthlyClientWithdrawalCountLimit: {
        enabled: false,
        value: null
    }
}

export const defaultDepositSettings: IDepositSetting = {
    id: "DepositSettings",
    investmentThreshold: {
        enabled: false,
        value: null
    },
    monthlyClientInvestmentCountLimit: {
        enabled: false,
        value: null
    }
}

export interface IWithdrawalSetting {
    id: string;
    withdrawalThreshold: ISetting;
    monthlyClientWithdrawalCountLimit: ISetting;
}

export interface IDepositSetting {
    id: string;
    investmentThreshold: ISetting;
    monthlyClientInvestmentCountLimit: ISetting;
}


export interface ISetting {
    enabled: boolean;
    value: string | number | null;
}

export default class WithdrawalSettingsModel {
    private withdrawalSettings: IWithdrawalSetting ;

    constructor(private store: AppStore, withdrawalSettings: IWithdrawalSetting) {
        makeAutoObservable(this);
        this.withdrawalSettings = withdrawalSettings;
    }

    get asJson(): IWithdrawalSetting  {
        return toJS(this.withdrawalSettings);
    }
}