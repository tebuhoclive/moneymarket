import { observer } from "mobx-react-lite";
import { ChangeEvent, useEffect, useState } from "react";

import { read, utils } from "xlsx";
import "./DailyPricingUpload.scss";

import FormFieldInfo from "../../../shared/components/form-field-info/FormFieldInfo";
import ProgressBar from "../../../shared/components/progress-bar/ProgressBar";
import MODAL_NAMES from "../../ModalName";

import swal from "sweetalert";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { IProductDailyPricing } from "../../../../../shared/models/ProductDailyPricingModel";
import { IProductUpdate } from "../../../../../shared/models/ProductModel";
import { IBondUpdate } from "../../../../../shared/models/instruments/BondModel";
import { IEquityUpdate } from "../../../../../shared/models/instruments/EquityModel";
import { IUnitTrustUpdate } from "../../../../../shared/models/instruments/UnitTrustModel";

interface IDailyPricingUpload {
  'Date': string;
  'Instrument Type': string;
  'Instrument Code': string;
  'Rate': number;
  'Price(cpu)': number;
}

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

const DailyPrincingUploadForm = observer(() => {
  const { api, store } = useAppContext();

  const [priceUploadFile, setImportFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [productPrices, setProductPrices] = useState<IProductUpdate[]>([]);
  const [bondPrices, setBondPrices] = useState<IBondUpdate[]>([]);
  const [equityPrices, setEquityPrices] = useState<IEquityUpdate[]>([]);
  const [unitTrustPrices, setUnitTrustPrices] = useState<IUnitTrustUpdate[]>([]);

  const [completedItems, setCompletedItems] = useState(0);
  const [completedBondItems, setCompletedBondItems] = useState(0);
  const [completedEquityItems, setCompletedEquityItems] = useState(0);

  const handleChangeAccountFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImportFile(event.target.files[0]);
    }
  }

  const handleDailyPriceUpload = async () => {
    if (priceUploadFile) {
      const wb = read(await priceUploadFile.arrayBuffer());
      const data = utils.sheet_to_json<IDailyPricingUpload>(wb.Sheets[wb.SheetNames[0]]);

      // Money Market Solutions on the Daily Pricing Upload file
      const updatedProductPrices: IProductUpdate[] = data.filter(products => products["Instrument Type"] === "MM Solution").map((product: IDailyPricingUpload, index) => ({
        key: index,
        id: "",
        productCode: product["Instrument Code"],
        baseRate: Number((product["Rate"] * 100).toPrecision(2)),
      }));

      // Bond Instruments on the Daily Pricing Upload file
      const updatedBondPrices: IBondUpdate[] = data.filter(bonds => bonds["Instrument Type"] === "Bonds").map((bonds: IDailyPricingUpload, index) => ({
        key: index,
        id: "",
        instrumentName: bonds["Instrument Code"],
        couponRate: Number((bonds['Rate'] * 100).toPrecision(2)),
        price: bonds["Price(cpu)"],
      }));

      // Equity Instruments on the Daily Pricing Upload file
      const updatedEquityPrices: IEquityUpdate[] = data.filter(equities => equities["Instrument Type"] === "Equities").map((equities: IDailyPricingUpload, index) => ({
        key: index,
        id: "",
        sharecode: equities["Instrument Code"],
        price: equities["Price(cpu)"]

      }));

      // Unit Trust Instrument on the Daily Pricing Upload file
      const updatedUnitTrustPrices: IUnitTrustUpdate[] = data.filter(unitTrusts => unitTrusts["Instrument Type"] === "Unit Trust").map((unitTrust: IDailyPricingUpload, index) => ({
        key: index,
        id: "",
        sharecode: unitTrust["Instrument Code"],
        price: unitTrust["Price(cpu)"]
      }));

      setProductPrices(updatedProductPrices);
      setBondPrices(updatedBondPrices);
      setUnitTrustPrices(updatedUnitTrustPrices);
      setEquityPrices(updatedEquityPrices);

      // upload Product Prices
      try {
        setLoading(true);
        for (let index = 0; index < updatedProductPrices.length; index++) {
          const productItem = updatedProductPrices[index];

          setCompletedItems(index + 1); // Update the progress bar and text

          const product = store.product.getByItemProductId(productItem.productCode); // find the product on the Daily Pricing Upload file using it's product code

          if (product) {
            store.product.select(product.asJson);
            const selectedProduct = store.product.selected;
            if (selectedProduct) {

              const _product: IProductUpdate = {
                id: selectedProduct.id || "",
                productCode: productItem.productCode,
                baseRate: productItem.baseRate
              }

              const _productDailyPricing: IProductDailyPricing = {
                id: "",
                productCode: productItem.productCode,
                priceUpdateDate: Date.now(),
                oldRate: selectedProduct.baseRate,
                newRate: productItem.baseRate,
              }

              await api.product.updateDailyPrice(_product); // update the base rate for each product (money market solution)
              await api.productDailyPricing.create(year.toString(), month.toString(), _productDailyPricing);
              await new Promise(resolve => setTimeout(resolve, 200)); // Wait two seconds before adding the next record to the database

              // get all the money market accounts that belong to that product
              const productAccounts = store.mma.allProductAccounts(selectedProduct.id);


              for (let index = 0; index < productAccounts.length; index++) {
                const _productAccount: IMoneyMarketAccount = {
                  ...productAccounts[index].asJson,
                  baseRate: productItem.baseRate
                }
                await api.mma.updateBaseRate(_productAccount); // update the base rate for each money market account
                await new Promise(resolve => setTimeout(resolve, 200)); // Wait two seconds before adding the next record to the database
              }
            }
          }

        }
      } catch (error) {
        setLoading(false);
      }

      // upload Bond prices
      try {
        setLoading(true);
        for (let index = 0; index < updatedBondPrices.length; index++) {
          const bondItem = updatedBondPrices[index];

          setCompletedBondItems(index + 1); // Update the progress bar and text

          const bond = store.instruments.bond.getByItemInstrumentName(bondItem.instrumentName); // find the product on the Daily Pricing Upload file using it's product code

          if (bond) {
            store.instruments.bond.select(bond.asJson);
            const selectedBond = store.instruments.bond.selected;
            if (selectedBond) {

              const _bond: IBondUpdate = {
                id: selectedBond.id || "",
                instrumentName: bondItem.instrumentName,
                price: bondItem.price
              }

              const _bondDailyPricing: IProductDailyPricing = {
                id: "",
                productCode: bondItem.instrumentName,
                priceUpdateDate: Date.now(),
                oldRate: selectedBond.price,
                newRate: bondItem.price,
              }

              await api.instruments.bond.updateDailyPrice(_bond); // update the base rate for each product (money market solution)
              await api.productDailyPricing.create(year.toString(), month.toString(), _bondDailyPricing);
              await new Promise(resolve => setTimeout(resolve, 200)); // Wait two seconds before adding the next record to the database
            }
          }

        }

      } catch (error) {
      }

      // upload Equity prices
      try {
        setLoading(true);
        for (let index = 0; index < updatedEquityPrices.length; index++) {
          const equityItem = updatedEquityPrices[index];

          setCompletedEquityItems(index + 1); // Update the progress bar and text

          const equity = store.instruments.equity.getByItemShareCode(equityItem.sharecode); // find the product on the Daily Pricing Upload file using it's product code

          if (equity) {
            store.instruments.equity.select(equity.asJson);
            const selectedBond = store.instruments.bond.selected;
            if (selectedBond) {

              const _equity: IEquityUpdate = {
                id: selectedBond.id || "",
                sharecode: equityItem.sharecode,
                price: equityItem.price
              }

              const _equityDailyPricing: IProductDailyPricing = {
                id: "",
                productCode: equityItem.sharecode,
                priceUpdateDate: Date.now(),
                oldRate: selectedBond.price,
                newRate: equityItem.price,
              }

              await api.instruments.equity.updateDailyPrice(_equity); // update the base rate for each product (money market solution)
              await api.productDailyPricing.create(year.toString(), month.toString(), _equityDailyPricing);
              await new Promise(resolve => setTimeout(resolve, 200)); // Wait two seconds before adding the next record to the database
            }
          }
        }

      } catch (error) {
      }

      // upload Equity prices
      try {
        setLoading(true);
        for (let index = 0; index < updatedUnitTrustPrices.length; index++) {
          const unitTrustItem = updatedUnitTrustPrices[index];

          setCompletedBondItems(index + 1); // Update the progress bar and text

          const unitTrust = store.instruments.equity.getByItemShareCode(unitTrustItem.sharecode); // find the product on the Daily Pricing Upload file using it's product code

          if (unitTrust) {
            store.instruments.equity.select(unitTrust.asJson);
            const selectedBond = store.instruments.bond.selected;
            if (selectedBond) {

              const _unitTrust: IEquityUpdate = {
                id: selectedBond.id || "",
                sharecode: unitTrustItem.sharecode,
                price: unitTrustItem.price
              }
              const _unitTrustDailyPricing: IProductDailyPricing = {
                id: "",
                productCode: unitTrustItem.sharecode,
                priceUpdateDate: Date.now(),
                oldRate: selectedBond.price,
                newRate: unitTrustItem.price,
              }

              await api.instruments.equity.updateDailyPrice(_unitTrust); // update the base rate for each product (money market solution)
              await api.productDailyPricing.create(year.toString(), month.toString(), _unitTrustDailyPricing);
              await new Promise(resolve => setTimeout(resolve, 200)); // Wait two seconds before adding the next record to the database
            }
          }
        }

      } catch (error) {
      }

      setLoading(false);
      onCancel();

      swal({
        icon: "success",
        text: "Daily Prices have been uploaded"
      })
    }
  }

  const onCancel = () => {
    setImportFile(null);
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.UPLOAD_DAILY_PRICING_MODAL);
  }


  return (
    <ErrorBoundary>
      <div className="uk-width-1-1 uk-margin" data-uk-margin>
        <div data-uk-form-custom="target: true">
          <input type="file" aria-label="Custom controls" onChange={handleChangeAccountFile} accept="xls" required />
          <input className="uk-input uk-form-width-large" type="text" placeholder="Select file" aria-label="Custom controls" disabled />
        </div>
        <FormFieldInfo>
          You can only upload Excel Files
        </FormFieldInfo>
        {
          !loading && priceUploadFile &&
          <button type="button" className="btn btn-primary" onClick={handleDailyPriceUpload}>
            Import
          </button>
        }
        {
          loading && priceUploadFile &&
          <>
            <label className="uk-form-label" htmlFor="">Product (MM Solutions) pricing upload status</label>
            <ProgressBar totalItems={productPrices.length} progress={completedItems} />
          </>

        }
        {
          loading && priceUploadFile &&
          <>
            <label className="uk-form-label" htmlFor="">Bond pricing upload status</label>
            <ProgressBar totalItems={bondPrices.length} progress={completedBondItems} />
          </>
        }

      </div>
    </ErrorBoundary>
  )
});

export default DailyPrincingUploadForm
