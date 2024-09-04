import { observer } from "mobx-react-lite";
import "../../../../../../shared/components/single-select/SingleSelect.scss";
import { numberCurrencyFormat } from "../../../../../../shared/functions/Directives";

interface IProps {
    index: number;
    clientName: string;
    accountNumber: string;
    product: string;
    email: string;
    statementReference: string;
    clientBankingDetails:string;
    amount: number;
}

export const SplitWithdrawalAllocationSheetView = observer((props: IProps) => {
    const {
        clientName,
        accountNumber,
        product,
        email,
        statementReference,
        clientBankingDetails,
        amount,
    } = props;

    return (
        <tr className="">
            <td>
                {`${accountNumber} - ${clientName}`}
            </td>
            <td>
                {clientBankingDetails}
            </td>
            <td>
                {numberCurrencyFormat(amount)}
            </td>
            <td>
                {email}
            </td>
            <td>
                {statementReference}
            </td>
            <td>
                {product}
            </td>
        </tr>
    );
});
