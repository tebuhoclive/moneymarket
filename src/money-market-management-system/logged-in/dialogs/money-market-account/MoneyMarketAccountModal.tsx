import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import SingleSelect from "../../../../shared/components/single-select/SingleSelect";
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import { findLatestAccount, getMMADocId } from "../../../../shared/functions/MyFunctions";
import { IMoneyMarketAccount, defaultMoneyMarketAccount } from "../../../../shared/models/money-market-account/MoneyMarketAccount";
import NumberInput from "../../shared/components/number-input/NumberInput";
import MODAL_NAMES from "../ModalName";

const MoneyMarketAccountModal = observer(() => {
  const { api, store } = useAppContext();
  const navigate = useNavigate();

  const [account, setAccount] = useState<IMoneyMarketAccount>({
    ...defaultMoneyMarketAccount,
  });

  const [loading, setLoading] = useState(false);
  const [showOtherSource, setShowOtherSource] = useState(false);

  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];
  const products = store.product.all;

  const activeLiabilities = products.filter(
    (product) => product.asJson.assetLiability === "Liability" && (!product.asJson.status || product.asJson.status === "active")
  )
    // Include products with status "active" or any other status apart from "pending"
    .sort((a, b) => {
      const createdAtA = a.asJson.createdAt
        ? new Date(a.asJson.createdAt)
        : new Date(0);
      const createdAtB = b.asJson.createdAt
        ? new Date(b.asJson.createdAt)
        : new Date(0);

      return createdAtB.getTime() - createdAtA.getTime(); // Sort by createdAt
    }).map((product) => product.asJson);


  const getBaseRate = (productId: string) => {
    const baseRate = store.product.all.find(
      (b) => b.asJson.id === productId
    )?.asJson.baseRate;

    return baseRate || 0;

  }

  const clientOptions = clients.map((cli) => ({
    label: cli.asJson.entityDisplayName,
    value: cli.asJson.entityId,
  }));

  const productionOptions = activeLiabilities.map((product) => ({
    label: product.productName,
    value: product.id,
  }));

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setShowOtherSource(value === "Other");

    // Clear the input field value when the user switches from 'Other' to another option
    if (value === "Other") {
      setAccount({
        ...account,
        sourceOfFunds: account.sourceOfFunds,
      });
    } else {
      setAccount({
        ...account,
        sourceOfFunds: value,
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (account.clientRate === 0) {
      swal({
        icon: "error",
        title: "Oops...",
        text: "The Client rate should not be 0!",
      });
      return;
    } else {
      account.baseRate = getBaseRate(account.accountType);
      await create(account);
      onCancel();
    }
    setLoading(false);
  };

  const create = async (account: IMoneyMarketAccount) => {
    try {
      await api.mma.create(account);
      swal("Account created successfully");
      const latestAccount = findLatestAccount(
        store.mma.all.map((a) => {
          return a.asJson;
        })
      );
      const docId = getMMADocId(latestAccount?.accountNumber, store);
      navigate(`/c/accounts/${docId}`);
    } catch (error) { }
  };

  const onCancel = () => {
    store.mma.clearSelected();
    setAccount({
      ...defaultMoneyMarketAccount,
      parentEntity: "",
      accountType: "",
      displayOnEntityStatement: false, // Update this field
    });
    hideModalFromId(MODAL_NAMES.ADMIN.MONEY_MARKET_ACCOUNT_MODAL);
  };

  useEffect(() => {
    if (store.mma.selected) {
      setAccount(store.mma.selected);
    }
  }, [store.mma.selected]);

  return (
    <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        onClick={onCancel}
        className="uk-modal-close-default"
        type="button"
        disabled={loading}
        data-uk-close
      ></button>
      <h3 className="main-title-lg text-to-break">{store.mma.selected ? 'Update Money Market Account Rate' : 'Create Money Market Account'}</h3>
      <hr />
      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          data-uk-grid
          onSubmit={handleSubmit}
        >
          <div className="uk-width-1-1">
            <div className="uk-margin">
              <label
                className="uk-form-label label required"
                htmlFor="parentEntity"
              >
                Account Owner
              </label>
              <SingleSelect
                options={clientOptions}
                name="parentEntity"
                value={account.parentEntity}
                onChange={(value: string) =>
                  setAccount({ ...account, parentEntity: value })
                }
                placeholder="e.g E000002"
                // required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label required" htmlFor="accountName">
              Account Number
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="accountName"
                placeholder="e.g A00000"
                value={account.accountNumber}
                onChange={(e) =>
                  setAccount({ ...account, accountNumber: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="accountName">
              Account Name
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="accountName"
                value={account.accountName}
                onChange={(e) =>
                  setAccount({ ...account, accountName: e.target.value })
                }
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <div className="uk-margin">
              <label className="uk-form-label required" htmlFor="accountType">
                Account Type
              </label>
              <SingleSelect
                options={productionOptions}
                name="product-type"
                value={account.accountType}
                onChange={(value: string) =>
                  setAccount({ ...account, accountType: value })
                }
                placeholder=""
                required
              />
            </div>
          </div>

          <div className="uk-width-1-1">
            <label className="uk-form-label required" htmlFor="clientRate">
              Client Rate
            </label>
            <div className="uk-form-controls">
              <NumberInput
                id="clientRate"
                className="auto-save uk-input uk-form-small"
                placeholder="-"
                value={account.clientRate || 0} // client rate for now
                onChange={(value) =>
                  setAccount({ ...account, clientRate: Number(value) })
                }
              />
            </div>
          </div>

          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="incomeDistribution">
              Select Income Distribution Option
            </label>
            <div className="uk-form-controls">
              <select
                className="uk-select uk-form-small"
                id="incomeDistribution"
                value={account.incomeDistribution}
                onChange={(e) =>
                  setAccount({ ...account, incomeDistribution: e.target.value })
                }
              >
              </select>
            </div>
          </div>

          <div className="uk-width-1-1">
            <label
              className="uk-form-label"
              htmlFor="clientStatus">
              Source Of Funds
            </label>
            <div className="uk-form-controls">
              <select className="uk-select uk-form-small" value={account.sourceOfFunds}
                id="clientStatus"
                onChange={handleSourceChange}
                required={!showOtherSource}
              >
                <option value="">Select Source of Funds</option>
                <option value="No Source of Funds">No Source of Funds</option>
                <option value="Existing Money Market Account">Existing Money Market Account</option>
                <option value="Salary">Salary</option>
                <option value="Investments">Investments</option>
                <option value="Business Profits">Business Profits</option>
                <option value="Inheritance">Inheritance</option>
                <option value="Gift">Gift</option>
                <option value="Other">Other</option>
              </select>

              {showOtherSource && (
                <input
                  type="text"
                  className="uk-input uk-form-small uk-margin-small-top"
                  placeholder="Enter other source of funds"
                  value={account.sourceOfFunds}
                  onChange={(e) =>
                    setAccount({
                      ...account,
                      sourceOfFunds: e.target.value,
                    })
                  }
                  required
                />
              )}
            </div>
          </div>

          {/* <div className="uk-width-1-1">
              <label className="uk-form-label" htmlFor="displayOnEntityStatement">
                Display On Entity Statement
              </label>
              <div className="uk-form-controls">
                <input
                  className="uk-checkbox"
                  id="displayOnEntityStatement"
                  type="checkbox"
                  checked={account.displayOnEntityStatement}
                  onChange={(e) =>
                    setAccount({
                      ...account,
                      displayOnEntityStatement: e.target.checked,
                    })
                  }
                />
              </div>
            </div> */}

          <div className="uk-width-1-1 uk-text-right">
            <button className="btn btn-danger" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              Save {loading && <div data-uk-spinner="ratio: .5"></div>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default MoneyMarketAccountModal;
