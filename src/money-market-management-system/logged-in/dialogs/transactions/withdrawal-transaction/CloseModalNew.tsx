import swal from "sweetalert";
import { useState, FormEvent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../../shared/functions/Context";
import { defaultWithdrawalTransaction, IWithdrawalTransaction } from "../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { defaultMoneyMarketAccount, IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
import { dateFormat_YY_MM_DD, sortAlphabetically } from "../../../../../shared/utils/utils";
import { FlagOutPossibleDuplicatesWithdrawals } from "../client-deposit-allocation/duplicate-flag-outs/DuplicateTransactionsFlag";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../ModalName";
import { calculateDays, calculateInterest, getFilteredStatementTransactions } from "../../../../../shared/functions/transactions/Statement";
import { IStatementTransaction } from "../../../../../shared/models/StatementTransactionModel";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import RecordCloseOutWithdrawalForm from "./capture-amend-return/RecordCloseOutWithdrawalForm";
import { calculateCloseOutInterest } from "./CloseModalNewInterestFunction";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

const CloseOutModalNew = observer(() => {
  const { api, store } = useAppContext();
  const user = store.user.me?.asJson.uid;
  const [loading, setLoading] = useState(false);
  const [calculatingInterest, setCalculatingInterest] = useState(false);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Withdrawal");
  const [closeOutInterest, setCloseOutInterest] = useState(0)
  const [closeOutDays, setCloseOutDays] = useState(0)
  const [withdrawalTransaction, setWithdrawalTransaction] = useState<IWithdrawalTransaction>({ ...defaultWithdrawalTransaction });
  const [selectedClientAccount, setSelectedClientAccount] = useState<IMoneyMarketAccount>();
  const [selectedClientProfile, setSelectedClientProfile] = useState<INaturalPerson | ILegalEntity | null>();
  const [verifyBackDating, setVerifyBackDating] = useState(false);
  const [showOtherSource, setShowOtherSource] = useState(false);

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setShowOtherSource(value === "Other");

    // Clear the input field value when the user switches from 'Other' to another option
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

  const handleDateChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.valueAsNumber;

    // calculate interest here when date is changed
    //close interest
    await api.statementTransaction.getAll(selectedClientAccount?.id || "")
    const transactions = store.statementTransaction.all
      .filter((transaction) => transaction.asJson.blinded !== true)
      .map((transaction) => { return transaction.asJson })
    const interest = calculateCloseOutInterest(transactions, startOfMonth, endOfMonth, selectedDate, setCalculatingInterest);
    setCloseOutInterest(interest.totalDistribution);
    setCloseOutDays(interest.totalDays);
    //close interest


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


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedClientAccount && selectedClientProfile && user) {
      const saveTransaction: IWithdrawalTransaction = {
        id: "",
        entityNumber: selectedClientProfile.entityId,
        accountNumber: selectedClientAccount.accountNumber,
        amount: selectedClientAccount.balance + closeOutInterest,
        clientBankingDetails: withdrawalTransaction.clientBankingDetails,
        bankReference: withdrawalTransaction.bankReference || selectedClientAccount.accountNumber,
        description: withdrawalTransaction.description,
        valueDate: withdrawalTransaction.valueDate || Date.now(), // Set valueDate to current date if not set
        transactionDate: Date.now(),
        allocationStatus: "Manually Recorded",
        transactionStatus: "First Level",
        transactionType: "Manual Close Out",
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
        capturedBy: store.auth.meUID || "",
        transactionAction: "Submitted for First Level Approval",
        closeOutInterest: closeOutInterest,
        closeOutDays: closeOutDays
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
          onCancel();
        }
      }
    }
  };

  const handleSave = async () => {
    if (selectedClientAccount && selectedClientProfile) {
      setLoadingDraft(true);
      try {
        const saveTransaction: IWithdrawalTransaction = {
          accountNumber: selectedClientAccount.accountNumber,
          emailAddress: selectedClientProfile?.contactDetail.emailAddress,
          amount: selectedClientAccount.balance + closeOutInterest,
          clientBankingDetails: withdrawalTransaction.clientBankingDetails,
          bankReference: withdrawalTransaction.bankReference || selectedClientAccount.accountNumber,
          description: withdrawalTransaction.description,
          valueDate: withdrawalTransaction.valueDate || Date.now(),
          transactionDate: Date.now(),
          allocationStatus: "Manually Recorded",
          transactionStatus: "Draft",
          transactionType: "Manual Close Out",
          productCode: selectedClientAccount.accountType,
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
          id: "",
          entityNumber: withdrawalTransaction.entityNumber,
          sourceOfFunds: withdrawalTransaction.sourceOfFunds,
          withdrawalNodeType: "Parent",
          transactionIdentifier: `ID-${selectedClientAccount.accountNumber}`,
          withdrawalTransactionProcess: withdrawalTransaction.withdrawalTransactionProcess,
          transactionAction: "Recorded",
          closeOutInterest: closeOutInterest,
          closeOutDays: closeOutDays
        };
        try {
          await api.withdrawalTransaction.create(saveTransaction);
          swal({
            icon: "success",
            text: "Transaction Saved as Draft",
          });
        } catch (error) {
        }
      } catch (error) {
      }
      setLoadingDraft(false);
      onCancel();
    }
  };



  const onCancel = () => {
    setSelectedClientProfile(null);
    setSelectedClientAccount(defaultMoneyMarketAccount);
    setWithdrawalTransaction(defaultWithdrawalTransaction);
    handleClientAccountChange(" ")
    store.withdrawalTransaction.clearSelected();
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.CLOSE_MM_ACCOUNT);
  };

  const onClear = () => {
    handleClientAccountChange(" ");
    setSelectedClientProfile(null);
    setSelectedClientAccount(defaultMoneyMarketAccount);
    setWithdrawalTransaction(defaultWithdrawalTransaction);
    // setVisible(false);
  };
  let [onClearFileComponent, setOnClearFileComponent] = useState(false)

  const handleClientAccountChange = async (accountNumber: string) => {
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
          //close interest
          await api.statementTransaction.getAll(account.asJson.id)
          const transactions = store.statementTransaction.all
            .filter((transaction) => transaction.asJson.blinded !== true)
            .map((transaction) => { return transaction.asJson });
          const interest = calculateCloseOutInterest(transactions, startOfMonth, endOfMonth, withdrawalTransaction.valueDate, setCalculatingInterest);
          setCloseOutInterest(interest.totalDistribution);
          setCloseOutDays(interest.totalDays);
          //close interest

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
  // const onClear = () => {
  //   setWithdrawalTransaction(defaultWithdrawalTransaction);
  // };


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
  }, [store, selectedClientProfile, selectedClientAccount, withdrawalTransaction.amount, withdrawalTransaction.valueDate]);

  useEffect(() => {
    const loadData = async () => {
      if (selectedClientAccount && selectedClientProfile) {
        try {
          await api.statementTransaction.getAll(selectedClientAccount.id);
        } catch (error) { }
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
            Withdrawal
          </h3>
          <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
          <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
            Capitalise Close Out
          </h3>
        </div>

        <hr />
        <div className="uk-margin-bottom uk-text-right">
          <button className={`btn ${selectedTab === "Withdrawal" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Withdrawal")}>
            Withdrawal View
          </button>
          <button className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Statement")}>
            Statement View
          </button>
        </div>
        <></>


        <RecordCloseOutWithdrawalForm
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
          closeOutDays={closeOutDays}
          closeOutInterest={closeOutInterest}
          calculatingInterest={calculatingInterest}
        />
      </div>
    </ErrorBoundary>
  );
});

export default CloseOutModalNew;
