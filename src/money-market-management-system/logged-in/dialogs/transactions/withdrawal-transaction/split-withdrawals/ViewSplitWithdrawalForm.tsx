import { Fragment, useState } from "react";
import { observer } from "mobx-react-lite";
import swal from "sweetalert";
import "./RecordNewFormView.scss";
import { IWithdrawalTransaction } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { IMoneyMarketAccount } from "../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { getAccount, getEntity } from "../../../../../../shared/functions/transactions/BankStatementUpload";
import { getMMAProduct } from "../../../../../../shared/functions/MyFunctions";
import showModalFromId, { hideModalFromId } from "../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../ModalName";
import { currencyFormat } from "../../../../../../shared/functions/Directives";
import { dateFormat_DD_MM_YY } from "../../../../../../shared/utils/utils";
import NormalClientStatementSplit from "../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatementSplit";
import { NoData } from "../../../../../../shared/components/nodata/NoData";
import Modal from "../../../../../../shared/components/Modal";
import { SplitWithdrawalAllocationSheetView } from "./SplitWithdrawalAllocationSheetView";
import { ClientWithdrawalAuditTrailView } from "../../../../system-modules/money-market-transactions-module/bank-statement-upload/transaction-status/ClientWithdrawalAuditTrailView";
import { ReturnSplitWithdrawalModal } from "./ReturnSplitWithdrawalModal";
import DetailView, { IDataDisplay } from "../../../../shared/components/detail-view/DetailView";

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

const ViewSplitWithdrawalForm: React.FC<FormProps> = observer(
  ({
    onCancel,
    loading,
    selectedTab,
    withdrawal,
    splitTransactions,
  }) => {

    const { api, store } = useAppContext();
    const [isLoadingFirstLevelApproval, setIsLoadingFirstLevelApproval] = useState(false);
    const [loadingApproveAndComplete, setLoadingApproveAndComplete] = useState(false);
    const [showOnReturnModal, setShowOnSubmitModal] = useState<boolean>(false);
    const newAccounts: IMoneyMarketAccount[] = [];
    const auditTrail = store.withdrawalTransactionAudit.all;
    const withdrawalTransactionAudit = auditTrail.sort((a, b) => {
      const dateA = new Date(a.asJson.auditDateTime || 0);
      const dateB = new Date(b.asJson.auditDateTime || 0);
      return dateB.getTime() - dateA.getTime();
    }).map((c) => { return c.asJson });

    const [loadingRestore, setLoadingRestore] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const transactionDetails: IDataDisplay[] = [
      { label: 'Transaction Status', value: withdrawal.transactionStatus },
      { label: 'Bank Reference', value: withdrawal.bankReference },
      { label: 'Value Date', value: dateFormat_DD_MM_YY(withdrawal.valueDate) },
      { label: 'Transaction Date', value: dateFormat_DD_MM_YY(withdrawal.transactionDate) },
      { label: 'Total Amount to Split', value: currencyFormat(withdrawal.amount) || 0 },
      { label: 'BOP Code', value: withdrawal.balanceOfPaymentCodes || "-" },
    ]

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

    const submitSecondLevelApproval = async () => {
      const newTransaction: IWithdrawalTransaction = {
        ...withdrawal,
        parentTransaction: withdrawal.parentTransaction || "",
        productCode: getMMAProduct(withdrawal.accountNumber, store),
        createdAtTime: {
          secondLevelQueue: Date.now()
        },
        transactionStatus: "Second Level",
        transactionAction: "Approved Second Level",
        emailAddress: withdrawal.emailAddress || "",
        capturedBy: withdrawal.capturedBy || "",
        firstLevelApprover: store.auth.meUID || "",
      };
      try {
        setIsLoadingFirstLevelApproval(true)
        if (withdrawal) {
          await api.withdrawalTransaction.update(newTransaction);
          setIsLoadingFirstLevelApproval(false)
          onCancel();
          swal({
            icon: "success",
            text: "Transaction submitted (2nd Level Approval)",
          });
        } else {
          swal({
            icon: "warning",
            text: "No transaction found"
          })
        }
      } catch (error) {
        swal({
          icon: "error",
          text: "System could not process the transaction"
        })
      }

    };

    const ApproveAndComplete = async () => {
      if (withdrawal.allocationStatus === "Submitted for Deletion") {
        const newClient: IWithdrawalTransaction = {
          ...withdrawal,
          transactionStatus: "Deleted",
          transactionAction: "Deleted",
          productCode: getMMAProduct(withdrawal.accountNumber, store),
          createdAtTime: {
            deletedQueue: Date.now(),
          },
          secondLevelApprover: store.auth.meUID || ""
        };
        try {
          setLoadingApproveAndComplete(true);
          if (withdrawal) {
            await api.withdrawalTransaction.update(
              newClient
            );
          }
          setLoadingApproveAndComplete(false);
          swal({
            icon: "success",
            text: "Transaction Successfully Deleted",
          });
          onCancel()
        } catch (error) { }
      } else {
        const newClient: IWithdrawalTransaction = {
          ...withdrawal,
          transactionStatus: "Payment Queue",
          transactionAction: "Approved Second Level",
          productCode: getMMAProduct(withdrawal.accountNumber, store),
          createdAtTime: {
            paymentQueue: Date.now(),
          },
          secondLevelApprover: store.auth.meUID || ""
        };
        try {
          setLoadingApproveAndComplete(true);
          if (withdrawal) {
            await api.withdrawalTransaction.update(
              newClient
            );
          }
          setLoadingApproveAndComplete(false);
          swal({
            icon: "success",
            text: "Transaction submitted to Payment Queue",
          });
          onCancel()
        } catch (error) { }
      }

    };

    const onReturnForAmendment = () => {
      store.withdrawalTransaction.select(withdrawal)
      setShowOnSubmitModal(true);
      showModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_FOR_AMENDMENT_SPLIT_MODAL);
    }

    const totalAllocatedSplitValue = splitTransactions.reduce(
      (sum, allocated) => sum + allocated.amount,
      0
    );

    const Restore = async () => {
      setLoadingRestore(true);
      const newWithdrawalTransaction: IWithdrawalTransaction = {
        ...withdrawal,
        id: withdrawal.id,
        transactionStatus: "Draft",
        createdAtTime: {
          transactionQueue: Date.now(),
        },
        // bankValueDate: withdrawal.bankValueDate || 0,
        // bankTransactionDate: withdrawal.bankTransactionDate || 0,
        parentTransaction: withdrawal.parentTransaction || "",
        // transactionAction: "Restored from Non-withdrawal Transactions"
      }
      try {
        await api.withdrawalTransaction.update(newWithdrawalTransaction)
        swal({
          icon: "success",
          text: "Transaction Successfully Restored",
        });
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL);
        setLoadingRestore(false)
      } catch (error) {

      }
    }

    const Delete = async () => {
      setLoadingDelete(true);
      const newWithdrawalTransaction: IWithdrawalTransaction = {
        ...withdrawal,
        id: withdrawal.id,
        transactionStatus: "Deleted",
        createdAtTime: {
          deletedQueue: Date.now(),
        },
        // bankValueDate: withdrawal.bankValueDate || 0,
        // bankTransactionDate: withdrawal.bankTransactionDate || 0,
        parentTransaction: withdrawal.parentTransaction || "",
      }
      try {
        await api.withdrawalTransaction.update(newWithdrawalTransaction)
        swal({
          icon: "success",
          text: "Transaction Successfully Deleted",
        });
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL);
        setLoadingDelete(false)
      } catch (error) {

      }
    }

    return (
      <form className="ijg-form">
        <div className="dialog-content uk-position-relative">
          {
            selectedTab === "Form" &&
            <div className="uk-grid uk-child-width-1-2" data-uk-grid>
              <DetailView dataToDisplay={transactionDetails} />

              <div>
                {withdrawal?.sourceOfFundsAttachment?.url && (
                  <div className="uk-form-controls uk-width-1-1 uk-margin-top">
                    <label className="uk-form-label" htmlFor="fileToAttach">
                      Attached Source of Funds
                    </label>
                    <div className="uk-margin-top uk-margin-bottom">
                      <a
                        className="btn btn-primary"
                        href={withdrawal.sourceOfFundsAttachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View File
                      </a>
                    </div>
                  </div>
                )}
                {withdrawal?.sourceOfFundsAttachment?.reasonForNotAttaching && !withdrawal.sourceOfFundsAttachment.url && (
                  <>
                    <div className="uk-form-controls">
                      <label className="uk-form-label" htmlFor="">
                        Reason for not attaching Source of Funds
                      </label>
                      <textarea
                        cols={60}
                        rows={2}
                        disabled
                        required
                        value={withdrawal.sourceOfFundsAttachment.reasonForNotAttaching}
                      ></textarea>
                    </div>
                  </>
                )}
                {withdrawal?.clientInstruction?.url && (
                  <div className="uk-form-controls uk-width-1-1 uk-margin-top">
                    <label className="uk-form-label" htmlFor="fileToAttach">
                      Attached Instruction
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
                      Reason for not attaching Instruction
                    </label>
                    <textarea
                      cols={60}
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
                    <textarea
                      value={withdrawal.note}
                      cols={5}
                      required
                      disabled
                    />
                  </div >
                }
                {
                  withdrawal.reasonForDeleting &&
                  <div>
                    <label className="uk-form-label required uk-margin">Reason for Deleting Transaction:</label>
                    <textarea
                      value={withdrawal.reasonForDeleting}
                      disabled
                      required
                    />
                  </div >
                }
              </div>
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
        <div className="uk-text-right">
          {
            withdrawal.transactionStatus !== "Draft" && withdrawal.transactionStatus !== "Completed" && withdrawal.transactionStatus !== "Payment Queue" &&
            <button type="button" className="btn btn-danger" disabled={loading || isLoadingFirstLevelApproval || loadingApproveAndComplete} onClick={onCancel}>Cancel</button>
          }
          {
            (withdrawal.transactionStatus !== "Draft" && withdrawal.transactionStatus !== "Non-withdrawal" && withdrawal.transactionStatus !== "Completed" && withdrawal.transactionStatus !== "Payment Queue") &&
            <button type="button" className="btn btn-danger" onClick={onReturnForAmendment}>Return For Amendment</button>
          }
          {
            withdrawal.transactionStatus === "First Level" &&
            <button type="button" className="btn btn-primary" disabled={loading || isLoadingFirstLevelApproval || loadingApproveAndComplete} onClick={submitSecondLevelApproval}>{isLoadingFirstLevelApproval ? <span data-uk-spinner={"ratio:.5"}> </span> : "Submit Transaction"}</button>
          }
          {
            withdrawal.transactionStatus === "Second Level" &&
            <button type="button" className="btn btn-primary" disabled={loading || isLoadingFirstLevelApproval || loadingApproveAndComplete} onClick={ApproveAndComplete}>{loadingApproveAndComplete ? <span data-uk-spinner={"ratio:.5"}> </span> : "Approve and Complete"}</button>
          }
          {
            withdrawal.transactionStatus === "Non-withdrawal" &&
            <button className="btn btn-danger" disabled={loading || loadingRestore || loadingDelete} onClick={Delete}>{loadingDelete ? <span data-uk-spinner={"ratio:.5"}></span> : "Delete"} </button>}
          {
            withdrawal.transactionStatus === "Non-withdrawal" &&
            <button className="btn btn-primary" disabled={loading || loadingRestore || loadingDelete} onClick={Restore}> {loadingRestore ? <span data-uk-spinner={"ratio:.5"}></span> : "Restore"}</button>
          }
          {
            withdrawal.transactionStatus === "Deleted" &&
            <button className="btn btn-primary" disabled={loading || loadingRestore || loadingDelete} onClick={Restore}> {loadingRestore ? <span data-uk-spinner={"ratio:.5"}></span> : "Restore"}</button>
          }
        </div>
        <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_FOR_AMENDMENT_SPLIT_MODAL}>
          {showOnReturnModal && <ReturnSplitWithdrawalModal setShowReturnModal={setShowOnSubmitModal} />}
        </Modal>
      </form >
    );
  }
);

export default ViewSplitWithdrawalForm;