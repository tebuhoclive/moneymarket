import {doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IEntityId } from "../../models/clients/EntityIdModel";

export default class EntityIdApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private entity() {
        return "entityId";
    }

    private entityId = "TURwHEkCzkSRVcbjdtTk";

    async getId() {
        const path = this.entity();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, this.entityId), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IEntityId;
            this.store.entityId.load(item);
        });
        return unsubscribe;
    }

    async update(item: IEntityId) {

        const path = this.entity();
        if (!path) return;

        try {
            await setDoc(doc(db, path, this.entityId), {
                ...item,
            });
            this.store.entityId.load(item);
        } catch (error) { }
    }
}