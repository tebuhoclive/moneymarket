import { FormEvent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../ModalName";
import ProductRateChangeForm from "./ProductRateChangeForm";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { IProduct, IProductRateChange, defaultProductRateChange } from '../../../../../../shared/models/ProductModel';
import swal from "sweetalert";
import { ACTIVE_ENV } from "../../../../CloudEnv";
import { dateFormat_DD_MM_YY } from "../../../../../../shared/utils/utils";

interface IProps {
  product: IProduct;
}

const ProductRateChangeModal = observer((props: IProps) => {

  const { api, store } = useAppContext();

  const userId = store.user.me?.asJson.uid;

  const { product } = props;

  const accounts = store.mma.allProductAccounts(product.id).map(accounts => { return accounts.asJson });


  const [loading, setLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const [progressPercentage, setProgressPercentage] = useState("");
  const [productsUpdated, setProductsUpdated] = useState(0);

  const [rateChange, setRateChange] = useState<IProductRateChange>({ ...defaultProductRateChange });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (accounts && rateChange.rateChangeType === "Drop") {
      try {
        let completedCount = 0;
        const maxConcurrentRequests = 100;
        setLoadingSave(true);

        const productRateChangeHistory: IProductRateChange = {
          id: `${rateChange.productCode}${dateFormat_DD_MM_YY(rateChange.effectiveDate)}`, //ensures that only one rate change can be recorded on the statement per effective date
          productCode: "",
          basisPoints: rateChange.basisPoints ? rateChange.basisPoints : 0,
          productRate: rateChange.productRate,
          rateChangeType: rateChange.rateChangeType,
          effectiveDate: rateChange.effectiveDate,
          changedAt: Date.now(),
          changedBy: userId || "",
          status: "effective"
        }

        //add feature for audit trail
        try {
          await api.productRateChangeHistory.create(product.id, productRateChangeHistory);

          const updateAccount = async (accountToUpdate: any) => {
            const newClientRate = accountToUpdate.clientRate - (rateChange.basisPoints / 100);

            const _accountToUpdate = {
              account: accountToUpdate,
              newClientRate: newClientRate,
              userId: store.user.me?.asJson.uid,
              rateChangeDate: rateChange.effectiveDate
            }

            const url = `${ACTIVE_ENV.url}adjustStatementTransactionAfterRateChangeHandler`;

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
                const progress = ((completedCount / accounts.length) * 100).toFixed(2);
                setProgressPercentage(progress);
                setProductsUpdated(completedCount);
              } else {
              }
            } catch (error) {
            }
          };

          const runUpdatesWithConcurrencyLimit = async () => {
            const executing: any = [];
            for (const account of accounts) {
              const update = updateAccount(account).then(() => {
                executing.splice(executing.indexOf(update), 1);
              });

              executing.push(update);

              if (executing.length >= maxConcurrentRequests) {
                await Promise.race(executing);
              }
            }
            await Promise.all(executing);
          };

          try {
            await runUpdatesWithConcurrencyLimit();
            setLoadingSave(false);
            onCancel();
            swal({
              icon: "success",
              title: `Rate Dropped by ${rateChange.basisPoints} basis points`
            });
          } catch (error) {
            swal(`Error updating the clients rates`); // offer the option to retry?
            // run the rate reversal here to rollback the updates that were successful
            await api.productRateChangeHistory.delete(product.id, productRateChangeHistory); // delete the rate change history
          }
        } catch (error) {
          swal(`Error updating the client rates on the ${product.id}`)
        }
      } catch (error) {
      }
    } else if (accounts && rateChange.rateChangeType === "Hike") {
      try {
        let completedCount = 0;
        const maxConcurrentRequests = 500;
        setLoadingSave(true);

        const productRateChangeHistory: IProductRateChange = {
          id: `${rateChange.productCode}${dateFormat_DD_MM_YY(rateChange.effectiveDate)}`, //ensures that only one rate change can be recorded on the statement per effective date
          productCode: "",
          basisPoints: rateChange.basisPoints ? rateChange.basisPoints : 0,
          productRate: rateChange.productRate,
          rateChangeType: rateChange.rateChangeType,
          effectiveDate: rateChange.effectiveDate,
          changedAt: Date.now(),
          changedBy: userId || "",
          status: "effective"
        }

        //add feature for audit trail
        try {
          await api.productRateChangeHistory.create(product.id, productRateChangeHistory);

          const updateAccount = async (accountToUpdate: any) => {
            const newClientRate = accountToUpdate.clientRate + (rateChange.basisPoints / 100);

            const _accountToUpdate = {
              account: accountToUpdate,
              newClientRate: newClientRate,
              userId: store.user.me?.asJson.uid,
              rateChangeDate: rateChange.effectiveDate
            }

            const url = `${ACTIVE_ENV.url}adjustStatementTransactionAfterRateChangeHandler`;

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
                const progress = ((completedCount / accounts.length) * 100).toFixed(2);
                setProgressPercentage(progress);
                setProductsUpdated(completedCount);
              } else {
              }
            } catch (error) {
            }
          };

          const runUpdatesWithConcurrencyLimit = async () => {
            const executing: any = [];
            for (const account of accounts) {
              const update = updateAccount(account).then(() => {
                executing.splice(executing.indexOf(update), 1);
              });

              executing.push(update);

              if (executing.length >= maxConcurrentRequests) {
                await Promise.race(executing);
              }
            }
            await Promise.all(executing);
          };

          try {
            await runUpdatesWithConcurrencyLimit();
            setLoadingSave(false);
            onCancel();
            swal({
              icon: "success",
              title: `Rate Hiked by ${rateChange.basisPoints} basis points`
            });
          } catch (error) {
            swal(`Error updating the clients rates`); // offer the option to retry?
            // run the rate reversal here to rollback the updates that were successful
            await api.productRateChangeHistory.delete(product.id, productRateChangeHistory); // delete the rate change history
          }
        } catch (error) {
          swal(`Error updating the client rates on the ${product.id}`)
        }
      } catch (error) {
      }
    }
  }

  //3210

  const onCancel = () => {
    setLoading(true);
    setLoading(false);
    hideModalFromId(MODAL_NAMES.ADMIN.LIABILITY_PRODUCT_RATE_DROP_MODAL);
  };
  return (
    <ErrorBoundary>
      <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-2-3">
        <button
          className="uk-modal-close-default"
          onClick={onCancel}
          disabled={loading}
          type="button"
          data-uk-close
        ></button>
        <div>
          <div className="form-title">
            <h3 style={{ marginRight: "1rem" }}>
              Rate Change
            </h3>
            <img alt="" src={`${process.env.PUBLIC_URL}/arrow.png`} />
            <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
              {product.productCode}
            </h3>
          </div>
        </div>
        <hr />
        <div className="uk-grid uk-grid-small" data-uk-grid>
          <ProductRateChangeForm
            onCancel={onCancel}
            handleSubmit={handleSubmit}
            loading={false}
            loadingSave={false} 
            setRateChange={setRateChange}
            rateChange={rateChange} product={product}
            accounts={accounts}
          />
        </div>
        <div className="uk-grid uk-grid-small" data-uk-grid>
          {
            loadingSave &&
            <>
              <progress className="uk-progress" value={progressPercentage} max={100}></progress>
              <label className="uk-form-label required" >{`Progress: ${progressPercentage}% (${productsUpdated} / ${accounts.length} accounts corrected)`} </label>
            </>
          }
        </div>

      </div>
    </ErrorBoundary>
  );
});

export default ProductRateChangeModal;

