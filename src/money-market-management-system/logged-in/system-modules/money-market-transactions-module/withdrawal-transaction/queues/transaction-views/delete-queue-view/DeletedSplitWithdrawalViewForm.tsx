import { Fragment } from "react";
import { observer } from "mobx-react-lite";
import "./../../../../../../dialogs/transactions/withdrawal-transaction/split-withdrawals/RecordNewFormView.scss";
import { IWithdrawalTransaction } from "../../../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { NoData } from "../../../../../../../../shared/components/nodata/NoData";
import { useAppContext } from "../../../../../../../../shared/functions/Context";
import { currencyFormat } from "../../../../../../../../shared/functions/Directives";
import { getAccount, getEntity } from "../../../../../../../../shared/functions/transactions/BankStatementUpload";
import { IMoneyMarketAccount } from "../../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { dateFormat_YY_MM_DD } from "../../../../../../../../shared/utils/utils";
import { SplitWithdrawalAllocationSheetView } from "../../../../../../dialogs/transactions/withdrawal-transaction/split-withdrawals/SplitWithdrawalAllocationSheetView";
import NormalClientStatementSplit from "../../../../../money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatementSplit";
import { ClientWithdrawalAuditTrailView } from "../../../../bank-statement-upload/transaction-status/ClientWithdrawalAuditTrailView";

interface FormProps {
  onCancel: () => void;
  onClear: () => void;
  selectedTab: string;
  loading?: boolean;
  loadingSave?: boolean;
  onClearFileComponent: boolean;
  withdrawal: IWithdrawalTransaction;
  splitTransactions: IWithdrawalTransaction[];
}

const ViewDeletedSplitWithdrawalForm: React.FC<FormProps> = observer(
  ({
    selectedTab,
    withdrawal,
    splitTransactions,
  }) => {

    const { store } = useAppContext();
    const newAccounts: IMoneyMarketAccount[] = [];
    const auditTrail = store.withdrawalTransactionAudit.all;
    const withdrawalTransactionAudit = auditTrail.sort((a, b) => {
      const dateA = new Date(a.asJson.auditDateTime || 0);
      const dateB = new Date(b.asJson.auditDateTime || 0);
      return dateB.getTime() - dateA.getTime();
    }).map((c) => { return c.asJson });
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
 
    const totalAllocatedSplitValue = splitTransactions.reduce(
      (sum, allocated) => sum + allocated.amount,
      0
    );
 

    return (
      <form className="ijg-form">
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
              {
                withdrawal.note &&
                <div>
                  <label className="uk-form-label">Return Note:</label>
                  <textarea value={withdrawal.note} cols={40} rows={2} disabled
                    required
                  />
                </div >
              }
              {
                withdrawal.reasonForDeleting &&
                <div>
                  <label className="uk-form-label">Reason For Deleting Transaction:</label>
                  <textarea value={withdrawal.reasonForDeleting} cols={40} rows={2} disabled
                    required
                  />
                </div >
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
                        clientBankingDetails={split.clientBankingDetails} />
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
            <ClientWithdrawalAuditTrailView data={withdrawalTransactionAudit} />
          )}
        </div>
      </form >
    );
  }
);

export default ViewDeletedSplitWithdrawalForm;