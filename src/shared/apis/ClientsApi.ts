import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import NaturalPersonApi from "./clients/NaturalPersonApi";
import EntityIdApi from "./clients/EntityIdApi";
import LegalEntityApi from "./clients/LegalEntityApi";
import NaturalPersonAuditTrailApi from "./clients/NaturalPersonAuditTrailApi";

export default class ClientsApi {
    legalEntity: LegalEntityApi;
    naturalPerson: NaturalPersonApi;
    naturalPersonAuditTrail: NaturalPersonAuditTrailApi;
    entityId: EntityIdApi;

    constructor(api: AppApi, store: AppStore) {
        this.legalEntity = new LegalEntityApi(api, store);
        this.naturalPerson = new NaturalPersonApi(api, store);
        this.naturalPersonAuditTrail = new NaturalPersonAuditTrailApi(api, store);
        this.entityId = new EntityIdApi(api, store)
    }
}