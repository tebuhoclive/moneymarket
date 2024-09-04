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
    "  Number": string;
    "Account Number": string
}

interface IDepositTransaction {
    tasman: string;
    lots: string;
}


const AnalyseModal = observer(() => {
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


    // lots tasman
    const handleAccountImport = async () => {
        if (importFile) {
            try {
                setLoading(true);
                const arrayBuffer = await importFile.arrayBuffer();
                const wb = read(arrayBuffer);
                const data = utils.sheet_to_json<ImportTransactions>(wb.Sheets[wb.SheetNames[0]]);

                const importDataAsJson = data.map((data: ImportTransactions) => {
                    return {
                        lots: data["Account Number"],
                        tasman: `A${padNumberStringWithZero(`${data["  Number"]}`, 5)}`,
                    };
                });

                // Extract lots and tasman account numbers into separate arrays
                const lotsAccountNumbers = importDataAsJson.map(item => item.lots);
                const tasmanAccountNumbers = importDataAsJson.map(item => item.tasman);

                // Find lots account numbers that are not in tasman account numbers
                const unmatchedLotsAccounts = lotsAccountNumbers.filter(
                    lots => !tasmanAccountNumbers.includes(lots)
                );

                console.log("Unmatched Lots Account Numbers: ", unmatchedLotsAccounts);

                setLoading(false);
            } catch (error) {
                console.error("Error during import", error);
                setLoading(false);
                // onCancel(); // Uncomment if needed
            }
        }
    };

    //tasman lots
    // const handleAccountImport = async () => {
    //     if (importFile) {
    //         try {
    //             setLoading(true);
    //             const arrayBuffer = await importFile.arrayBuffer();
    //             const wb = read(arrayBuffer);
    //             const data = utils.sheet_to_json<ImportTransactions>(wb.Sheets[wb.SheetNames[0]]);

    //             const importDataAsJson = data.map((data: ImportTransactions) => {
    //                 return {
    //                     lots: data["Account Number"],
    //                     tasman: `A${padNumberStringWithZero(`${data["  Number"]}`, 5)}`,
    //                 };
    //             });

    //             // Extract lots and tasman account numbers into separate arrays
    //             const lotsAccountNumbers = importDataAsJson.map(item => item.lots);
    //             const tasmanAccountNumbers = importDataAsJson.map(item => item.tasman);

    //             // Find tasman account numbers that are not in lots account numbers
    //             const unmatchedTasmanAccounts = tasmanAccountNumbers.filter(
    //                 tasman => !lotsAccountNumbers.includes(tasman)
    //             );

    //             console.log("Unmatched Tasman Account Numbers: ", unmatchedTasmanAccounts);

    //             setLoading(false);
    //         } catch (error) {
    //             console.error("Error during import", error);
    //             setLoading(false);
    //             // onCancel(); // Uncomment if needed
    //         }
    //     }
    // };




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
            <h3 className="uk-modal-title">Analyse</h3>
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

export default AnalyseModal
