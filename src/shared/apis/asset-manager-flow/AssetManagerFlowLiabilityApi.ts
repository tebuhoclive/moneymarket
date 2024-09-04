import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import { IAssetManagerFlowLiability } from "../../models/AssetManagerFlowLiabilityModel";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";


export default class AssetManagerFlowLiabilityApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private liabilitiesPath() {
        return `/assetManagerDailyFlowsLiabilities`;
    }

    async getAll() {

        this.store.assetManager.liability.removeAll();
        const path = this.liabilitiesPath();

        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const liabilities: IAssetManagerFlowLiability[] = [];
                querySnapshot.forEach((doc) => {
                    liabilities.push({ id: doc.id, ...doc.data() } as IAssetManagerFlowLiability);
                });
                this.store.assetManager.liability.load(liabilities);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById( id: string) {
        const path = this.liabilitiesPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IAssetManagerFlowLiability;
            this.store.assetManager.liability.load([item]);
        });

        return unsubscribe;
    }

    async create( item: IAssetManagerFlowLiability) {

        const path = this.liabilitiesPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }

    async update(item: IAssetManagerFlowLiability) {

        const path = this.liabilitiesPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.assetManager.liability.load([item]);
        } catch (error) { }
    }

    async delete(item: IAssetManagerFlowLiability) {
        const path = this.liabilitiesPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.assetManager.liability.remove(item.id);
        } catch (error) { }
    }
}