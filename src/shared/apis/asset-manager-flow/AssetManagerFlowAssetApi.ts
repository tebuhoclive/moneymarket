import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import { IAssetManagerFlowAsset } from "../../models/AssetManagerFlowAssetModel";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";


export default class AssetManagerFlowAssetApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private assetPath() {
        return `/assetManagerDailyFlowsAssets`;
    }

    async getAll() {

        this.store.assetManager.asset.removeAll();
        const path = this.assetPath();

        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const assets: IAssetManagerFlowAsset[] = [];
                querySnapshot.forEach((doc) => {
                    assets.push({ id: doc.id, ...doc.data() } as IAssetManagerFlowAsset);
                });
                this.store.assetManager.asset.load(assets);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.assetPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IAssetManagerFlowAsset;
            this.store.assetManager.asset.load([item]);
        });

        return unsubscribe;
    }

    async create(item: IAssetManagerFlowAsset) {

        const path = this.assetPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }

    async update(item: IAssetManagerFlowAsset) {

        const path = this.assetPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.assetManager.asset.load([item]);
        } catch (error) { }
    }

    async delete(item: IAssetManagerFlowAsset) {
        const path = this.assetPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.assetManager.asset.remove(item.id);
        } catch (error) { }
    }
}