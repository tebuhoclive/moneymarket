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
import { IPurchaseBond } from "../../models/purchases/bonds/BondPurchaseModel";
import { IMoneyMarketAccountPurchase } from "../../models/MoneyMarketAccountPurchase";
import { IBondPurchaseAllocation } from "../../models/purchases/bonds/BondPurchaseAllocationModel";
import { IBondPurchaseTransaction } from "../../models/purchases/bonds/BondPurchaseTransactionModel";
import { IBondPurchaseHolding } from "../../models/purchases/bonds/BondPurchaseHoldingModel";
import { IBondPurchaseExecution } from "../../models/purchases/bonds/BondPurchaseExecutionModel";
import { IBondDeskDealingSheet } from "../../models/purchases/bonds/BondDeskDealingSheetModel";

export default class PurchaseBondApi {
  constructor(private api: AppApi, private store: AppStore) {}

  private bondsPath() {
    return "bondPurchases";
  }

  private bondsItemsPath(bondId: string, category: string) {
    return `bondPurchases/${bondId}/${category}`;
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
    this.store.purchase.bond.removeAll();
    const path = this.bondsPath();
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const bonds: IPurchaseBond[] = [];
          querySnapshot.forEach((doc) => {
            bonds.push({ id: doc.id, ...doc.data() } as IPurchaseBond);
          });
          this.store.purchase.bond.load(bonds);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllNewTenderSheet(bondId: string) {
    this.store.purchase.bondAllocation.removeAll();
    const path = `bondPurchases/${bondId}/newTendersheet`;
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const bonds: IBondPurchaseAllocation[] = [];
          querySnapshot.forEach((doc) => {
            bonds.push({
              id: doc.id,
              ...doc.data(),
            } as IBondPurchaseAllocation);
          });
          this.store.purchase.bondAllocation.load(bonds);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllOldTenderSheet(bondId: string) {
    this.store.purchase.treasuryBillAllocation.removeAll();
    const path = `bondPurchases/${bondId}/oldTendersheet`;
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const bonds: IBondPurchaseAllocation[] = [];
          querySnapshot.forEach((doc) => {
            bonds.push({
              id: doc.id,
              ...doc.data(),
            } as IBondPurchaseAllocation);
          });
          this.store.purchase.bondAllocation.load(bonds);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllPurchaseTransactionClients(bondId: string) {
    this.store.purchase.treasuryBillTransaction.removeAll();
    // const path = `treasuryBill/${purchaseId}/transactionSheet`
    const path = `bondPurchase/${bondId}/transactionSheet`;
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const bonds: IBondPurchaseTransaction[] = [];
          querySnapshot.forEach((doc) => {
            bonds.push({
              id: doc.id,
              ...doc.data(),
            } as IBondPurchaseTransaction);
          });
          this.store.purchase.bondTransaction.load(bonds);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllPurchaseHoldings(bondId: string) {
    this.store.purchase.bondHolding.removeAll();

    const path = `bondPurchase/${bondId}/holdings`;
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const bonds: IBondPurchaseHolding[] = [];
          querySnapshot.forEach((doc) => {
            bonds.push({
              id: doc.id,
              ...doc.data(),
            } as IBondPurchaseHolding);
          });
          this.store.purchase.bondHolding.load(bonds);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllPurchaseExecutionFileItems(bondId: string) {
    this.store.purchase.bondExecution.removeAll();

    const path = `bondPurchase/${bondId}/executionFile`;
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const bonds: IBondPurchaseExecution[] = [];
          querySnapshot.forEach((doc) => {
            bonds.push({
              id: doc.id,
              ...doc.data(),
            } as IBondPurchaseExecution);
          });
          this.store.purchase.bondExecution.load(bonds);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllPurchaseDeskDealing(bondId: string) {
    this.store.purchase.treasuryBillDeskDealingSheet.removeAll();

    const path = `bondPurchases/${bondId}/oldTendersheet`;
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const bonds: IBondDeskDealingSheet[] = [];
          querySnapshot.forEach((doc) => {
            bonds.push({
              id: doc.id,
              ...doc.data(),
            } as IBondDeskDealingSheet);
          });
          this.store.purchase.bondDeskDealingSheet.load(bonds);
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
      } as IBondPurchaseAllocation;
      this.store.purchase.bondAllocation.load([item]);
    });

    return unsubscribe;
  }
  async getById(bondId: string) {
    const path = `bondPurchase`;
    if (!path) return;

    const unsubscribe = onSnapshot(doc(db, path, bondId), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as IPurchaseBond;
      this.store.purchase.bond.load([item]);
    });

    return unsubscribe;
  }
  async createDeskDealingSheet(
    purchaseId: string,
    item: IBondDeskDealingSheet
  ) {
    const path = `bondPurchase/${purchaseId}/deskDealingSheet`;
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {}
  }

  async updateDeskDealingSheet(
    purchaseId: string,
    item: IBondDeskDealingSheet
  ) {
    const path = `bondPurchase/${purchaseId}/deskDealingSheet`;
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
    item: IBondPurchaseAllocation
  ) {
    const path = `bondPurchases/${purchaseId}/oldTendersheet`;
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
    item: IBondPurchaseAllocation
  ) {
    const path = `bondPurchases/${purchaseId}/newTendersheet`;
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
    const path = `bondPurchases/${purchaseId}/oldTendersheet`;
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
    const path = `bondPurchases/${purchaseId}/newTendersheet`;
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
    item: IBondPurchaseAllocation
  ) {
    const path = `bondPurchases/${purchaseId}/newTendersheet`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.bondAllocation.load([item]);
    } catch (error) {}
  }

  async updatePurchaseNewTenderSheet(
    purchaseId: string,
    item: IBondPurchaseAllocation
  ) {
    const path = `bondPurchases/${purchaseId}/newTendersheet`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.bondAllocation.load([item]);
    } catch (error) {
      console.log(error);
    }
  }

  async deletePurchaseOldTenderSheetItem(
    purchaseId: string,
    item: IBondPurchaseAllocation
  ) {
    const path = `bondPurchases/${purchaseId}/newTendersheet`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.bondAllocation.remove(item.id);
    } catch (error) {}
  }

  async deletePurchaseNewTenderSheetItem(
    purchaseId: string,
    item: IBondPurchaseAllocation
  ) {
    const path = `bondPurchases/${purchaseId}/newTendersheet`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.bondAllocation.remove(item.id);
    } catch (error) {}
  }

  async deleteAllDocumentsInCollection(purchaseId: string) {
    const path = `bondPurchases/${purchaseId}/newTendersheet`;
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
    item: IBondPurchaseTransaction
  ) {
    const path = `bondPurchases/${purchaseId}/oldTransactionFile`;
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
    item: IBondPurchaseTransaction
  ) {
    const path = `bondPurchases/${purchaseId}/newTransactionFile`;
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
    const path = `bondPurchases/${purchaseId}/oldTransactionFile`;
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
    const path = `bondPurchases/${purchaseId}/newTransactionFile`;
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
    item: IBondPurchaseTransaction
  ) {
    const path = `bondPurchases/${purchaseId}/oldTransactionFile`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.bondTransaction.load([item]);
    } catch (error) {}
  }

  async updatePurchaseNewTransactionFile(
    purchaseId: string,
    item: IBondPurchaseTransaction
  ) {
    const path = `bondPurchases/${purchaseId}/newTransactionFile`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.bondTransaction.load([item]);
    } catch (error) {
      console.log(error);
    }
  }

  async deletePurchaseOldTransactionFileItem(
    purchaseId: string,
    item: IBondPurchaseAllocation
  ) {
    const path = `bondPurchases/${purchaseId}/newTransactionFile`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.bondTransaction.remove(item.id);
    } catch (error) {}
  }

  async deletePurchaseNewTransactionFileItem(
    purchaseId: string,
    item: IBondPurchaseTransaction
  ) {
    const path = `bondPurchases/${purchaseId}/newTransactionFile`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.bondTransaction.remove(item.id);
    } catch (error) {}
  }
  /************************************ Transaction File ******************************************** */

  async createPurchaseHolding(purchaseId: string, item: IBondPurchaseHolding) {
    const path = `bondPurchase/${purchaseId}/holdings`;

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
    item: IBondPurchaseExecution
  ) {
    const path = `bondPurchase/${purchaseId}/executionFile`;

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
    item: IBondPurchaseHolding
  ) {
    const path = `bondPurchase/${purchaseId}/holdings`;

    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.bondHolding.load([item]);
    } catch (error) {}
  }

//   async update(item: IPurchaseTreasuryBill) {
//     const path = this.treasuryBillsPath();

//     if (!path) return;

//     try {
//       await updateDoc(doc(db, path, item.id), {
//         ...item,
//       });
//       this.store.purchase.treasuryBill.load([item]);
//     } catch (error) {}
//   }

//   async delete(mmaId: string, item: ITreasuryBillPurchaseAllocation) {
//     const path = `moneyMarketAccounts/${mmaId}/purchases`;
//     if (!path) return;

//     try {
//       await deleteDoc(doc(db, path, item.id));
//       this.store.purchase.treasuryBillAllocation.remove(item.id);
//     } catch (error) {}
//   }

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
    item: IBondPurchaseAllocation
  ) {
    const path = `moneyMarketAccounts/${accountId}/purchases`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.bondAllocation.load([item]);
    } catch (error) {}
  }

  async deletePurchaseInAccount(
    mmaId: string,
    item: IBondPurchaseAllocation
  ) {
    const path = `moneyMarketAccounts/${mmaId}/purchases`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.bondAllocation.remove(item.id);
    } catch (error) {}
  }

  async create(item: IPurchaseBond) {
    const path = this.bondsPath();
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {}
  }

  async update(item: IPurchaseBond) {
    const path = this.bondsPath();
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.bond.load([item]);
    } catch (error) {}
  }

  async delete(item: IPurchaseBond) {
    const path = this.bondsPath();
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.bond.remove(item.id);
    } catch (error) {}
  }
}
