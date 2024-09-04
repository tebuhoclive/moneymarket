import { observer } from "mobx-react-lite";
import { ChangeEvent, useState } from "react";
import { read, utils } from "xlsx";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import FormFieldInfo from "../../../shared/components/form-field-info/FormFieldInfo";
import MODAL_NAMES from "../../ModalName";
import { padNumberStringWithZero } from "../../../../../shared/functions/StringFunctions";
import { getMMADocId } from "../../../../../shared/functions/MyFunctions";
import swal from "sweetalert";
import { ACTIVE_ENV } from "../../../CloudEnv";

interface IMoneyMarketAccountRateImport {
    id: string;
    AccountNumber: string;
    OldRate: number;
    CurrentRate: number;
}

const ImportMoneyMarketAccountRates = observer(() => {
    const { store } = useAppContext();

    const [importFile, setImportFile] = useState<File | null>(null);
    const [importedData, setImportedData] = useState<IMoneyMarketAccountRateImport[]>();
    const [loading, setLoading] = useState(false);

    const [progressPercentage, setProgressPercentage] = useState("");
    const [accountsUpdated, setAccountsUpdated] = useState(0);

    const handleChangeAccountFile = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setImportFile(event.target.files[0]);
        }
    };

    //     if (importFile) {

    //         const wb = read(await importFile.arrayBuffer());
    //         const data = utils.sheet_to_json<IMoneyMarketAccountRateImport>(
    //             wb.Sheets[wb.SheetNames[0]]
    //         );
    //         setImportedData(data);

    //         if (importedData) {

    //             const importDataAsJson: any[] = importedData.map(
    //                 (data: IMoneyMarketAccountRateImport, index) => ({
    //                     id: getMMADocId(`A${padNumberStringWithZero(`${data.AccountNumber}`, 5)}`, store),
    //                     currentRate: data.CurrentRate,
    //                     oldRate: data.CurrentRate,
    //                 })
    //             );
    //             setLoading(true);
    //             for (let index = 0; index < importDataAsJson.length; index++) {
    //                 const accountToUpdate = importDataAsJson[index];
    //                 const rate = getAccountCurrentRate(accountToUpdate.id, store);

    //                 const _accountToUpdate = {
    //                     accountId: accountToUpdate.id,
    //                     currentRate: accountToUpdate.currentRate,
    //                     rateAtImport: rate,
    //                     // rateOnRecord: accountToUpdate.oldRate,
    //                     // isRateChangeRequired: isRateChangeRequired,
    //                 }


    //                 const url = `${ACTIVE_ENV.url}updateClientRateSecondGen`;
    //                 try {
    //                     const response = await fetch(url || "", {
    //                         method: "POST",
    //                         headers: {
    //                             "Content-Type": "application/json",
    //                         },
    //                         body: JSON.stringify(_accountToUpdate),
    //                     });

    //                     if (response.ok) {
    //                         console.log("response: ", response);
    //                         console.log(`Updated`, _accountToUpdate);
    //                         completedCount++; // Increment completed count
    //                         const progress = ((completedCount / importedData.length) * 100).toFixed(2);
    //                         setProgressPercentage(progress);
    //                         setAccountsUpdated(completedCount);
    //                     } else {

    //                         console.log("error: ", response.status);

    //                         // swal({
    //                         //     icon: "error",
    //                         //     text: "Error updating account",
    //                         // });
    //                     }
    //                 } catch (error) {
    //                     console.log("error", error);
    //                 }
    //             }
    //             setLoading(false);
    //             onCancel();
    //         }
    //     }
    // };
    const handleAccountImportUpdate = async () => {
        if (importFile) {
            const wb = read(await importFile.arrayBuffer());
            const data = utils.sheet_to_json<IMoneyMarketAccountRateImport>(
                wb.Sheets[wb.SheetNames[0]]
            );
            setImportedData(data);

            console.log("data: ", data)
            if (data && data.length > 0) {
                const importDataAsJson: any[] = data.map(
                    (data: IMoneyMarketAccountRateImport) => ({
                        id: getMMADocId(`A${padNumberStringWithZero(`${data.AccountNumber}`, 5)}`, store),
                        currentRate: data.OldRate,
                        oldRate: data.OldRate,
                    })
                );

                setLoading(true);
                let completedCount = 0;
                const maxConcurrentRequests = 500;

                const updateAccount = async (accountToUpdate: any) => {
                    const rate = accountToUpdate.clientRate;

                    const _accountToUpdate = {
                        accountId: accountToUpdate.id,
                        currentRate: accountToUpdate.oldRate,
                        rateAtImport: accountToUpdate.oldRate,
                    };

                    console.log("Account", _accountToUpdate);

                    const url = `${ACTIVE_ENV.url}updateClientRateSecondGen`;

                    try {
                        const response = await fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(_accountToUpdate),
                        });

                        if (response.ok) {
                            completedCount++;
                            const progress = (
                                (completedCount / importDataAsJson.length) *
                                100
                            ).toFixed(2);
                            setProgressPercentage(progress);
                            setAccountsUpdated(completedCount);
                            return true; // Indicate success
                        } else {
                            console.log("error: ", response.type);
                            console.log("error: ", response.status);
                            console.log("error: ", response.text.name);
                            console.log("error: ", response.url);
                            return false; // Indicate failure
                        }
                    } catch (error) {
                        console.log("error", error);
                        return false;
                    } finally {

                    }
                };

                const runUpdatesWithConcurrencyLimit = async () => {
                    const executing: any = [];
                    for (const account of importDataAsJson) {
                        const p = updateAccount(account).then(() => {
                            executing.splice(executing.indexOf(p), 1);
                        });
                        executing.push(p);
                        if (executing.length >= maxConcurrentRequests) {
                            await Promise.race(executing);
                        }
                    }
                    await Promise.all(executing);
                };

                try {
                    await runUpdatesWithConcurrencyLimit();
                    swal({
                        icon: "success",
                        text: "Accounts updated successfully",
                    });
                } catch (error) {
                    console.error("Error updating accounts:", error);
                } finally {
                    setLoading(false);
                    onCancel();
                }
            }
        }
    };


    const onCancel = () => {
        setImportFile(null);
        hideModalFromId(MODAL_NAMES.DATA_MIGRATION.IMPORT_CLIENT_ACCOUNTS_MODAL);
    };

    return (
        <div className="upload-deduction-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
            <button className="uk-modal-close-default" type="button" data-uk-close></button>

            <h3 className="main-title-lg">Import Money Market Rates</h3>

            <div className="dialog-content uk-position-relative">
                <form className="uk-form-stacked uk-grid-small" data-uk-grid>
                    <div className="uk-width-1-1 uk-margin" data-uk-margin>
                        <div data-uk-form-custom="target: true">
                            <input type="file" aria-label="Custom controls" onChange={handleChangeAccountFile} accept="xls"
                                required
                            />
                            <input className="uk-input uk-form-width-large" type="text" placeholder="Select file" aria-label="Custom controls"
                                disabled
                            />
                        </div>
                        <FormFieldInfo>You can only upload Excel Files</FormFieldInfo>
                        {!loading && importFile &&
                            <button type="button" className="btn btn-primary" onClick={handleAccountImportUpdate}>
                                Import
                            </button>
                        }
                        <div className="uk-width-1-1 uk-margin">
                            <label>Calculating Accounts interest</label> <br />
                            <label className="uk-form-label required">
                                {`Progress ${progressPercentage}% - ${accountsUpdated} out of ${importedData?.length} completed`}
                            </label>
                            <progress
                                className="uk-progress"
                                value={progressPercentage}
                                max={100}
                            ></progress>
                            <br />



                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default ImportMoneyMarketAccountRates;
