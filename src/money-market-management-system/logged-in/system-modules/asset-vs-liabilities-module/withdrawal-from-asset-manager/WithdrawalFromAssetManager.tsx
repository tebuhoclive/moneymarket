import { useEffect } from "react"

import { useAppContext } from "../../../../../shared/functions/Context";

const WithdrawalFromAssetManager = () => {
    const {api, store} = useAppContext();

    const outFlows = store.outflow.all;

    const today = outFlows.filter(
        outflow=>outflow.asJson.transactionDate === Date.now()
    )

    useEffect(() => {
        const loadData = ()=>{
            api.outflow.getAll();
        }
        loadData();
    }, [api.outflow])
    return (
        <div className="uk-section uk-section-small">
            <div className="uk-container uk-container-expand">
                <div className="uk-card uk-card-body">

                </div>
            </div>
        </div>
    )
}

export default WithdrawalFromAssetManager
