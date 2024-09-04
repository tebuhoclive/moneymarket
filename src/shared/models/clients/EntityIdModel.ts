import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultEntityId: IEntityId = {
    id: "",
    entityId: "",
    createdOn: Date.now()
}

export interface IEntityId {
    id: string;
    entityId: string;
    createdOn: number;
}
export default class EntityIdModel {
    private entity: IEntityId;

    constructor(private store: AppStore, entity: IEntityId) {
        makeAutoObservable(this);
        this.entity = entity;
    }

    get asJson(): IEntityId {
        return toJS(this.entity);
    }
}