import { depositTransactionProcess } from "../../../../../shared/models/deposit-transaction/DepositTransactionModel";

// Define the TransactionType component
interface IProp {
    type: depositTransactionProcess;
}

export const TransactionType = ({type}: IProp) => {
    // Define the styles based on the transaction type
    const getDotStyle = (type: depositTransactionProcess) => {
        switch (type) {
            case 'Future-Dated':
                return { backgroundColor: 'blue', width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' };
            case 'Back-Dated':
                return { backgroundColor: 'red', width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' };
            case 'Normal':
                return { backgroundColor: 'green', width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' };
            default:
                return { backgroundColor: 'grey', width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' };
        }
    };

    return (
        <span data-uk-tooltip={type} style={getDotStyle(type)}></span>
    );
};