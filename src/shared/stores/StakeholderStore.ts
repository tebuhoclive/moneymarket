import AppStore from "./AppStore";
import RelatedPartyStore from "./RelatedPartyStore";

export default class StakeholderStore {
    relatedParty: RelatedPartyStore;

    constructor(store: AppStore) {
        this.relatedParty = new RelatedPartyStore(store);
    }
}