import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultStakeholderId: IStakeholderId = {
    id: "",
    stakeholderId: "",
    createdOn: Date.now()
}

export interface IStakeholderId {
    id: string;
    stakeholderId: string;
    createdOn: number;
}
export default class StakeholderIdModel {
    private stakeholder: IStakeholderId;

    constructor(private store: AppStore, stakeholder: IStakeholderId) {
        makeAutoObservable(this);
        this.stakeholder = stakeholder;
    }

    get asJson(): IStakeholderId {
        return toJS(this.stakeholder);
    }
}