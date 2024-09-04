import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../../../shared/functions/Context";
import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import ClientAccountStatementTabs from "../../client-statements/ClientAccountStatementTabs";
import NormalClientStatement from "../../client-statements/client-statement-tab-items/NormalClientStatement";
import CorrectedClientStatement from "../../client-statements/client-statement-tab-items/CorrectedClientStatement";
import NormalClientFeeStatement from "../../../../../../shared/functions/transactions/month-end-report-grid/rolled-back/NormalClientFeeStatement";
import MonthEndClientStatement from "../../client-statements/client-statement-tab-items/month-end-view/MonthEndClientStatement";

interface IProps {
  accountId: string
}

const AccountStatements = observer((props: IProps) => {
  const { api, store } = useAppContext();

  const { accountId } = props;


  const [selectedTab, setSelectedTab] = useState("client-view-tab");

  const account = store.mma.getItemById(accountId);

  useEffect(() => {
    const getData = async () => {
      try {
        await Promise.all([
          api.depositTransaction.getAll(),
          api.statementTransaction.getAll(accountId || ""),
          api.mma.getById(accountId || ""),
        ]);
      } catch (error) { }
    };

    getData();
  }, [accountId, api.depositTransaction, api.mma, api.statementTransaction]);

  return (
    <div className="uk-container uk-container-expand">
      <div className="sticky-top">
        <Toolbar title={`Client Statement`} />
        <hr />
      </div>
      <div className="page-main-card">
        <Toolbar
          rightControls={
            <ClientAccountStatementTabs
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
          }
        />
        {selectedTab === "client-view-tab" && (
          <NormalClientStatement
            moneyMarketAccountId={accountId}
          />
        )}

        {selectedTab === "correction-view-tab" && (
          <CorrectedClientStatement
            moneyMarketAccountId={accountId}
          />
        )}

        {selectedTab === "ijg-fee-view-tab" && account && (
          <NormalClientFeeStatement
            moneyMarketAccountId={accountId} account={account.asJson} />
        )}

        {selectedTab === "month-end-view-tab" && account && (
          <MonthEndClientStatement
            moneyMarketAccountId={accountId} />
        )}
      </div>
    </div>
  );
});

export default AccountStatements;
