import { observer } from "mobx-react-lite";
import MODAL_NAMES from "../../ModalName";
import { Box } from "@mui/material";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { ProductMoneyMarketAccountsGrid } from "../../../system-modules/products-module/ProductMoneyMarketAccountsGrid";
import { getFilteredFeeStatementTransactions, getFilteredStatementMonthEndTransactions, getStatementTotalDays, getStatementTotalDistribution, getStatementTotalFees } from "../../../../../shared/functions/transactions/Statement";
import { useState } from "react";
import swal from "sweetalert";
import { ACTIVE_ENV } from "../../../CloudEnv";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

const AllProductMoneyMarketAccountsModal = observer(() => {

  const { api, store } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);

  const [progressPercentage, setProgressPercentage] = useState("");
  const [accountsUpdated, setAccountsUpdated] = useState(0);

  const product = store.product.selected

  const accounts = store.product.getAllProductAccounts(product?.id || "").sort((a, b) => {
    const dateA = new Date(a.asJson.accountNumber);
    const dateB = new Date(b.asJson.accountNumber);
    return dateB.getTime() - dateA.getTime();
  }).map((c) => { return c.asJson; });

  const onCancel = () => {
    store.product.clearSelected();
    hideModalFromId(MODAL_NAMES.ADMIN.MONEY_MARKET_ACCOUNT_MODAL);
  };
  const updateInterest = async () => {
    setLoading(true);

    try {
      await updateInterestAndFessAccrued();
    } catch (error) {
    } finally {
      swal({
        icon: "success",
        text: `Interest and Fees have been updated on all the ${product?.productName} accounts`,
      });
      setLoading(false);
    }
  };

  async function updateInterestAndFessAccrued() {
    setLoading(true);
    let completedCount = 0;

    const promises = accounts.map(async (account) => {
      await api.statementTransaction.$getAll(account.id);
      const statementTransactions = store.statementTransaction.all.filter(
        (notBlinded) => notBlinded.asJson.blinded !== true
      );

      const statementTransactionsAsJson = statementTransactions.map(
        (transaction) => {
          return transaction.asJson;
        }
      );

      const filteredStatementTransactions = getFilteredStatementMonthEndTransactions(
        startOfMonth, new Date(Date.now()), statementTransactionsAsJson, Date.now()
      );

      const filteredFeeStatementTransactions = getFilteredFeeStatementTransactions(
        startOfMonth, new Date(Date.now()), statementTransactionsAsJson, account
      );

      const totalFees = getStatementTotalFees(filteredFeeStatementTransactions);
      const totalDistribution = getStatementTotalDistribution(filteredStatementTransactions);
      const totalDays = getStatementTotalDays(filteredStatementTransactions);

      completedCount++; // Increment completed count
      const progress = ((completedCount / accounts.length) * 100).toFixed(2); // Calculate progress percentage

      let monthEndData;

      monthEndData = {
        accountId: account.id,
        newDays: totalDays,
        newMonthTotalInterest: totalDistribution,
        fees: totalFees
      };

      const url = `${ACTIVE_ENV.url}updateDaysAndInterest`;

      try {
        const response = await fetch(url || "", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(monthEndData),
        });

        if (response.ok) {
        } else {
          swal({
            icon: "error",
            text: "Error updating account",
          });
        }
      } catch (error) {
      }
      setProgressPercentage(progress);
      setAccountsUpdated(completedCount);
    });
    await Promise.all(promises);
    swal({
      icon: "success",
      text: "Update Account",
    });
    setLoading(false);
  }

  return (
    <div className="view-modal custom-modal-style uk-width-1-1 uk-modal-dialog uk-modal-body uk-margin-small-auto-vertical uk-padding-small">
      <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel}></button>
      <h4 className="main-title-lg">{product?.productName} Accounts</h4>
      <hr />

      <div className="dialog-content uk-position-relative">
        <div className="uk-grid uk-grid-small uk-child-width-1-1" data-uk-grid>
          <div className="uk-width-1-1">
            <div className="uk-grid" data-uk-gird>
              <div className="uk-width-1-3 grid">
                <Box sx={{ height: 50 }}>
                  <h4>Total Accounts: {accounts.length}</h4>
                </Box>
              </div>
              <div className="uk-width-1-3 grid">
                <Box sx={{ height: 50 }}>
                  <h4>Balance: {(accounts.reduce((sum, balance) => sum + balance.balance, 0))}</h4>
                </Box>
              </div>
            </div>
          </div>

          <ProductMoneyMarketAccountsGrid data={accounts} />

          {/* <div className="uk-width-1-1 uk-margin">
            <label>Calculating Accounts interest</label> <br />
            <label className="uk-form-label required">
              {`Progress ${progressPercentage}% - ${accountsUpdated} out of ${accounts.length} updated`}
            </label>
            <progress
              className="uk-progress"
              value={progressPercentage}
              max={100}
            ></progress>
            <br />
          </div> */}

        </div>
      </div>
    </div>
  );
});

export default AllProductMoneyMarketAccountsModal;

