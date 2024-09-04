import React, { useEffect, useRef, useState } from "react";
import ErrorBoundary from "../../../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import Toolbar from "../../../../../shared/components/toolbar/Toolbar";
import { CSVRow, IBankStatementTransaction, IIndexedTransaction, IMatchedTransaction, INedBankStatement, IStandardBankStatement, ISuggestedMatchedTransaction, IUnMatchedTransaction } from "../../../../../../../shared/interfaces/BankStatements";

import swal from "sweetalert";
import { LoadingEllipsis } from "../../../../../../../shared/components/loading/Loading";
import { IDepositTransaction } from '../../../../../../../shared/models/deposit-transaction/DepositTransactionModel';

import ProgressBar from "../../../../../shared/components/progress-bar/ProgressBar";
import { ACTIVE_ENV } from "../../../../../CloudEnv";
import { observer } from "mobx-react-lite";
import { hideModalFromId } from "../../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../../ModalName";
import { IMoneyMarketAccount } from "../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { BANK_STATEMENT_CONFIGURATIONS } from "../../../../../../../shared/functions/CONSTANTS";
import Papa from "papaparse";
import { convertDateStringToTimestampMonth, convertDateStringToTimestampSlash } from "../../../../../../../shared/functions/DateToTimestamp";
import { padNumberStringWithZero } from "../../../../../../../shared/functions/StringFunctions";
import { MatchedItemsGrid } from "./MatchedItemsGrid";
import { SuggestedMatchedItemsGrid } from "./SuggestedMatchedItemsGrid";
import { UnmatchedItemsGrid } from "./UnmatchedItemsGrid";
import { IndexedItemsGrid } from "./IndexedItemsGrid";
import { StatementItemsGrid } from "./StatementItemsGrid";

type BankUploadTabs = "Uploaded Bank Statement" | "Matched Transactions" | "Suggested Matches" | "Unmatched Transactions" | "Indexed Transactions";

interface ITabsProps {
  data: {
    totalTransactions: number;
    totalMatched: number;
    totalSuggestedMatches: number;
    totalUnMatched: number;
    totalIndexed: number;
  }
  tab: BankUploadTabs;
  setTab: React.Dispatch<React.SetStateAction<BankUploadTabs>>;
}

const Tabs = (props: ITabsProps) => {

  const activeClass = (tab: BankUploadTabs) => {
    if (props.tab === tab) {
      return "uk-active";
    } else {
      return "";
    }
  };

  const { data } = props;

  return (
    <div className="uk-margin-small-bottom">
      <ul className="kit-tabs" data-uk-tab>
        <li className={activeClass("Uploaded Bank Statement")} onClick={() => props.setTab("Uploaded Bank Statement")}>
          <a href="void(0)">Uploaded ({data.totalTransactions})</a>
        </li>
        <li className={activeClass("Matched Transactions")} onClick={() => props.setTab("Matched Transactions")}>
          <a href="void(0)">Matched ({data.totalMatched})</a>
        </li>
        <li className={activeClass("Suggested Matches")} onClick={() => props.setTab("Suggested Matches")}>
          <a href="void(0)">Suggestions ({data.totalSuggestedMatches})</a>
        </li>
        <li className={activeClass("Unmatched Transactions")} onClick={() => props.setTab("Unmatched Transactions")}>
          <a href="void(0)">Unmatched ({data.totalUnMatched})</a>
        </li>

        <li className={activeClass("Indexed Transactions")} onClick={() => props.setTab("Indexed Transactions")}>
          <a href="void(0)">Indexed ({data.totalIndexed})</a>
        </li>
      </ul>
    </div>
  );
};
interface IProps {
  isVisible: (show: boolean) => void;
}

const BankStatementUploadModal = observer(({ isVisible }: IProps) => {
  const { api, store } = useAppContext();

  const [loading, setLoading] = useState(false);

  const [tab, setTab] = useState<BankUploadTabs>("Uploaded Bank Statement");
  const [selectedTab, setSelectedTab] = useState("Form");

  const [progressPercentage, setProgressPercentage] = useState(0);
  const [duplicateCheckProgressPercentage, setDuplicateCheckProgressPercentage] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [accountNumber, setAccountNumber] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("Standard Bank");

  const [transactions, setTransactions] = useState<CSVRow[]>([]);
  const [statementTransactions, setStatementTransactions] = useState<IBankStatementTransaction[]>([]);

  const [isMatching, setIsMatching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatAndConvertAmount = (amount: string): number => {
    const sanitizedValue = amount.replace(/,/g, "");
    return parseFloat(sanitizedValue);
  };

  const totalUploadedValue = statementTransactions.reduce((sum, transaction) => sum + formatAndConvertAmount(transaction.amount), 0);

  /**  ======================================================================== Functions to handle matched transactions start here ========================================================================================== */
  const [matched, setMatched] = useState<IMatchedTransaction[]>([]);

  const [selectedMatchedTransactions, setSelectedMatchedTransactions] = useState<IMatchedTransaction[]>([]);
  const selectAllMatchedRef = useRef<HTMLInputElement>(null);

  /**  ======================================================================== Functions to handle matched transactions end here ========================================================================================== */


  /**  ======================================================================== Functions to handle matched transactions start here ========================================================================================== */
  const [suggestedMatch, setSuggestedMatch] = useState<ISuggestedMatchedTransaction[]>([]);

  const [selectedSuggestedTransactions, setSelectedSuggestedTransactions] = useState<ISuggestedMatchedTransaction[]>([]);
  const selectAllSuggestedRef = useRef<HTMLInputElement>(null);

  const readySuggested = suggestedMatch.filter(transaction => transaction.suggestionRemark !== "")


  /**  ======================================================================== Functions to handle matched transactions end here ========================================================================================== */

  /**  ======================================================================== Functions to handle Unmatched transactions start here ========================================================================================== */
  const [unmatched, setUnmatched] = useState<IUnMatchedTransaction[]>([]);
  const readyUnmatched = unmatched.filter(transaction => transaction.suggestionRemark !== "")
  const [selectedUnmatchedTransactions, setSelectedUnmatchedTransactions] = useState<IUnMatchedTransaction[]>([]);
  const selectAllUnmatchedRef = useRef<HTMLInputElement>(null);
  /**  ======================================================================== Functions to handle Unmatched transactions end here ========================================================================================== */

  /**  ======================================================================== Functions to handle indexed transactions start here ========================================================================================== */
  const [indexedTransactions, setIndexTransactions] = useState<IIndexedTransaction[]>([]);
  const [selectedIndexedTransactions, setSelectedIndexedTransactions] = useState<IIndexedTransaction[]>([]);
  const selectAllIndexedRef = useRef<HTMLInputElement>(null);

  const handleIndexSuggestions = (transactions: ISuggestedMatchedTransaction[]) => {
    setIndexTransactions((prevTransactions) => {
      // Filter out transactions with specific remarks
      const filteredTransactions = prevTransactions.filter(t =>
        t.matchType !== "System Accepted Match" && t.matchType !== "System Rejected Match"
      );

      // Separate transactions based on suggestionRemark
      const newAutoTransactions: IIndexedTransaction[] = [];
      const newManualTransactions: IIndexedTransaction[] = [];

      transactions.forEach(transaction => {
        if (transaction.suggestionRemark === "Accepted") {
          newAutoTransactions.push({
            matchedAccount: transaction.matchedAccount,
            transactionDate: transaction.transactionDate,
            valueDate: transaction.valueDate,
            bankReference: transaction.bankReference,
            amount: transaction.amount,
            balance: transaction.balance,
            matchType: "System Accepted Match",
            remark: "To be processed",
            statementIdentifier: transaction.statementIdentifier,
            isAlreadyUploaded: transaction.isAlreadyUploaded,
            suggestionRemark: "Accepted"
          });
          // readySuggested.push(transaction);

        } else if (transaction.suggestionRemark === "Rejected") {
          newManualTransactions.push({
            transactionDate: transaction.transactionDate,
            valueDate: transaction.valueDate,
            bankReference: transaction.bankReference,
            amount: transaction.amount,
            balance: transaction.balance,
            matchType: "System Rejected Match",
            remark: "To be saved on the Transaction Queue",
            statementIdentifier: transaction.statementIdentifier,
            isAlreadyUploaded: transaction.isAlreadyUploaded,
            suggestionRemark: "Rejected"
          });
          // readySuggested.push(transaction);
        }
      });

      // setSelectedSuggestedTransactions(readySuggested);

      // Concatenate the new transactions with filtered transactions
      return [...filteredTransactions, ...newAutoTransactions, ...newManualTransactions];
    });
  };

  const handleIndexAutoAllocated = (transactions: IMatchedTransaction[]) => {
    const newTransactions: IIndexedTransaction[] = transactions.map((transaction) => ({
      matchedAccount: transaction.matchedAccount,
      transactionDate: transaction.transactionDate,
      valueDate: transaction.valueDate,
      bankReference: transaction.bankReference,
      amount: transaction.amount,
      balance: transaction.balance,
      matchType: "Client",
      remark: "To be processed",
      statementIdentifier: transaction.statementIdentifier,
      isAlreadyUploaded: transaction.isAlreadyUploaded,
      suggestionRemark: "",
    }));

    setIndexTransactions((prevTransactions) => {
      // Filter out transactions with remark "To be processed"
      const filteredTransactions = prevTransactions.filter(t => t.matchType !== "Client");

      // Concatenate the new transactions with filtered transactions
      return [...filteredTransactions, ...newTransactions];
    });
  };

  const handleIndexUnallocated = (transactions: IUnMatchedTransaction[]) => {
    const newTransactions: IIndexedTransaction[] = transactions.map((transaction) => ({
      transactionDate: transaction.transactionDate,
      valueDate: transaction.valueDate,
      bankReference: transaction.bankReference,
      amount: transaction.amount,
      balance: transaction.balance,
      matchType: "Unmatched",
      remark: "To be saved on the Transaction Queue",
      statementIdentifier: transaction.statementIdentifier,
      isAlreadyUploaded: transaction.isAlreadyUploaded,
      suggestionRemark: "",
    }));

    setIndexTransactions((prevTransactions) => {
      // Filter out transactions with remark "To be processed"
      const filteredTransactions = prevTransactions.filter(t => t.matchType !== "Unmatched");

      // Concatenate the new transactions with filtered transactions
      return [...filteredTransactions, ...newTransactions];
    });
  };

  // const handleIndexNonDepost = (transactions: IUnMatchedTransaction[] | ISuggestedMatchedTransaction[]) => {
  //   const newTransactions: IIndexedTransaction[] = transactions.map((transaction) => ({
  //     transactionDate: transaction.transactionDate,
  //     valueDate: transaction.valueDate,
  //     bankReference: transaction.bankReference,
  //     amount: transaction.amount,
  //     balance: transaction.balance,
  //     matchType: "Non-Deposit",
  //     remark: "To be saved on the Non Deposit Queue",
  //     statementIdentifier: transaction.statementIdentifier,
  //     isAlreadyUploaded: transaction.isAlreadyUploaded,
  //     suggestionRemark: "",
  //   }));

  //   setIndexTransactions((prevTransactions) => {
  //     // Filter out transactions with remark "To be processed"
  //     const filteredTransactions = prevTransactions.filter(t => t.matchType !== "Non-Deposit");

  //     // Concatenate the new transactions with filtered transactions
  //     return [...filteredTransactions, ...newTransactions];
  //   });
  // };

  const handleRefreshIndexed = () => {
    handleIndexAutoAllocated(selectedMatchedTransactions);
    handleIndexUnallocated(selectedUnmatchedTransactions);
    handleIndexSuggestions(readySuggested);
  }

  const readyToIndex = selectedMatchedTransactions.length + selectedUnmatchedTransactions.length + readySuggested.length;

  const onProcessIndexedTransactions = async () => {
    const concurrencyLimit = 1000; // Adjust the concurrency limit as needed
    let completedCount = 0;

    const userId = store.user.me?.asJson.uid;

    setIsProcessing(true);

    const processTransaction = async (transaction: IIndexedTransaction) => {

      if (transaction.valueDate && transaction.transactionDate && transaction.remark === "To be processed" && transaction.matchedAccount) {

        const url = `${ACTIVE_ENV.url}processTransactionsToCompletedQueueHandler`;

        const account = getAccount(transaction.matchedAccount);

        if (account !== undefined && userId !== undefined) {
          const _transactionToProcess: IDepositTransaction = {
            id: "",
            bankTransactionDate: transaction.transactionDate,
            bankValueDate: transaction.valueDate,
            transactionDate: Date.now(),
            valueDate: Date.now(),
            amount: transaction.amount,
            accountNumber: transaction.matchedAccount,
            productCode: getAccountType(transaction.matchedAccount),
            entityNumber: getAccountOwner(transaction.matchedAccount),
            sourceBank: selectedBank,
            bankReference: transaction.bankReference,
            sourceOfFunds: "",
            depositNodeType: "Parent",
            statementIdentifier: transaction.statementIdentifier,
            createdAtTime: {
              completedQueue: Date.now()
            },
            transactionType: "CSV File",
            allocationStatus: "Auto-Allocated",
            transactionStatus: "Completed",
            depositTransactionProcess: "Normal",
            sourceOfFundsAttachment: {
              url: "",
              reasonForNotAttaching: ""
            },
            proofOfPaymentAttachment: {
              url: "",
              reasonForNotAttaching: ""
            },
            description: "",
            capturedBy: userId,
            firstLevelApprover: userId,
            secondLevelApprover: userId,
          };

          const payload = {
            transaction: _transactionToProcess,
            account: account,
            user: userId
          }

          try {
            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              completedCount++;
              const progress = Number(((completedCount / indexedTransactions.length) * 100).toString());
              setProgressPercentage(progress);
              return true; // Indicate success
            } else {
              return false; // Indicate failure
            }
          } catch (error) {
            return false;
          }
        }

      } else if (transaction.valueDate && transaction.transactionDate && transaction.remark === "To be saved on the Transaction Queue") {

        const url = `${ACTIVE_ENV.url}processTransactionsToTransactionQueueHandler`;

        const _transactionToProcess: IDepositTransaction = {
          id: "",
          bankTransactionDate: transaction.transactionDate,
          bankValueDate: transaction.valueDate,
          transactionDate: Date.now(),
          valueDate: Date.now(),
          amount: transaction.amount,
          accountNumber: "",
          productCode: "",
          entityNumber: "",
          sourceBank: selectedBank,
          bankReference: transaction.bankReference,
          sourceOfFunds: "",
          depositNodeType: "Parent",
          statementIdentifier: transaction.statementIdentifier,
          createdAtTime: {
            transactionQueue: Date.now()
          },

          transactionType: "CSV File",
          allocationStatus: "Unallocated",
          transactionStatus: "Unallocated",
          depositTransactionProcess: "Normal",
          sourceOfFundsAttachment: {
            url: "",
            reasonForNotAttaching: ""
          },
          proofOfPaymentAttachment: {
            url: "",
            reasonForNotAttaching: ""
          },
          description: ""
        };
        const payload = {
          transaction: _transactionToProcess,
          user: userId
        }


        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            completedCount++;
            const progress = Number(((completedCount / indexedTransactions.length) * 100).toFixed(2));
            setProgressPercentage(progress);
            return true;
          } else {
            return false;
          }
        } catch (error) {
          return false;
        }

      }
    };

    const processTransactionsInChunks = async (selectedIndexedTransactions: IIndexedTransaction[], limit: number) => {
      const chunks = [];
      for (let i = 0; i < selectedIndexedTransactions.length; i += limit) {
        chunks.push(selectedIndexedTransactions.slice(i, i + limit));
      }

      for (const chunk of chunks) {
        await Promise.all(chunk.map((selectedIndexedTransactions: IIndexedTransaction) => processTransaction(selectedIndexedTransactions)));
      }
    };

    await processTransactionsInChunks(selectedIndexedTransactions, concurrencyLimit);
    onCancel();
  }
  /**  ========================================================================Functions to handle indexed transactions end here ========================================================================================== */
  const getAccountOwner = (accNumber: string): string => {
    const mmAccount = store.mma.all.find((m) => m.asJson.accountNumber === accNumber);

    if (mmAccount) {
      return mmAccount.asJson.parentEntity;
    } else {
      return "";
    }
  }

  const getAccount = (accNumber: string): IMoneyMarketAccount | undefined => {
    const mmAccount = store.mma.all.find((m) => m.asJson.accountNumber === accNumber);
    if (mmAccount) {
      return mmAccount.asJson;
    } else {
      return undefined;
    }
  }

  const getAccountType = (accNumber: string): string => {
    const mmAccount = store.mma.all.find((m) => m.asJson.accountNumber === accNumber);

    if (mmAccount) {
      return mmAccount.asJson.accountType;
    } else {
      return "";
    }
  }

  const bankConfiguration = () => {
    switch (selectedBank) {
      case "Standard Bank":
        return BANK_STATEMENT_CONFIGURATIONS.STANDARD_BANK;
      case "Ned Bank":
        return BANK_STATEMENT_CONFIGURATIONS.NED_BANK;
      default:
        break;
    }
  }

  const config = bankConfiguration();

  const convertFileToJson = (bankName: string, file: File) => {
    Papa.parse(file, {
      complete: (result) => {
        const parsedData: CSVRow[] = result.data as CSVRow[];

        if (config) {
          const _bankName = parsedData[config.bankNameConfig.startRow][config.bankNameConfig.endRow];
          const _accountNumber = parsedData[config.accountNumberConfig.startRow][config.accountNumberConfig.endRow];

          if (_bankName === config.bankName && _accountNumber) {
            const closingBalanceIndex = parsedData.findIndex((row) =>
              row.includes(config.statementEnd)
            );

            const statementDataRaw = parsedData.slice(config.statementStart - 1, closingBalanceIndex);
            const statementDataForProcessing = parsedData.slice(config.statementStart, closingBalanceIndex);

            switch (bankName) {
              case "Standard Bank":
                const standardBankTransactions: IStandardBankStatement[] = statementDataForProcessing.map((data) => {
                  const [
                    Date = "",
                    ValueDate = "",
                    StatementNumber = "",
                    Description = "",
                    Amount = "",
                    Balance = "",
                    Type = "",
                    OriginatorReference = "",
                    CustomerReference = "",
                  ] = data;

                  return {
                    Date,
                    "Value Date": ValueDate,
                    "Statement Number": StatementNumber,
                    Description,
                    Amount,
                    Balance,
                    Type,
                    "Originator Reference": OriginatorReference,
                    "Customer Reference": CustomerReference,
                  };
                });

                const standardBankTransactionsClean: IBankStatementTransaction[] = standardBankTransactions.map((data) => ({
                  transactionDate: convertDateStringToTimestampSlash(data.Date),
                  valueDate: convertDateStringToTimestampSlash(data["Value Date"]),
                  bankReference: data["Originator Reference"].trim(),
                  amount: data.Amount,
                  balance: data.Balance,
                  statementIdentifier: `${(data["Value Date"])}-${data["Originator Reference"].trim()}-${data.Date}-${data.Amount}-${data.Balance}`,
                }));
                const sbnDeposits = standardBankTransactionsClean.filter(transaction => formatAndConvertAmount(transaction.amount) > 0);
                setTransactions(statementDataRaw);
                setStatementTransactions(sbnDeposits);
                setAccountNumber(_accountNumber);

                break;

              case "Ned Bank":
                const nedBankTransactions: INedBankStatement[] = statementDataRaw.map((data) => {
                  const [
                    TransactionDate = "",
                    ValueDate = "",
                    TransactionReferenceNo = "",
                    Description = "",
                    VatChargeIndicator = "",
                    Debit = "",
                    Credit = "",
                    Balance = "",
                  ] = data;

                  return {
                    "Transaction Date": TransactionDate,
                    "Value Date": ValueDate,
                    "Transaction Reference No.": TransactionReferenceNo,
                    Description,
                    "*VAT Charge Indicator": VatChargeIndicator,
                    Debit,
                    Credit,
                    Balance,
                  };
                });

                const nedTBankTransactionsClean: IBankStatementTransaction[] = nedBankTransactions.map((data) => ({
                  transactionDate: convertDateStringToTimestampMonth(data["Transaction Date"]) || null,
                  valueDate: convertDateStringToTimestampMonth(data["Value Date"]),
                  bankReference: data.Description,
                  amount: data.Credit,
                  balance: data.Balance,
                  statementIdentifier: `${(data["Value Date"])}-${data.Description}-${(data["Transaction Date"])}-${data.Credit}-${data.Balance}`,
                }));

                const nbnDeposits = nedTBankTransactionsClean.filter(transaction => formatAndConvertAmount(transaction.amount) > 0);

                setTransactions(statementDataRaw);
                setStatementTransactions(nbnDeposits);
                setAccountNumber(_accountNumber);
                break;
              default:
                setTransactions([]);
                setStatementTransactions([]);
                setAccountNumber("");
                setMatched([]);
                setUnmatched([]);
                break;
            }
          } else {
            swal({
              icon: "error",
              text: `${`Invalid file selected for ${bankName}`}`
            });
            setTransactions([]);
            setStatementTransactions([]);
            setAccountNumber("");
            setMatched([]);
            setUnmatched([]);
          }
        } else {
          swal({
            icon: "error",
            text: `Bank configuration not found`
          });
          setTransactions([]);
          setStatementTransactions([]);
          setAccountNumber("");
          setMatched([]);
          setUnmatched([]);
        }
      },
      header: false, // Set this to true if the first row contains headers
    });
  };

  const handleFileUploadChange = async (event: React.ChangeEvent<HTMLInputElement>) => {

    setTransactions([]);
    setStatementTransactions([]);
    setAccountNumber("");
    setMatched([]);
    setSuggestedMatch([]);
    setUnmatched([]);

    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file) {
        convertFileToJson(selectedBank, file)
      }
    }
  };

  const handleFileReUpload = async () => {
    setTransactions([]);
    setStatementTransactions([]);
    setAccountNumber("");
    setMatched([]);
    setSuggestedMatch([]);
    setUnmatched([]);
    setSelectedTab("Form");
    setIsMatching(false);
    setIsProcessing(false);

  };

  const handleUpload = () => {
    const accounts = store.mma.all;
    const matchedItems: IMatchedTransaction[] = [];
    const suggestedItems: ISuggestedMatchedTransaction[] = [];
    const unmatchedItems: IUnMatchedTransaction[] = [];
    setIsMatching(true);
    for (let index = 0; index < statementTransactions.length;) {
      setLoading(true);
      const transaction = statementTransactions[index];

      const regex = /(?<!\d)0*([1-9]\d{0,3})(?!\d)/;
      const matches = transaction.bankReference.match(regex);

      const capturedNumber = parseInt(matches ? matches[1] : "", 10);
      const searchAccount = `${capturedNumber}`;

      const match = accounts.find((mmaAccount) => mmaAccount.asJson.accountNumber === transaction.bankReference);
      const matchSuggestion = accounts.find((mmaAccount) => mmaAccount.asJson.accountNumber === `A${padNumberStringWithZero(searchAccount, 5)}`);

      const statementTrackers = store.statementTracker.all;

      const checkIfTransactionIsAlreadyRecorded = (transaction: IBankStatementTransaction) => {
        return statementTrackers.some((item) => (item.asJson.trackerCode === transaction.statementIdentifier));
      };

      if (match) {
        const _match: IMatchedTransaction = {
          matchedAccount: transaction.bankReference,
          transactionDate: transaction.transactionDate,
          valueDate: transaction.valueDate,
          bankReference: transaction.bankReference,
          amount: formatAndConvertAmount(transaction.amount),
          balance: transaction.balance,
          matchType: 'Used Client Reference',
          statementIdentifier: transaction.statementIdentifier,
          isAlreadyUploaded: checkIfTransactionIsAlreadyRecorded(transaction)
        };
        matchedItems.push(_match);
      } else if (matchSuggestion) {
        const _matchSuggestion: ISuggestedMatchedTransaction = {
          matchedAccount: `A${padNumberStringWithZero(searchAccount, 5)}`,
          transactionDate: transaction.transactionDate,
          valueDate: transaction.valueDate,
          bankReference: transaction.bankReference,
          amount: formatAndConvertAmount(transaction.amount),
          balance: transaction.balance,
          matchType: 'System Suggested',
          statementIdentifier: transaction.statementIdentifier,
          isAlreadyUploaded: checkIfTransactionIsAlreadyRecorded(transaction),
          suggestionRemark: ""
        };
        suggestedItems.push(_matchSuggestion);

      } else if (!match && !matchSuggestion) {
        const _unmatched: IUnMatchedTransaction = {
          transactionDate: transaction.transactionDate,
          valueDate: transaction.valueDate,
          bankReference: transaction.bankReference,
          amount: formatAndConvertAmount(transaction.amount),
          balance: transaction.balance,
          statementIdentifier: transaction.statementIdentifier,
          isAlreadyUploaded: checkIfTransactionIsAlreadyRecorded(transaction),
          suggestionRemark: ""
        };
        unmatchedItems.push(_unmatched);
      }
      index++
      const progressChecked = (index / statementTransactions.length) * 100;
      setDuplicateCheckProgressPercentage(progressChecked);
      setLoading(false);
    }
    setMatched(matchedItems);
    setUnmatched(unmatchedItems);
    setSuggestedMatch(suggestedItems);
    setSelectedTab("Indexing");
    setIsMatching(false);
  }

  const onSelectBank = (bankName: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the input field
    }
    setTransactions([]);
    setStatementTransactions([]);
    setAccountNumber("");
    setMatched([]);
    setUnmatched([]);
    setIndexTransactions([]);
    setSelectedBank(bankName);
    setDuplicateCheckProgressPercentage(0);
    setProgressPercentage(0);
  }

  const onCancel = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the input field
    }
    setTransactions([]);
    setStatementTransactions([]);
    setAccountNumber("");
    setMatched([]);
    setUnmatched([]);
    setIndexTransactions([]);
    setDuplicateCheckProgressPercentage(0);
    setProgressPercentage(0);
    isVisible(false);
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.BANK_STATEMENT_UPLOAD_MODAL);
  };

  useEffect(() => {
    if (selectAllMatchedRef.current) {
      selectAllMatchedRef.current.indeterminate = selectedMatchedTransactions.length > 0 && selectedMatchedTransactions.length < matched.length;
    }

    if (selectAllSuggestedRef.current) {
      selectAllSuggestedRef.current.indeterminate = selectedSuggestedTransactions.length > 0 && selectedSuggestedTransactions.length < suggestedMatch.length;
    }

    if (selectAllUnmatchedRef.current) {
      selectAllUnmatchedRef.current.indeterminate = selectedUnmatchedTransactions.length > 0 && selectedUnmatchedTransactions.length < unmatched.length;
    }

    if (selectAllIndexedRef.current) {
      selectAllIndexedRef.current.indeterminate = selectedIndexedTransactions.length > 0 && selectedIndexedTransactions.length < indexedTransactions.length;
    }

  }, [matched.length, indexedTransactions.length, selectedIndexedTransactions.length, selectedMatchedTransactions.length, selectedUnmatchedTransactions.length, unmatched.length, selectedSuggestedTransactions.length, suggestedMatch.length]);

  useEffect(() => {
    const getData = async () => {
      await api.statementTracker.getAll();
    }

    getData();

  }, [api.statementTracker]);

  return (
    <ErrorBoundary>
      <div className="custom-modal-style uk-modal-dialog uk-margin-auto-vertical uk-width-4-5">
        <button className="uk-modal-close-default" onClick={onCancel} type="button" data-uk-close></button>
        <div>
          <div className="form-title">
            <h3 className="main-title-md" style={{ marginRight: "1rem" }}>
              Bank Statement Upload
            </h3>
            <img alt="" src={`${process.env.PUBLIC_URL}/arrow.png`} />
            <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
              {selectedBank}
            </h3>
          </div>
        </div>
        <hr />

        <div className="dialog-content uk-position-relative">
          {
            selectedTab === "Form" &&
            <>
              <h4 className="main-title-md">Bank Upload Form</h4>
              <div className="">
                <div className="uk-form-controls uk-width-1-2">
                  <label className="uk-form-label" htmlFor="">Select Bank</label>
                  <select name="" id="" onChange={(e) => onSelectBank(e.target.value)}>
                    <option value="Standard Bank">Standard Bank</option>
                    <option value="Ned Bank">Ned Bank</option>
                  </select>
                </div>
                <div className="uk-form-controls">
                  <label className="uk-form-label" htmlFor="">CSV File</label>
                  <br />
                  <input ref={fileInputRef} accept=".csv" type="file" onChange={handleFileUploadChange} />
                  {
                    statementTransactions && statementTransactions.length > 0 &&
                    <p className="uk-text-small">*Click above to re-select the file</p>
                  }
                </div>
                <button onClick={handleUpload} disabled={statementTransactions.length < 0 || matched.length > 0 || unmatched.length > 0} type="button" className="btn btn-primary">
                  {isMatching ? <span data-uk-spinner={"ratio:.5"}></span> : "Match Transactions"}
                </button>
              </div>
            </>
          }
          {isMatching && <ProgressBar title="Matching and Checking for Duplicates" progress={duplicateCheckProgressPercentage} totalItems={statementTransactions.length} />}
          {isProcessing && <ProgressBar title="Processing/Uploading Transactions" progress={progressPercentage} totalItems={selectedIndexedTransactions.length} />}

          {
            selectedTab === "Indexing" &&
            <>
              <Toolbar
                leftControls={<h4 className="main-title-md">{tab}</h4>}
                rightControls={
                  <Tabs
                    data={{
                      totalTransactions: statementTransactions.length,
                      totalMatched: matched.length,
                      totalSuggestedMatches: suggestedMatch.length,
                      totalUnMatched: unmatched.length,
                      totalIndexed: indexedTransactions.length
                    }
                    } tab={tab} setTab={setTab} />
                }
              />
              {
                loading && <LoadingEllipsis />
              }
              {
                !loading && tab === "Uploaded Bank Statement" && transactions.length > 0 &&
                <StatementItemsGrid transactions={transactions} totalUploadedValue={totalUploadedValue} bankName={selectedBank} />
              }
              {
                !loading && tab === "Matched Transactions" && matched.length > 0 &&
                <MatchedItemsGrid
                  matched={matched}
                  selectedMatchedTransactions={selectedMatchedTransactions}
                  setSelectedMatchedTransactions={setSelectedMatchedTransactions}
                  handleIndexAutoAllocated={handleIndexAutoAllocated}
                  selectAllMatchedRef={selectAllMatchedRef}
                />
              }

              {
                !loading && tab === "Suggested Matches" && suggestedMatch.length > 0 &&
                // <SuggestedMatchedItemsGrid
                //   suggestedMatch={suggestedMatch}
                //   selectedSuggestedTransactions={selectedSuggestedTransactions}
                //   readySuggested={readySuggested}
                //   setSelectedSuggestedTransactions={setSelectedSuggestedTransactions}
                //   handleIndexSuggestions={handleIndexSuggestions}
                //   selectAllSuggestedRef={selectAllSuggestedRef}
                //   setSuggestedMatch={setSuggestedMatch}
                // />
                <div></div>
              }

              {
                !loading && tab === "Unmatched Transactions" && unmatched.length > 0 &&
                // <UnmatchedItemsGrid
                //   unmatched={unmatched}
                //   readyUnmatched={readyUnmatched}
                //   setUnmatched={setUnmatched}
                //   selectedUnmatchedTransactions={selectedUnmatchedTransactions}
                //   setSelectedUnmatchedTransactions={setSelectedUnmatchedTransactions}
                //   handleIndexUnallocated={handleIndexUnallocated}
                //   selectAllUnmatchedRef={selectAllUnmatchedRef} />
                <div></div>
              }

              {
                !loading && tab === "Indexed Transactions" && indexedTransactions.length > 0 &&
                <IndexedItemsGrid
                  indexedTransactions={indexedTransactions}
                  selectedIndexedTransactions={selectedIndexedTransactions}
                  setSelectedIndexedTransactions={setSelectedIndexedTransactions}
                  selectAllIndexedRef={selectAllIndexedRef}
                  handleRefreshIndexed={handleRefreshIndexed}
                />
              }
            </>
          }
        </div>
        <div className="uk-text-right">
          {
            transactions && config && accountNumber &&
            <>
              {
                readyToIndex !== indexedTransactions.length &&
                <>
                  <small className="uk-text-danger">Indexed Transactions should be updated before uploading: Selected Matched ({selectedMatchedTransactions.length}) and Selected Unmatched ({selectedUnmatchedTransactions.length}), Confirmed suggestions ({readySuggested.length}), but the Total Indexed Transactions = {indexedTransactions.length}</small><br />
                </>
              }
              {
                selectedIndexedTransactions.length === 0 &&
                <>
                  <small className="uk-text-danger">Select the Indexed Transaction(s) that should be processed/uploaded</small><br />
                </>
              }
              {
                transactions.length !== 0 && accountNumber.trim() !== config.accountNumber &&
                <small className="uk-text-danger uk-text-small uk-text-center" >The account number on this statement does not match the <b>IJG MANCO</b> account number, therefore transactions cannot be auto-allocated/uploaded </small>
              }
              {
                accountNumber.trim() === config.accountNumber &&
                <button className="btn btn-primary" onClick={() => onProcessIndexedTransactions()} disabled={selectedIndexedTransactions.length === 0}>
                  Complete Upload
                  {loading && <div data-uk-spinner={"ratio:.5"}></div>}
                </button>
              }
            </>
          }
          <button className="btn btn-primary" disabled={loading} onClick={handleFileReUpload}>
            Re Upload
          </button>
          <button className="btn btn-danger" disabled={loading} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </ErrorBoundary >
  );
});

export default BankStatementUploadModal;
