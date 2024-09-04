import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IPurchaseEquity } from "../../models/purchases/equity/PurchaseEquityModel";
import { IEquityPurchaseAllocation } from "../../models/purchases/equity/EquityAllocationModel";
import { IEquityPurchaseTransaction } from "../../models/purchases/equity/EquityPurchaseTransactionModel";
import { IEquityPurchaseHolding } from "../../models/purchases/equity/EquityPurchaseHoldingModel";
import { IEquityPurchaseExecution } from "../../models/purchases/equity/EquityPurchaseExecutionModel";
import { IEquityDeskDealingSheet } from "../../models/purchases/equity/EquityDeskDealingSheetModel";
import { IMoneyMarketAccountPurchase } from "../../models/MoneyMarketAccountPurchase";
import { IBondPurchaseAllocation } from "../../models/purchases/bonds/BondPurchaseAllocationModel";

export default class PurchaseEquityApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private equityPath() {
        return "equityPurchases";
    }
    private equityItemsPath(equityId: string, category: string) {
        return `equityPurchases/${equityId}/${category}`;
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
        this.store.purchase.equity.removeAll();
        const path = this.equityPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const bonds: IPurchaseEquity[] = [];
                querySnapshot.forEach((doc) => {
                    bonds.push({ id: doc.id, ...doc.data() } as IPurchaseEquity);
                });
                this.store.purchase.equity.load(bonds);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }
    async getAllNewTenderSheet(equityId: string) {
        this.store.purchase.equityAllocation.removeAll();
        const path = `equityPurchases/${equityId}/newTendersheet`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const equity: IEquityPurchaseAllocation[] = [];
              querySnapshot.forEach((doc) => {
                equity.push({
                  id: doc.id,
                  ...doc.data(),
                } as IEquityPurchaseAllocation);
              });
              this.store.purchase.equityAllocation.load(equity);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllOldTenderSheet(equityId: string) {
        this.store.purchase.equityAllocation.removeAll();
        const path = `equityPurchases/${equityId}/oldTendersheet`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const equity: IEquityPurchaseAllocation[] = [];
              querySnapshot.forEach((doc) => {
                equity.push({
                  id: doc.id,
                  ...doc.data(),
                } as IEquityPurchaseAllocation);
              });
              this.store.purchase.equityAllocation.load(equity);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllPurchaseTransactionClients(equityId: string) {
        this.store.purchase.equityTransaction.removeAll();
        // const path = `treasuryBill/${purchaseId}/transactionSheet`
        const path = `equityPurchase/${equityId}/transactionSheet`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const equity: IEquityPurchaseTransaction[] = [];
              querySnapshot.forEach((doc) => {
                equity.push({
                  id: doc.id,
                  ...doc.data(),
                } as IEquityPurchaseTransaction);
              });
              this.store.purchase.equityTransaction.load(equity);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllPurchaseHoldings(equityId: string) {
        this.store.purchase.equityHolding.removeAll();
    
        const path = `equityPurchase/${equityId}/holdings`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const equity: IEquityPurchaseHolding[] = [];
              querySnapshot.forEach((doc) => {
                equity.push({
                  id: doc.id,
                  ...doc.data(),
                } as IEquityPurchaseHolding);
              });
              this.store.purchase.equityHolding.load(equity);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllPurchaseExecutionFileItems(equityId: string) {
        this.store.purchase.equityExecution.removeAll();
    
        const path = `equityPurchase/${equityId}/executionFile`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const equity: IEquityPurchaseExecution[] = [];
              querySnapshot.forEach((doc) => {
                equity.push({
                  id: doc.id,
                  ...doc.data(),
                } as IEquityPurchaseExecution);
              });
              this.store.purchase.equityExecution.load(equity);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllPurchaseDeskDealing(equityId: string) {
        this.store.purchase.equityDeskDealingSheet.removeAll();
    
        const path = `equityPurchases/${equityId}/oldTendersheet`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const equity: IEquityDeskDealingSheet[] = [];
              querySnapshot.forEach((doc) => {
                equity.push({
                  id: doc.id,
                  ...doc.data(),
                } as IEquityDeskDealingSheet);
              });
              this.store.purchase.equityDeskDealingSheet.load(equity);
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
          } as IEquityPurchaseAllocation;
          this.store.purchase.equityAllocation.load([item]);
        });
    
        return unsubscribe;
      }

    async getById(equityId: string) {
        const path = `equityPurchase`;
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, equityId), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IPurchaseEquity;
            this.store.purchase.equity.load([item]);
        });

        return unsubscribe;
    }

    async createDeskDealingSheet(
        purchaseId: string,
        item: IEquityDeskDealingSheet
      ) {
        const path = `equityPurchase/${purchaseId}/deskDealingSheet`;
        if (!path) return;
    
        const itemRef = doc(collection(db, path));
        item.id = itemRef.id;
    
        try {
          await setDoc(itemRef, item, { merge: true });
        } catch (error) {}
      }
    
      async updateDeskDealingSheet(
        purchaseId: string,
        item: IEquityDeskDealingSheet
      ) {
        const path = `equityPurchase/${purchaseId}/deskDealingSheet`;
        if (!path) return;
    
        try {
          await updateDoc(doc(db, path, item.id), {
            ...item,
          });
          this.store.purchase.equityDeskDealingSheet.load([item]);
        } catch (error) {}
      }
    
      async createPurchaseOldTenderSheet(
        purchaseId: string,
        item: IEquityPurchaseAllocation
      ) {
        const path = `equityPurchases/${purchaseId}/oldTendersheet`;
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
        item: IEquityPurchaseAllocation
      ) {
        const path = `equityPurchases/${purchaseId}/newTendersheet`;
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
        const path = `equityPurchases/${purchaseId}/oldTendersheet`;
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
        const path = `equityPurchases/${purchaseId}/newTendersheet`;
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
        item: IEquityPurchaseAllocation
      ) {
        const path = `equityPurchases/${purchaseId}/newTendersheet`;
        if (!path) return;
    
        try {
          await updateDoc(doc(db, path, item.id), {
            ...item,
          });
          this.store.purchase.equityAllocation.load([item]);
        } catch (error) {}
      }
    
      async updatePurchaseNewTenderSheet(
        purchaseId: string,
        item: IEquityPurchaseAllocation
      ) {
        const path = `equityPurchases/${purchaseId}/newTendersheet`;
        if (!path) return;
    
        try {
          await updateDoc(doc(db, path, item.id), {
            ...item,
          });
          this.store.purchase.equityAllocation.load([item]);
        } catch (error) {
          console.log(error);
        }
      }
    
      async deletePurchaseOldTenderSheetItem(
        purchaseId: string,
        item: IEquityPurchaseAllocation
      ) {
        const path = `equityPurchases/${purchaseId}/newTendersheet`;
        if (!path) return;
    
        try {
          await deleteDoc(doc(db, path, item.id));
          this.store.purchase.equityAllocation.remove(item.id);
        } catch (error) {}
      }
    
      async deletePurchaseNewTenderSheetItem(
        purchaseId: string,
        item: IEquityPurchaseAllocation
      ) {
        const path = `equityPurchases/${purchaseId}/newTendersheet`;
        if (!path) return;
    
        try {
          await deleteDoc(doc(db, path, item.id));
          this.store.purchase.equityAllocation.remove(item.id);
        } catch (error) {}
      }
    
      async deleteAllDocumentsInCollection(purchaseId: string) {
        const path = `equityPurchases/${purchaseId}/newTendersheet`;
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
        item: IEquityPurchaseTransaction
      ) {
        const path = `equityPurchases/${purchaseId}/oldTransactionFile`;
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
        item: IEquityPurchaseTransaction
      ) {
        const path = `equityPurchases/${purchaseId}/newTransactionFile`;
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
        const path = `equityPurchases/${purchaseId}/oldTransactionFile`;
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
        const path = `equityPurchases/${purchaseId}/newTransactionFile`;
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
        item: IEquityPurchaseTransaction
      ) {
        const path = `equityPurchases/${purchaseId}/oldTransactionFile`;
        if (!path) return;
    
        try {
          await updateDoc(doc(db, path, item.id), {
            ...item,
          });
          this.store.purchase.equityTransaction.load([item]);
        } catch (error) {}
      }
    
      async updatePurchaseNewTransactionFile(
        purchaseId: string,
        item: IEquityPurchaseTransaction
      ) {
        const path = `equityPurchases/${purchaseId}/newTransactionFile`;
        if (!path) return;
    
        try {
          await updateDoc(doc(db, path, item.id), {
            ...item,
          });
          this.store.purchase.equityTransaction.load([item]);
        } catch (error) {
          console.log(error);
        }
      }
    
      async deletePurchaseOldTransactionFileItem(
        purchaseId: string,
        item: IEquityPurchaseAllocation
      ) {
        const path = `equityPurchases/${purchaseId}/newTransactionFile`;
        if (!path) return;
    
        try {
          await deleteDoc(doc(db, path, item.id));
          this.store.purchase.equityAllocation.remove(item.id);
        } catch (error) {}
      }
    
      async deletePurchaseNewTransactionFileItem(
        purchaseId: string,
        item: IEquityPurchaseTransaction
      ) {
        const path = `equityPurchases/${purchaseId}/newTransactionFile`;
        if (!path) return;
    
        try {
          await deleteDoc(doc(db, path, item.id));
          this.store.purchase.equityTransaction.remove(item.id);
        } catch (error) {}
      }
      /************************************ Transaction File ******************************************** */
    
  async createPurchaseHolding(purchaseId: string, item: IEquityPurchaseHolding) {
    const path = `equityPurchase/${purchaseId}/holdings`;

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
    item: IEquityPurchaseExecution
  ) {
    const path = `equityPurchase/${purchaseId}/executionFile`;

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
    item: IEquityPurchaseHolding
  ) {
    const path = `equityPurchase/${purchaseId}/holdings`;

    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.equityHolding.load([item]);
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
    item: IEquityPurchaseAllocation
  ) {
    const path = `moneyMarketAccounts/${accountId}/purchases`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.equityAllocation.load([item]);
    } catch (error) {}
  }

  async deletePurchaseInAccount(
    mmaId: string,
    item: IEquityPurchaseAllocation
  ) {
    const path = `moneyMarketAccounts/${mmaId}/purchases`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.equityAllocation.remove(item.id);
    } catch (error) {}
  }

//   async create(item: IPurchaseEquity) {
//     const path = this.equityPath();
//     if (!path) return;

//     const itemRef = doc(collection(db, path));
//     item.id = itemRef.id;

//     try {
//       await setDoc(itemRef, item, { merge: true });
//     } catch (error) {}
//   }

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

//   async delete(item: IPurchaseEquity) {
//     const path = this.equityPath();
//     if (!path) return;

//     try {
//       await deleteDoc(doc(db, path, item.id));
//       this.store.purchase.equity.remove(item.id);
//     } catch (error) {}
//   }
    async create(item: IPurchaseEquity) {

        const path = this.equityPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }


    async update(item: IPurchaseEquity) {

        const path = this.equityPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.purchase.equity.load([item]);
        } catch (error) { }
    }

    async delete(item: IPurchaseEquity) {
        const path = this.equityPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.purchase.equity.remove(item.id);
        } catch (error) { }
    }
}