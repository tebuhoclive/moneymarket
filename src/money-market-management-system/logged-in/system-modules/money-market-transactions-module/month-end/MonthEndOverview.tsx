import { useEffect, useState } from "react"
import Modal from "../../../../../shared/components/Modal"
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary"
import MonthEndTabs from './MonthEndTabs';
import showModalFromId from "../../../../../shared/functions/ModalShow"
import { useAppContext } from "../../../../../shared/functions/Context"
import { PendingMonthEndRunsDataGrid } from "./PendingMonthEndRunsDataGrid"
import { observer } from "mobx-react-lite"
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import MonthEndInitiationModal from "../../../dialogs/transactions/month-end/MonthEndInitiationModal";
import ViewMonthEndInitiationModal from "../../../dialogs/transactions/month-end/ViewMonthEndInitiationModal";
import MODAL_NAMES from "../../../dialogs/ModalName";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { CompletedMonthEndRunsDataGrid } from "./CompletedMonthEndRunsDataGrid";
import { MonthEndReportModal } from "../../../dialogs/transactions/month-end/MonthEndReportModal";
import { MonthEndRollBackModal } from "../../../dialogs/transactions/month-end/MonthEndRollBackModal";
import './MonthEndOverview.scss'
import { CompletedMonthEndReport } from "../../../dialogs/transactions/month-end/CompletedMonthEndReport";
import { MonthEndRollBack } from "../../../dialogs/transactions/month-end/MonthEndRollBack";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import NormalClientStatement from "../../money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement";
import { StatementRun } from "../../../dialogs/transactions/month-end/StatementRun";
import { MonthEndCompleteModal } from "../../../dialogs/transactions/month-end/MonthEndCompleteModal";
import RoadMap from "./road-map/RoadMap";



const MonthEndOverview = observer(() => {
    const { api, store } = useAppContext();
    const [loadingData, setLoadingData] = useState(false);
    const [selectedTab, setSelectedTab] = useState("in-progress-tab");
    const month = new Date(Date.now()).getMonth();
    const year = new Date(Date.now()).getFullYear();

    //MODAL LOGIC STARTS HERE
    const [isMonthEndInitiationModal, setIsMonthEndInitiationModal] = useState(false);
    const [monthCompleted, setMonthEndComplete] = useState(false);
    const [showMonthEndReportModal, setShowMonthEndReportModal] = useState(false);
    const [showMonthEndRollBackModal, setShowMonthEndRollBackModal] = useState(false);
    const [showMonthCompletedMonthEndReport, setShowCompletedMonthEndReport] = useState(false);
    const [showViewMonthEndInitiationModal, setShowViewMonthEndInitiationModal] = useState(false);
    const [showMonthEndRollBack, setShowMonthEndRollBack] = useState(false);
    const [showStatementRun, setShowStatementRun] = useState(false);

    //MODAL LOGIC ENDS HERE
    const onInitiateMonthEnd = () => {
        setIsMonthEndInitiationModal(true)
        showModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_INITIATION_MODAL);
    }


    const monthEndRunsInProgress = store.monthEndRun.all.filter(inProgress => inProgress.asJson.status === 'Pending');
    const monthEndRunsCompleted = store.monthEndRun.all.filter(inProgress => inProgress.asJson.status === 'Completed');

    const sortedMonthEndRunsInProgress = monthEndRunsInProgress
        .map((c) => {
            return c.asJson;
        });

    const sortedMonthEndRunsCompleted = monthEndRunsCompleted
        .sort((a, b) => {
            const dateA = new Date(a.asJson.date || 0);
            const dateB = new Date(b.asJson.date || 0);

            return dateB.getTime() - dateA.getTime();
        })
        .map((c) => {
            return c.asJson;
        });

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingData(true);
                await api.monthEndRun.getAll(`${year}`);
                setLoadingData(false);
            } catch (error) { }
        };
        loadData();
    }, [api.monthEndRun, year]);



    return (
        <ErrorBoundary>
            {loadingData ?
                <LoadingEllipsis />
                :
                <div className="page uk-section uk-section-small">
                    <div className="uk-container uk-container-expand">
                        <div className="sticky-top">
                            <Toolbar
                                title="Month End"
                            />
                            <Toolbar
                                leftControls={
                                    <MonthEndTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                                }
                                rightControls={
                                    <>
                                        {/* {monthEndRunsInProgress.length === 0 && */}
                                        <button className="btn btn-primary" onClick={onInitiateMonthEnd}>{year} Initiate Month-end Run <span><FontAwesomeIcon icon={faPlus} /></span></button>
                                        {/* } */}
                                    </>
                                }
                            />
                            <hr />
                        </div>
                        <ErrorBoundary>
                            <div>
                                {
                                    selectedTab === 'in-progress-tab' &&
                                    <PendingMonthEndRunsDataGrid data={sortedMonthEndRunsInProgress} setMonthEndComplete={setMonthEndComplete} setMonthEndReport={setShowMonthEndReportModal} />
                                }
                                {
                                    selectedTab === 'completed-tab' &&
                                    <CompletedMonthEndRunsDataGrid data={sortedMonthEndRunsCompleted} setMonthEndRollBack={setShowMonthEndRollBack} setStatement={setShowStatementRun} setShowCompletedMonthEndReport={setShowMonthEndReportModal} />
                                }
                            </div>
                        </ErrorBoundary>
                    </div>
                </div>
            }
            <Modal modalId={MODAL_NAMES.BACK_OFFICE.MONTH_END_INITIATION_MODAL}>
                {isMonthEndInitiationModal && < MonthEndInitiationModal setIsVisible={setIsMonthEndInitiationModal} />}
            </Modal>
            <Modal modalId={MODAL_NAMES.BACK_OFFICE.MONTH_END_COMPLETE_MODAL}>
                {monthCompleted && < MonthEndCompleteModal setIsVisible={setMonthEndComplete} />}
            </Modal>
            <Modal modalId={MODAL_NAMES.BACK_OFFICE.MONTH_END_REPORT_MODAL}>
                {showMonthEndReportModal &&
                    <MonthEndReportModal setIsVisible={setShowMonthEndReportModal} />
                }
            </Modal>
            <Modal modalId={MODAL_NAMES.BACK_OFFICE.VIEW_MONTH_END_INITIATION_MODAL}>
                {showViewMonthEndInitiationModal && <ViewMonthEndInitiationModal setIsVisible={setShowViewMonthEndInitiationModal} />}
            </Modal>
            <Modal modalId={MODAL_NAMES.BACK_OFFICE.STATEMENT_RUN}>
                {showStatementRun && <StatementRun setIsVisible={setShowStatementRun} />}
            </Modal>
        </ErrorBoundary>
    )
})

export default MonthEndOverview
