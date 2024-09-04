import { runInAction, toJS } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import CessionInstructionModel, { ICessionInstruction } from "../../models/cession/CessionInstructionModel";


export default class CessionStore extends Store<ICessionInstruction, CessionInstructionModel> {
    items = new Map<string, CessionInstructionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ICessionInstruction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new CessionInstructionModel(this.store, item))
            );
        });
    }

    getByItemProductId(cessionId: string) {
        const list = Array.from(toJS(this.items.values()));
        return list.find((item) => item.asJson.id === cessionId);
    }
}