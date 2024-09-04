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
  import { IMoneyMarketAccountPurchase } from "../../models/MoneyMarketAccountPurchase";
import { IPurchaseCallDeposit } from "../../models/purchases/call-deposit/PurchaseCallDepositModel";
import { ICallDepositPurchaseAllocation } from "../../models/purchases/call-deposit/CallDepositPurchaseAllocationModel";
import { ICallDepositPurchaseTransaction } from "../../models/purchases/call-deposit/CallDepositPurchaseTransactionModel";
import { ICallDepositPurchaseHolding } from "../../models/purchases/call-deposit/CallDepositPurchaseHoldingModel";
import { ICallDepositPurchaseExecution } from "../../models/purchases/call-deposit/CallDepositPurchaseExecutionModel";
import { ICallDepositDeskDealingSheet } from "../../models/purchases/call-deposit/CallDepositDeskDealingSheetModel";
  
  export default class PurchaseCallDepositApi {
    constructor(private api: AppApi, private store: AppStore) {}
  
    private callDepositsPath() {
      return "callDeposits";
    }
  
    private callDepositsItemsPath(callDepId: string, category: string) {
      return `callDeposits/${callDepId}/${category}`;
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
      this.store.purchase.callDeposit.removeAll();
      const path = this.callDepositsPath();
      if (!path) return;
  
      const $query = query(collection(db, path));
  
      return await new Promise<Unsubscribe>((resolve, reject) => {
        const unsubscribe = onSnapshot(
          $query,
          (querySnapshot) => {
            const callD: IPurchaseCallDeposit[] = [];
            querySnapshot.forEach((doc) => {
              callD.push({ id: doc.id, ...doc.data() } as IPurchaseCallDeposit);
            });
            this.store.purchase.callDeposit.load(callD);
            resolve(unsubscribe);
          },
          (error) => {
            reject();
          }
        );
      });
    }
  
    async getAllNewTenderSheet(purchaseId: string) {
      this.store.purchase.callDepositAllocation.removeAll();
      const path = `callDeposits/${purchaseId}/newTendersheet`;
      if (!path) return;
  
      const $query = query(collection(db, path));
  
      return await new Promise<Unsubscribe>((resolve, reject) => {
        const unsubscribe = onSnapshot(
          $query,
          (querySnapshot) => {
            const callD: ICallDepositPurchaseAllocation[] = [];
            querySnapshot.forEach((doc) => {
              callD.push({
                id: doc.id,
                ...doc.data(),
              } as ICallDepositPurchaseAllocation);
            });
            this.store.purchase.callDepositAllocation.load(callD);
            resolve(unsubscribe);
          },
          (error) => {
            reject();
          }
        );
      });
    }
  
    async getAllOldTenderSheet(purchaseId: string) {
      this.store.purchase.callDepositAllocation.removeAll();
      const path = `callDeposits/${purchaseId}/oldTendersheet`;
      if (!path) return;
  
      const $query = query(collection(db, path));
  
      return await new Promise<Unsubscribe>((resolve, reject) => {
        const unsubscribe = onSnapshot(
          $query,
          (querySnapshot) => {
            const callD: ICallDepositPurchaseAllocation[] = [];
            querySnapshot.forEach((doc) => {
              callD.push({
                id: doc.id,
                ...doc.data(),
              } as ICallDepositPurchaseAllocation);
            });
            this.store.purchase.callDepositAllocation.load(callD);
            resolve(unsubscribe);
          },
          (error) => {
            reject();
          }
        );
      });
    }
  
    async getAllPurchaseTransactionClients(purchaseId: string) {
      this.store.purchase.callDepositTransaction.removeAll();
      // const path = `treasuryBill/${purchaseId}/transactionSheet`
      const path = `callDeposit/${purchaseId}/transactionSheet`;
      if (!path) return;
  
      const $query = query(collection(db, path));
  
      return await new Promise<Unsubscribe>((resolve, reject) => {
        const unsubscribe = onSnapshot(
          $query,
          (querySnapshot) => {
            const callD: ICallDepositPurchaseTransaction[] = [];
            querySnapshot.forEach((doc) => {
              callD.push({
                id: doc.id,
                ...doc.data(),
              } as ICallDepositPurchaseTransaction);
            });
            this.store.purchase.callDepositTransaction.load(callD);
            resolve(unsubscribe);
          },
          (error) => {
            reject();
          }
        );
      });
    }
  
    async getAllPurchaseHoldings(purchaseId: string) {
      this.store.purchase.callDepositHolding.removeAll();
  
      const path = `callDeposit/${purchaseId}/holdings`;
      if (!path) return;
  
      const $query = query(collection(db, path));
  
      return await new Promise<Unsubscribe>((resolve, reject) => {
        const unsubscribe = onSnapshot(
          $query,
          (querySnapshot) => {
            const callD: ICallDepositPurchaseHolding[] = [];
            querySnapshot.forEach((doc) => {
              callD.push({
                id: doc.id,
                ...doc.data(),
              } as ICallDepositPurchaseHolding);
            });
            this.store.purchase.callDepositHolding.load(callD);
            resolve(unsubscribe);
          },
          (error) => {
            reject();
          }
        );
      });
    }
  
    async getAllPurchaseExecutionFileItems(purchaseId: string) {
      this.store.purchase.callDepositExecution.removeAll();
  
      const path = `callDeposit/${purchaseId}/executionFile`;
      if (!path) return;
  
      const $query = query(collection(db, path));
  
      return await new Promise<Unsubscribe>((resolve, reject) => {
        const unsubscribe = onSnapshot(
          $query,
          (querySnapshot) => {
            const callD: ICallDepositPurchaseExecution[] = [];
            querySnapshot.forEach((doc) => {
              callD.push({
                id: doc.id,
                ...doc.data(),
              } as ICallDepositPurchaseExecution);
            });
            this.store.purchase.callDepositExecution.load(callD);
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
  
      const path = `callDeposits/${purchaseId}/oldTendersheet`;
      if (!path) return;
  
      const $query = query(collection(db, path));
  
      return await new Promise<Unsubscribe>((resolve, reject) => {
        const unsubscribe = onSnapshot(
          $query,
          (querySnapshot) => {
            const callD: ICallDepositDeskDealingSheet[] = [];
            querySnapshot.forEach((doc) => {
              callD.push({
                id: doc.id,
                ...doc.data(),
              } as ICallDepositDeskDealingSheet);
            });
            this.store.purchase.callDepositDeskDealingSheet.load(callD);
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
            const callD: IMoneyMarketAccountPurchase[] = [];
            querySnapshot.forEach((doc) => {
              callD.push({
                id: doc.id,
                ...doc.data(),
              } as IMoneyMarketAccountPurchase);
            });
            this.store.purchase.moneyMarket.load(callD);
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
        } as ICallDepositPurchaseAllocation;
        this.store.purchase.callDepositAllocation.load([item]);
      });
  
      return unsubscribe;
    }
  
    async getById(purchaseId: string) {
      const path = `callDeposit`;
      if (!path) return;
  
      const unsubscribe = onSnapshot(doc(db, path, purchaseId), (doc) => {
        if (!doc.exists) return;
        const item = { id: doc.id, ...doc.data() } as IPurchaseCallDeposit;
        this.store.purchase.callDeposit.load([item]);
      });
  
      return unsubscribe;
    }
  
    async createDeskDealingSheet(
      purchaseId: string,
      item: ICallDepositDeskDealingSheet
    ) {
      const path = `callDeposit/${purchaseId}/deskDealingSheet`;
      if (!path) return;
  
      const itemRef = doc(collection(db, path));
      item.id = itemRef.id;
  
      try {
        await setDoc(itemRef, item, { merge: true });
      } catch (error) {}
    }
  
    async updateDeskDealingSheet(
      purchaseId: string,
      item: ICallDepositDeskDealingSheet
    ) {
      const path = `callDeposit/${purchaseId}/deskDealingSheet`;
      if (!path) return;
  
      try {
        await updateDoc(doc(db, path, item.id), {
          ...item,
        });
        this.store.purchase.callDepositDeskDealingSheet.load([item]);
      } catch (error) {}
    }
  
    async createPurchaseOldTenderSheet(
      purchaseId: string,
      item: ICallDepositPurchaseAllocation
    ) {
      const path = `callDeposits/${purchaseId}/oldTendersheet`;
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
      item: ICallDepositPurchaseAllocation
    ) {
      const path = `callDeposits/${purchaseId}/newTendersheet`;
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
      const path = `callDeposits/${purchaseId}/oldTendersheet`;
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
      const path = `callDeposits/${purchaseId}/newTendersheet`;
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
      item: ICallDepositPurchaseAllocation
    ) {
      const path = `callDeposit/${purchaseId}/newTendersheet`;
      if (!path) return;
  
      try {
        await updateDoc(doc(db, path, item.id), {
          ...item,
        });
        this.store.purchase.callDepositAllocation.load([item]);
      } catch (error) {}
    }
  
    async updatePurchaseNewTenderSheet(
      purchaseId: string,
      item: ICallDepositPurchaseAllocation
    ) {
      const path = `callDeposits/${purchaseId}/newTendersheet`;
      if (!path) return;
  
      try {
        await updateDoc(doc(db, path, item.id), {
          ...item,
        });
        this.store.purchase.callDepositAllocation.load([item]);
      } catch (error) {
        console.log(error);
      }
    }
  
    async deletePurchaseOldTenderSheetItem(
      purchaseId: string,
      item: ICallDepositPurchaseAllocation
    ) {
      const path = `callDeposits/${purchaseId}/newTendersheet`;
      if (!path) return;
  
      try {
        await deleteDoc(doc(db, path, item.id));
        this.store.purchase.callDepositAllocation.remove(item.id);
      } catch (error) {}
    }
  
    async deletePurchaseNewTenderSheetItem(
      purchaseId: string,
      item: ICallDepositPurchaseAllocation
    ) {
      const path = `callDeposit/${purchaseId}/newTendersheet`;
      if (!path) return;
  
      try {
        await deleteDoc(doc(db, path, item.id));
        this.store.purchase.callDepositAllocation.remove(item.id);
      } catch (error) {}
    }
  
    async deleteAllDocumentsInCollection(purchaseId:string) {
      const path = `callDeposits/${purchaseId}/newTendersheet`;
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
      item: ICallDepositPurchaseTransaction
    ) {
      const path = `callDeposits/${purchaseId}/oldTransactionFile`;
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
      item: ICallDepositPurchaseTransaction
    ) {
      const path = `callDeposits/${purchaseId}/newTransactionFile`;
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
      const path = `callDeposit/${purchaseId}/oldTransactionFile`;
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
      const path = `callDeposit/${purchaseId}/newTransactionFile`;
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
      item: ICallDepositPurchaseTransaction
    ) {
      const path = `callDeposits/${purchaseId}/oldTransactionFile`;
      if (!path) return;
  
      try {
        await updateDoc(doc(db, path, item.id), {
          ...item,
        });
        this.store.purchase.callDepositTransaction.load([item]);
      } catch (error) {}
    }
  
    async updatePurchaseNewTransactionFile(
      purchaseId: string,
      item: ICallDepositPurchaseTransaction
    ) {
      const path = `callDeposits/${purchaseId}/newTransactionFile`;
      if (!path) return;
  
      try {
        await updateDoc(doc(db, path, item.id), {
          ...item,
        });
        this.store.purchase.callDepositTransaction.load([item]);
      } catch (error) {
        console.log(error);
      }
    }
  
    async deletePurchaseOldTransactionFileItem(
      purchaseId: string,
      item: ICallDepositPurchaseAllocation
    ) {
      const path = `callDeposits/${purchaseId}/newTransactionFile`;
      if (!path) return;
  
      try {
        await deleteDoc(doc(db, path, item.id));
        this.store.purchase.callDepositTransaction.remove(item.id);
      } catch (error) {}
    }
  
    async deletePurchaseNewTransactionFileItem(
      purchaseId: string,
      item: ICallDepositPurchaseTransaction
    ) {
      const path = `callDeposits/${purchaseId}/newTransactionFile`;
      if (!path) return;
  
      try {
        await deleteDoc(doc(db, path, item.id));
        this.store.purchase.callDepositTransaction.remove(item.id);
      } catch (error) {}
    }
  
    /************************************ Transaction File ******************************************** */
  
    async createPurchaseHolding(
      purchaseId: string,
      item: ICallDepositPurchaseHolding
    ) {
      const path = `callDeposit/${purchaseId}/holdings`;
  
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
      item: ICallDepositPurchaseExecution
    ) {
      const path = `callDeposit/${purchaseId}/executionFile`;
  
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
      item: ICallDepositPurchaseHolding
    ) {
      const path = `callDeposit/${purchaseId}/holdings`;
  
      if (!path) return;
  
      try {
        await updateDoc(doc(db, path, item.id), {
          ...item,
        });
        this.store.purchase.callDepositHolding.load([item]);
      } catch (error) {}
    }
  
    async update(item: IPurchaseCallDeposit) {
      const path = this.callDepositsPath();
  
      if (!path) return;
  
      try {
        await updateDoc(doc(db, path, item.id), {
          ...item,
        });
        this.store.purchase.callDeposit.load([item]);
      } catch (error) {}
    }
  
    async delete(mmaId: string, item: ICallDepositPurchaseAllocation) {
      const path = `moneyMarketAccounts/${mmaId}/purchases`;
      if (!path) return;
  
      try {
        await deleteDoc(doc(db, path, item.id));
        this.store.purchase.callDepositAllocation.remove(item.id);
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
      item: ICallDepositPurchaseAllocation
    ) {
      const path = `moneyMarketAccounts/${accountId}/purchases`;
      if (!path) return;
  
      try {
        await updateDoc(doc(db, path, item.id), {
          ...item,
        });
        this.store.purchase.callDepositAllocation.load([item]);
      } catch (error) {}
    }
  
    async deletePurchaseInAccount(
      mmaId: string,
      item: ICallDepositPurchaseAllocation
    ) {
      const path = `moneyMarketAccounts/${mmaId}/purchases`;
      if (!path) return;
  
      try {
        await deleteDoc(doc(db, path, item.id));
        this.store.purchase.callDepositAllocation.remove(item.id);
      } catch (error) {}
    }
  }
  