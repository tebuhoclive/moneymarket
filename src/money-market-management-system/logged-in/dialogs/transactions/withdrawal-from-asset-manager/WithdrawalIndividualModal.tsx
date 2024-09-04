import { FormEvent, useState } from 'react'
import NumberInput from '../../../shared/components/number-input/NumberInput'
import { observer } from 'mobx-react-lite'
import ErrorBoundary from '../../../../../shared/components/error-boundary/ErrorBoundary';
import { useAppContext } from '../../../../../shared/functions/Context';
import { hideModalFromId } from '../../../../../shared/functions/ModalShow';
import { IAssetManagerFlowLiability, defaultAssetManagerFlowLiability } from '../../../../../shared/models/AssetManagerFlowLiabilityModel';
import TransactionOutflowModel from '../../../../../shared/models/TransactionOutflowModel';
import MODAL_NAMES from '../../ModalName';


interface IProps {
    transactions: TransactionOutflowModel[];
    inflows: number;
    outflows: number;
    netflow: number;
}

const WithdrawalIndividualModal = observer((props: IProps) => {
    const { api } = useAppContext();
    const { transactions, inflows, outflows, netflow } = props;

    const [redemptionRequest, setRedemptionRequest] = useState<IAssetManagerFlowLiability>({ ...defaultAssetManagerFlowLiability });
    const [loading, setLoading] = useState(false);

    const onCancel = () => {
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAW_FROM_ASSET_MANAGER.INDIVIDUAL_CORPORATE_MODAL);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        

        // swal({
        //     title: "Are you sure?",
        //     icon: "warning",
        //     buttons: ["Cancel", "Submit"],
        //     dangerMode: true,
        // }).then(async (edit) => {
        //     if (edit) {
        //         //create date
        //         const _dailyFlowDayLiability: IAssetManagerFlowLiability = {
        //             id: '',
        //             productId: 'oU2sIjtXHAJnslqFqw8Y',
        //             // openingBalance: 0,
        //             netflows: -netflow,
        //             depositAmount: netflow,
        //             numberOfDepositUnits: -redemptionRequest.numberOfDepositUnits || 0,
        //             withdrawalAmount: 0,
        //             numberOfWithdrawalUnits: redemptionRequest.numberOfWithdrawalUnits || 0,
        //             flowDate: Date.now(),
        //             toAccount: redemptionRequest.toAccount
        //         }

        //         const _dailyFlowDayAsset: IAssetManagerFlowAsset = {
        //             id: '',
        //             productId: 'oU2sIjtXHAJnslqFqw8Y',
        //             toFromAccount: redemptionRequest.toAccount,
        //             netflows: -netflow,
        //             depositAmount: 0,
        //             numberOfDepositUnits: redemptionRequest.numberOfDepositUnits || 0,
        //             withdrawalAmount: netflow,
        //             numberOfWithdrawalUnits: redemptionRequest.numberOfWithdrawalUnits || 0,
        //             flowDate: Date.now(),
        //             openingUnits: 0,
        //             closingUnits: 0
        //         }
        //         try {
        //             await api.assetManager.asset.create(_dailyFlowDayAsset);
        //             await api.assetManager.liability.create(_dailyFlowDayLiability);

        //             for (let index = 0; index < transactions.length; index++) {
        //                 const transaction = transactions[index];
        //                 const _transaction: ITransactionOutflow = {
        //                     ...transaction.asJson,
        //                     status: "withdrawn"
        //                 }
        //                 try {
        //                     await api.outflow.update(_transaction);
        //                 } catch (error) {

        //                 }
        //             }
        //         } catch (error) {

        //         }
        //         onCancel();

        //     } else {
        //         swal({
        //             icon: "error",
        //             text: "Operation cancelled!"
        //         });
        //         onCancel();
        //     }
        // })
    }

    return (
        <ErrorBoundary>
            <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-3">
                <button
                    className="uk-modal-close-default" onClick={onCancel}
                    type="button"
                    data-uk-close
                ></button>
                <h3 className="uk-modal-title text-to-break">Redemption Request</h3>
                <div className="dialog-content uk-position-relative">
                    <form className="uk-grid uk-grid-small" data-uk-grid onSubmit={handleSubmit}>

                        <div className="uk-form-controls uk-width-1-1">
                            <label className="uk-form-label required" htmlFor="">From Unit Trust Fund</label>
                            <select className="uk-select uk-form-small" name="" id="" onChange={(e) => setRedemptionRequest({ ...redemptionRequest, toAccount: e.target.value })} required>
                                <option value=""> -- select account --</option>
                                <option value="IJG Income Provider Fund – B3">IJG Income Provider Fund – B3</option>
                                <option value="IJG Income Provider Fund – A2">IJG Money Market Fund - A2</option>
                            </select>
                        </div>

                        <div className="uk-form-controls uk-width-1-1">
                            <label className="uk-form-label required" htmlFor="">Amount (NAD)</label>
                            <NumberInput   className='uk-input uk-form-small' value={netflow} onChange={(value) => setRedemptionRequest({ ...redemptionRequest, withdrawalAmount: (Number(value)) })} />
                            <small>Net Flow {(netflow)}</small>
                        </div>

                        <div>
                            <button className="btn btn-primary uk-margin-top">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ErrorBoundary >
    )
});

export default WithdrawalIndividualModal;



