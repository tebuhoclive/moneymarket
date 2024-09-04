import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction } from "mobx";
import DocFoxProfileAdditionalDetailsModel, { IDocFoxProfileAdditionalDetails } from "../../models/clients/docfox-profile/DocFoxProfileAdditionalDetailsModel";

export default class DocFoxProfileAdditionalDetailsStore extends Store<IDocFoxProfileAdditionalDetails, DocFoxProfileAdditionalDetailsModel> {
    items = new Map<string, DocFoxProfileAdditionalDetailsModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IDocFoxProfileAdditionalDetails[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new DocFoxProfileAdditionalDetailsModel(this.store, item))
            );
        });
    }
}
