import { ChangeEvent } from "react";
import "./MoneyMarketTabs.scss";

interface TabProps {
    index: number;
    id: string;
    name: string;
    selectedTab: string;
    handleTabChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const Tab: React.FC<TabProps> = ({
    id,
    index,
    name,
    selectedTab,
    handleTabChange,
}) => {
    return (
        <>
            <label className="tab" htmlFor={id}>
                {name}
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

const MoneyMarketTabs = (props: IProps) => {

    const { selectedTab, setSelectedTab } = props;

    const handleTabChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        setSelectedTab(event.target.id);
    };

    return (
        <div className="tab-container-money-market">
            <div className="tabs">
                <Tab
                    id="cashflow-tab"
                    name="Cashflow"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={1}
                />
                <Tab
                    id="interest-tab"
                    name="Interest"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={2}
                />
                <Tab
                    id="holdings-tab"
                    name="Holdings"
                    selectedTab={selectedTab}
                    handleTabChange={handleTabChange}
                    index={3}
                />
                <span className="glider"></span>
            </div>
        </div>
    );
};

export default MoneyMarketTabs;
