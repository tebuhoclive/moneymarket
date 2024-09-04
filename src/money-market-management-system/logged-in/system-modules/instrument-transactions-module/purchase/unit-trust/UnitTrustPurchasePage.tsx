import { useNavigate } from 'react-router-dom';
import Toolbar from '../../../../shared/components/toolbar/Toolbar'
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useEffect, useState } from 'react';
import { UnitsGrid } from './UnitTrustGrid';
import { useAppContext } from '../../../../../../shared/functions/Context';
import { IUnitTrust } from '../../../../../../shared/models/instruments/UnitTrustModel';

const UnitTrustPurchasePage = () => {
    const { store, api } = useAppContext()
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const handleBack = () => {
        navigate('/c/purchases');
    }
    const unitTrust: IUnitTrust[] = store.instruments.unitTrust.all.map((instrument) => { return instrument.asJson })

    useEffect(() => {
        const loadData = async () => {

            try {
                setLoading(true);
                await api.instruments.unitTrust.getAll();
                await api.issuer.getAll();
                setLoading(false);
            } catch (error) { }
        };
        loadData();
    }, [api.instruments.unitTrust, api.issuer]);

    return (
        <div className="page uk-section uk-section-small">
            <div className="uk-container uk-container-expand">
                <div className="sticky-top">
                    <Toolbar
                        title="Unit Trust Purchasing"
                        rightControls={
                            <button className="btn btn-danger" onClick={handleBack}><FontAwesomeIcon icon={faArrowLeftLong} /> Back to Instrument Categories</button>
                        }
                    />
                    <hr />
                </div>
                <div className="page-main-card uk-card uk-card-body">
                    {
                        !loading && <UnitsGrid data={unitTrust} />
                    }

                </div>
            </div>
        </div>
    )
}

export default UnitTrustPurchasePage
