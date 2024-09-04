import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";

import swal from "sweetalert";
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import { IMoneyMarketAccount, defaultMoneyMarketAccount } from "../../../../shared/models/money-market-account/MoneyMarketAccount";
import NumberInput from "../../shared/components/number-input/NumberInput";
import MODAL_NAMES from "../ModalName";
import { IStatementTransaction } from "../../../../shared/models/StatementTransactionModel";
import { dateFormat_YY_MM_DD } from "../../../../shared/utils/utils";
import { IAccountRateChangeHistory } from "../../../../shared/models/AccountRateChangeHistoryModel";
import { LoadingEllipsis } from "../../../../shared/components/loading/Loading";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const startOfMonthBackDating = new Date(currentYear, currentMonth, 2);

const UpdateMoneyMarketAccountModal = observer(() => {
  const { api, store } = useAppContext();

  const [account, setAccount] = useState<IMoneyMarketAccount>({
    ...defaultMoneyMarketAccount,
  });

  const [newClientRate, setNewClientRate] = useState<number>();
  const [rateChangeDate, setRateChangeDate] = useState<number>(Date.now());

  const [loading, setLoading] = useState(false);

  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];

  const getClientName = (parentEntityId: string) => {
    const client = clients.find(
      (client) => client.asJson.entityId === parentEntityId
    );
    if (client && parentEntityId !== "") {
      return client.asJson.entityDisplayName;
    }
    return "";
  };

  const users = store.user.all

  const getActionUser = (userId: string) => {
    if (users) {
      const actionUser = users.find((user) => user.asJson.uid === userId);

      if (actionUser) {
        const actionUserName = actionUser.asJson.displayName || actionUser.asJson.firstName;
        return actionUserName;
      }
      return "";
    }
    return "";
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
      if (newClientRate) {
        adjustStatementTransactionAfterRateChange(account, newClientRate);
      }
      onCancel();
    }
    setLoading(false);
  };

  const adjustStatementTransactionAfterRateChange = async (account: IMoneyMarketAccount, newClientRate: number) => {
    if (account && account.clientRate && newClientRate) {

      try {
        await api.statementTransaction.getAll(account.id);

        const newAllStatementTransactions = store.statementTransaction.all.map(st => st.asJson);

        const statementTransaction: IStatementTransaction = {
          id: `rateChange${account.accountNumber}${dateFormat_YY_MM_DD(rateChangeDate)}`,
          date: Date.parse(dateFormat_YY_MM_DD(rateChangeDate)),
          transaction: "rateChange",
          balance: account.balance,
          previousBalance: account.balance,
          rate: newClientRate,
          remark: `Rate change from ${account.clientRate || 0} to ${newClientRate || 0}`,
          amount: 0,
          createdAt: rateChangeDate
        };

        try {
          const statementPlusTransaction = [...newAllStatementTransactions];
          statementPlusTransaction.push(statementTransaction);

          await api.mma.createStatementTransaction(account.id, statementTransaction);

          // Sort transactions by date, transaction type (rateChange first on the same day), and createdAt
          const includeNew = statementPlusTransaction.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);

            if (dateA.getTime() !== dateB.getTime()) {
              return dateA.getTime() - dateB.getTime();
            } else if (a.transaction === "rateChange" && b.transaction !== "rateChange") {
              return -1;
            } else if (a.transaction !== "rateChange" && b.transaction === "rateChange") {
              return 1;
            } else {
              const createdAtA = new Date(a.createdAt || 0);
              const createdAtB = new Date(b.createdAt || 0);

              return createdAtA.getTime() - createdAtB.getTime();
            }
          });

          const modifiedTransactions = [];
          let currentRate = account.clientRate;  // Initialize with the original rate

          for (let i = 0; i < includeNew.length; i++) {
            const previousTransaction = i > 0 ? includeNew[i - 1] : null;
            const currentTransaction = includeNew[i];

            currentTransaction.previousBalance = previousTransaction ? previousTransaction.balance : currentTransaction.previousBalance;

            if (currentTransaction.transaction === "deposit") {
              currentTransaction.balance = previousTransaction ? previousTransaction.balance + currentTransaction.amount : currentTransaction.amount;
            } else if (currentTransaction.transaction === "withdrawal") {
              currentTransaction.balance = previousTransaction ? previousTransaction.balance - currentTransaction.amount : -currentTransaction.amount;
            } else {
              currentTransaction.balance = previousTransaction ? previousTransaction.balance : currentTransaction.balance;
            }

            if (currentTransaction.transaction === "rateChange") {
              currentRate = currentTransaction.rate;
            } else {
              currentTransaction.rate = currentRate;
            }
            try {
              await api.statementTransaction.update(account.id, currentTransaction);
            } catch (error) {
              console.log(error);
            }

            modifiedTransactions.push(currentTransaction);
          }

          if (newClientRate !== undefined) {
            try {
              const _account: IMoneyMarketAccount = {
                ...account,
                clientRate: newClientRate
              }

              await api.mma.update(_account);

              const _rateChangeHistory: IAccountRateChangeHistory = {
                id: statementTransaction.id,
                rateChangeDate: rateChangeDate,
                oldRate: account.clientRate,
                clientRate: newClientRate || 0,
                changedBy: store.auth.meUID ? store.auth.meUID : "",
                createdAt: Date.now(),
                status: "active"
              }
              try {
                await api.accountRateChangeHistory.create(account.id, _rateChangeHistory);
              } catch (error) {
                console.log(error);
              }

            } catch (error) {
              console.log(error);
            }
          }


        } catch (error) {
          console.log(error);
        }
        store.statementTransaction.removeAll();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const reverseRateChange = async (account: IMoneyMarketAccount, rateChangeDate: number, rateChangeHistory: IAccountRateChangeHistory) => {
    if (account && account.clientRate) {
      try {
        await api.statementTransaction.getAll(account.id);
        const allStatementTransactions = store.statementTransaction.all.map(st => st.asJson);

        // Find the rate change transaction
        const rateChangeTransaction = allStatementTransactions.find(st => st.transaction === "rateChange" && st.date === Date.parse(dateFormat_YY_MM_DD(rateChangeDate)));
        if (!rateChangeTransaction) {
          console.log('Rate change transaction not found.');
          return;
        }

        // Remove the rate change transaction
        const remainingTransactions = allStatementTransactions.filter(st => st.id !== rateChangeTransaction.id);

        // Check if this was the last rate change
        const lastRateChangeTransaction = remainingTransactions.find(st => st.transaction === "rateChange" && new Date(st.date) > new Date(rateChangeDate));
        const shouldUpdateClientRate = !lastRateChangeTransaction;

        // Sort remaining transactions
        const sortedTransactions = remainingTransactions.sort((a, b) => {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);

          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          } else if (a.transaction === "rateChange" && b.transaction !== "rateChange") {
            return -1;
          } else if (a.transaction !== "rateChange" && b.transaction === "rateChange") {
            return 1;
          } else {
            const createdAtA = new Date(a.createdAt || 0);
            const createdAtB = new Date(b.createdAt || 0);

            return createdAtA.getTime() - createdAtB.getTime();
          }
        });

        // Recompute balances and rates
        const modifiedTransactions = [];
        let currentRate = shouldUpdateClientRate ? rateChangeHistory.oldRate : account.clientRate;

        for (let i = 0; i < sortedTransactions.length; i++) {
          const previousTransaction = i > 0 ? sortedTransactions[i - 1] : null;
          const currentTransaction = sortedTransactions[i];

          currentTransaction.previousBalance = previousTransaction ? previousTransaction.balance : currentTransaction.previousBalance;

          if (currentTransaction.transaction === "deposit") {
            currentTransaction.balance = previousTransaction ? previousTransaction.balance + currentTransaction.amount : currentTransaction.amount;
          } else if (currentTransaction.transaction === "withdrawal") {
            currentTransaction.balance = previousTransaction ? previousTransaction.balance - currentTransaction.amount : -currentTransaction.amount;
          } else {
            currentTransaction.balance = previousTransaction ? previousTransaction.balance : currentTransaction.balance;
          }

          if (currentTransaction.transaction === "rateChange") {
            currentRate = currentTransaction.rate;
          } else {
            currentTransaction.rate = currentRate;
          }

          try {
            await api.statementTransaction.update(account.id, currentTransaction);
          } catch (error) {
            console.error('Error updating transaction:', error);
          }
          modifiedTransactions.push(currentTransaction);
        }

        if (shouldUpdateClientRate) {
          try {
            const _account: IMoneyMarketAccount = {
              ...account,
              clientRate: rateChangeHistory.oldRate
            };
            await api.mma.update(_account);
          } catch (error) {
            console.log(error);
          }
        }

        try {
          await api.statementTransaction.delete(account.id, rateChangeTransaction);
          const _rateChangeHistory: IAccountRateChangeHistory = {
            ...rateChangeHistory,
            status: "reversed"
          };
          await api.accountRateChangeHistory.update(account.id, _rateChangeHistory);
        } catch (error) {
          console.error('Error deleting rate change transaction or updating rate change history:', error);
        }

        store.statementTransaction.removeAll();
      } catch (error) {
        console.log('Error retrieving statement transactions:', error);
      }
    }
  };

  const handleRateDropReverse = async (rateChangeHistory: IAccountRateChangeHistory) => {
    if (account) {
      setLoading(true);
      try {
        reverseRateChange(account, rateChangeHistory.rateChangeDate, rateChangeHistory);
        swal({
          icon: "success",
          title: `Rate Drop reversed`
        });
      } catch (error) {
      }
      setLoading(false);
      onCancel();
    }
  }

  const onCancel = () => {
    store.mma.clearSelected();
    setAccount({
      ...defaultMoneyMarketAccount,
      parentEntity: "",
      accountType: "",
      displayOnEntityStatement: false, // Update this field
    });
    hideModalFromId(MODAL_NAMES.ADMIN.UPDATE_MONEY_MARKET_ACCOUNT_MODAL);
  };

  useEffect(() => {
    const getHistory = async () => {
      try {
        setLoading(true);
        await api.accountRateChangeHistory.getAll(account.id);
        setLoading(false);
      } catch (error) {
      }
    }

    if (store.mma.selected) {
      setAccount(store.mma.selected);
      if (account.id) {
        getHistory();
      }
    }
  }, [account.id, account.clientRate, api.accountRateChangeHistory, store.mma.selected]);

  return (
    <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical uk-width-4-5">
      <button onClick={onCancel} className="uk-modal-close-default" type="button" disabled={loading} data-uk-close></button>
      <h3 className="main-title-lg text-to-break">{store.mma.selected ? 'Update Money Market Account Rate' : 'Create Money Market Account'}</h3>
      <hr />
      <div className="dialog-content uk-position-relative">

        <div className="uk-grid uk-grid-small" data-uk-grid>
          <form className="uk-form-stacked uk-grid-small uk-width-1-3" data-uk-grid onSubmit={handleSubmit}>
            <div className="uk-width-1-1">
              <div className="uk-margin">
                <label className="uk-form-label label required" htmlFor="parentEntity">
                  Account Owner
                </label>
                <div className="uk-form-controls">
                  <input type="text" className="uk-input uk-form-small" value={`${account.parentEntity} - ${getClientName(account.parentEntity)}`}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="uk-width-1-1">
              <label className="uk-form-label required" htmlFor="accountName">
                Account Number
              </label>
              <div className="uk-form-controls">
                <input className="uk-input uk-form-small" id="accountName" placeholder="e.g A00000"
                  value={account.accountNumber}
                  disabled
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
                <input className="uk-input uk-form-small" id="accountName"
                  value={account.accountName}
                  disabled
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
                <input className="uk-input uk-form-small" id="accountName" value={account.accountType}
                  disabled
                  onChange={(e) =>
                    setAccount({ ...account, accountType: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="uk-width-1-1">
              <label className="uk-form-label required" htmlFor="clientRate">
                Current Client Rate
              </label>
              <div className="uk-form-controls">
                <input id="clientRate" type="text" className="auto-save uk-input uk-form-small"
                  placeholder="-"
                  value={account.clientRate || 0} // client rate for now
                  disabled
                />
              </div>
            </div>
            <div className="uk-width-1-1 uk-form-controls">
              <label className="uk-form-label required" htmlFor="newClientRate">
                New Client Rate
              </label>
              <NumberInput className="uk-input uk-form-small" id="newClientRate" value={newClientRate || 0}
                onChange={(value) => setNewClientRate(Number(value))}
                required
              />
            </div>
            <div className="uk-width-1-1 uk-form-controls">
              <label className="uk-form-label required" htmlFor="valueDate">
                Rate Change Effective Date
              </label>
              <input className="uk-input uk-form-small" id="valueDate" type="date" name="valueDate"
                // min={startOfMonthBackDating.toISOString().split('T')[0]}
                value={dateFormat_YY_MM_DD(rateChangeDate)}
                onChange={(e) => setRateChangeDate(e.target.valueAsNumber)}
                required
              />
            </div>
            <div className="uk-width-1-1 uk-text-right">
              <button className="btn btn-danger" type="button" onClick={onCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                Update {loading && <div data-uk-spinner="ratio: .5"></div>}
              </button>
            </div>
          </form>
          <div className="uk-width-expand">
            <h4 className="main-title-sm">Rate Change History</h4>
            <hr />
            {/* <ProductRateDropHistoryGrid /> */}

            {!loading &&
              <table className="uk-table uk-table-small kit-table">
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>Basis Points</th>
                    <th>Rate Change Effective Date</th>
                    <th>Updated By</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {
                    store.accountRateChangeHistory.all.map(history => (
                      <tr key={history.asJson.id}>
                        <td>{dateFormat_YY_MM_DD(history.asJson.createdAt)}</td>
                        <td>{history.asJson.clientRate}</td>
                        <td>{dateFormat_YY_MM_DD(history.asJson.rateChangeDate)}</td>
                        <td>{getActionUser(history.asJson.changedBy)}</td>
                        <td>
                          {
                            history.asJson.status !== "reversed" &&
                            <button className="btn btn-danger" onClick={() => handleRateDropReverse(history.asJson)}>
                              Reverse {loading && <div data-uk-spinner="ratio: .5"></div>}
                            </button>
                          }
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            }
            {loading && <LoadingEllipsis />}

          </div>
        </div>

      </div>
    </div>
  );
});

export default UpdateMoneyMarketAccountModal;
