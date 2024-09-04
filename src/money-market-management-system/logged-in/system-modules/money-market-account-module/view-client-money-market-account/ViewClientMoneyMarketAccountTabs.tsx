import { ChangeEvent } from "react";
import "./ViewClientMoneyMarketAccountTabs.scss";

interface TabProps {
    id: string;
    name: string;
    selectedTab: string;
    handleTabChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Tab: React.FC<TabProps> = ({
    id,
    name,
    selectedTab,
    handleTabChange,
}) => {
    return (
        <>
            <label className="tab" htmlFor={id}>
                <div className="uk-width-1-2 uk-text-center">
                    {name}
                </div>

            </label>
            <input
                type="radio"
                id={id}
                name="tabs"
                checked={selectedTab === id}
                onChange={handleTabChange}
            />
        </>
    );
};

interface IProps {
    selectedTab: string;
    setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const ViewClientMoneyMarketAccountTabs = (props: IProps) => {
    const { selectedTab, setSelectedTab } = props;

    const handleTabChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setSelectedTab(event.target.id);
    };

    return (
        <div className="account-module-tabs">
            <div className="tabs">
                <Tab
                    id="general-information-tab"
                    name="General Information"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="income-distribution-tab"
                    name="Income Distribution"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="transaction-limitation-tab"
                    name="Transaction Limitation"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="withholding-tax-tab"
                    name="Withholding Tax NRST"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="cession-tab"
                    name="Cession"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="transaction-history-tab"
                    name="Transaction History"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="communication-filing-tab"
                    name="Communication Filing"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <Tab
                    id="audit-trail-tab"
                    name="Audit Trail"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                />
                <span className="glider"></span>
            </div>
        </div>
    );
};

export default ViewClientMoneyMarketAccountTabs;
