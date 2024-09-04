import { runInAction, toJS } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import CessionInstructionAuditTrailModel, { ICessionInstructionAuditTrail } from "../../models/cession/CessionInstructionAuditTrailModel";

export default class CessionAuditTrailStore extends Store<ICessionInstructionAuditTrail, CessionInstructionAuditTrailModel> {
    items = new Map<string, CessionInstructionAuditTrailModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ICessionInstructionAuditTrail[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new CessionInstructionAuditTrailModel(this.store, item))
            );
        });
    }

    getByItemProductId(cessionId: string) {
        const list = Array.from(toJS(this.items.values()));
        return list.find((item) => item.asJson.id === cessionId);
    }
}