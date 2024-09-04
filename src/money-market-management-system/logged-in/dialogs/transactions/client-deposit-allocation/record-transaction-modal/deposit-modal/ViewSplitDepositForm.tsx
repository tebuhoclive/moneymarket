import { Fragment, useState } from "react";
import { observer } from "mobx-react-lite";
import swal from "sweetalert";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import { IDepositTransaction } from "../../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import "./../RecordNewForm.scss";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import { NoData } from "../../../../../../../shared/components/nodata/NoData";
import { getAccount, getEntity } from "../../../../../../../shared/functions/transactions/BankStatementUpload";
import { currencyFormat } from "../../../../../../../shared/functions/Directives";
import { SplitDepositAllocationSheetView } from "./SplitDepositAllocationSheetView";
import { getMMAProduct } from "../../../../../../../shared/functions/MyFunctions";
import { completeTransaction } from "../../view-transaction-modal/complete-transaction-process/ProcessTransactions";
import showModalFromId, { hideModalFromId } from "../../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../../ModalName";
import Modal from "../../../../../../../shared/components/Modal";

import { ClientDepositAllocationAuditTrailGrid } from "../../../../../system-modules/money-market-transactions-module/bank-statement-upload/ClientDepositAllocationAuditTrailGrid";
import { ReturnSplitDepositModal } from "./ReturnSplitDepositModal";
import NormalClientStatementSplit from "../../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatementSplit";
import { IMoneyMarketAccount } from "../../../../../../../shared/models/money-market-account/MoneyMarketAccount";

interface FormProps {
  onCancel: () => void;
  onClear: () => void;
  selectedTab: string;
  loading?: boolean;
  loadingSave?: boolean;
  onClearFileComponent: boolean;
  deposit: IDepositTransaction;
  splitTransactions: IDepositTransaction[];
}

const ViewSplitDepositForm: React.FC<FormProps> = observer(
  ({
    onCancel,
    loading,
    selectedTab,
    deposit,
    splitTransactions,
    onClearFileComponent = false,
  }) => {

    const { api, store } = useAppContext();
    const [isLoadingFirstLevelApproval, setIsLoadingFirstLevelApproval] = useState(false);
    const [loadingApproveAndComplete, setLoadingApproveAndComplete] = useState(false);
    const [showOnReturnModal, setShowOnSubmitModal] = useState<boolean>(false);
    const newAccounts: IMoneyMarketAccount[] = [];
    const [loadingRestore, setLoadingRestore] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
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
    const auditTrail = store.depositTransactionAudit.all;

    const depositAudit = auditTrail.sort((a, b) => {
      const dateA = new Date(a.asJson.auditDateTime || 0);
      const dateB = new Date(b.asJson.auditDateTime || 0);

      return dateB.getTime() - dateA.getTime();
    }).map((c) => {
      return c.asJson;
    });

    // const submitFirstLevelApproval = async () => {
    //   const newClient: IDepositTransaction = {
    //     ...deposit,
    //     allocationStatus: "Manually Allocated",
    //     productCode: getMMAProduct(deposit.accountNumber, store),
    //     createdAtTime: {
    //       transactionQueue: deposit.createdAtTime.transactionQueue,
    //       firstLevelQueue: Date.now(),
    //     },
    //     transactionAction: "Approved First Level",
    //     transactionType: "Split",
    //     transactionStatus: "First Level",
    //   };

    //   swal({
    //     title: "Are you sure?",
    //     icon: "warning",
    //     buttons: ["Cancel", "Submit for First Level Approval"],
    //     dangerMode: true,
    //   }).then(async (edit) => {
    //     if (edit) {
    //       try {
    //         setIsLoadingFirstLevelApproval(true);
    //         if (deposit) {
    //           await api.depositTransaction.updateAndCreateAuditTrail(
    //             deposit,
    //             newClient
    //           );
    //           setIsLoadingFirstLevelApproval(false);
    //           onCancel();
    //           swal({
    //             icon: "success",
    //             text: "Transaction has passed 1st Level Approval",
    //           });
    //         }
    //       } catch (error) { }
    //     } else {
    //       swal({
    //         icon: "error",
    //         text: "Transaction approval has been cancelled!",
    //       });
    //     }
    //   });
    // };

    const submitSecondLevelApproval = async () => {
      const newTransaction: IDepositTransaction = {
        ...deposit,
        bankValueDate: deposit.bankValueDate || 0,
        bankTransactionDate: deposit.bankTransactionDate || 0,
        parentTransaction: deposit.parentTransaction || "",
        productCode: getMMAProduct(deposit.accountNumber, store),
        createdAtTime: {
          //  transactionQueue: deposit.createdAtTime.transactionQueue,
          //   firstLevelQueue: deposit.createdAtTime.firstLevelQueue,
          secondLevelQueue: Date.now()
        },
        transactionStatus: "Second Level",
        transactionAction: "Approved Second Level",
        emailAddress: deposit.emailAddress || "",
        capturedBy: deposit.capturedBy || "",
        firstLevelApprover: store.auth.meUID || "",

      };
      try {
        setIsLoadingFirstLevelApproval(true)
        if (deposit) {
          await api.depositTransaction.update(newTransaction);
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
      const newClient: IDepositTransaction = {
        ...deposit,
        transactionStatus: "Completed",
        transactionAction: "Completed",
        productCode: getMMAProduct(deposit.accountNumber, store),
        createdAtTime: {
          completedQueue: Date.now()
        },
        secondLevelApprover: store.auth.meUID || ""
      };
      try {
        setLoadingApproveAndComplete(true);
        if (deposit) {
          await api.depositTransaction.updateAndCreateAuditTrail(
            deposit,
            newClient
          );
        }
        if (splitTransactions) {
          for (const transaction of splitTransactions) {
            const newTransaction: IDepositTransaction = {
              ...transaction,
              transactionStatus: "Completed",
              transactionAction: "Completed",
              productCode: getMMAProduct(transaction.accountNumber, store),
              createdAtTime: {
                completedQueue: Date.now()
              },
              secondLevelApprover: store.auth.meUID || ""
            };
            await completeTransaction(newTransaction, store, api, setLoadingApproveAndComplete)
          }
          onCancel();
        }
        swal({
          icon: "success",
          text: "Transaction approved and Completed!",
        });
      } catch (error) { }
    };
    const onReturnForAmendment = () => {
      store.depositTransaction.select(deposit)
      setShowOnSubmitModal(true);
      showModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_FOR_AMENDMENT_SPLIT_MODAL);
    }


    const totalAllocatedSplitValue = splitTransactions.reduce(
      (sum, allocated) => sum + allocated.amount,
      0
    );
    const Restore = async () => {
      setLoadingRestore(true);
      const newDepositTransaction: IDepositTransaction = {
        ...deposit,
        id: deposit.id,
        transactionStatus: "Draft",
        createdAtTime: {
          transactionQueue: Date.now(),
        },
        bankValueDate: deposit.bankValueDate || 0,
        bankTransactionDate: deposit.bankTransactionDate || 0,
        parentTransaction: deposit.parentTransaction || "",
        transactionAction: "Restored from Non-Deposit Transactions"
      }
      try {
        await api.depositTransaction.update(newDepositTransaction)
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
      const newDepositTransaction: IDepositTransaction = {
        ...deposit,
        id: deposit.id,
        transactionStatus: "Deleted",
        createdAtTime: {
          deletedQueue: Date.now(),
        },
        bankValueDate: deposit.bankValueDate || 0,
        bankTransactionDate: deposit.bankTransactionDate || 0,
        parentTransaction: deposit.parentTransaction || "",
      }
      try {
        await api.depositTransaction.update(newDepositTransaction)
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
            <div className="uk-grid uk-grid-small uk-width-4-5 uk-child-width-1-2" data-uk-grid>

              <div className="uk-width-1-3">
                <label className="uk-form-label main-title-sm">
                  TOTAL AMOUNT TO SPLIT:
                </label>
              </div>

              <div className="uk-width-2-3">
                <label className="uk-form-label main-title-sm">
                  {currencyFormat(deposit.amount)}
                </label>
              </div>

              <div className="uk-width-1-3">
                <label className="uk-form-label">
                  Value Date:
                </label>
              </div>

              <div className="uk-width-2-3">
                <label className="uk-form-label main-title-sm">
                  {dateFormat_YY_MM_DD(deposit.valueDate || Date.now())}
                </label>
              </div>

              <div className="uk-width-1-3">
                <label className="uk-form-label">
                  Select IJG Bank Account:
                </label>
              </div>

              <div className="uk-width-2-3">
                <label className="uk-form-label">
                  {deposit.sourceBank === "NBN" ? 'Nedbank' : 'Standard Bank'}
                </label>
              </div>

              <div className="uk-width-1-3">
                <label className="uk-form-label">
                  Source of Funds:
                </label>
              </div>

              <div className="uk-width-2-3">
                <label className="uk-form-label">
                  {deposit.sourceOfFunds}
                </label>
              </div>
              {deposit?.sourceOfFundsAttachment?.url && (

                <div className="uk-form-controls">
                  <label className="uk-form-label" htmlFor="fileToAttach">
                    Attached Source of Funds:
                  </label>
                  <div className="uk-margin-top uk-margin-bottom">
                    <a
                      className="btn btn-primary"
                      href={deposit.sourceOfFundsAttachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View File
                    </a>
                  </div>
                </div>

              )}
              {deposit?.sourceOfFundsAttachment?.reasonForNotAttaching && !deposit.sourceOfFundsAttachment.url && (

                <div className="uk-form-controls">
                  <label className="uk-form-label" htmlFor="">
                    Reason for not attaching Source of Funds:
                  </label>
                  <textarea

                    cols={40}
                    rows={2}
                    disabled
                    required
                    value={deposit.sourceOfFundsAttachment.reasonForNotAttaching}
                  ></textarea>
                </div>

              )}
              {deposit?.proofOfPaymentAttachment?.url && (

                <div className="uk-form-controls">
                  <label className="uk-form-label" htmlFor="fileToAttach">
                    Attached Proof of Payment:
                  </label>
                  <div className="uk-margin-top uk-margin-bottom">
                    <a
                      className="btn btn-primary"
                      href={deposit.proofOfPaymentAttachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View File
                    </a>
                  </div>
                </div>

              )}
              {deposit?.proofOfPaymentAttachment?.reasonForNotAttaching && !deposit.proofOfPaymentAttachment.url && (

                <div className="uk-form-controls">
                  <label className="uk-form-label" htmlFor="">
                    Reason for not attaching Proof of Payment:
                  </label>
                  <textarea cols={40} rows={2} disabled
                    required
                    value={deposit.proofOfPaymentAttachment.reasonForNotAttaching}
                  ></textarea>
                </div>
              )}
              {
                deposit.note &&
                <div>
                  <label className="uk-form-label">Return Note:</label>
                  <textarea value={deposit.note} cols={40} rows={2} disabled
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
                    {currencyFormat(deposit.amount)}
                  </label>
                  <br />
                  {
                    deposit.amount < totalAllocatedSplitValue &&
                    <small className="uk-text-danger">Allocated amounts cannot exceed the total deposit value, amount exceeded with <b>{currencyFormat(totalAllocatedSplitValue - deposit.amount)}</b></small>
                  }
                  {
                    deposit.amount > totalAllocatedSplitValue &&
                    <small className="uk-text-danger">A total of <b>{currencyFormat(deposit.amount - totalAllocatedSplitValue)}</b> has not yet been allocated</small>
                  }
                </div>

              </div>
              <table className="kit-table-borderless">
                <thead>
                  <tr>
                    <th className="uk-table-expand">Account/Client Name</th>
                    <th className="required">Amount N$</th>
                    <th>Email Address</th>
                    <th>Statement Reference</th>
                    <th>Product</th>
                  </tr>
                </thead>
                <tbody className="uk-margin-bottom-large">
                  {splitTransactions.map((split, index) => (
                    <Fragment key={index}>
                      <SplitDepositAllocationSheetView
                        index={index}
                        clientName={getEntity(split.entityNumber, store)?.entityDisplayName || ""}
                        accountNumber={split.accountNumber}
                        product={split.productCode}
                        email={split.emailAddress || ""}
                        statementReference={split.bankReference}
                        amount={split.amount}
                      />
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
            <ClientDepositAllocationAuditTrailGrid
              data={depositAudit}
            />
          )}
        </div>
        <div className="uk-text-right">
          {
            deposit.transactionStatus !== "Draft" && deposit.transactionStatus !=="Completed" &&
            <button type="button" className="btn btn-danger" disabled={loading || isLoadingFirstLevelApproval || loadingApproveAndComplete} onClick={onCancel}>Cancel</button>
          }
          {
            (deposit.transactionStatus !== "Draft" && deposit.transactionStatus !== "Non-Deposit" && deposit.transactionStatus !=="Completed") &&
            <button type="button" className="btn btn-danger" onClick={onReturnForAmendment}>Return For Amendment</button>
          }
          {/* {
            deposit.transactionStatus === "Draft" &&
            <button type="button" className="btn btn-primary" disabled={loading || isLoadingFirstLevelApproval || loadingApproveAndComplete} onClick={submitFirstLevelApproval}>{isLoadingFirstLevelApproval ? <span data-uk-spinner={"ratio:.5"}> </span> : "Submit Transaction"}</button>
          } */}
          {
            deposit.transactionStatus === "First Level" &&
            <button type="button" className="btn btn-primary" disabled={loading || isLoadingFirstLevelApproval || loadingApproveAndComplete} onClick={submitSecondLevelApproval}>{isLoadingFirstLevelApproval ? <span data-uk-spinner={"ratio:.5"}> </span> : "Submit Transaction"}</button>
          }
          {
            deposit.transactionStatus === "Second Level" &&
            <button type="button" className="btn btn-primary" disabled={loading || isLoadingFirstLevelApproval || loadingApproveAndComplete} onClick={ApproveAndComplete}>{loadingApproveAndComplete ? <span data-uk-spinner={"ratio:.5"}> </span> : "Approve and Complete"}</button>
          }
          {
            deposit.transactionStatus === "Non-Deposit" &&
            <button className="btn btn-danger" disabled={loading || loadingRestore || loadingDelete} onClick={Delete}>{loadingDelete ? <span data-uk-spinner={"ratio:.5"}></span> : "Delete"} </button>}
          {
            deposit.transactionStatus === "Non-Deposit" &&
            <button className="btn btn-primary" disabled={loading || loadingRestore || loadingDelete} onClick={Restore}> {loadingRestore ? <span data-uk-spinner={"ratio:.5"}></span> : "Restore"}</button>
          }

          {
            deposit.transactionStatus === "Deleted" &&
            <button className="btn btn-primary" disabled={loading || loadingRestore || loadingDelete} onClick={Restore}> {loadingRestore ? <span data-uk-spinner={"ratio:.5"}></span> : "Restore"}</button>
          }
        </div>
        <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_FOR_AMENDMENT_SPLIT_MODAL}>
          {showOnReturnModal && <ReturnSplitDepositModal setShowReturnModal={setShowOnSubmitModal} />}
        </Modal>
      </form >
    );
  }
);

export default ViewSplitDepositForm;