import AppStore from "./AppStore";
import NaturalPersonStore from "./NaturalPersonStore";
import LegalEntityStore from "./LegalEntityStore";
import NaturalPersonAuditTrailStore from "./NaturalPersonAuditTrailStore";

export default class ClientsStore {
    legalEntity: LegalEntityStore;
    naturalPerson: NaturalPersonStore;
    naturalPersonAuditTrail: NaturalPersonAuditTrailStore;

    constructor(store: AppStore) {
        this.legalEntity = new LegalEntityStore(store);
        this.naturalPerson = new NaturalPersonStore(store);
        this.naturalPersonAuditTrail = new NaturalPersonAuditTrailStore(store);
    }
}