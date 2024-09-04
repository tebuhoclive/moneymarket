import { observer } from "mobx-react-lite";

import { doc, collection, getDocs, deleteDoc } from "firebase/firestore";
import swal from "sweetalert";
import { db } from "../../shared/config/firebase-config";
import { useAppContext } from "../../shared/functions/Context";
import { IStatementTransaction } from "../../shared/models/StatementTransactionModel";
import { log } from "console";
import { useEffect, useState } from "react";
import { IMoneyMarketAccount } from "../../shared/models/money-market-account/MoneyMarketAccount";
import { ACTIVE_ENV } from "../logged-in/CloudEnv";
import showModalFromId from "../../shared/functions/ModalShow";
import MODAL_NAMES from "../logged-in/dialogs/ModalName";
import Modal from "../../shared/components/Modal";
import TransactionImportModal from "./import-transactions/TransactionImportModal";
import { getMMADocId } from "../../shared/functions/MyFunctions";
import AnalyseModal from "./import-transactions/Analyse";

const SystemCommandCenter = observer(() => {
    const { api, store } = useAppContext();
    const [progressPercentage, setProgressPercentage] = useState("");
    const [accountsUpdated, setAccountsUpdated] = useState(0);

    const accounts = store.mma.all
        // .filter((a) => a.asJson.accountNumber === "A03579")
        .map((a) => { return a.asJson });

    const products = store.product.all;
    // const accounts = store.mma.all;
    const [loading, setLoading] = useState(false);

    const deleteAccountLogs = () => {
        // if (products.length !== 0) {
        alert("here")
        accounts.forEach(async (account) => {
            deleteSubCollection(account.id, 'transactions');
            // deleteWithdrawals(account.asJson.id, 'withdrawals');
            // deleteRateHistory(product.asJson.id, 'productRateChangeHistory');
        });
        // }
    }

    const deleteSubCollection = async (parentDocumentId: string, subCollectionName: string) => {
        try {
            // Reference to the parent document
            const parentDocRef = doc(db, 'moneyMarketAccounts', parentDocumentId);

            // Reference to the subCollection
            const subCollectionRef = collection(parentDocRef, subCollectionName);

            // Query to get all documents in the subCollection
            const subCollectionQuerySnapshot = await getDocs(subCollectionRef);

            // Delete each document in the subCollection
            subCollectionQuerySnapshot.forEach(async (subDoc) => {
                await deleteDoc(subDoc.ref);
            });

            console.log("success");

            return 'Sub Collection deleted successfully';
        } catch (error) {
            console.error('Error deleting subCollection:', error);
            throw error;
        }
    };

    const deleteWithdrawals = async (parentDocumentId: string, subCollectionName: string) => {
        try {
            // Reference to the parent document
            const parentDocRef = doc(db, 'moneyMarketAccounts', parentDocumentId);

            // Reference to the subCollection
            const subCollectionRef = collection(parentDocRef, subCollectionName);

            // Query to get all documents in the subCollection
            const subCollectionQuerySnapshot = await getDocs(subCollectionRef);

            // Delete each document in the subCollection
            subCollectionQuerySnapshot.forEach(async (subDoc) => {
                await deleteDoc(subDoc.ref);
            });

            return 'Sub Collection deleted successfully';
        } catch (error) {
            console.error('Error deleting subCollection:', error);
            throw error;
        }
    };

    const deleteDeposits = async (parentDocumentId: string, subCollectionName: string) => {
        try {
            // Reference to the parent document
            const parentDocRef = doc(db, 'products', parentDocumentId);

            // Reference to the subCollection
            const subCollectionRef = collection(parentDocRef, subCollectionName);

            // Query to get all documents in the subCollection
            const subCollectionQuerySnapshot = await getDocs(subCollectionRef);

            // Delete each document in the subCollection
            subCollectionQuerySnapshot.forEach(async (subDoc) => {
                await deleteDoc(subDoc.ref);
                console.log("Deleting", subDoc);
            });
            swal("Deleting")
            return 'Sub Collection deleted successfully';
        } catch (error) {
            console.error('Error deleting subCollection:', error);
        }
    };

    const deleteRateHistory = async (parentDocumentId: string, subCollectionName: string) => {
        try {
            // Reference to the parent document
            const parentDocRef = doc(db, 'moneyMarketAccounts', parentDocumentId);

            // Reference to the subCollection
            const subCollectionRef = collection(parentDocRef, subCollectionName);

            // Query to get all documents in the subCollection
            const subCollectionQuerySnapshot = await getDocs(subCollectionRef);

            // Delete each document in the subCollection
            subCollectionQuerySnapshot.forEach(async (subDoc) => {
                await deleteDoc(subDoc.ref);
                console.log("Deleting", subDoc);
            });
            swal("Deleting")
            return 'Sub Collection deleted successfully';
        } catch (error) {
            console.error('Error deleting subCollection:', error);
        }
    };

    const createOpeningBalance = () => {
        swal("Here");
        console.log(accounts);

        accounts.forEach(async account => {
            const transactionData: IStatementTransaction = {
                balance: account.balance,
                id: "TURwHEkCzkSRVcbjdtTkssssss",
                date: Date.parse('2024-08-01'),
                transaction: 'capitalisation',
                amount: 0,
                rate: account.clientRate ? account.clientRate : 0,
                remark: 'Opening Balance after Capitalization',
                createdAt: Date.now(),
            };

            console.log(transactionData)

            try {
                await api.mma.createStatementTransaction(account.id, transactionData);
                log(transactionData);
            } catch (error) {
                console.log(error);
            }
            swal("Done")
        });
    }

    const changeRate = () => {
        swal("Here");
        accounts.forEach(async account => {
            const transactionData: IMoneyMarketAccount = {
                ...account,
                clientRate: account.clientRate ? account.clientRate - 0.10 : 0
            };
            swal("here");

            try {
                await api.mma.update(transactionData);
                log(transactionData);
                swal("Done");
            } catch (error) {
                console.log(error);
            }
        });
    }

    // const onDeleteRateChange = async () => {
    //     console.log(accounts.length);

    //     accounts.forEach(async account => {

    //         const _accountToUpdate = {
    //             mmaId: account.asJson.id,
    //         }

    //         let completedCount = 0;

    //         const url = `${ACTIVE_ENV.url}deleteTransactionsWithStatusRateChange`;

    //         try {
    //             const response = await fetch(url, {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify(_accountToUpdate),
    //             });

    //             if (response.ok) {
    //                 console.log("Account", _accountToUpdate);
    //                 console.log("success, deleted");

    //                 completedCount++;
    //                 const progress = ((completedCount / accounts.length) * 100).toFixed(2);
    //                 setProgressPercentage(progress);
    //                 setAccountsUpdated(completedCount);
    //                 return true; // Indicate success
    //             } else {
    //                 console.log("error: ", response.status);
    //                 return false; // Indicate failure
    //             }

    //         } catch (error) {
    //             console.log("error", error);
    //             return false;
    //         }
    //     });
    //     // console.log("success");
    // }

    const onDeleteRateChange = async () => {
        console.log(accounts.length);

        const concurrencyLimit = 100; // Adjust the concurrency limit as needed
        let completedCount = 0;
        const url = `${ACTIVE_ENV.url}deleteTransactionsWithStatusRateChangeNew`;

        const processAccount = async (account: any) => {
            const _accountToUpdate = {
                mmaId: account.asJson.id,
            };
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(_accountToUpdate),
                });

                if (response.ok) {
                    console.log("Account", _accountToUpdate);
                    console.log("success, deleted");

                    completedCount++;
                    const progress = ((completedCount / accounts.length) * 100).toFixed(2);
                    setProgressPercentage(progress);
                    setAccountsUpdated(completedCount);
                    return true; // Indicate success
                } else {
                    console.log("error: ", response.status);
                    return false; // Indicate failure
                }

            } catch (error) {
                console.log("error", error);
                return false;
            }
        };

        const processAccountsInChunks = async (accounts: any, limit: number) => {
            const chunks = [];
            for (let i = 0; i < accounts.length; i += limit) {
                chunks.push(accounts.slice(i, i + limit));
            }

            for (const chunk of chunks) {
                await Promise.all(chunk.map((account: any) => processAccount(account)));
            }
        };

        await processAccountsInChunks(accounts, concurrencyLimit);
        console.log("All accounts processed");
    }
    const onReAlign = async () => {
        console.log(accounts.length);

        const concurrencyLimit = 100; // Adjust the concurrency limit as needed
        let completedCount = 0;
        const url = `${ACTIVE_ENV.url}reAlignStatement`;

        const processAccount = async (account: any) => {
            const _accountToUpdate = {
                mmaId: account.id,
            };

            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(_accountToUpdate),
                });

                if (response.ok) {
                    console.log("Account", _accountToUpdate);
                    console.log("success, re-aligned");

                    completedCount++;
                    const progress = ((completedCount / accounts.length) * 100).toFixed(2);
                    setProgressPercentage(progress);
                    setAccountsUpdated(completedCount);
                    return true; // Indicate success
                } else {
                    console.log("error: ", response.status);
                    return false; // Indicate failure
                }

            } catch (error) {
                console.log("error", error);
                return false;
            }
        };

        const processAccountsInChunks = async (accounts: any, limit: number) => {
            const chunks = [];
            for (let i = 0; i < accounts.length; i += limit) {
                chunks.push(accounts.slice(i, i + limit));
            }

            for (const chunk of chunks) {
                await Promise.all(chunk.map((account: any) => processAccount(account)));
            }
        };

        await processAccountsInChunks(accounts, concurrencyLimit);
        console.log("All accounts processed");
    }

    const onTransactionImport = () => {
        showModalFromId(MODAL_NAMES.DATA_MIGRATION.IMPORT_TRANSACTIONS_MODAL)
    }
    const onAnalyse = () => {
        showModalFromId(MODAL_NAMES.DATA_MIGRATION.IMPORT_ANALYSE_MODAL)
    }


    const singleRateChange = async () => {
        const rateChangeData = {
            moneyMarketAccountId: getMMADocId("A03207", store),
            date: "2024-06-18",
            rate: 7.98,
            createdDateAndTime: Date.parse("2024-06-18T04:00:00")
        };

        console.log("Data: ", rateChangeData);

        const url = `${ACTIVE_ENV.url}recordSingleRateChange`;
        setLoading(true);
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(rateChangeData),
            });

            if (response.ok) {
                console.log("success:", response);
                setLoading(false);

            } else {
                const errorText = await response.text();
                console.error("Error updating account:", errorText);
                setLoading(false);
                throw new Error(errorText);
            }
        } catch (error) {
            console.error("Error in updateInterestAccruedAndTotalDays:", error);
            throw error; // Re-throw the error to be caught in handleInitiateMonthEndRun
        }
    }

    useEffect(() => {
        const loadSystemData = async () => {
            try {
                setLoading(true);
                await Promise.all([
                    api.mma.getAll(),
                ]);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };
        // Call the function directly inside useEffect
        loadSystemData();
    }, [api.mma]); // Empty dependency array to run the effect once on mount

    return (
        <div className="uk-padding">
            <h4 className="main-title-sm">Test Command Center</h4>
            <button className="btn btn-danger uk-margin-right" disabled={loading} onClick={deleteAccountLogs}>Delete Logs {loading && <div data-uk-spinner={"ratio:.5"}></div>}</button>
            <button className="btn btn-danger uk-margin-right" disabled={loading} onClick={onDeleteRateChange}>Delete change rate transaction {loading && <div data-uk-spinner={"ratio:.5"}></div>}</button>
            <button className="btn btn-danger uk-margin-right" disabled={loading} onClick={createOpeningBalance}>Capitalise {loading && <div data-uk-spinner={"ratio:.5"}></div>}</button>
            <button className="btn btn-danger uk-margin-right" disabled={loading} onClick={changeRate}>Change Rate {loading && <div data-uk-spinner={"ratio:.5"}></div>}</button>
            <button className="btn btn-danger uk-margin-right" disabled={loading} onClick={onReAlign}>Align Statements {loading && <div data-uk-spinner={"ratio:.5"}></div>}</button>
            <button className="btn btn-danger uk-margin-right" disabled={loading} onClick={onTransactionImport}>Import Transactions {loading && <div data-uk-spinner={"ratio:.5"}></div>}</button>
            <button className="btn btn-danger uk-margin-right" disabled={loading} onClick={singleRateChange}>Single Rate Change {loading && <div data-uk-spinner={"ratio:.5"}></div>}</button>
            <button className="btn btn-danger uk-margin-right" disabled={loading} onClick={onAnalyse}>Analyse {loading && <div data-uk-spinner={"ratio:.5"}></div>}</button>
            <div className="uk-margin">
                <div className="uk-width-1-1 uk-margin">
                    <label className="uk-form-label required">
                        {`Progress ${progressPercentage}% - ${accountsUpdated} out of ${accounts.length} completed`}
                    </label>
                    <progress className="uk-progress" value={progressPercentage} max={100}></progress>
                    <br />
                </div>
            </div>
            <Modal modalId={MODAL_NAMES.DATA_MIGRATION.IMPORT_TRANSACTIONS_MODAL}>
                <TransactionImportModal />
            </Modal>
            <Modal modalId={MODAL_NAMES.DATA_MIGRATION.IMPORT_ANALYSE_MODAL}>
                <AnalyseModal />
            </Modal>
        </div>
    )
})

export default SystemCommandCenter