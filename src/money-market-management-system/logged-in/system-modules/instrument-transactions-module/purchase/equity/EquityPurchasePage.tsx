import { useNavigate } from 'react-router-dom';
import Toolbar from '../../../../shared/components/toolbar/Toolbar'
import { faArrowLeftLong, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EquityGrid } from './EquityGrid';

import { useEffect, useState } from 'react';

import MODAL_NAMES from '../../../../dialogs/ModalName';
import EquityPurchaseModal from './EquityPurchaseModal';
import Modal from '../../../../../../shared/components/Modal';
import { useAppContext } from '../../../../../../shared/functions/Context';
import showModalFromId from '../../../../../../shared/functions/ModalShow';
import { IEquity } from '../../../../../../shared/models/instruments/EquityModel';

const EquityPurchasePage = () => {
    const { store, api } = useAppContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const equities: IEquity[] = store.instruments.equity.all.map((instrument) => { return instrument.asJson })
    const handleBack = () => {
        navigate('/c/purchases');
    }

    //complete function
    const purchaseEquity = () => {
        showModalFromId(MODAL_NAMES.ADMIN.PURCHASE_EQUITY_MODAL);
    }

    useEffect(() => {
        const loadData = async () => {

            try {
                setLoading(true);
                await api.instruments.equity.getAll();
                await api.issuer.getAll();
                setLoading(false);
            } catch (error) { }
        };
        loadData();
    }, [api.instruments.equity, api.issuer]);

    return (
        <div className="page uk-section uk-section-small">
            <div className="uk-container uk-container-expand">
                <div className="sticky-top">
                    <Toolbar
                        title="Equity Purchasing"
                        rightControls={
                            <>
                                <button className="btn btn-primary" onClick={purchaseEquity}><FontAwesomeIcon icon={faPlusCircle} /> Purchase Equity</button>
                                <button className="btn btn-danger" onClick={handleBack}><FontAwesomeIcon icon={faArrowLeftLong} /> Back to Instrument Categories</button>
                            </>
                        }
                    />
                    <hr />
                </div>
                <div className="page-main-card uk-card uk-card-body">
                    {!loading && <EquityGrid data={equities} />}

                </div>
            </div>

            <Modal modalId={MODAL_NAMES.ADMIN.PURCHASE_EQUITY_MODAL}>
                <EquityPurchaseModal />
            </Modal>

        </div>
    )
}

export default EquityPurchasePage
