import {
  query,
  collection,
  updateDoc,
  doc,
  onSnapshot,
  Unsubscribe,
  setDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { ICommunicationAndFiling } from "../../models/money-market-account/CommunicationAndFiling";

export default class CommunicationAndFilingApi {
  constructor(private api: AppApi, private store: AppStore) { }

  private categoriesPath(accountId: string) {
    return `moneyMarketAccounts/${accountId}/CommunicationAndFilings`;
  }

  async getAll(accountId: string) {
    this.store.communication.removeAll();
    const path = this.categoriesPath(accountId);
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const communication: ICommunicationAndFiling[] = [];
          querySnapshot.forEach((doc) => {
            communication.push({ id: doc.id, ...doc.data() } as ICommunicationAndFiling);
          });
          this.store.communication.load(communication);
          if (querySnapshot.size === communication.length) {
            resolve(unsubscribe);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async getById(accountId: string, communicationId: string) {
    const path = this.categoriesPath(accountId);
    if (!path) return;

    const unsubscribe = onSnapshot(doc(db, path, communicationId), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as ICommunicationAndFiling;
      this.store.communication.load([item]);
    });
    return unsubscribe;
  }

  async create(accountId: string, item: ICommunicationAndFiling) {
    const path = this.categoriesPath(accountId);
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {

    }
  }

  async update(accountId: string, item: ICommunicationAndFiling) {
    const path = this.categoriesPath(accountId);
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.communication.load([item]);
    } catch (error) {

    }
  }
}
