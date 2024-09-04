import {
  query,
  collection,
  onSnapshot,
  Unsubscribe,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";

import { IStatementTransaction } from "../models/StatementTransactionModel";

export default class StatementTransactionApi {
  constructor(private store: AppStore) {}

  private statementTransactionPath(id: string) {
    return `moneyMarketAccounts/${id}/transactions`;
  }

  async getAll(moneyMarketAccountId: string) {
    this.store.statementTransaction.removeAll();
    const path = this.statementTransactionPath(moneyMarketAccountId);
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const statementTransaction: IStatementTransaction[] = [];
          querySnapshot.forEach((doc) => {
            statementTransaction.push({
              id: doc.id,
              ...doc.data(),
            } as IStatementTransaction);
          });
          this.store.statementTransaction.load(statementTransaction);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async $getAll(moneyMarketAccountId: string) {
    this.store.statementTransaction.removeAll();
    const path = this.statementTransactionPath(moneyMarketAccountId);
    if (!path) return;

    const queryRef = collection(db, path);
    const querySnapshot = await getDocs(queryRef);

    const statementTransaction: IStatementTransaction[] = [];
    querySnapshot.forEach((doc) => {
      statementTransaction.push({
        id: doc.id,
        ...doc.data(),
      } as IStatementTransaction);
    });
    this.store.statementTransaction.load(statementTransaction);
    return () => {}; // Return a no-op unsubscribe function
  }

  async getById(moneyMarketAccountId: string, id: string) {
    const path = this.statementTransactionPath(moneyMarketAccountId);
    if (!path) return;

    const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as IStatementTransaction;
      this.store.statementTransaction.load([item]);
    });

    return unsubscribe;
  }

  async update(moneyMarketAccountId: string, item: IStatementTransaction) {
    const path = this.statementTransactionPath(moneyMarketAccountId);
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.statementTransaction.load([item]);
      this.getAll(moneyMarketAccountId);
    } catch (error) {
      console.log(error);
    }
  }

  async delete(moneyMarketAccountId: string, item: IStatementTransaction) {
    const path = this.statementTransactionPath(moneyMarketAccountId);
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.statementTransaction.remove(item.id);
    } catch (error) {}
  }
}
