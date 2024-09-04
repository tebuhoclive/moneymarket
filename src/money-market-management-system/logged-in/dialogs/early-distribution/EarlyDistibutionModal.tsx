import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import {
  IEarlyDistributionAccount,
  defaultProduct,
} from "../../../../shared/models/EarlyDistributionAccountModel";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../ModalName";
import { createEarlyDistribution } from "./CreateAccount";

export const EarlyDistributionModal = observer(() => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [earlyDistribution, setEarlyDistribution] =
    useState<IEarlyDistributionAccount>({ ...defaultProduct });

  const products = store.product.all.map((p) => {
    return p.asJson;
  });

  useEffect(() => {
    const getData = async () => {
      await Promise.all(
        [
          api.earlyDistribution.getAll()
        ]);
    };

    getData();
  }, [api.earlyDistribution]);

  const createAccount = async () => {
    if (earlyDistribution.accountName === "") {
      return;
    }
    if (earlyDistribution.productCode === "") {
      return;
    }
    try {
      setLoading(true);
      await createEarlyDistribution(
        api,
        earlyDistribution.accountName,
        earlyDistribution.productCode
      );
    } catch (error) {
    } finally {
      setLoading(false);
      setEarlyDistribution({ ...defaultProduct });
      hideModalFromId(MODAL_NAMES.BACK_OFFICE.CREATE_ED_ACCOUNT_MODAL);
    }
  };

  const clear = () => {
    setEarlyDistribution({ ...defaultProduct });
  };

  return (
    <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
        onClick={clear}
      ></button>
      <h3 className="main-title-sm text-to-break">
        New Early Distribution Account
      </h3>
      <hr className="uk-width-1-1" />
      <div className="dialog-content uk-position-relative">
        <div
          className="uk-form-stacked uk-grid-small"
          data-uk-grid
          // onSubmit={handleSubmit}
        >
          <div className="uk-width-1-1">
            <label
              className="uk-form-label required"
              htmlFor="counterParty-fname"
            >
              Account Name
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="counterParty-fname"
                type="text"
                value={earlyDistribution.accountName}
                onChange={(e) =>
                  setEarlyDistribution({
                    ...earlyDistribution,
                    accountName: e.target.value,
                  })
                }
                placeholder=" Name"
                name="agentName" // Add name attribute
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label
              className="uk-form-label required"
              htmlFor="counterParty-fname"
            >
              Select Product
            </label>
            <div className="uk-form-controls">
              <select
                className="uk-input"
                value={earlyDistribution.productCode}
                onChange={(e) =>
                  setEarlyDistribution({
                    ...earlyDistribution,
                    productCode: e.target.value,
                  })
                }
              >
                <option value="">Select Account</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="uk-width-1-1 uk-text-right">
            <button
              className="btn btn-primary"
              onClick={createAccount}
              disabled={loading}
            >
              Save
              {loading && <div data-uk-spinner="ratio: .5"></div>}
            </button>
            {/* <button
              className="btn btn-danger"
              type="button"
            >
              Cancel
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
});
