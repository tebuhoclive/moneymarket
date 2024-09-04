import { IDepositTransaction, depositTransactionProcess } from "../../../../../shared/models/deposit-transaction/DepositTransactionModel";

// Define the TransactionType component
interface IProp {
    transaction: IDepositTransaction;
}

export const ReturnedTransaction = ({ transaction }: IProp) => {
    const getDotStyle = () => {
        return {
            backgroundColor: 'red',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            display: 'inline-block'
        };
    };

    return (
        <>
            {transaction.note && (
                <span data-uk-tooltip={transaction.note} style={getDotStyle()}></span>
            )}
        </>
    );
};
