import {doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IStakeholderId } from "../../models/stakeholders/StakeholderIdModel";

export default class StakeholderIdApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private stakeholder() {
        return "stakeholderId";
    }

    private stakeholderId = "TURwHEkCzkSRVcbjdtTk";

    async getId() {
        const path = this.stakeholder();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, this.stakeholderId), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IStakeholderId;
            this.store.stakeholderId.load(item);
        });
        return unsubscribe;
    }

    async update(item: IStakeholderId) {

        const path = this.stakeholder();
        if (!path) return;

        try {
            await setDoc(doc(db, path, this.stakeholderId), {
                ...item,
            });
            this.store.stakeholderId.load(item);
        } catch (error) { }
    }
}