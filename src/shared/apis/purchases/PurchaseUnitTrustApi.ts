import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IPurchaseUnitTrust } from "../../models/purchases/unit-trust/PurchaseUnitTrustModel";
import { IUnitTrustPurchaseAllocation } from "../../models/purchases/unit-trust/UnitTrustPurchaseAllocationModel";
import { IUnitTrustPurchaseTransaction } from "../../models/purchases/unit-trust/UnitTrustPurchaseTransactionModel";
import { IUnitTrustPurchaseHolding } from "../../models/purchases/unit-trust/UnitTrustPurchaseHoldingModel";
import { IUnitTrustPurchaseExecution } from "../../models/purchases/unit-trust/UnitTrustPurchaseExecutionModel";
import { IUnitTrustDeskDealingSheet } from "../../models/purchases/unit-trust/UnitTrustDeskDealingSheetModel";
import { IMoneyMarketAccountPurchase } from "../../models/MoneyMarketAccountPurchase";

export default class PurchaseUnitTrustApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private unitTrustsPath() {
        return "unitTrustPurchases";
    }

    private unitTrustItemsPath(unitTrustId: string, category: string) {
        return `unitTrustPurchases/${unitTrustId}/${category}`;
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
        this.store.purchase.unitTrust.removeAll();
        const path = this.unitTrustsPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const units: IPurchaseUnitTrust[] = [];
                querySnapshot.forEach((doc) => {
                    units.push({ id: doc.id, ...doc.data() } as IPurchaseUnitTrust);
                });
                this.store.purchase.unitTrust.load(units);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getAllNewTenderSheet(unitTrustId: string) {
        this.store.purchase.unitTrustAllocation.removeAll();
        const path = `unitTrustPurchases/${unitTrustId}/newTendersheet`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const unitTrust: IUnitTrustPurchaseAllocation[] = [];
              querySnapshot.forEach((doc) => {
                unitTrust.push({
                  id: doc.id,
                  ...doc.data(),
                } as IUnitTrustPurchaseAllocation);
              });
              this.store.purchase.unitTrustAllocation.load(unitTrust);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllOldTenderSheet(unitTrustId: string) {
        this.store.purchase.unitTrustAllocation.removeAll();
        const path = `unitTrustPurchases/${unitTrustId}/oldTendersheet`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const unitTrust: IUnitTrustPurchaseAllocation[] = [];
              querySnapshot.forEach((doc) => {
                unitTrust.push({
                  id: doc.id,
                  ...doc.data(),
                } as IUnitTrustPurchaseAllocation);
              });
              this.store.purchase.unitTrustAllocation.load(unitTrust);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllPurchaseTransactionClients(unitTrustId: string) {
        this.store.purchase.unitTrustTransaction.removeAll();
        // const path = `treasuryBill/${purchaseId}/transactionSheet`
        const path = `unitTrustPurchase/${unitTrustId}/transactionSheet`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const unitTrust: IUnitTrustPurchaseTransaction[] = [];
              querySnapshot.forEach((doc) => {
                unitTrust.push({
                  id: doc.id,
                  ...doc.data(),
                } as IUnitTrustPurchaseTransaction);
              });
              this.store.purchase.unitTrustTransaction.load(unitTrust);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllPurchaseHoldings(unitTrustId: string) {
        this.store.purchase.unitTrust.removeAll();
    
        const path = `unitTrustPurchase/${unitTrustId}/holdings`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const unitTrust: IUnitTrustPurchaseHolding[] = [];
              querySnapshot.forEach((doc) => {
                unitTrust.push({
                  id: doc.id,
                  ...doc.data(),
                } as IUnitTrustPurchaseHolding);
              });
              this.store.purchase.unitTrustHolding.load(unitTrust);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllPurchaseExecutionFileItems(unitTrustId: string) {
        this.store.purchase.unitTrustExecution.removeAll();
    
        const path = `unitTrustPurchase/${unitTrustId}/executionFile`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const unitTrust: IUnitTrustPurchaseExecution[] = [];
              querySnapshot.forEach((doc) => {
                unitTrust.push({
                  id: doc.id,
                  ...doc.data(),
                } as IUnitTrustPurchaseExecution);
              });
              this.store.purchase.unitTrustExecution.load(unitTrust);
              resolve(unsubscribe);
            },
            (error) => {
              reject();
            }
          );
        });
      }
    
      async getAllPurchaseDeskDealing(unitTrustId: string) {
        this.store.purchase.unitTrustDeskDealingSheet.removeAll();
    
        const path = `unitTrustPurchases/${unitTrustId}/oldTendersheet`;
        if (!path) return;
    
        const $query = query(collection(db, path));
    
        return await new Promise<Unsubscribe>((resolve, reject) => {
          const unsubscribe = onSnapshot(
            $query,
            (querySnapshot) => {
              const unitTrust: IUnitTrustDeskDealingSheet[] = [];
              querySnapshot.forEach((doc) => {
                unitTrust.push({
                  id: doc.id,
                  ...doc.data(),
                } as IUnitTrustDeskDealingSheet);
              });
              this.store.purchase.unitTrustDeskDealingSheet.load(unitTrust);
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
              const unitTrust: IMoneyMarketAccountPurchase[] = [];
              querySnapshot.forEach((doc) => {
                unitTrust.push({
                  id: doc.id,
                  ...doc.data(),
                } as IMoneyMarketAccountPurchase);
              });
              this.store.purchase.moneyMarket.load(unitTrust);
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
          } as IUnitTrustPurchaseAllocation;
          this.store.purchase.unitTrustAllocation.load([item]);
        });
    
        return unsubscribe;
      }
    async getById(id: string) {
        const path = `unitTrustPurchase`;
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IPurchaseUnitTrust;
            this.store.purchase.unitTrust.load([item]);
        });

        return unsubscribe;
    }

    async createDeskDealingSheet(
        purchaseId: string,
        item: IUnitTrustDeskDealingSheet
      ) {
        const path = `unitTrustPurchase/${purchaseId}/deskDealingSheet`;
        if (!path) return;
    
        const itemRef = doc(collection(db, path));
        item.id = itemRef.id;
    
        try {
          await setDoc(itemRef, item, { merge: true });
        } catch (error) {}
      }
    
      async updateDeskDealingSheet(
        purchaseId: string,
        item: IUnitTrustDeskDealingSheet
      ) {
        const path = `unitTrustPurchase/${purchaseId}/deskDealingSheet`;
        if (!path) return;
    
        try {
          await updateDoc(doc(db, path, item.id), {
            ...item,
          });
          this.store.purchase.unitTrustDeskDealingSheet.load([item]);
        } catch (error) {}
      }
    
      async createPurchaseOldTenderSheet(
        purchaseId: string,
        item: IUnitTrustPurchaseAllocation
      ) {
        const path = `unitTrustPurchases/${purchaseId}/oldTendersheet`;
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
        item: IUnitTrustPurchaseAllocation
      ) {
        const path = `unitTrustPurchases/${purchaseId}/newTendersheet`;
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
        const path = `unitTrustPurchases/${purchaseId}/oldTendersheet`;
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
        const path = `unitTrustPurchases/${purchaseId}/newTendersheet`;
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
        item: IUnitTrustPurchaseAllocation
      ) {
        const path = `unitTrustPurchases/${purchaseId}/newTendersheet`;
        if (!path) return;
    
        try {
          await updateDoc(doc(db, path, item.id), {
            ...item,
          });
          this.store.purchase.unitTrustAllocation.load([item]);
        } catch (error) {}
      }
    
      async updatePurchaseNewTenderSheet(
        purchaseId: string,
        item: IUnitTrustPurchaseAllocation
      ) {
        const path = `unitTrustPurchases/${purchaseId}/newTendersheet`;
        if (!path) return;
    
        try {
          await updateDoc(doc(db, path, item.id), {
            ...item,
          });
          this.store.purchase.unitTrustAllocation.load([item]);
        } catch (error) {
          console.log(error);
        }
      }
    
      async deletePurchaseOldTenderSheetItem(
        purchaseId: string,
        item: IUnitTrustPurchaseAllocation
      ) {
        const path = `unitTrustPurchases/${purchaseId}/newTendersheet`;
        if (!path) return;
    
        try {
          await deleteDoc(doc(db, path, item.id));
          this.store.purchase.unitTrustAllocation.remove(item.id);
        } catch (error) {}
      }
    
      async deletePurchaseNewTenderSheetItem(
        purchaseId: string,
        item: IUnitTrustPurchaseAllocation
      ) {
        const path = `unitTrustPurchases/${purchaseId}/newTendersheet`;
        if (!path) return;
    
        try {
          await deleteDoc(doc(db, path, item.id));
          this.store.purchase.unitTrustAllocation.remove(item.id);
        } catch (error) {}
      }
    
      async deleteAllDocumentsInCollection(purchaseId: string) {
        const path = `unitTrustPurchases/${purchaseId}/newTendersheet`;
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
        item: IUnitTrustPurchaseTransaction
      ) {
        const path = `unitTrustPurchases/${purchaseId}/oldTransactionFile`;
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
        item: IUnitTrustPurchaseTransaction
      ) {
        const path = `unitTrustPurchases/${purchaseId}/newTransactionFile`;
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
        const path = `unitTrustPurchases/${purchaseId}/oldTransactionFile`;
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
        const path = `unitTrustPurchases/${purchaseId}/newTransactionFile`;
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
        item: IUnitTrustPurchaseTransaction
      ) {
        const path = `unitTrustPurchases/${purchaseId}/oldTransactionFile`;
        if (!path) return;
    
        try {
          await updateDoc(doc(db, path, item.id), {
            ...item,
          });
          this.store.purchase.unitTrustTransaction.load([item]);
        } catch (error) {}
      }
    
      async updatePurchaseNewTransactionFile(
        purchaseId: string,
        item: IUnitTrustPurchaseTransaction
      ) {
        const path = `unitTrustPurchases/${purchaseId}/newTransactionFile`;
        if (!path) return;
    
        try {
          await updateDoc(doc(db, path, item.id), {
            ...item,
          });
          this.store.purchase.unitTrustTransaction.load([item]);
        } catch (error) {
          console.log(error);
        }
      }
    
      async deletePurchaseOldTransactionFileItem(
        purchaseId: string,
        item: IUnitTrustPurchaseAllocation
      ) {
        const path = `unitTrustPurchases/${purchaseId}/newTransactionFile`;
        if (!path) return;
    
        try {
          await deleteDoc(doc(db, path, item.id));
          this.store.purchase.unitTrustAllocation.remove(item.id);
        } catch (error) {}
      }
    
      async deletePurchaseNewTransactionFileItem(
        purchaseId: string,
        item: IUnitTrustPurchaseTransaction
      ) {
        const path = `unitTrustPurchases/${purchaseId}/newTransactionFile`;
        if (!path) return;
    
        try {
          await deleteDoc(doc(db, path, item.id));
          this.store.purchase.unitTrustTransaction.remove(item.id);
        } catch (error) {}
      }
      /************************************ Transaction File ******************************************** */
    
  async createPurchaseHolding(purchaseId: string, item: IUnitTrustPurchaseHolding) {
    const path = `unitTrustPurchase/${purchaseId}/holdings`;

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
    item: IUnitTrustPurchaseExecution
  ) {
    const path = `unitTrustPurchase/${purchaseId}/executionFile`;

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
    item: IUnitTrustPurchaseHolding
  ) {
    const path = `unitTrustPurchase/${purchaseId}/holdings`;

    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.unitTrustHolding.load([item]);
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
    item: IUnitTrustPurchaseAllocation
  ) {
    const path = `moneyMarketAccounts/${accountId}/purchases`;
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.unitTrustAllocation.load([item]);
    } catch (error) {}
  }

  async deletePurchaseInAccount(
    mmaId: string,
    item: IUnitTrustPurchaseAllocation
  ) {
    const path = `moneyMarketAccounts/${mmaId}/purchases`;
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.purchase.unitTrustAllocation.remove(item.id);
    } catch (error) {}
  }

  async create(item: IPurchaseUnitTrust) {
    const path = this.unitTrustsPath();
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {}
  }

  async update(item: IPurchaseUnitTrust) {
    const path = this.unitTrustsPath();
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.purchase.unitTrust.load([item]);
    } catch (error) {}
  }

//   async delete(item: IPurchaseBond) {
//     const path = this.bondsPath();
//     if (!path) return;

//     try {
//       await deleteDoc(doc(db, path, item.id));
//       this.store.purchase.bond.remove(item.id);
//     } catch (error) {}
//   }
    // async create(item: IPurchaseUnitTrust) {

    //     const path = this.unitTrustsPath();
    //     if (!path) return;

    //     const itemRef = doc(collection(db, path))
    //     item.id = itemRef.id;

    //     try {
    //         await setDoc(itemRef, item, { merge: true, })
    //     } catch (error) {
    //     }
    // }


    // async update(item: IPurchaseUnitTrust) {

    //     const path = this.unitTrustsPath();
    //     if (!path) return;

    //     try {
    //         await updateDoc(doc(db, path, item.id), {
    //             ...item,
    //         });
    //         this.store.purchase.unitTrust.load([item]);
    //     } catch (error) { }
    // }


    async delete(item: IPurchaseUnitTrust) {
        const path = this.unitTrustsPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.purchase.unitTrust.remove(item.id);
        } catch (error) { }
    }
}