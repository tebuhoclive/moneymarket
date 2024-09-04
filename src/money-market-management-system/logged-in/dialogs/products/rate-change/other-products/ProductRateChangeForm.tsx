import { FormEvent, useState } from "react";
import { observer } from "mobx-react-lite";

import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import { IProduct, IProductRateChange } from '../../../../../../shared/models/ProductModel';
import NumberInput from "../../../../shared/components/number-input/NumberInput";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import DetailView from "../../../../shared/components/detail-view/DetailView";
import { IMoneyMarketAccount } from "../../../../../../shared/models/money-market-account/MoneyMarketAccount";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const startOfMonthBackDating = new Date(currentYear, currentMonth, 2);

interface IProps {
  product: IProduct;
  accounts: IMoneyMarketAccount[];
  onCancel: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  rateChange: IProductRateChange;
  setRateChange: React.Dispatch<React.SetStateAction<IProductRateChange>>;
  loading: boolean;
  loadingSave: boolean;
}

const ProductRateChange = observer((props: IProps) => {
  const { product, accounts, onCancel, handleSubmit, rateChange, setRateChange, loading, loadingSave } = props;
  const [selectedTab, setSelectedTab] = useState("Form");

  const productTotalAccounts = accounts.length

  const productTotalBalance = accounts.reduce(
    (sum, balance) => sum + balance.balance,
    0
  );

  const productDetails = [
    {
      label: "Product Code",
      value: product.productCode
    },
    {
      label: "Product Name",
      value: product.productName
    },
    {
      label: "Product Rate",
      value: product.baseRate
    },
    {
      label: "Total Account",
      value: productTotalAccounts
    },
    {
      label: "Balance",
      value: productTotalBalance
    }
  ]

  const onSelectRateChangeType = (selectedRateChangeType: string) => {
    const rateChangeType = selectedRateChangeType
    if (rateChangeType === "Drop" || rateChangeType === "Hike" || rateChangeType === "Rate") {
      setRateChange({ ...rateChange, rateChangeType: rateChangeType })
    }
  }

  return (
    <div className="dialog-content uk-position-relative uk-width-expand">
      <div className="form-views uk-child-width-1-1 uk-grid uk-grid-small" data-uk-grid>
        <Toolbar
          leftControls={
            <div className="uk-margin-bottom">
              <button className={`btn ${selectedTab ? "btn-primary" : "btn-primary-in-active"}`}
                onClick={() => setSelectedTab("Form")}
              >
                Rate Change Form
              </button>
              <button className={`btn ${selectedTab ? "btn-primary" : "btn-primary-in-active"}`}
                onClick={() => setSelectedTab("Rate Change History")}
              >
                Rate Change History
              </button>
              <button className={`btn ${selectedTab ? "btn-primary" : "btn-primary-in-active"}`}
                onClick={() => setSelectedTab("Rate Change Audit Trail")}
              >
                Rate Change Audit Trail
              </button>
            </div>
          }
        />
        <hr className="uk-remove-margin-top" />
        {
          selectedTab === "Form" &&
          <>
            <div className="uk-width-1-2">
              <h4 className="main-title-md">Product Details</h4>
              <DetailView dataToDisplay={productDetails} />
            </div>
            <form className="uk-form-stacked uk-grid-small uk-width-1-2" data-uk-grid onSubmit={handleSubmit}>
              <h4 className="main-title-md">Rate Change Form</h4>
              <div className="uk-width-1-1 uk-form-controls">
                <label className="uk-form-label" htmlFor="product-name">
                  Rate Change Type
                </label>
                <select className="uk-select" name="" id=""
                  value={rateChange.rateChangeType}
                  onChange={(e) => onSelectRateChangeType(e.target.value)}
                >
                  <option value="Drop">Drop</option>
                  <option value="Hike">Hike</option>
                  <option value="Rate">Rate</option>
                </select>
              </div>
              {rateChange.rateChangeType !== "Rate" &&
                <div className="uk-width-1-1 uk-form-controls">
                  <label className="uk-form-label required" htmlFor="basis-points">
                    Basis Points ({rateChange.rateChangeType}) {rateChange.basisPoints ? `(${rateChange.basisPoints / 100})` : ""}
                  </label>
                  <NumberInput className="uk-input uk-form-small" id="basis-points" value={rateChange.basisPoints}
                    onChange={(value) => setRateChange({ ...rateChange, basisPoints: Number(value) })}
                    required />
                </div>}
              {rateChange.rateChangeType === "Rate" &&
                <div className="uk-width-1-1 uk-form-controls">
                  <label className="uk-form-label required" htmlFor="basis-points">
                    New Product Rate {rateChange.productRate ? `(${rateChange.productRate / 100})` : ""}
                  </label>
                  <NumberInput className="uk-input uk-form-small" id="basis-points" value={rateChange.productRate}
                    onChange={(value) => setRateChange({ ...rateChange, productRate: Number(value) })}
                    required />
                </div>}

              <div className="uk-width-1-1 uk-form-controls">
                <label className="uk-form-label required" htmlFor="valueDate">
                  Rate Change Effective Date
                </label>
                <input className="uk-input uk-form-small" id="valueDate" type="date" name="valueDate"
                  // min={startOfMonthBackDating.toISOString().split('T')[0]}
                  value={dateFormat_YY_MM_DD(rateChange.effectiveDate || Date.now())}
                  onChange={(e) => setRateChange({ ...rateChange, effectiveDate: e.target.valueAsNumber })}
                  required />
              </div>
              <div className="uk-width-1-1 uk-text-right">
                <button className="btn btn-primary" type="submit" disabled={loading || loadingSave}>
                  {rateChange.rateChangeType === "Rate" ? "Change" : rateChange.rateChangeType} Rate {(loading || loadingSave) && <div data-uk-spinner="ratio: .5"></div>}
                </button>
                <button className="btn btn-danger" type="button" onClick={onCancel}>
                  Cancel
                </button>
              </div>
            </form></>
        }
      </div>
    </div>
  );
}
);

export default ProductRateChange;
