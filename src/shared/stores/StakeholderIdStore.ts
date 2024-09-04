import { makeAutoObservable } from "mobx";
import AppStore from "./AppStore";
import StakeholderIdModel, { IStakeholderId } from "../models/stakeholders/StakeholderIdModel";

export default class StakeholderIdStore {
    item: StakeholderIdModel | null = null;

    constructor(private store: AppStore) {
        makeAutoObservable(this);
    }

    load(item: IStakeholderId | null) {
        this.item = item ? new StakeholderIdModel(this.store, item) : null;
    }

    get id() {
        return this.item ? this.item.asJson.stakeholderId : "";
    }
}