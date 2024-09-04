import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../shared/functions/Context";
import { AllEntitiesGrid } from "./AllEntitiesGrid";

const AllEntities = observer(() => {
    const { store } = useAppContext();

    const entities = [
        ...store.client.naturalPerson.all,
        ...store.client.legalEntity.all,
        ...store.stakeholder.relatedParty.all
    ];

    const allEntities = entities.map((entities) => {
        return entities.asJson;
    });
    return (
        <div className="page-main-card">
            <AllEntitiesGrid data={allEntities} />
        </div>
    )
});

export default AllEntities
