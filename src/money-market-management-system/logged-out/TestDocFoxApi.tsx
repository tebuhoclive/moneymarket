import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../shared/functions/Context";

const TestDocFoxApi = observer(() => {
    const { api, store } = useAppContext();

    const riskRatings = store.docFoxApplicationRiskRating.all
    // console.log("Risk",riskRatings);
    
    useEffect(() => {
        const loadData = async () => {

            // await api.docfox.kycApplications.getKYCApplicationRelatedEntities("000eb6d7-0a76-4eb2-8d14-6f2b4a55c9c7");
            await api.docfox.kycApplications.getKYCApplicationRiskRatings("042fb806-43b9-441f-96dc-62c1c01702b9");
            await api.docfox.kycProfiles.getKYCProfileAdditionalDetails("de5441ed-1230-4578-8952-7fd75db3d054");
            await api.docfox.kycProfiles.getKYCProfileAddresses("de5441ed-1230-4578-8952-7fd75db3d054");
            await api.docfox.kycProfiles.getKYCProfileContacts("de5441ed-1230-4578-8952-7fd75db3d054");
            await api.docfox.kycProfiles.getKYCProfileNumbers("de5441ed-1230-4578-8952-7fd75db3d054");
        }
        loadData()
    }, [api.docfox.kycApplications, api.docfox.kycProfiles])

    return (
        <div className="uk-section">
            <div className="uk-container">
                {
                    riskRatings.map((riskRating, index) => (
                        <p key={index}>{riskRating.asJson.rating} {riskRating.asJson.status}</p>
                    ))
                }
            </div>
        </div>
    )
});

export default TestDocFoxApi
