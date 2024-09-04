import { ChangeEvent, useEffect, useState } from "react";
import { IWithdrawalTransaction } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { useAppContext } from "../../../../../../shared/functions/Context";
import SingleSelect from "../../../../../../shared/components/single-select/SingleSelect";
import NumberInput from "../../../../shared/components/number-input/NumberInput";
import { getAccount, getEntity } from "../../../../../../shared/functions/transactions/BankStatementUpload";

interface IProps {
  index: number;
  accountNumber: string;
  product: string;
  email: string;
  statementReference: string;
  clientBankingDetails: string;
  amount: number;
  useAgent: boolean;
  split: IWithdrawalTransaction,
  selectedValue:string|null,
  splitTransactions: IWithdrawalTransaction[],
  clientBankingDetailsAccounts: any[],
  agentsAccount: {
    value: string;
    label: string;
  }[]
  onItemChange: (index: number) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onItemRemove: (index: number) => void;
  onClientChange: (value: string, index: number) => void;
  onAmountChange: (value: number, index: number,) => void;
  handleUseAgentChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  handleBankAccountChange: (selectedBank: string, index: number) => void;
  handleClientBankDetailsChange: (clientBankingDetail: string, index: number) => void;
}
type BankingDetailItem = {
    label: string;
    value: string;
  };
export const SplitWithdrawalAllocationSheetAmend = (props: IProps) => {
  const {
    index,
    product,
    email,
    statementReference,
    amount,
    split,
    handleUseAgentChange,
    handleClientBankDetailsChange,
    onItemChange,
    onItemRemove,
    onClientChange,
    onAmountChange,
    handleBankAccountChange,
    agentsAccount,
    splitTransactions,
  } = props;

  const { store } = useAppContext();
  const accountsToExclude = splitTransactions.map(item => item.accountNumber);
  const [bankingDetails,setBankingDetails]=useState<BankingDetailItem[]>([])
  const handleClientChange=(value:string, index:number)=>{
    onClientChange(value,index)
    if(split && split.bankingDetails && split.bankingDetails.length !==0){
        setBankingDetails(split.bankingDetails)
      }
  };

  const clientAccountOptions = store.mma.all
    .filter(cli => !accountsToExclude.includes(cli.asJson.accountNumber) && cli.asJson.status === "Active")
    .map((cli) => ({
      label: `${cli.asJson.accountNumber}-${cli.asJson.accountName}`,
      value: cli.asJson.accountNumber,
    }));
    const oldOptions = store.mma.all
    .filter(cli => cli.asJson.status === "Active")
    .map((cli) => ({
      label: `${cli.asJson.accountNumber}-${cli.asJson.accountName}`,
      value: cli.asJson.accountNumber,
    }));
    const accountDetails = getAccount(split.accountNumber, store);
    const entity = getEntity(accountDetails?.parentEntity || "", store);
    const onHandleBankAccountChange=(value:string,index:number)=>{
        handleBankAccountChange(value,index)
    }
    useEffect(() => {
        if (accountDetails && entity) {
          let newClientBankingDetailsAccounts: BankingDetailItem[] = [];
          
          if (Array.isArray(entity.bankingDetail)) {
            newClientBankingDetailsAccounts = entity.bankingDetail.map((clientBankingDetailsDetail) => ({
              label: `${clientBankingDetailsDetail.bankName} | ${clientBankingDetailsDetail.accountNumber} | ${clientBankingDetailsDetail.accountHolder} | ${clientBankingDetailsDetail.branchNumber}`,
              value: `${clientBankingDetailsDetail.bankName} | ${clientBankingDetailsDetail.accountNumber} | ${clientBankingDetailsDetail.accountHolder} | ${clientBankingDetailsDetail.branchNumber}`,
            }));
          } else if (typeof entity.bankingDetail === "object" && entity.bankingDetail !== null) {
            const { bankName, accountHolder, accountNumber, branchNumber } = entity.bankingDetail;
            const label = `${bankName} | ${accountNumber} | ${accountHolder} | ${branchNumber}`;
            const value = `${bankName} | ${accountNumber} | ${accountHolder} | ${branchNumber}`;
            newClientBankingDetailsAccounts.push({ label, value });
          } else {
          }
          setBankingDetails(newClientBankingDetailsAccounts);
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [split]);
  return (
    <tr>
      <td>
        <SingleSelect value={split.accountNumber??""} oldOptions={oldOptions} options={clientAccountOptions} onChange={(value) => handleClientChange(value, index)} />
      
      </td>
      <td>
        <label className={`uk-form-label uk-display-block`}>
          {split.useAgent ? 'Uncheck for payment to the Client' : 'Make payment to Agent?'}
          <input
            className="uk-checkbox"
            type="checkbox"
            checked={split?.useAgent}
            onChange={(e) => handleUseAgentChange(e, index)}
            style={{ marginLeft: "10px" }}
          />
        </label>
      </td>
      <td>
        {!split.useAgent && (
          <div className="uk-width-1-1">
            <select
              value={split?.clientBankingDetails || ''}
              onChange={(e) => onHandleBankAccountChange(e.target.value, index)}
            >
              <option value="">Select banking details...</option>
              {(bankingDetails ?? []).map((account) => (
                <option key={account.value} value={account.value}>
                  {account.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {split.useAgent && (
          <div className="uk-width-1-1">
            <select
              value={split?.clientBankingDetails}
              id="client-clientBankingDetails-account"
              name={"client-clientBankingDetails-account"}
              onChange={(e) => handleClientBankDetailsChange(e.target.value, index)}
            >
              <option value="" selected>
                Select agent...
              </option>
              {agentsAccount &&
                agentsAccount.map((acc) => (
                  <option key={acc.value} value={acc.value}>
                    {acc.label}
                  </option>
                ))}
            </select>
          </div>
        )}            </td>
      <td>
        <NumberInput value={amount} onChange={(value) => onAmountChange(Number(value), index)}
        />
      </td>
      <td>
        <input type="text" name="emailAddress" value={email} onChange={onItemChange(index)} />
      </td>
      <td>
        <input placeholder={statementReference ? '' : 'Withdrawal'} type="text" name="bankReference" value={statementReference} onChange={onItemChange(index)} />
      </td>
      <td>
        {product}
      </td>
      <td>
        <div className="uk-width-auto@s uk-flex uk-flex-center uk-flex-middle">
          <div className="uk-flex uk-flex-center uk-flex-middle uk-flex-inline">
            <div className="uk-margin uk-flex uk-flex-center uk-flex-middle">
              <div className="icon uk-flex uk-flex-center uk-flex-middle">
                <span
                  className="uk-text-danger uk-margin-small-top uk-flex uk-flex-center uk-flex-middle"
                  data-uk-tooltip="Delete item"
                  onClick={() => onItemRemove(index)}
                  data-uk-icon="icon:  minus-circle;"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </td>
      <td>
        <input
          className="uk-input purchase-input uk-form-small uk-display-none"
          type="text"
          name={"accountId"}
          onChange={onItemChange(index)}
          hidden
        />
      </td>
    </tr>
  );
};
