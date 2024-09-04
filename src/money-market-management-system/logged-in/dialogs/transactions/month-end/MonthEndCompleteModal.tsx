import { observer } from "mobx-react-lite"
import { useAppContext } from "../../../../../shared/functions/Context";
import { completeMonthEnd } from "../../../../../shared/functions/transactions/MonthEndRunFunctions";
import { useState } from "react";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../ModalName";

interface IProps {
    setIsVisible: (show: boolean) => void;
}

export const MonthEndCompleteModal = observer(({ setIsVisible }: IProps) => {
    const { store, api } = useAppContext();
    const [loading, setLoading] = useState(false)
    const month = new Date(Date.now()).getMonth();
    const year = new Date(Date.now()).getFullYear();

    const moneyMarketAccounts = store.mma
        .getAllLiabilityAccountsNoZeroBalances()
        .sort((a, b) =>
            a.asJson.accountNumber.localeCompare(b.asJson.accountNumber)
        ).map((a) => { return a.asJson });

    const onCancel = () => {
        setIsVisible(false);
        setLoading(false);
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_COMPLETE_MODAL)
    }

    const onCompleteMonthEnd = async () => {
        try {
            // await completeMonthEnd(
                
            //     moneyMarketAccounts,
            //     api,
            //     setLoading,
            //     `${year}`,
            //     `${month}`

            // )
            onCancel();
        } catch (error) {

        }

    }



    return (
        <div
            className="month-end-modal view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-2-3"
        >
            <button
                className="uk-modal-close-default"
                onClick={onCancel}
                type="button"
                data-uk-close
                disabled={loading}
            ></button>
            <h3 className="main-title-sm text-to-break">
                Complete Month End
            </h3>

            {loading ?
                <LoadingEllipsis />
                :
                <></>
            }
            <div className="uk-grid">
                <div className="uk-width-1-1 uk-margin">
                    <button
                        className="btn btn-danger"
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        type="button"
                        onClick={onCompleteMonthEnd}
                        disabled={loading}
                    >
                        Complete
                    </button>
                </div>
            </div>

        </div >
    )
})