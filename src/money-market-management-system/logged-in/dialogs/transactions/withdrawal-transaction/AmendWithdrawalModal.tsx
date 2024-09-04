import swal from "sweetalert";
import { useState, FormEvent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { dateFormat_YY_MM_DD, sortAlphabetically } from "../../../../../shared/utils/utils";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import showModalFromId, { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { getFilteredStatementTransactions, calculateInterest, calculateDays } from "../../../../../shared/functions/transactions/Statement";
import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import { IMoneyMarketAccount, defaultMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { IStatementTransaction } from "../../../../../shared/models/StatementTransactionModel";
import { IWithdrawalTransaction, defaultWithdrawalTransaction } from "../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import MODAL_NAMES from "../../ModalName";
import { FlagOutPossibleDuplicatesWithdrawals } from "../client-deposit-allocation/duplicate-flag-outs/DuplicateTransactionsFlag";
import AmendWithdrawalForm from "./AmendWithdrawalForm";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import { toJS } from "mobx";
import Modal from "../../../../../shared/components/Modal";
import DeleteManualWithdrawalForAmendment from "./delete-manual-withdrawal/DeleteManualWithdrawalModal";
interface IProps {
  isVisible: (show: boolean) => void;
}
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

const AmendWithdrawalModal = observer(({ isVisible }: IProps) => {
  const { api, store } = useAppContext();
  const user = store.user.me?.asJson.uid;
  let [onClearFileComponent, setOnClearFileComponent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Withdrawal");
  const [withdrawalTransaction, setWithdrawalTransaction] = useState<IWithdrawalTransaction>({ ...defaultWithdrawalTransaction });
  const [selectedClientAccount, setSelectedClientAccount] = useState<IMoneyMarketAccount>();
  const [selectedClientProfile, setSelectedClientProfile] = useState<INaturalPerson | ILegalEntity | null>();
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [verifyBackDating, setVerifyBackDating] = useState(false);
  const [showOtherSource, setShowOtherSource] = useState(false);
  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];
  const moneyMarketAccounts = store.mma.all;
  const withdrawals = store.withdrawalTransaction.all.map((t) => { return t.asJson });
  const agents = store.agent.all;
  const clientAccountOptions = moneyMarketAccounts.filter((mma) => mma.asJson.status === "Active").sort((a, b) => sortAlphabetically(a.asJson.accountName, b.asJson.accountName)).map((d) => {
    return {
      label: `${d.asJson.accountNumber} - ${d.asJson.accountName}`,
      value: d.asJson.accountNumber
    }
  })
  const agentsAccount = agents.map((acc) => ({
    value: `${acc.asJson.bankName} | ${acc.asJson.agentName} | ${acc.asJson.accountNumber} | ${acc.asJson.branchCode}`,
    label: ` ${acc.asJson.agentName} - ${acc.asJson.bankName} (${acc.asJson.accountNumber}) `,
  }));
  const clearDataTransaction: IWithdrawalTransaction = {
    ...defaultWithdrawalTransaction,
  };
  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setShowOtherSource(value === "Other");
    if (value === "Other") {
      setWithdrawalTransaction({
        ...withdrawalTransaction,
        sourceOfFunds: withdrawalTransaction.sourceOfFunds,
      });
    } else {
      setWithdrawalTransaction({
        ...withdrawalTransaction,
        sourceOfFunds: value,
      });
    }
  };
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.valueAsNumber;
    if (dateFormat_YY_MM_DD(selectedDate) > dateFormat_YY_MM_DD(Date.now())) {
      swal({
        title: "Transaction Future Dating",
        text: `Do you want to capture a Withdrawal that will be future dated to ${dateFormat_YY_MM_DD(
          selectedDate
        )}`,
        icon: "warning",
        buttons: ["Cancel", "Future Date"],
        dangerMode: true,
      }).then(async (edit) => {
        setLoading(true);
        if (edit) {
          swal({
            icon: "warning",
            text: `You are now capturing a Withdrawal that will be future dated to ${dateFormat_YY_MM_DD(
              selectedDate
            )}`,
          });
          setWithdrawalTransaction({
            ...withdrawalTransaction,
            valueDate: selectedDate,
            withdrawalTransactionProcess: "Future-Dated",
          });
        }
        setLoading(false);
      });
    } else if (
      dateFormat_YY_MM_DD(selectedDate) < dateFormat_YY_MM_DD(Date.now())
    ) {
      swal({
        title: "Transaction Back Dating",
        text: `Do you want to capture a Withdrawal that will be back dated to ${dateFormat_YY_MM_DD(
          selectedDate
        )}`,
        icon: "warning",
        buttons: ["Cancel", "Back Date"],
        dangerMode: true,
      }).then(async (edit) => {
        setLoading(true);
        if (edit) {
          swal({
            icon: "warning",
            text: `You are now capturing a Withdrawal that will be back dated to ${dateFormat_YY_MM_DD(
              selectedDate
            )}`,
          });
          setWithdrawalTransaction({
            ...withdrawalTransaction,
            valueDate: selectedDate,
            withdrawalTransactionProcess: "Back-Dated",
          });
        }
        setLoading(false);
      });
    } else {
      setWithdrawalTransaction({
        ...withdrawalTransaction,
        valueDate: selectedDate,
        withdrawalTransactionProcess: "Normal",
      });
    }
  };

  // const generateWithdrawalThresholdNotificationHTML = async () => {
  //   try {
  //     const imageUrl = "https://firebasestorage.googleapis.com/v0/b/ijgmms-development.appspot.com/o/ijg-header.jpg?alt=media&token=e7143bea-34a3-4a72-8e22-9b9bd73c80f3";
  //     // Use SweetAlert to confirm sending the email
  //     swal({
  //       title: "Are you sure?",
  //       text: "Do you want to send notification to client?",
  //       icon: "warning",
  //       buttons: ["Cancel", "Send Email"],
  //       dangerMode: true,
  //     }).then(async (sendEmail) => {
  //       if (sendEmail && selectedClientProfile && withdrawalTransaction.emailAddress) {
  //         setLoading(true);
  //         const email = thresholdEmailContent(selectedClientProfile, imageUrl, withdrawalTransaction.emailAddress)
  //         const response = await fetch(
  //           "https://us-central1-functions-918c1.cloudfunctions.net/sendNotificationEmail",
  //           {
  //             method: "POST",
  //             headers: {
  //               "Content-Type": "application/json",
  //             },
  //             body: JSON.stringify({
  //               htmlContent: email.body,
  //               subject: email.subject,
  //               to: email.to,
  //               from: email.from,
  //             }),
  //           }
  //         );

  //         if (response.ok) {
  //           swal("Success", "Email sent successfully!", "success");
  //         } else {
  //           throw new Error("Failed to send email");
  //         }
  //         setLoading(false);
  //       } else {
  //         swal("Cancelled", "Email sending cancelled", "error");
  //       }
  //     });
  //   } catch (error) {
  //     swal("Error", "Error sending Email. Please try again later.", "error");
  //   }
  // };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedClientAccount && selectedClientProfile && user) {
      const saveTransaction: IWithdrawalTransaction = {
        id: "",
        entityNumber: selectedClientProfile.entityId,
        accountNumber: selectedClientAccount.accountNumber,
        amount: withdrawalTransaction.amount,
        clientBankingDetails: withdrawalTransaction.clientBankingDetails,
        bankReference: withdrawalTransaction.bankReference || selectedClientAccount.accountNumber,
        description: withdrawalTransaction.description,
        valueDate: withdrawalTransaction.valueDate || Date.now(), // Set valueDate to current date if not set
        transactionDate: Date.now(),
        allocationStatus: "Manually Recorded",
        reasonForDeleting: withdrawalTransaction.reasonForDeleting,
        transactionStatus: "First Level",
        transactionType: "Manual",
        productCode: selectedClientAccount.accountType,
        createdAtTime: {
          transactionQueue: Date.now(),
          firstLevelQueue: Date.now(),
        },

        clientInstruction: {
          url: withdrawalTransaction.clientInstruction.url ?? "",
          reasonForNotAttaching: withdrawalTransaction.clientInstruction.reasonForNotAttaching ?? ""
        },
        sourceOfFundsAttachment: {
          url: withdrawalTransaction.sourceOfFundsAttachment.url ?? "",
          reasonForNotAttaching: withdrawalTransaction.sourceOfFundsAttachment.reasonForNotAttaching ?? ""
        },
        sourceOfFunds: withdrawalTransaction.sourceOfFunds,
        withdrawalNodeType: "Parent",
        transactionIdentifier: `ID-${selectedClientAccount.accountNumber}-${dateFormat_YY_MM_DD(Date.now())}-${withdrawalTransaction.amount}-${withdrawalTransaction.bankReference}`,
        withdrawalTransactionProcess: withdrawalTransaction.withdrawalTransactionProcess,
        capturedBy: store.auth.meUID || ""
      };

      const warning = FlagOutPossibleDuplicatesWithdrawals(withdrawals.filter((t) => t.accountNumber === selectedClientAccount?.accountNumber), withdrawalTransaction);

      if (warning) {

        swal({
          title: "Possible Duplicate?",
          text: "This transaction might be a possible duplication. would you like to continue?",
          icon: "warning",
          buttons: ["Cancel", "Record"],
          dangerMode: true,
        }).then(async (edit) => {
          if (edit) {
            setLoadingSubmission(true);
            try {
              await api.withdrawalTransaction.create(saveTransaction);
            } catch (error) {
            }
            onCancel();
            setLoadingSubmission(false);
          } else {
            swal({
              icon: "error",
              text: "Transaction cancelled!",
            });
            return;
          }
        });
      } else {
        setLoadingSubmission(true);
        try {
          try {
            await api.withdrawalTransaction.create(saveTransaction);
            swal({
              icon: "success",
              text: "Transaction submitted for First Level Approval",
            });
          } catch (error) {
          }
        } catch (error) {
        } finally {
          setLoadingSubmission(false);
          onSaveAndCancel();
        }
      }
    }
  };
  
  const handleSave = async () => {
    if (selectedClientAccount && selectedClientProfile) {
      setLoadingDraft(true);
      try {
        const saveTransaction: IWithdrawalTransaction = {
          id: withdrawalTransaction.id,
          accountNumber: selectedClientAccount.accountNumber,
          amount: withdrawalTransaction.amount,
          clientBankingDetails: withdrawalTransaction.clientBankingDetails,
          bankReference: withdrawalTransaction.bankReference || selectedClientAccount.accountNumber,
          description: withdrawalTransaction.description || "",
          valueDate: withdrawalTransaction.valueDate,
          transactionDate: withdrawalTransaction.transactionDate,
          allocationStatus: "Manually Recorded",
          transactionStatus: "Draft",
          transactionType: "Manual",
          productCode: selectedClientAccount.accountType,
          emailAddress: withdrawalTransaction.emailAddress || "",
          createdAtTime: {
            transactionQueue: Date.now()
          },
          clientInstruction: {
            url: withdrawalTransaction.clientInstruction.url ?? "",
            reasonForNotAttaching: withdrawalTransaction.clientInstruction.reasonForNotAttaching ?? ""
          },
          sourceOfFundsAttachment: {
            url: withdrawalTransaction.sourceOfFundsAttachment.url ?? "",
            reasonForNotAttaching: withdrawalTransaction.sourceOfFundsAttachment.reasonForNotAttaching ?? ""
          },
          entityNumber: withdrawalTransaction.entityNumber,
          sourceOfFunds: withdrawalTransaction.sourceOfFunds || "",
          withdrawalNodeType: "Parent",
          transactionIdentifier: `ID-${selectedClientAccount.accountNumber}`,
          withdrawalTransactionProcess: withdrawalTransaction.withdrawalTransactionProcess || "",
          transactionAction: "Amended, Updated and Saved",
          streetName: selectedClientProfile.contactDetail.address1 || "",
          townName: selectedClientProfile.contactDetail.city || "",
          province: selectedClientProfile.contactDetail.state || "",
          // postalCode: selectedClientProfile.contactDetail.,
          countryCode: "NA",
          balanceOfPaymentCodes: withdrawalTransaction.balanceOfPaymentCodes || "Hello",
          balanceOfPaymentCodeEntityType: selectedClientProfile.entityType === "Individual" ? 'I' : 'E',
          parentTransaction: withdrawalTransaction.id
        };
        try {
          await api.withdrawalTransaction.updateAndCreateAuditTrail(withdrawalTransaction, saveTransaction);
        } catch (error) {
        }
      } catch (error) {
      }
      swal({
        icon: "success",
        text: "Draft has been updated and saved",
      });
      setLoadingDraft(false);
      onSaveAndCancel();
    }
  };

  const onDelete = () => {
    store.withdrawalTransaction.select(withdrawalTransaction);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.DELETE_WITHDRAWAL_TRANSACTION_MODAL);
  };

  const onCancel = () => {
    swal({
      title: "Close without saving, changes?",
      text: "Closing this will result in the loss of unsaved changes",
      icon: "warning",
      buttons: ["Update and Close", "Close Anyway"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        isVisible(false);
        store.withdrawalTransaction.clearSelected();
        onClear();
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_AMEND_MODAL);
      } else {
        handleSave();
        isVisible(false);
        store.withdrawalTransaction.clearSelected();
        onClear();
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_AMEND_MODAL);
      }
    });
  };

  const onSaveAndCancel = () => {
    isVisible(false);
    store.withdrawalTransaction.clearSelected();
    onClear();
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_AMEND_MODAL);
  };

  const onClear = () => {
    setShowOtherSource(false);
    handleClientAccountChange("");
    setSelectedClientProfile(null);
    setSelectedClientAccount(defaultMoneyMarketAccount);
    setWithdrawalTransaction(clearDataTransaction);
    setWithdrawalTransaction({
      ...withdrawalTransaction,
      amount: 0,
    })
  };

  const handleClientAccountChange = (accountNumber: string) => {
    if (accountNumber) {
      const account = moneyMarketAccounts.find(account => account.asJson.accountNumber === accountNumber);
      if (account) {
        const client = clients.find(client => client.asJson.entityId === account.asJson.parentEntity)
        if (client) {
          setSelectedClientProfile(client.asJson);
          setSelectedClientAccount(account.asJson);
          setWithdrawalTransaction({
            ...withdrawalTransaction, accountNumber: account.asJson.accountNumber, entityNumber: client.asJson.entityId
          }
          )
        }
      }
    } else {
      setSelectedClientProfile(null);
      setSelectedClientAccount(defaultMoneyMarketAccount);
      setWithdrawalTransaction(
        {
          ...withdrawalTransaction,
          accountNumber: '',
          entityNumber: ''
        }
      )
    }
  };

  const handleAmountChange = (newAmount: number) => {
    setWithdrawalTransaction({
      ...withdrawalTransaction,
      amount: newAmount,
    })
  };

  const handleUseAgentChange = () => {
    if (withdrawalTransaction.useAgent) {
      setWithdrawalTransaction({
        ...withdrawalTransaction,
        useAgent: false,
      })
    } else {
      setWithdrawalTransaction({
        ...withdrawalTransaction,
        useAgent: true,
      })
    }

  }
  useEffect(() => {
    const updateTransactionsAndNewTransaction = () => {

      const statementTransactions = store.statementTransaction.all.filter(
        (notBlinded) => notBlinded.asJson.blinded !== true
      );

      const statementTransactionsAsJson = statementTransactions.map((transaction) => {
        return transaction.asJson;
      });

      const filteredStatementTransactions = getFilteredStatementTransactions(startOfMonth, endOfMonth, statementTransactionsAsJson);

      calculateInterest(statementTransactionsAsJson, filteredStatementTransactions);

      const transactionAmount = withdrawalTransaction.amount;

      if (selectedClientAccount) {
        const newTransaction: IStatementTransaction = {
          id: "",
          date: Date.parse(dateFormat_YY_MM_DD(withdrawalTransaction.valueDate)),
          transaction: "withdrawal",
          balance: selectedClientAccount.balance - withdrawalTransaction.amount,
          rate: selectedClientAccount.clientRate || 0,
          remark: `withdrawal`,
          amount: withdrawalTransaction.amount,
          createdAt: Date.now(),
          previousBalance: selectedClientAccount.balance,
        };

        // Push the new transaction to the existing filteredStatementTransactions array
        filteredStatementTransactions.push(newTransaction);

        // Sort the array based on date and createdAt fields
        filteredStatementTransactions.sort((a, b) => {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);

          // First, sort by date
          if (dateB.getTime() !== dateA.getTime()) {
            return dateA.getTime() - dateB.getTime();
          } else {
            // If dates are equal, sort by createdAt
            const createdAtA = new Date(a.createdAt || 0);
            const createdAtB = new Date(b.createdAt || 0);
            return createdAtA.getTime() - createdAtB.getTime();
          }
        });

        // Find the index where the new transaction was pushed
        const newIndex = filteredStatementTransactions.findIndex(
          (transaction) => transaction.id === newTransaction.id
        );

        // If the new transaction is not the first transaction in the array
        if (newIndex > 0) {
          // Get the previous balance before the pushed transaction

          let balanceBeforePush = filteredStatementTransactions[newIndex - 1].balance;
          // Subtract the amount of the pushed transaction from the previous balance
          const newTransactionAmount = transactionAmount;
          const previousBalanceAfterPush = balanceBeforePush ? balanceBeforePush - newTransactionAmount : 0;

          // Update the balance of the pushed transaction
          newTransaction.balance = previousBalanceAfterPush;

          if (newTransactionAmount > balanceBeforePush) {
            setVerifyBackDating(true);
          } else {
            setVerifyBackDating(false);
          }
        }

        // Update balances and recalculate days and distribution for each transaction
        let previousBalance = filteredStatementTransactions[0]?.balance || 0;
        filteredStatementTransactions.forEach((transaction, index) => {
          transaction.previousBalance = previousBalance;
          if (index < filteredStatementTransactions.length - 1) {
            const nextTransaction = filteredStatementTransactions[index + 1];
            transaction.days = calculateDays(
              transaction.date,
              nextTransaction.date
            );
          } else {
            transaction.days = calculateDays(transaction.date);
          }
          transaction.distribution = Number(
            ((transaction.balance * transaction.rate || 0) / 100) *
            (transaction.days ? transaction.days / 365 : 0 / 365)
          );
          previousBalance = transaction.balance;
        });
      }


    };

    updateTransactionsAndNewTransaction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientAccount, withdrawalTransaction.amount, withdrawalTransaction.valueDate]);

  useEffect(() => {
    if (store.withdrawalTransaction.selected) {
      const withdrawalTransaction = toJS(store.withdrawalTransaction.selected);
      setWithdrawalTransaction(withdrawalTransaction);

      const account = moneyMarketAccounts.find(
        account => account.asJson.accountNumber === store.withdrawalTransaction.selected?.accountNumber
      );
      if (account) {
        const client = clients.find(client => client.asJson.entityId === account.asJson.parentEntity);
        if (client) {
          setSelectedClientProfile(client.asJson);
          setSelectedClientAccount(account.asJson);
        } else {

        }
        if (selectedClientProfile && selectedClientAccount) {
          handleClientAccountChange(account.asJson?.accountNumber ?? "")
        } else {

        }
      } else {

      }
    } else {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.withdrawalTransaction.selected]);

  useEffect(() => {
    const loadData = async () => {
      if (selectedClientAccount && selectedClientProfile) {
        try {
          await api.statementTransaction.getAll(selectedClientAccount.id);
        } catch (error) {
        }
      } else {
      }
    };
    loadData();
  }, [api.statementTransaction, selectedClientAccount, selectedClientProfile]);

  return (
    <ErrorBoundary>
      <div className="custom-modal-style uk-modal-dialog uk-width-4-5">
        <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel}></button>
        <div className="form-title">
          <h3 style={{ marginRight: "1rem" }}>
            WITHDRAWAL
          </h3>
          <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
          <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
            Amend Transaction
          </h3>
        </div>

        <hr />
        <Toolbar
          rightControls={
            <div className="uk-margin-bottom">
              <button className={`btn ${selectedTab === "Withdrawal" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Withdrawal")}>
                Withdrawal
              </button>

              <button
                className={`btn ${selectedTab === "Audit Trail" ? "btn-primary" : "btn-primary-in-active"}`}
                onClick={() => setSelectedTab("Audit Trail")}
              >
                View Audit Trail
              </button>
              <button
                className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`}
                onClick={() => setSelectedTab("Statement")}
              >
                View Statement
              </button>
              <Modal modalId={MODAL_NAMES.BACK_OFFICE.DELETE_WITHDRAWAL_TRANSACTION_MODAL}>
                <DeleteManualWithdrawalForAmendment />
              </Modal>
            </div>
          }
        />
        <AmendWithdrawalForm
          onCancel={onCancel}
          onClear={onClear}
          handleSubmit={handleSubmit}
          handleClientAccountChange={handleClientAccountChange}
          handleDateChange={handleDateChange}
          handleAmountChange={handleAmountChange}
          handleSave={handleSave}
          loading={loading}
          showOtherSource={showOtherSource}
          selectedClientAccount={selectedClientAccount}
          selectedClientProfile={selectedClientProfile}
          selectedTab={selectedTab}
          clientAccountOptions={clientAccountOptions}
          withdrawalTransaction={withdrawalTransaction}
          setWithdrawalTransaction={setWithdrawalTransaction}
          onClearFileComponent={onClearFileComponent}
          setOnClearToFalse={setOnClearFileComponent}
          handleSourceChange={handleSourceChange}
          handleUseAgentChange={handleUseAgentChange}
          verifyBackDating={verifyBackDating}
          loadingSubmission={loadingSubmission}
          agentsAccount={agentsAccount}
          loadingDraft={loadingDraft}
          loadingSave={false}
          onDelete={onDelete}
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
          selectedAccountNumber={""}
        />
      </div>
    </ErrorBoundary>
  );
});

export default AmendWithdrawalModal;
