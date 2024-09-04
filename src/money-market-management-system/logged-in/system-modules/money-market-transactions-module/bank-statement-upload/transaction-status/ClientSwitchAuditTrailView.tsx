import { useEffect } from 'react';
import { IWithdrawalTransactionAudit } from '../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionAuditModel';
import { splitAndTrimString } from '../../../../../../shared/functions/StringFunctions';
import { getClientName } from '../../../../../../shared/functions/MyFunctions';
import { useAppContext } from '../../../../../../shared/functions/Context';
import { VerifyUploadComponent } from '../../../../../../shared/components/instruction-file-upload/edit-upload-component/VerifyComponent';
import { dateFormat_YY_MM_DD_NEW } from '../../../../../../shared/utils/utils';
import { ISwitchAudit } from '../../../../../../shared/models/SwitchAuditModel';

interface IClientSwitchAuditTrailView {
    displayDetails: React.Dispatch<React.SetStateAction<boolean>>;
    auditTrail: ISwitchAudit;
}

const ClientSwitchAuditTrailView = (props: IClientSwitchAuditTrailView) => {
    const { auditTrail, displayDetails } = props;
    const { store } = useAppContext();

    useEffect(() => {
        const loadData = async () => {

        }
        loadData();
    }, []);


    return (
        <div className='view-dialog'>
            <div className="uk-grid">
                <div className="uk-width-1-1">
                    <button className='btn btn-danger' onClick={() => displayDetails(false)}>Close Audit Trail Details</button>
                </div>
            </div>
            <div className="uk-grid">
                <div className="uk-width-1-2">
                    <h4>Data before Transaction was {auditTrail.action}</h4>
                </div>
                <div className="uk-width-1-2">
                    <h4>Data after Transaction was {auditTrail.action}</h4>
                </div>
            </div>
            <div className="uk-grid uk-height-large" data-uk-overflow-auto>
                <div className="uk-width-1-2">

                    <div className="uk-grid uk-grid-small" data-uk-grid>
                        <div className="uk-width-1-3">
                            <p>Transaction Date</p>
                        </div>
                        <div className="uk-width-2-3">
                            {/* <p>{dateFormat_YY_MM_DD_NEW(auditTrail.dataStateBeforeAudit.switchDate)}</p> */}
                        </div>
                        <hr className="uk-width-1-1" />

                        <div className="uk-width-1-3">
                            <p>Value Date</p>
                        </div>
                        <div className="uk-width-2-3">
                            {/* <p>{dateFormat_YY_MM_DD_NEW(auditTrail?.dataStateBeforeAudit.ijgValueDate ?? null)}</p> */}
                        </div>
                        <hr className="uk-width-1-1" />
                        {/* <div className="uk-width-1-3">
                            <p>Client Name</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{getClientName(auditTrail.dataStateBeforeAudit, store)}</p>
                        </div>
                        <hr className="uk-width-1-1" /> */}

                        {/* <div className="uk-width-1-3">
                            <p>From Account</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{auditTrail.dataStateBeforeAudit.fromAccount}</p>
                        </div>
                        <hr className="uk-width-1-1" />
                        <div className="uk-width-1-3">
                            <p>To Account</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{auditTrail.dataStateBeforeAudit.toAccount}</p>
                        </div>
                        <hr className="uk-width-1-1" />

                        <div className="uk-width-1-3">
                            <p>Amount</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{auditTrail.dataStateBeforeAudit.amount}</p>
                        </div> */}
                        <hr className="uk-width-1-1" />

                        {/* <div className="uk-width-1-3">
                            <p>Reference</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{auditTrail.dataStateBeforeAudit.reference}</p>
                        </div>
                        <hr className="uk-width-1-1" /> */}

                        {/* <div className="uk-width-1-3">
                            <p>Status</p>
                        </div> */}
                        {/* <div className="uk-width-2-3">
                            <p>{auditTrail.dataStateBeforeAudit.switchStatus}</p>
                        </div> */}
                        <hr className="uk-width-1-1" />

                        {
                            // auditTrail.dataStateBeforeAudit.returnNote &&
                            <>
                                <div className="uk-width-1-3">
                                    <p>Return Note</p>
                                </div>
                                <div className="uk-width-2-3">
                                    {/* <p>{auditTrail.dataStateBeforeAudit.returnNote}</p> */}
                                </div>
                                <hr className="uk-width-1-1" />
                            </>
                        }
                        <div className="uk-width-1-2">
                            <div className="uk-grid uk-grid-small" data-uk-grid>
                                <div className="uk-width-1-3">
                                    <p>Transaction Date</p>
                                </div>
                                <div className={`uk-width-2-3`}>
                                </div>
                                <hr className="uk-width-1-1" />
                                <div className="uk-width-1-3">
                                    <p>Status</p>
                                </div>
                                <div className="uk-width-2-3">
                                </div>
                                <hr className="uk-width-1-1" />

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ClientSwitchAuditTrailView
