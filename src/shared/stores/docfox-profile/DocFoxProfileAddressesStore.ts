import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction } from "mobx";
import DocFoxProfileAddressesModel, { IDocFoxProfileAddresses } from "../../models/clients/docfox-profile/DocFoxProfileAddressesModel";


export default class DocFoxProfileAddressesStore extends Store<IDocFoxProfileAddresses, DocFoxProfileAddressesModel> {
    items = new Map<string, DocFoxProfileAddressesModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IDocFoxProfileAddresses[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new DocFoxProfileAddressesModel(this.store, item))
            );
        });
    }
}
