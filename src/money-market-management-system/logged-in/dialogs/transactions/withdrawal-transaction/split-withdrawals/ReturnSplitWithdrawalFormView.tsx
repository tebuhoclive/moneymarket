import { Fragment, useState } from "react";
import { observer } from "mobx-react-lite";
import "./RecordNewFormView.scss";
import swal from "sweetalert";
import { IWithdrawalTransaction } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { IMoneyMarketAccount } from "../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { getAccount, getEntity } from "../../../../../../shared/functions/transactions/BankStatementUpload";
import { currencyFormat } from "../../../../../../shared/functions/Directives";
import { SplitWithdrawalAllocationSheetView } from "./SplitWithdrawalAllocationSheetView";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import NormalClientStatementSplit from "../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatementSplit";
import { NoData } from "../../../../../../shared/components/nodata/NoData";
import { ClientWithdrawalAuditTrailView } from "../../../../system-modules/money-market-transactions-module/bank-statement-upload/transaction-status/ClientWithdrawalAuditTrailView";


interface FormProps {
  onCancel: () => void;
  onClear: () => void;
  selectedTab: string;
  withdrawal: IWithdrawalTransaction;
  splitTransactions: IWithdrawalTransaction[];
  setWithdrawal: React.Dispatch<
    React.SetStateAction<IWithdrawalTransaction>
  >;
}

const ReturnSplitWithdrawalForm: React.FC<FormProps> = observer(
  ({
    onCancel,
    selectedTab,
    withdrawal,
    setWithdrawal,
    splitTransactions,
  }) => {

    const { api, store } = useAppContext();
    const [transactionLoading, setTransactionLoading] = useState(false);
    const newAccounts: IMoneyMarketAccount[] = [];

    splitTransactions.forEach((transaction) => {
      const account = getAccount(transaction.accountNumber, store);
      if (account) {
        const newAccount = {
          ...account,
          accountNumber: account.accountNumber || "",
          accountName: account.accountName || "",
        };
        newAccounts.push(newAccount);
      }
    });
    const auditTrail = store.withdrawalTransactionAudit.all;

    const withdrawalAudit = auditTrail.sort((a, b) => {
      const dateA = new Date(a.asJson.auditDateTime || 0);
      const dateB = new Date(b.asJson.auditDateTime || 0);

      return dateB.getTime() - dateA.getTime();
    }).map((c) => {
      return c.asJson;
    });

    const totalAllocatedSplitValue = splitTransactions.reduce(
      (sum, allocated) => sum + allocated.amount,
      0
    );

    const handleReturn = async (e: any) => {
      e.preventDefault();
      setTransactionLoading(true);
      const newWithdrawalTransaction: IWithdrawalTransaction = {
        ...withdrawal,
        id: withdrawal.id,
        transactionStatus: "Draft",
        createdAtTime: {
          transactionQueue: Date.now(),
        },
        note: withdrawal.note,
        //! Verify if needed with MC
        // bankValueDate: withdrawal.bankValueDate || 0,
        // bankTransactionDate: withdrawal.bankTransactionDate || 0,
        parentTransaction: withdrawal.parentTransaction || "",
        allocationStatus: "Returned for Amendment",
        transactionAction: "Returned for Amendment",
      }
      try {
        await api.withdrawalTransaction.update(newWithdrawalTransaction)
        swal({
          icon: "success",
          text:
            "Transaction successfully returned for Amendment",
        });
        setTransactionLoading(false);
        onCancel();

      } catch (error) {

      }
    }

    return (
      <form className="ijg-form" onSubmit={handleReturn}>
        <div className="dialog-content uk-position-relative">
          {
            selectedTab === "Form" &&
            <div className="uk-grid uk-grid-small uk-width-4-5 uk-child-width-1-2" data-uk-grid>

            <div className="uk-width-1-3">
              <label className="uk-form-label main-title-sm">
                TOTAL AMOUNT TO SPLIT:
              </label>
            </div>

            <div className="uk-width-2-3">
              <label className="uk-form-label main-title-sm">
                {currencyFormat(withdrawal.amount)}
              </label>
            </div>

            <div className="uk-width-1-3">
              <label className="uk-form-label">
                Value Date:
              </label>
            </div>

            <div className="uk-width-2-3">
              <label className="uk-form-label main-title-sm">
                {dateFormat_YY_MM_DD(withdrawal.valueDate || Date.now())}
              </label>
            </div>
            {withdrawal?.clientInstruction?.url && (

              <div className="uk-form-controls">
                <label className="uk-form-label" htmlFor="fileToAttach">
                  Attached Client Instruction:
                </label>
                <div className="uk-margin-top uk-margin-bottom">
                  <a
                    className="btn btn-primary"
                    href={withdrawal.clientInstruction.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View File
                  </a>
                </div>
              </div>

            )}
            {withdrawal?.clientInstruction?.reasonForNotAttaching && !withdrawal.clientInstruction.url && (

              <div className="uk-form-controls">
                <label className="uk-form-label" htmlFor="">
                  Reason for not attaching Client Instruction:
                </label>
                <textarea

                  cols={40}
                  rows={2}
                  disabled
                  required
                  value={withdrawal.clientInstruction.reasonForNotAttaching}
                ></textarea>
              </div>

            )}
            <div>
                <label className="uk-form-label required uk-margin">Return Note:</label>
                <textarea
                  onChange={(e) => setWithdrawal({ ...withdrawal, note: e.target.value })}
                  required
                />
              </div >
              <div></div>
              {
                  (withdrawal.note === "" || withdrawal.note === undefined) &&
                  <small className="uk-text-danger">Please enter a note if you wish to return this transaction for amendment</small>
                }
          </div>
          }
          {selectedTab === "Statement" &&
            <NormalClientStatementSplit accountsToSplit={newAccounts} />
          }
          {
            selectedTab === "Allocation" &&
            <>
              <div className="uk-width-1-1 uk-grid uk-grid-small" data-uk-grid>
                <div className="uk-width-expand">
                  <label className="uk-form-label main-title-sm uk-margin-large-right">
                    TOTAL AMOUNT TO SPLIT:
                  </label>
                  <label className="uk-form-label main-title-sm">
                    {currencyFormat(withdrawal.amount)}
                  </label>
                  <br />
                  {
                    withdrawal.amount < totalAllocatedSplitValue &&
                    <small className="uk-text-danger">Allocated amounts cannot exceed the total withdrawal value, amount exceeded with <b>{currencyFormat(totalAllocatedSplitValue - withdrawal.amount)}</b></small>
                  }
                  {
                    withdrawal.amount > totalAllocatedSplitValue &&
                    <small className="uk-text-danger">A total of <b>{currencyFormat(withdrawal.amount - totalAllocatedSplitValue)}</b> has not yet been allocated</small>
                  }
                </div>

              </div>
              <table className="kit-table-borderless">
                <thead>
                  <tr>
                    <th className="uk-table-expand">Account/Client Name</th>
                    <th className="uk-table-expand">Bank Account</th>
                    <th className="required">Amount N$</th>
                    <th>Email Address</th>
                    <th>Statement Reference</th>
                    <th>Product</th>
                  </tr>
                </thead>
                <tbody className="uk-margin-bottom-large">
                  {splitTransactions.map((split, index) => (
                    <Fragment key={index}>
                      <SplitWithdrawalAllocationSheetView
                        index={index}
                        clientName={getEntity(split.entityNumber, store)?.entityDisplayName || ""}
                        accountNumber={split.accountNumber}
                        product={split.productCode}
                        email={split.emailAddress || ""}
                        statementReference={split.bankReference}
                        amount={split.amount} 
                        clientBankingDetails={split.clientBankingDetails}                      />
                    </Fragment>
                  ))}
                  {
                    splitTransactions.length === 0 &&
                    <div className="uk-height-medium">
                      <NoData />
                    </div>
                  }
                </tbody>
                <tfoot >
                  <tr>
                    <th className="main-title-sm">Total</th>
                    <th colSpan={5}></th>
                  </tr>
                </tfoot>
              </table>
            </>
          }
          {selectedTab === "Audit-Trail" && (
            <ClientWithdrawalAuditTrailView
              data={withdrawalAudit}
            />
          )}
        </div>
        <div className="uk-text-right">
          <button type='button' className='btn btn-danger' disabled={transactionLoading} onClick={onCancel}>Cancel</button>
          <button type='submit' className='btn btn-primary' disabled={transactionLoading || withdrawal.note === "" || withdrawal.note === undefined || transactionLoading}> {transactionLoading ? <span data-uk-spinner={"ratio:.5"}></span> : "Return"}</button>
        </div>
      </form >
    );
  }
);

export default ReturnSplitWithdrawalForm;