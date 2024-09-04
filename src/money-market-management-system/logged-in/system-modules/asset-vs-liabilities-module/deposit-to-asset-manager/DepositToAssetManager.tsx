import { useEffect } from "react"

import { useAppContext } from "../../../../../shared/functions/Context";
import Toolbar from "../../../shared/components/toolbar/Toolbar";

const DepositToAssetManager = () => {
    const { api, store } = useAppContext();

    useEffect(() => {
        const loadData = () => {
            api.outflow.getAll();
        }
        loadData();
    }, [api.outflow])
    return (
        <div className="page uk-section uk-section-small">
            <div className="uk-container uk-container-expand">

                <div className="sticky-top">
                    <Toolbar
                        title="Deposit"
                    />
                    <hr />
                </div>

                <div className="page-main-card uk-card uk-card-body">

                </div>
            </div>
        </div>
    )
}

export default DepositToAssetManager
