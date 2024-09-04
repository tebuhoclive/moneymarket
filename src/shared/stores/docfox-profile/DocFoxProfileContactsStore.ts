import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction } from "mobx";
import DocFoxProfileContactsModel, { IDocFoxProfileContacts } from "../../models/clients/docfox-profile/DocFoxProfileContactsModel";


export default class DocFoxProfileContactsStore extends Store<IDocFoxProfileContacts, DocFoxProfileContactsModel> {
    items = new Map<string, DocFoxProfileContactsModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IDocFoxProfileContacts[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new DocFoxProfileContactsModel(this.store, item))
            );
        });
    }
}
