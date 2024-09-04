import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultAssetManagerFlowDay: IAssetManagerFlowDay = {
    id: "",
    flowDate: Date.now()
}

export interface IAssetManagerFlowDay {
    id: string;
    flowDate: number
}
export default class AssetManagerFlowDayModel {
    private assetManagerDay: IAssetManagerFlowDay;

    constructor(private store: AppStore, assetManagerDay: IAssetManagerFlowDay) {
        makeAutoObservable(this);
        this.assetManagerDay = assetManagerDay;
    }

    get asJson(): IAssetManagerFlowDay {
        return toJS(this.assetManagerDay);
    }
}