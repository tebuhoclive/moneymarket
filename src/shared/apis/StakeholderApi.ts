import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";

import RelatedPartyApi from "./stakeholders/RelatedPartyApi";
import StakeholderIdApi from "./stakeholders/StakeholderIdApi";

export default class ClientsApi {
    relatedParty: RelatedPartyApi;
    stakeholderId: StakeholderIdApi;

    constructor(api: AppApi, store: AppStore) {
        this.relatedParty = new RelatedPartyApi(api, store);
        this.stakeholderId = new StakeholderIdApi(api, store);
    }
}