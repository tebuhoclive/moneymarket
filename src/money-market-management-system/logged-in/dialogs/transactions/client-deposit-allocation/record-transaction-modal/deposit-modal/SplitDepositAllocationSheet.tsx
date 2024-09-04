import { ChangeEvent } from "react";
import { useAppContext } from "../../../../../../../shared/functions/Context";

import "../../../../../../../shared/components/single-select/SingleSelect.scss";
import SingleSelect from "../../../../../../../shared/components/single-select/SingleSelect";
import NumberInput from "../../../../../shared/components/number-input/NumberInput";
import { IDepositTransaction } from "../../../../../../../shared/models/deposit-transaction/DepositTransactionModel";

interface IProps {
    index: number;
    accountNumber: string;
    product: string;
    email: string;
    selectedValue:string|null,
    statementReference: string;
    amount: number;
    splitTransactions: IDepositTransaction[],
    onItemChange: (index: number) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onItemRemove: (index: number) => void;
    onClientChange: (value: string, index: number) => void;
    onAmountChange: (value: number, index: number,) => void;
}

// export const SplitDepositAllocationSheet = (props: IProps) => {
//     const {
//         index,
//         accountNumber,
//         product,
//         email,
//         statementReference,
//         amount,
//         onItemChange,
//         onItemRemove,
//         onClientChange,
//         onAmountChange,
//         splitTransactions
//     } = props;

//     const { store } = useAppContext();

//     const accountsToExclude = splitTransactions.map(item => item.accountNumber);

//     const clientAccountOptions = store.mma.all
//     .filter(cli => !accountsToExclude.includes(cli.asJson.accountNumber) && cli.asJson.status === "Active")
//     .map((cli) => ({
//         label: `${cli.asJson.accountNumber}-${cli.asJson.accountName}`,
//         value: cli.asJson.accountNumber,
//     }));

//     return (
//         <tr>
//             <td>
//                 <SingleSelect value={accountNumber} options={clientAccountOptions} onChange={(value) => onClientChange(value, index)} />
//             </td>
//             <td>
//                 <NumberInput value={amount} onChange={(value) => onAmountChange(Number(value), index)}
//                 />
//             </td>
//             <td>
//                 <input type="text" name="emailAddress" value={email} onChange={onItemChange(index)} />
//             </td>
//             <td>
//                 <input placeholder={statementReference ? '': 'Deposit'} type="text" name="bankReference" value={statementReference} onChange={onItemChange(index)} />
//             </td>
//             <td>
//                 {product}
//             </td>
//             <td>
//                 <div className="uk-width-auto@s uk-flex uk-flex-center uk-flex-middle">
//                     <div className="uk-flex uk-flex-center uk-flex-middle uk-flex-inline">
//                         <div className="uk-margin uk-flex uk-flex-center uk-flex-middle">
//                             <div className="icon uk-flex uk-flex-center uk-flex-middle">
//                                 <span
//                                     className="uk-text-danger uk-margin-small-top uk-flex uk-flex-center uk-flex-middle"
//                                     data-uk-tooltip="Delete item"
//                                     onClick={() => onItemRemove(index)}
//                                     data-uk-icon="icon:  minus-circle;"
//                                 ></span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </td>
//             <td>
//                 <input
//                     className="uk-input purchase-input uk-form-small uk-display-none"
//                     type="text"
//                     name={"accountId"}
//                     onChange={onItemChange(index)}
//                     hidden
//                 />
//             </td>
//         </tr>
//     );
// };

// interface IProps {
//     index: number;
//     accountNumber: string;
//     product: string;
//     email: string;
//     statementReference: string;
//     // clientBankingDetails: string;
//     amount: number;
//     useAgent: boolean;
//     split: IDepositTransaction,
//     selectedValue:string|null,
//     splitTransactions: IDepositTransaction[],
//     clientBankingDetailsAccounts: any[],
//     agentsAccount: {
//       value: string;
//       label: string;
//     }[]
//     onItemChange: (index: number) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
//     onItemRemove: (index: number) => void;
//     onClientChange: (value: string, index: number) => void;
//     onAmountChange: (value: number, index: number,) => void;
//     handleUseAgentChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
//     handleBankAccountChange: (selectedBank: string, index: number) => void;
//     handleClientBankDetailsChange: (clientBankingDetail: string, index: number) => void;
//   }
  
  export const SplitDepositAllocationSheet = (props: IProps) => {
    const {
      index,
      product,
      email,
      statementReference,
      selectedValue,
      amount,
    //   split,
    //   handleUseAgentChange,
    //   handleClientBankDetailsChange,
      onItemChange,
      onItemRemove,
      onClientChange,
      onAmountChange,
    //   handleBankAccountChange,
    //   agentsAccount,
      splitTransactions,
    } = props;
  
    const { store } = useAppContext();
    const accountsToExclude = splitTransactions.map(item => item.accountNumber);
    const handleClientChange=(value:string, index:number)=>{
      onClientChange(value,index)
    };
    // const clientAccountOptions1 = store.mma.all
    // console.log("log deposit money accounts",clientAccountOptions1);
    
// Function to check if account name contains "Account Closed"
function isAccountClosed(accountName:string) {
    // Regex to match "Account Closed" in the account name, case-insensitive
    const regex = /Account\sClosed/i;
    return regex.test(accountName);
  }
  
  // Example usage in the filtering logic
  const clientAccountOptions = store.mma.all
    .filter(cli => 
      !accountsToExclude.includes(cli.asJson.accountNumber) && 
      cli.asJson.status === "Active" && 
      !isAccountClosed(cli.asJson.accountName)
    )
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
    return (
      <tr>
        <td>
          <SingleSelect value={selectedValue??""} oldOptions={oldOptions} options={clientAccountOptions} onChange={(value) => handleClientChange(value, index)} />
        
        </td>
       
        <td>
          <NumberInput value={amount} onChange={(value) => onAmountChange(Number(value), index)}
          />
        </td>
        <td>
          <input type="text" name="emailAddress" value={email} onChange={onItemChange(index)} />
        </td>
        {/* <td>
          <input placeholder={statementReference ? '' : 'Withdrawal'} type="text" name="bankReference" value={statementReference} onChange={onItemChange(index)} />
        </td> */}
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
  