import { observer } from "mobx-react-lite";
import { ChangeEvent, useState } from "react";
import { read, utils } from "xlsx";
import "./AccountImport.scss";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import FormFieldInfo from "../../../shared/components/form-field-info/FormFieldInfo";
import ProgressBar from "../../../shared/components/progress-bar/ProgressBar";
import MODAL_NAMES from "../../ModalName";
import { padNumberStringWithZero } from "../../../../../shared/functions/StringFunctions";
import { ACTIVE_ENV } from "../../../CloudEnv";

interface IMoneyMarketAccountImport {
  id: string;
  "CounterParty Code": string;
  "Counterparty Name": string;
  "Tasman Account Number": string;
  "Product Code": string;
  "Account Current Balance": number;
  "Account Status": string;
  "Current Rate": number;
}

const AccountImportFormV2 = observer(() => {
  const { store } = useAppContext();

  const [importFile, setImportFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [importAccounts, setAccountImports] = useState<IMoneyMarketAccount[]>(
    []
  );
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [accountsImported, setAccountsImported] = useState(0);

  const handleChangeAccountFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImportFile(event.target.files[0]);
    }
  };

  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];

  const getParentEntity = (entityOldCPNumber: string) => {
    const client = clients.find(
      (client) => client.asJson.oldCPNumber === entityOldCPNumber
    );
    if (client) {
      return client.asJson.entityId;
    }
    return "";
  };

  const products = store.product.all;

  const getBaseRate = (productId: string) => {
    const baseRate = products.find(
      (b) => b.asJson.id === productId
    )?.asJson.baseRate;

    return baseRate || 0;

  }

  const handleAccountImport = async () => {
    if (importFile) {
      const wb = read(await importFile.arrayBuffer());
      const data = utils.sheet_to_json<IMoneyMarketAccountImport>(
        wb.Sheets[wb.SheetNames[0]]
      );

      const importDataAsJson: IMoneyMarketAccount[] = data.map(
        (data: IMoneyMarketAccountImport, index) => ({
          key: index,
          id: "",
          parentEntity: getParentEntity(`${data["CounterParty Code"]}`),
          oldCPNumber: `${data["CounterParty Code"]}`,
          accountNumber: `A${padNumberStringWithZero(`${data["Tasman Account Number"]}`, 5)}`,
          accountName: data["Counterparty Name"],
          accountType: `${data["Product Code"]}`,
          baseRate: getBaseRate(`${data["Product Code"]}`),
          feeRate: getBaseRate(`${data["Product Code"]}`) ? getBaseRate(`${data["Product Code"]}`) - data["Current Rate"] : 0,
          cession: 0,
          clientRate: data["Current Rate"],
          backUpClientRate: data["Current Rate"],
          balance: data["Account Current Balance"],
          backUpAccountBalance: data["Account Current Balance"],
          runningBalance: 0,
          displayOnEntityStatement: true,
          status: data["Account Status"],
          description: "",
          createdBy: "System",
        })
      )
      // .filter((d) => d.status === "Active" && d.balance !== 0);
      setAccountImports(importDataAsJson);

      console.log("accounts: ", importDataAsJson);
      try {
        setLoading(true);

        const data = {
          moneyMarketAccount: importDataAsJson,
        };


        let completedCount = 0;

        const url = `${ACTIVE_ENV.url}importMoneyMarketAccountsV2`;
        const response = await fetch(
          url,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        if (response.ok) {
        } else {
          console.log("Failed", response.status);
          console.log("Failed Payload", data.moneyMarketAccount);
        }

      } catch (error) {
        setLoading(false);
        onCancel();
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
            disabled={loading}
            onClick={handleAccountImport}
          >
            {loading ? <span data-uk-spinner={"ratio:.5"}></span> : "Import"}
          </button>
        )}
        {loading && importFile && (
          <ProgressBar
            totalItems={importAccounts.length}
            progress={progressPercentage}
          />
        )}
      </div>
    </ErrorBoundary>
  );
});

export default AccountImportFormV2;
