import { makeAutoObservable } from "mobx";
import EntityIdModel, { IEntityId } from "../models/clients/EntityIdModel";
import AppStore from "./AppStore";

export default class EntityIdStore {
    item: EntityIdModel | null = null;

    constructor(private store: AppStore) {
        makeAutoObservable(this);
    }

    load(item: IEntityId | null) {
        this.item = item ? new EntityIdModel(this.store, item) : null;
    }

    get id() {
        return this.item ? this.item.asJson.entityId : "";
    }
}