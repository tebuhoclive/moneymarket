import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction } from "mobx";
import DocFoxProfileNumbersModel, { IDocFoxProfileNumbers } from "../../models/clients/docfox-profile/DocFoxProfileNumbersModel";

export default class DocFoxProfileNumbersStore extends Store<IDocFoxProfileNumbers, DocFoxProfileNumbersModel> {
    items = new Map<string, DocFoxProfileNumbersModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IDocFoxProfileNumbers[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new DocFoxProfileNumbersModel(this.store, item))
            );
        });
    }
}
