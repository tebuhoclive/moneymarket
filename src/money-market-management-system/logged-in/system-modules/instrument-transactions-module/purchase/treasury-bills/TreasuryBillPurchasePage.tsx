import { useNavigate } from 'react-router-dom';
import Toolbar from '../../../../shared/components/toolbar/Toolbar'
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PurchaseTBGrid } from './PurchaseTreasuryBillsGrid';
import { useAppContext } from '../../../../../../shared/functions/Context';
import { useEffect } from 'react';

const TreasuryBillPurchasePage = () => {

    const { api, store } = useAppContext();

    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/c/purchases');
    }

    const tbills = store.instruments.treasuryBill.all.sort((a, b) => {
        const dateA = new Date(a.asJson.issueDate || 0);
        const dateB = new Date(b.asJson.issueDate || 0);

        return dateB.getDate() - dateA.getDate();
    }).map((c) => {
        return c.asJson;
    });


    useEffect(() => {
        const loadData = async () => {
            try {
                await api.instruments.treasuryBill.getAll();
            } catch (error) { }
        };
        loadData();

    }, [api.instruments.treasuryBill, api.purchase.treasuryBill]);

    return (
        <div className="page uk-section uk-section-small">
            <div className="uk-container uk-container-expand">
                <div className="sticky-top">
                    <Toolbar
                        title="Treasury Bill Purchasing"
                        rightControls={
                            <button className="btn btn-danger" onClick={handleBack}><FontAwesomeIcon icon={faArrowLeftLong} /> Back to Instrument Categories</button>
                        }
                    />
                    <hr />
                </div>
                <div className="page-main-card uk-card uk-card-body">
                    <PurchaseTBGrid data={tbills} />
                </div>
            </div>
        </div>
    )
}

export default TreasuryBillPurchasePage
