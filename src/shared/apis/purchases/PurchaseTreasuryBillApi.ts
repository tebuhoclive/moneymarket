import {
  query,
  collection,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  setDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { ITreasuryBillPurchaseAllocation } from "../../models/purchases/treasury-bills/TreasuryBillPurchaseAllocationModel";
import { IPurchaseTreasuryBill } from "../../models/purchases/treasury-bills/TreasuryBillPurchaseModel";
import { IMoneyMarketAccountPurchase } from "../../models/MoneyMarketAccountPurchase";
import { ITreasuryBillPurchaseTransaction } from "../../models/purchases/treasury-bills/TreasuryBillPurchaseTransactionModel";
import { ITreasuryBillDeskDealingSheet } from "../../models/purchases/treasury-bills/TreasuryBillDeskDealingSheetModel";
import { ITreasuryBillPurchaseHolding } from "../../models/purchases/treasury-bills/TreasuryBillPurchaseHoldingModel";
import { ITreasuryBillPurchaseExecution } from "../../models/purchases/treasury-bills/TreasuryBillPurchaseExecutionModel";

export default class PurchaseTreasuryBillApi {
  constructor(private api: AppApi, private store: AppStore) {}

  private treasuryBillsPath() {
    return "treasuryBills";
  }

  private treasuryBillItemsPath(treasuryId: string, category: string) {
    return `treasuryBills/${treasuryId}/${category}`;
  }

  private generateRandomString(length: number) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  async getAll() {
    this.store.purchase.treasuryBill.removeAll();
    const path = this.treasuryBillsPath();
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const tBills: IPurchaseTreasuryBill[] = [];
          querySnapshot.forEach((doc) => {
            tBills.push({ id: doc.id, ...doc.data() } as IPurchaseTreasuryBill);
          });
          this.store.purchase.treasuryBill.load(tBills);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllNewTenderSheet(purchaseId: string) {
    this.store.purchase.treasuryBillAllocation.removeAll();
    const path = `treasuryBills/${purchaseId}/newTendersheet`;
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const tBills: ITreasuryBillPurchaseAllocation[] = [];
          querySnapshot.forEach((doc) => {
            tBills.push({
              id: doc.id,
              ...doc.data(),
            } as ITreasuryBillPurchaseAllocation);
          });
          this.store.purchase.treasuryBillAllocation.load(tBills);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllOldTenderSheet(purchaseId: string) {
    this.store.purchase.treasuryBillAllocation.removeAll();
    const path = `treasuryBills/${purchaseId}/oldTendersheet`;
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const tBills: ITreasuryBillPurchaseAllocation[] = [];
          querySnapshot.forEach((doc) => {
            tBills.push({
              id: doc.id,
              ...doc.data(),
            } as ITreasuryBillPurchaseAllocation);
          });
          this.store.purchase.treasuryBillAllocation.load(tBills);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllPurchaseTransactionClients(purchaseId: string) {
    this.store.purchase.treasuryBillTransaction.removeAll();
    // const path = `treasuryBill/${purchaseId}/transactionSheet`
    const path = `treasuryBill/${purchaseId}/transactionSheet`;
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const tBills: ITreasuryBillPurchaseTransaction[] = [];
          querySnapshot.forEach((doc) => {
            tBills.push({
              id: doc.id,
              ...doc.data(),
            } as ITreasuryBillPurchaseTransaction);
          });
          this.store.purchase.treasuryBillTransaction.load(tBills);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllPurchaseHoldings(purchaseId: string) {
    this.store.purchase.treasuryBillHolding.removeAll();

    const path = `treasuryBill/${purchaseId}/holdings`;
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const tBills: ITreasuryBillPurchaseHolding[] = [];
          querySnapshot.forEach((doc) => {
            tBills.push({
              id: doc.id,
              ...doc.data(),
            } as ITreasuryBillPurchaseHolding);
          });
          this.store.purchase.treasuryBillHolding.load(tBills);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllPurchaseExecutionFileItems(purchaseId: string) {
    this.store.purchase.treasuryBillExecution.removeAll();

    const path = `treasuryBill/${purchaseId}/executionFile`;
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const tBills: ITreasuryBillPurchaseExecution[] = [];
          querySnapshot.forEach((doc) => {
            tBills.push({
              id: doc.id,
              ...doc.data(),
            } as ITreasuryBillPurchaseExecution);
          });
          this.store.purchase.treasuryBillExecution.load(tBills);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllPurchaseDeskDealing(purchaseId: string) {
    this.store.purchase.treasuryBillDeskDealingSheet.removeAll();

    const path = `treasuryBills/${purchaseId}/oldTendersheet`;
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const tBills: ITreasuryBillDeskDealingSheet[] = [];
          querySnapshot.forEach((doc) => {
            tBills.push({
              id: doc.id,
              ...doc.data(),
            } as ITreasuryBillDeskDealingSheet);
          });
          this.store.purchase.treasuryBillDeskDealingSheet.load(tBills);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllFromAcount(accountId: string) {
    this.store.purchase.moneyMarket.removeAll();
    const path = `moneyMarketAccounts/${accountId}/purchases`;
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const tBills: IMoneyMarketAccountPurchase[] = [];
          querySnapshot.forEach((doc) => {
            tBills.push({
              id: doc.id,
              ...doc.data(),
            } as IMoneyMarketAccountPurchase);
          });
          this.store.purchase.moneyMarket.load(tBills);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getFromAccountById(mmaId: string, purchaseId: string) {
    const path = `moneyMarketAccounts/${mmaId}/purchases/${purchaseId}`;
    if (!path) return;

    const unsubscribe = onSnapshot(doc(db, path, purchaseId), (doc) => {
      if (!doc.exists) return;
      const item = {
        id: doc.id,
        ...doc.data(),
      } as ITreasuryBillPurchaseAllocation;
      this.store.purchase.treasuryBillAllocation.load([item]);
    });

    return unsubscribe;
  }

  async getById(purchaseId: string) {
    const path = `treasuryBill`;
    if (!path) return;

    const unsubscribe = onSnapshot(doc(db, path, purchaseId), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as IPurchaseTreasuryBill;
      this.store.purchase.treasuryBill.load([item]);
    });

    return unsubscribe;
  }

  async createDeskDealingSheet(
    purchaseId: string,
    item: ITreasuryBillDeskDealingSheet
  ) {
    const path = `treasuryBill/${purchaseId}/deskDealingSheet`;
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {}
  }

  async updateDeskDealingSheet(
    purchaseId: string,
    item: ITreasuryBillDeskDealingSheet
  ) {
    const path = `treasuryBill/${purchaseId}/deskDealingSheet`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.treasuryBillDeskDealingSheet.load([item]);
    } catch (error) {}
  }

  async createPurchaseOldTenderSheet(
    purchaseId: string,
    item: ITreasuryBillPurchaseAllocation
  ) {
    const path = `treasuryBills/${purchaseId}/oldTendersheet`;
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {
      console.log(error);
    }
  }

  async createPurchaseNewTenderSheet(
    purchaseId: string,
    item: ITreasuryBillPurchaseAllocation
  ) {
    const path = `treasuryBills/${purchaseId}/newTendersheet`;
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {
      console.log(error);
    }
  }

  async createOrUpdatePurchaseOldTenderSheet(purchaseId: string, item: any) {
    const path = `treasuryBills/${purchaseId}/oldTendersheet`;
    if (!path) return;

    const itemRef = doc(db, path, item.id);

    try {
      const itemSnapshot = await getDoc(itemRef);

      if (itemSnapshot.exists()) {
        // Item already exists, update it
        await updateDoc(itemRef, item);
      } else {
        // Item doesn't exist, create it
        await setDoc(itemRef, item);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async createOrUpdatePurchaseNewTenderSheet(purchaseId: string, item: any) {
    const path = `treasuryBills/${purchaseId}/newTendersheet`;
    if (!path) return;

    const itemRef = doc(db, path, item.id);

    try {
      const itemSnapshot = await getDoc(itemRef);

      if (itemSnapshot.exists()) {
        // Item already exists, update it
        await updateDoc(itemRef, item);
      } else {
        // Item doesn't exist, create it
        await setDoc(itemRef, item);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updatePurchaseOldTenderSheet(
    purchaseId: string,
    item: ITreasuryBillPurchaseAllocation
  ) {
    const path = `treasuryBills/${purchaseId}/newTendersheet`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.treasuryBillAllocation.load([item]);
    } catch (error) {}
  }

  async updatePurchaseNewTenderSheet(
    purchaseId: string,
    item: ITreasuryBillPurchaseAllocation
  ) {
    const path = `treasuryBills/${purchaseId}/newTendersheet`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.treasuryBillAllocation.load([item]);
    } catch (error) {
      console.log(error);
    }
  }

  async deletePurchaseOldTenderSheetItem(
    purchaseId: string,
    item: ITreasuryBillPurchaseAllocation
  ) {
    const path = `treasuryBills/${purchaseId}/newTendersheet`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.treasuryBillAllocation.remove(item.id);
    } catch (error) {}
  }

  async deletePurchaseNewTenderSheetItem(
    purchaseId: string,
    item: ITreasuryBillPurchaseAllocation
  ) {
    const path = `treasuryBills/${purchaseId}/newTendersheet`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.treasuryBillAllocation.remove(item.id);
    } catch (error) {}
  }

  async deleteAllDocumentsInCollection(purchaseId:string) {
    const path = `treasuryBills/${purchaseId}/newTendersheet`;
    const collectionRef = collection(db, path);
    const querySnapshot = await getDocs(collectionRef);
  
    querySnapshot.forEach(async (doc) => {
      try {
        await deleteDoc(doc.ref);
      } catch (error) {
        console.error(`Error deleting document: ${error}`);
      }
    });
  }

  /************************************ Transaction File ******************************************** */

  async createPurchaseOldTransactionFile(
    purchaseId: string,
    item: ITreasuryBillPurchaseTransaction
  ) {
    const path = `treasuryBills/${purchaseId}/oldTransactionFile`;
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {
      console.log(error);
    }
  }

  async createPurchaseNewTransactionFile(
    purchaseId: string,
    item: ITreasuryBillPurchaseTransaction
  ) {
    const path = `treasuryBills/${purchaseId}/newTransactionFile`;
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {
      console.log(error);
    }
  }

  async createOrUpdatePurchaseoldTransactionFile(
    purchaseId: string,
    item: any
  ) {
    const path = `treasuryBills/${purchaseId}/oldTransactionFile`;
    if (!path) return;

    const itemRef = doc(db, path, item.id);

    try {
      const itemSnapshot = await getDoc(itemRef);

      if (itemSnapshot.exists()) {
        // Item already exists, update it
        await updateDoc(itemRef, item);
      } else {
        // Item doesn't exist, create it
        await setDoc(itemRef, item);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async createOrUpdatePurchaseNewTransactionFile(
    purchaseId: string,
    item: any
  ) {
    const path = `treasuryBills/${purchaseId}/newTransactionFile`;
    if (!path) return;

    const itemRef = doc(db, path, item.id);

    try {
      const itemSnapshot = await getDoc(itemRef);

      if (itemSnapshot.exists()) {
        // Item already exists, update it
        await updateDoc(itemRef, item);
      } else {
        // Item doesn't exist, create it
        await setDoc(itemRef, item);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updatePurchaseOldTransactionFile(
    purchaseId: string,
    item: ITreasuryBillPurchaseTransaction
  ) {
    const path = `treasuryBills/${purchaseId}/oldTransactionFile`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.treasuryBillTransaction.load([item]);
    } catch (error) {}
  }

  async updatePurchaseNewTransactionFile(
    purchaseId: string,
    item: ITreasuryBillPurchaseTransaction
  ) {
    const path = `treasuryBills/${purchaseId}/newTransactionFile`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.treasuryBillTransaction.load([item]);
    } catch (error) {
      console.log(error);
    }
  }

  async deletePurchaseOldTransactionFileItem(
    purchaseId: string,
    item: ITreasuryBillPurchaseAllocation
  ) {
    const path = `treasuryBills/${purchaseId}/newTransactionFile`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.treasuryBillTransaction.remove(item.id);
    } catch (error) {}
  }

  async deletePurchaseNewTransactionFileItem(
    purchaseId: string,
    item: ITreasuryBillPurchaseTransaction
  ) {
    const path = `treasuryBills/${purchaseId}/newTransactionFile`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.treasuryBillTransaction.remove(item.id);
    } catch (error) {}
  }

  /************************************ Transaction File ******************************************** */

  async createPurchaseHolding(
    purchaseId: string,
    item: ITreasuryBillPurchaseHolding
  ) {
    const path = `treasuryBill/${purchaseId}/holdings`;

    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {
      console.log(error);
    }
  }

  async createPurchaseExecution(
    purchaseId: string,
    item: ITreasuryBillPurchaseExecution
  ) {
    const path = `treasuryBill/${purchaseId}/executionFile`;

    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {
      console.log(error);
    }
  }

  async updatePurchaseHolding(
    purchaseId: string,
    item: ITreasuryBillPurchaseHolding
  ) {
    const path = `treasuryBill/${purchaseId}/holdings`;

    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.treasuryBillHolding.load([item]);
    } catch (error) {}
  }

  async update(item: IPurchaseTreasuryBill) {
    const path = this.treasuryBillsPath();

    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.treasuryBill.load([item]);
    } catch (error) {}
  }

  async delete(mmaId: string, item: ITreasuryBillPurchaseAllocation) {
    const path = `moneyMarketAccounts/${mmaId}/purchases`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.treasuryBillAllocation.remove(item.id);
    } catch (error) {}
  }

  async createPurchaseInAccount(
    accountId: string,
    item: IMoneyMarketAccountPurchase
  ) {
    const path = `moneyMarketAccounts/${accountId}/purchases`;

    if (!path) return;

    const itemRef = doc(
      collection(db, path),
      `${this.generateRandomString(20)}-TB`
    );
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {}
  }

  async updatePurchaseInAccount(
    accountId: string,
    item: ITreasuryBillPurchaseAllocation
  ) {
    const path = `moneyMarketAccounts/${accountId}/purchases`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.treasuryBillAllocation.load([item]);
    } catch (error) {}
  }

  async deletePurchaseInAccount(
    mmaId: string,
    item: ITreasuryBillPurchaseAllocation
  ) {
    const path = `moneyMarketAccounts/${mmaId}/purchases`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.treasuryBillAllocation.remove(item.id);
    } catch (error) {}
  }
}
