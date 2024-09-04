import { observer } from "mobx-react-lite";

import "../../../../../../../shared/components/single-select/SingleSelect.scss";
import { numberCurrencyFormat } from "../../../../../../../shared/functions/Directives";

interface IProps {
    index: number;
    clientName: string;
    accountNumber: string;
    product: string;
    email: string;
    statementReference: string;
    amount: number;
}

export const SplitDepositAllocationSheetView = observer((props: IProps) => {
    const {
        clientName,
        accountNumber,
        product,
        email,
        statementReference,
        amount,
    } = props;

    return (
        <tr className="">
            <td>
                {`${accountNumber} - ${clientName}`}
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
