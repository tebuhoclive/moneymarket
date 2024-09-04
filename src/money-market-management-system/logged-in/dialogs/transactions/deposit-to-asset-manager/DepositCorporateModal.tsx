import swal from 'sweetalert'
import MODAL_NAMES from '../../ModalName'
import { observer } from 'mobx-react-lite';
import { FormEvent, useState } from 'react';
import NumberInput from '../../../shared/components/number-input/NumberInput';
import ErrorBoundary from '../../../../../shared/components/error-boundary/ErrorBoundary';
import { useAppContext } from '../../../../../shared/functions/Context';
import { hideModalFromId } from '../../../../../shared/functions/ModalShow';
import { IAssetManagerFlowLiability, defaultAssetManagerFlowLiability } from '../../../../../shared/models/AssetManagerFlowLiabilityModel';
import TransactionInflowModel, { ITransactionInflow } from '../../../../../shared/models/TransactionInflowModel';


interface IProps {
    transactions: TransactionInflowModel[];
    inflows: number;
    outflows: number;
    netflow: number;
}

const DepositCorporateModal = observer((props: IProps) => {
    const { api } = useAppContext();
    const { transactions, inflows, outflows, netflow } = props;

    const [loading, setLoading] = useState(false);

    const [deposit, setDeposit] = useState<IAssetManagerFlowLiability>({ ...defaultAssetManagerFlowLiability });

    const onCancel = () => {
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.DEPOSIT_TO_ASSET_MANAGER.INDIVIDUAL_CORPORATE_MODAL);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: ["Cancel", "Submit"],
            dangerMode: true,
        }).then(async (edit) => {
            if (edit) {
                //create date
                const _dailyFlowDayLiability: IAssetManagerFlowLiability = {
                    id: '',
                    productId: 'oU2sIjtXHAJnslqFqw8Y',
                    // openingBalance: 0,
                    toAccount: deposit.toAccount,
                    netflows: netflow,
                    depositAmount: netflow,
                    numberOfDepositUnits: deposit.numberOfDepositUnits || 0,
                    withdrawalAmount: 0,
                    numberOfWithdrawalUnits: deposit.numberOfWithdrawalUnits || 0,
                    flowDate: Date.now()
                }

                try {
                    await api.assetManager.liability.create(_dailyFlowDayLiability);
                    for (let index = 0; index < transactions.length; index++) {
                        const transaction = transactions[index];
                        const _transaction: ITransactionInflow = {
                            ...transaction.asJson,
                            status: "deposited"
                        }
                        try {
                            await api.inflow.update(_transaction);
                        } catch (error) {

                        }
                    }
                } catch (error) {

                }
                onCancel();
                
            } else {
                swal({
                    icon: "error",
                    text: "Operation cancelled!"
                });
                onCancel();
            }
        })
    }

    return (
        <ErrorBoundary>
            <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-3">
                <button
                    className="uk-modal-close-default" onClick={onCancel}
                    type="button"
                    data-uk-close
                ></button>
                <h3 className="uk-modal-title">Deposit to Asset Manager</h3>
                <div className="dialog-content uk-position-relative uk-padding-small">
                    <form className="uk-grid" data-uk-grid onSubmit={handleSubmit}>

                        <div className="uk-form-controls uk-width-1-1">
                            <label className="uk-form-label required" htmlFor="">To Unit Trust Fund</label>
                            <select className="uk-select uk-form-small" name="" id="">
                                <option value=""> -- select account --</option>
                                <option value="IJG Income Provider Fund – B1">IJG Income Provider Fund – B3</option>
                                <option value="IJG Income Provider Fund – B2">IJG Money Market Fund - A2</option>
                            </select>
                        </div>

                        <div className="uk-form-controls uk-width-1-1">
                            <label className="uk-form-label required" htmlFor="">Amount (NAD)</label>
                            <NumberInput   className='uk-input uk-form-small' value={netflow} onChange={(value) => setDeposit({ ...deposit, netflows: Number(value) })} />
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

export default DepositCorporateModal;



