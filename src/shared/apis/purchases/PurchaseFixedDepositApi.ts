import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IPurchaseFixedDeposit } from "../../models/purchases/fixed-deposit/PurchaseFixedDepositModel";
import { IFixedDepositPurchaseAllocation } from "../../models/purchases/fixed-deposit/FixedDepositPurchaseAllocationModel";
import { IFixedDepositPurchaseTransaction } from "../../models/purchases/fixed-deposit/FixedDepositPurchaseTransactionModel";
import { IFixedDepositPurchaseHolding } from "../../models/purchases/fixed-deposit/FixedDepositPurchaseHoldingModel";
import { IFixedDepositPurchaseExecution } from "../../models/purchases/fixed-deposit/FixedDepositPurchaseExecutionModel";
import { IFixedDepositDeskDealingSheet } from "../../models/purchases/fixed-deposit/FixedDepositDeskDealingSheetModel";
import { IMoneyMarketAccountPurchase } from "../../models/MoneyMarketAccountPurchase";

export default class PurchaseFixedDepositApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private fixedDepositsPath() {
        return "fixedDepositPurchases";
    }
    private fixedDepositItemsPath(bondId: string, category: string) {
        return `fixedDepositPurchases/${bondId}/${category}`;
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
        this.store.purchase.fixedDeposit.removeAll();
        const path = this.fixedDepositsPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const bonds: IPurchaseFixedDeposit[] = [];
                querySnapshot.forEach((doc) => {
                    bonds.push({ id: doc.id, ...doc.data() } as IPurchaseFixedDeposit);
                });
                this.store.purchase.fixedDeposit.load(bonds);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }


    async getAllNewTenderSheet(fixedId: string) {
        this.store.purchase.fixedDepositAllocation.removeAll();
        const path = `fixedDepositPurchases/${fixedId}/newTendersheet`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const fixedDeposit: IFixedDepositPurchaseAllocation[] = [];
              querySnapshot.forEach((doc) => {
                fixedDeposit.push({
                  id: doc.id,
                  ...doc.data(),
                } as IFixedDepositPurchaseAllocation);
              });
              this.store.purchase.fixedDepositAllocation.load(fixedDeposit);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllOldTenderSheet(fixedId: string) {
        this.store.purchase.fixedDepositAllocation.removeAll();
        const path = `fixedDepositPurchases/${fixedId}/oldTendersheet`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const fixedDeposit: IFixedDepositPurchaseAllocation[] = [];
              querySnapshot.forEach((doc) => {
                fixedDeposit.push({
                  id: doc.id,
                  ...doc.data(),
                } as IFixedDepositPurchaseAllocation);
              });
              this.store.purchase.fixedDepositAllocation.load(fixedDeposit);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllPurchaseTransactionClients(fixedId: string) {
        this.store.purchase.fixedDepositTransaction.removeAll();
        // const path = `treasuryBill/${purchaseId}/transactionSheet`
        const path = `fixedDepositPurchase/${fixedId}/transactionSheet`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const fixedDeposit: IFixedDepositPurchaseTransaction[] = [];
              querySnapshot.forEach((doc) => {
                fixedDeposit.push({
                  id: doc.id,
                  ...doc.data(),
                } as IFixedDepositPurchaseTransaction);
              });
              this.store.purchase.fixedDepositTransaction.load(fixedDeposit);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllPurchaseHoldings(fixedId: string) {
        this.store.purchase.fixedDepositHolding.removeAll();
    
        const path = `fixedDepositPurchase/${fixedId}/holdings`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const fixedDeposit: IFixedDepositPurchaseHolding[] = [];
              querySnapshot.forEach((doc) => {
                fixedDeposit.push({
                  id: doc.id,
                  ...doc.data(),
                } as IFixedDepositPurchaseHolding);
              });
              this.store.purchase.fixedDepositHolding.load(fixedDeposit);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllPurchaseExecutionFileItems(fixedId: string) {
        this.store.purchase.fixedDepositExecution.removeAll();
    
        const path = `fixedDepositPurchase/${fixedId}/executionFile`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const fixedDeposit: IFixedDepositPurchaseExecution[] = [];
              querySnapshot.forEach((doc) => {
                fixedDeposit.push({
                  id: doc.id,
                  ...doc.data(),
                } as IFixedDepositPurchaseExecution);
              });
              this.store.purchase.fixedDepositExecution.load(fixedDeposit);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllPurchaseDeskDealing(fixedId: string) {
        this.store.purchase.fixedDepositDeskDealingSheet.removeAll();
    
        const path = `fixedDepositPurchases/${fixedId}/oldTendersheet`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const fixedDeposit: IFixedDepositDeskDealingSheet[] = [];
              querySnapshot.forEach((doc) => {
                fixedDeposit.push({
                  id: doc.id,
                  ...doc.data(),
                } as IFixedDepositDeskDealingSheet);
              });
              this.store.purchase.fixedDepositDeskDealingSheet.load(fixedDeposit);
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
          } as IFixedDepositPurchaseAllocation;
          this.store.purchase.fixedDepositAllocation.load([item]);
        });
    
        return unsubscribe;
      }
    async getById(fixedId: string) {
        const path = `fixedDepositPurchase`;
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, fixedId), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IPurchaseFixedDeposit;
            this.store.purchase.fixedDeposit.load([item]);
        });

        return unsubscribe;
    }

    
  async createDeskDealingSheet(
    purchaseId: string,
    item: IFixedDepositDeskDealingSheet
  ) {
    const path = `fixedDepositPurchase/${purchaseId}/deskDealingSheet`;
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {}
  }

  async updateDeskDealingSheet(
    purchaseId: string,
    item: IFixedDepositDeskDealingSheet
  ) {
    const path = `fixedDepositPurchase/${purchaseId}/deskDealingSheet`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.fixedDepositDeskDealingSheet.load([item]);
    } catch (error) {}
  }

  async createPurchaseOldTenderSheet(
    purchaseId: string,
    item: IFixedDepositPurchaseAllocation
  ) {
    const path = `fixedDepositPurchases/${purchaseId}/oldTendersheet`;
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
    item: IFixedDepositPurchaseAllocation
  ) {
    const path = `fixedDepositPurchases/${purchaseId}/newTendersheet`;
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
    const path = `fixedDepositPurchases/${purchaseId}/oldTendersheet`;
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
    const path = `fixedDepositPurchases/${purchaseId}/newTendersheet`;
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
    item: IFixedDepositPurchaseAllocation
  ) {
    const path = `fixedDepositPurchases/${purchaseId}/newTendersheet`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.fixedDepositAllocation.load([item]);
    } catch (error) {}
  }

  async updatePurchaseNewTenderSheet(
    purchaseId: string,
    item: IFixedDepositPurchaseAllocation
  ) {
    const path = `fixedDepositPurchases/${purchaseId}/newTendersheet`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.fixedDepositAllocation.load([item]);
    } catch (error) {
      console.log(error);
    }
  }

  async deletePurchaseOldTenderSheetItem(
    purchaseId: string,
    item: IFixedDepositPurchaseAllocation
  ) {
    const path = `fixedDepositPurchases/${purchaseId}/newTendersheet`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.fixedDepositAllocation.remove(item.id);
    } catch (error) {}
  }

  async deletePurchaseNewTenderSheetItem(
    purchaseId: string,
    item: IFixedDepositPurchaseAllocation
  ) {
    const path = `fixedDepositPurchases/${purchaseId}/newTendersheet`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.fixedDepositAllocation.remove(item.id);
    } catch (error) {}
  }

  async deleteAllDocumentsInCollection(purchaseId: string) {
    const path = `fixedDepositPurchases/${purchaseId}/newTendersheet`;
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
    item: IFixedDepositPurchaseTransaction
  ) {
    const path = `fixedDepositPurchases/${purchaseId}/oldTransactionFile`;
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
    item: IFixedDepositPurchaseTransaction
  ) {
    const path = `fixedDepositPurchases/${purchaseId}/newTransactionFile`;
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
    const path = `fixedDepositPurchases/${purchaseId}/oldTransactionFile`;
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
    const path = `fixedDepositPurchases/${purchaseId}/newTransactionFile`;
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
    item: IFixedDepositPurchaseTransaction
  ) {
    const path = `fixedDepositPurchases/${purchaseId}/oldTransactionFile`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.fixedDepositTransaction.load([item]);
    } catch (error) {}
  }

  async updatePurchaseNewTransactionFile(
    purchaseId: string,
    item: IFixedDepositPurchaseTransaction
  ) {
    const path = `fixedDepositPurchases/${purchaseId}/newTransactionFile`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.fixedDepositTransaction.load([item]);
    } catch (error) {
      console.log(error);
    }
  }

  async deletePurchaseOldTransactionFileItem(
    purchaseId: string,
    item: IFixedDepositPurchaseAllocation
  ) {
    const path = `fixedDepositPurchases/${purchaseId}/newTransactionFile`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.bondTransaction.remove(item.id);
    } catch (error) {}
  }

  async deletePurchaseNewTransactionFileItem(
    purchaseId: string,
    item: IFixedDepositPurchaseTransaction
  ) {
    const path = `fixedDepositPurchases/${purchaseId}/newTransactionFile`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.fixedDepositTransaction.remove(item.id);
    } catch (error) {}
  }
  /************************************ Transaction File ******************************************** */
   
  
  async createPurchaseHolding(purchaseId: string, item: IFixedDepositPurchaseHolding) {
    const path = `fixedDepositPurchase/${purchaseId}/holdings`;

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
    item: IFixedDepositPurchaseExecution
  ) {
    const path = `fixedDepositPurchase/${purchaseId}/executionFile`;

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
    item: IFixedDepositPurchaseHolding
  ) {
    const path = `fixedDepositPurchase/${purchaseId}/holdings`;

    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.fixedDepositHolding.load([item]);
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
    item: IFixedDepositPurchaseAllocation
  ) {
    const path = `moneyMarketAccounts/${accountId}/purchases`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.fixedDepositAllocation.load([item]);
    } catch (error) {}
  }

  async deletePurchaseInAccount(
    mmaId: string,
    item: IFixedDepositPurchaseAllocation
  ) {
    const path = `moneyMarketAccounts/${mmaId}/purchases`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.fixedDepositAllocation.remove(item.id);
    } catch (error) {}
  }

  async create(item: IPurchaseFixedDeposit) {
    const path = this.fixedDepositsPath();
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {}
  }

//   async update(item: IPurchaseBond) {
//     const path = this.bondsPath();
//     if (!path) return;

//     try {
//       await updateDoc(doc(db, path, item.id), {
//         ...item,
//       });
//       this.store.purchase.bond.load([item]);
//     } catch (error) {}
//   }

//   async delete(item: IPurchaseBond) {
//     const path = this.bondsPath();
//     if (!path) return;

//     try {
//       await deleteDoc(doc(db, path, item.id));
//       this.store.purchase.bond.remove(item.id);
//     } catch (error) {}
//   }

//   async create(item: IPurchaseFixedDeposit) {

//         const path = this.fixedDepositsPath();
//         if (!path) return;

//         const itemRef = doc(collection(db, path))
//         item.id = itemRef.id;

//         try {
//             await setDoc(itemRef, item, { merge: true, })
//         } catch (error) {
//         }
//     }


    async update(item: IPurchaseFixedDeposit) {

        const path = this.fixedDepositsPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.purchase.fixedDeposit.load([item]);
        } catch (error) { }
    }


    async delete(item: IPurchaseFixedDeposit) {
        const path = this.fixedDepositsPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.purchase.fixedDeposit.remove(item.id);
        } catch (error) { }
    }
}