import { observer } from 'mobx-react-lite'
import React, { ChangeEvent, useState } from 'react'
import { useAppContext } from '../../../shared/functions/Context';
import { IMoneyMarketAccount } from '../../../shared/models/money-market-account/MoneyMarketAccount';
import FormFieldInfo from '../../logged-in/shared/components/form-field-info/FormFieldInfo';
import ProgressBar from '../../logged-in/shared/components/progress-bar/ProgressBar';
import { read, utils } from 'xlsx';
import { ACTIVE_ENV } from '../../logged-in/CloudEnv';
import { hideModalFromId } from '../../../shared/functions/ModalShow';
import MODAL_NAMES from '../../logged-in/dialogs/ModalName';
import { padNumberStringWithZero } from '../../../shared/functions/StringFunctions';

interface ImportTransactions {
    "Account Number": string;
    Instrument: string;
    "Transaction Type": string;
    "      Transaction Amount": number;
    "      Rate": number;
    "Date": string; //value date
    "Captured": string// transaction date
    "By": string
}

interface IDepositTransaction {
    id: string;
    transactionDate: number;
    valueDate: number;
    transactionType: string;
    amount: number;
    rate: number;
    capturedBy: string;
    accountNumber: string;
    product: string;
}


const TransactionImportModal = observer(() => {
    const { store } = useAppContext();
    const [importFile, setImportFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [transactionsImported, setTransactionsImported] = useState(0);
    const [importTransactions, setTransactionImports] = useState<IDepositTransaction[]>(
        []
    );

    const handleChangeTransactionFile = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setImportFile(event.target.files[0]);
        }
    };


    // const handleAccountImport = async () => {
    //     alert("im clicked")
    //     if (importFile) {
    //         const wb = read(await importFile.arrayBuffer());
    //         const data = utils.sheet_to_json<ImportTransactions>(
    //             wb.Sheets[wb.SheetNames[0]]
    //         );

    //         const importDataAsJson: IDepositTransaction[] = data.map(
    //             (data: ImportTransactions, index) => ({
    //                 id: "",
    //                 transactionDate: data["Date"],
    //                 valueDate: data["Captured"],
    //                 transactionType: data["Transaction Type"],
    //                 amount: data["      Transaction Amount"],
    //                 rate: data["      Rate"],
    //                 capturedBy: data["By"],
    //                 accountNumber: data["ACC Num"],
    //                 product: data.Instrument
    //             })
    //         );
    //         alert("im clicked after import")
    //         console.log("data", importDataAsJson);


    //         setTransactionImports(importDataAsJson);

    //         try {
    //             setLoading(true);

    //             const data = {
    //                 moneyMarketAccount: importDataAsJson,
    //             };


    //             let completedCount = 0;

    //             // const url = `${ACTIVE_ENV}importMoneyMarketAccounts`;
    //             // const response = await fetch(
    //             //     url,
    //             //     {
    //             //         method: "POST",
    //             //         headers: {
    //             //             "Content-Type": "application/json",
    //             //         },
    //             //         body: JSON.stringify(data),
    //             //     }
    //             // );

    //             // if (response.ok) {
    //             //     const progress = ((completedCount / importTransactions.length) * 100).toFixed(2); // Calculate progress percentransactions          setTransactionsImported(completedCount);
    //             //     setProgressPercentage(Number(progress));
    //             //     completedCount++;
    //             // } else {
    //             //     console.log("Failed", response.status);
    //             //     console.log("Failed Payload", data.moneyMarketAccount);
    //             // }

    //         } catch (error) {
    //             setLoading(false);
    //             onCancel();
    //         }
    //         setLoading(false);
    //         await new Promise((resolve) => setTimeout(resolve, 2000));
    //         onCancel();
    //     }
    // };

    // const handleAccountImport = async () => {
    //     if (importFile) {
    //         try {
    //             setLoading(true);

    //             // Read the file and convert it to JSON
    //             const arrayBuffer = await importFile.arrayBuffer();
    //             const wb = read(arrayBuffer);
    //             const data = utils.sheet_to_json<ImportTransactions>(wb.Sheets[wb.SheetNames[0]]);

    //             // Helper function to convert Excel dates to JS dates
    //             const excelDateToJSDate = (serial: number): Date => {
    //                 const utc_days = Math.floor(serial - 25569);
    //                 const utc_value = utc_days * 86400;
    //                 return new Date(utc_value * 1000);
    //             };

    //             // Transform data to IDepositTransaction format
    //             const importDataAsJson: IDepositTransaction[] = data.map((data: ImportTransactions) => {
    //                 const transactionDate = excelDateToJSDate(parseFloat(data["Date"])).getTime();
    //                 const valueDate = excelDateToJSDate(parseFloat(data["Captured"])).getTime();

    //                 return {
    //                     id: "",
    //                     transactionDate: transactionDate,
    //                     valueDate: valueDate,
    //                     transactionType: data["Transaction Type"].toLowerCase(),
    //                     amount: data["      Transaction Amount"],
    //                     rate: data["      Rate"],
    //                     capturedBy: data["By"],
    //                     accountNumber: `A${padNumberStringWithZero(`${data["ACC Num"]}`, 5)}`,
    //                     product: data.Instrument,
    //                 };
    //             });

    //             setTransactionImports(importDataAsJson);

    //             // Prepare data for the POST request
    //             const requestData = {
    //                 transactions: importDataAsJson,
    //             };
    //             const url = `${ACTIVE_ENV}importTransaction`;

    //             // Send the POST request
    //             const response = await fetch(url, {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify(requestData),
    //             });

    //             if (response.ok) {
    //                 console.log("Transactions imported successfully");
    //             } else {
    //                 console.log("Failed", response.status);
    //                 console.log("Failed Payload", requestData.transactions);
    //             }

    //             setLoading(false);
    //             await new Promise((resolve) => setTimeout(resolve, 2000));
    //             // onCancel(); // Uncomment if needed
    //         } catch (error) {
    //             console.error("Error during import", error);
    //             setLoading(false);
    //             // onCancel(); // Uncomment if needed
    //         }
    //     }
    // };


    const handleAccountImport = async () => {
        if (importFile) {
            try {
                setLoading(true);

                // Read the file and convert it to JSON
                const arrayBuffer = await importFile.arrayBuffer();
                const wb = read(arrayBuffer);
                const data = utils.sheet_to_json<ImportTransactions>(wb.Sheets[wb.SheetNames[0]]);

                // Helper function to convert Excel dates to JS dates
                const excelDateToJSDate = (serial: number): Date => {
                    const utc_days = Math.floor(serial - 25569);
                    const utc_value = utc_days * 86400;
                    return new Date(utc_value * 1000);
                };

                // Transform data to IDepositTransaction format
                const importDataAsJson: IDepositTransaction[] = data.map((data: ImportTransactions) => {
                    const transactionDate = excelDateToJSDate(parseFloat(data["Captured"])).getTime();
                    const valueDate = excelDateToJSDate(parseFloat(data["Date"])).getTime();

                    return {
                        id: "",
                        transactionDate: transactionDate,
                        valueDate: valueDate,
                        transactionType: data["Transaction Type"].toLowerCase(),
                        amount: Math.abs(data["      Transaction Amount"]),
                        rate: data["      Rate"],
                        capturedBy: data["By"],
                        accountNumber: `A${padNumberStringWithZero(`${data["Account Number"]}`, 5)}`,
                        product: data.Instrument,
                    };
                });

                setTransactionImports(importDataAsJson);

                // Prepare data for the POST request
                const requestData = {
                    transactions: importDataAsJson,
                };

                // Construct the URL
                const url = `${ACTIVE_ENV.url}importTransaction`;

                // Log the URL and request data for debugging
                console.log("URL:", url);
                console.log("Request Data:", requestData);

                // Send the POST request
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                });

                if (response.ok) {
                    console.log("Transactions imported successfully");
                } else {
                    console.log("Failed", response.status);
                    console.log("Failed Payload", requestData.transactions);
                }

                setLoading(false);
                await new Promise((resolve) => setTimeout(resolve, 2000));
                // onCancel(); // Uncomment if needed
            } catch (error) {
                console.error("Error during import", error);
                setLoading(false);
                // onCancel(); // Uncomment if needed
            }
        }
    };



    const onCancel = () => {
        setImportFile(null);
        hideModalFromId(MODAL_NAMES.DATA_MIGRATION.IMPORT_TRANSACTIONS_MODAL);
    };



    return (
        <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-4-5">
            <button
                className="uk-modal-close-default"
                // onClick={onCancel}
                // disabled={loading}
                type="button"
                data-uk-close
            ></button>
            <h3 className="uk-modal-title">Import Transactions</h3>
            <div className="dialog-content uk-position-relative">
                <form
                    className="uk-form-stacked uk-grid-small"
                    data-uk-grid
                >
                    <p>This form allows you to import <b>Client Accounts</b> using excel files that have been exported from the old system.</p>

                    <div className="uk-width-1-1 uk-margin" data-uk-margin>
                        <div data-uk-form-custom="target: true">
                            <input
                                type="file"
                                aria-label="Custom controls"
                                onChange={handleChangeTransactionFile}
                                accept="xls"
                                required
                            />
                            <input
                                className="uk-input uk-form-width-large"
                                type="text"
                                placeholder="Select file"
                                aria-label="Custom controls"
                                disabled
                            />
                        </div>
                        <FormFieldInfo>You can only upload Excel Files</FormFieldInfo>
                        {/* {!loading && importFile && ( */}
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleAccountImport}
                            disabled={loading}
                        >
                            {loading ? <span data-uk-spinner={"ratio:.5"}></span> : "Import"}
                        </button>
                    </div>
                    <div className="uk-width-1-1 uk-text-right">
                        <button className="btn btn-danger uk-margin-right" type="button" onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

        </div>
    )
})

export default TransactionImportModal
