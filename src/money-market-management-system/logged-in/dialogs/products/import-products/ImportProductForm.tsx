import { observer } from "mobx-react-lite";
import { ChangeEvent, useState } from "react";
import { read, utils } from "xlsx";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { IProduct, defaultProduct } from "../../../../../shared/models/ProductModel";
import FormFieldInfo from "../../../shared/components/form-field-info/FormFieldInfo";
import ProgressBar from "../../../shared/components/progress-bar/ProgressBar";
import MODAL_NAMES from "../../ModalName";

interface IProductImport {
  ['Product Code (Old)']: string,
  ['Product Code (New)']: string,
  ['A/L']: string,
  ['Link']: string,
  ['Display Name']: string,
  ['Type']: string,
  ['Account Type']: string,
  ['Base Rate']: number,
}

const ImportProductForm = observer(() => {
  const { api } = useAppContext();

  const [importFile, setImportFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [importEntitys, setEntityImports] = useState<IProduct[]>([]);
  const [completedItems, setCompletedItems] = useState(0);

  const handleChangeEntityFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImportFile(event.target.files[0]);
    }
  }

  const handleEntityImport = async () => {
    if (importFile) {
      const wb = read(await importFile.arrayBuffer());
      const data = utils.sheet_to_json<IProductImport>(wb.Sheets[wb.SheetNames[0]]);

      console.log("Data", data);
      

      const importDataAsJson: IProduct[] = data.map((data: IProductImport) => ({
        ...defaultProduct,
        id: `${data["Product Code (Old)"]}`,
        productCode: data["Product Code (Old)"],
        productName: data["Display Name"],
        productDescription: data["Product Code (Old)"],
        baseRate:0,
        assetLiability: data["A/L"],
        dailyFlowCutOffTime: 0,
        newProductCode: data["Product Code (New)"],
        productType: data["Type"], //7 Day Call | Money Market Fund | Fixed Deposit
        isAccount: data["Account Type"] === 'Account' ? true : false , //true: Account //false: Product
        link:data["Link"]
      }));

      setEntityImports(importDataAsJson);
      console.log("here", importDataAsJson);

      try {
        setLoading(true);
        for (let index = 0; index < importDataAsJson.length; index++) {
          const clientRecord = importDataAsJson[index];

          setCompletedItems(index + 1); // Update the progress bar and text
          await api.product.create(clientRecord);
          await new Promise(resolve => setTimeout(resolve, 200)); // Wait two seconds before adding the next record to the database
        }
      } catch (error) {
        setLoading(false);
        console.log(error);

      }
      setLoading(false);
      await new Promise(resolve => setTimeout(resolve, 2000));
      onCancel();
    }
  }

  const onCancel = () => {
    setImportFile(null);
    hideModalFromId(MODAL_NAMES.DATA_MIGRATION.IMPORT_CLIENT_ENTITY_MODAL);
  }

  return (
    <ErrorBoundary>
      <div className="uk-width-1-1 uk-margin" data-uk-margin>
        <div data-uk-form-custom="target: true">
          <input type="file" aria-label="Custom controls" onChange={handleChangeEntityFile} accept="xls" required />
          <input className="uk-input uk-form-width-large" type="text" placeholder="Select file" aria-label="Custom controls" disabled />
        </div>
        <FormFieldInfo>
          You can only upload Excel Files
        </FormFieldInfo>
        {
          !loading && importFile &&
          <button type="button" className="btn btn-primary" onClick={handleEntityImport}>
            Import
          </button>
        }
        {
          loading && importFile &&
          <ProgressBar totalItems={importEntitys.length} progress={completedItems} />
        }

      </div>
    </ErrorBoundary>
  )
});

export default ImportProductForm
