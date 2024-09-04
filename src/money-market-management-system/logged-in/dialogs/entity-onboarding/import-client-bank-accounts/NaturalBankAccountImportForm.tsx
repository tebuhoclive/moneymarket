import { observer } from "mobx-react-lite";
import { ChangeEvent, useEffect, useState } from "react";
import { read, utils } from "xlsx";
import "./AccountImport.scss";

import FormFieldInfo from "../../../shared/components/form-field-info/FormFieldInfo";
import ProgressBar from "../../../shared/components/progress-bar/ProgressBar";
import MODAL_NAMES from "../../ModalName";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { allBanks, getUniversalBankCode } from "../../../../../shared/functions/Banks";


export interface IClientStaticDataImport {
  "Account Holder": string;
  "Bank Account No": string;
  "Bank Name": string;
  "Branch Name": string;
  "Cpty Code": string;
}

const NaturalBankAccountImportForm = observer(() => {
  const { api, store } = useAppContext();

  const [importFile, setImportFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [importAccounts, setAccountImports] = useState<
    IClientStaticDataImport[]
  >([]);
  const [completedItems, setCompletedItems] = useState(0);

  const handleChangeAccountFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImportFile(event.target.files[0]);
    }
  };

  const handleAccountImport = async () => {
    if (importFile) {
      const wb = read(await importFile.arrayBuffer());
      const data = utils.sheet_to_json<IClientStaticDataImport>(
        wb.Sheets[wb.SheetNames[0]]
      );

      const importDataAsJson = data.map((data: IClientStaticDataImport) => ({
        counterPartyCode: `${data["Cpty Code"]}`,
        accountHolder: data["Account Holder"],
        bankName: data["Bank Name"],
        branchName: data["Branch Name"],
        accountNumber: data["Bank Account No"],
        branchNumber: getUniversalBankCode(data["Bank Name"], allBanks),
      }));

      try {
        setLoading(true);

        const data = {
          bankAccount: importDataAsJson,
        };


        console.log("data: ", data)

        // call here
        const response = await fetch("https://us-central1-ijgmms.cloudfunctions.net/importNaturalPersonBankAccount",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        if (response.ok) {
          //action
        } else {
          //action
        }
      } catch (error) {
        setLoading(false);
      }
      setLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onCancel();
    }
  };

  const onCancel = () => {
    setImportFile(null);
    hideModalFromId(MODAL_NAMES.DATA_MIGRATION.IMPORT_CLIENT_ACCOUNTS_MODAL);
  };

  return (
    <ErrorBoundary>
      <div className="uk-width-1-1 uk-margin" data-uk-margin>
        <div data-uk-form-custom="target: true">
          <input
            type="file"
            aria-label="Custom controls"
            onChange={handleChangeAccountFile}
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
        {!loading && importFile && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAccountImport}
          >
            Import
          </button>
        )}
        {loading && importFile && (
          <ProgressBar
            totalItems={importAccounts.length}
            progress={completedItems}
          />
        )}
      </div>
    </ErrorBoundary>
  );
});

export default NaturalBankAccountImportForm;
