import { ICessionInstruction } from '../../../../../../shared/models/cession/CessionInstructionModel';
import { observer } from 'mobx-react-lite';

import Modal from '../../../../../../shared/components/Modal';
import MODAL_NAMES from '../../../../dialogs/ModalName';
import CessionModal from '../../../../dialogs/money-market-account/cession/CessionModal';

import { IMoneyMarketAccount } from '../../../../../../shared/models/money-market-account/MoneyMarketAccount';

import CessionTabs from './CessionTabs';
import { useState } from 'react';
import CessionPendingQueueGrid from './queues/CessionPendingQueueGrid';
import CessionFirstLevelQueueGrid from './queues/CessionFirstLevelQueueGrid';
import { ToolbarNew } from '../../../../shared/components/toolbar/Toolbar';
import CessionUpliftedQueueGrid from './queues/CessionUpliftedQueueGrid';
import CessionActiveQueueGrid from './queues/CessionActiveQueueGrid';
import CessionSecondLevelQueueGrid from './queues/CessionSecondLevelQueueGrid';

interface IProps {
  account: IMoneyMarketAccount;
  data: ICessionInstruction[]
}

const Cession = observer((props: IProps) => {

  const { data, account } = props;
  const [selectedTab, setSelectedTab] = useState("pending-cessions-tab");


  const getSelectedTabName = () => {
    switch (selectedTab) {
      case "pending-cessions-tab":
        return "Pending Account Cessions";
      case "first-level-cessions-tab":
        return "First Level Approval";
      case "second-level-cessions-tab":
        return "Second Level Approval";
      case "approved-cessions-tab":
        return "Approved Account Cessions";
      case "uplifted-cessions-tab":
        return "Uplifted Account Cessions";
      default:
        break;
    }
  }

  const pendingCessions = data.filter(pending => pending.cessionStatus === "Pending");
  const firstLevelCessions = data.filter(pending => pending.cessionStatus === "First Level");
  const secondLevelCessions = data.filter(pending => pending.cessionStatus === "Second Level");
  const activeCessions = data.filter(pending => pending.cessionStatus === "Active");
  const upliftedCessions = data.filter(pending => pending.cessionStatus === "Uplifted");

  return (
    <div className="grid">
      <div className="uk-margin-small-bottom">
        <ToolbarNew
          title={
            <h4 className='main-title-md'>{getSelectedTabName()}</h4>
          }
          rightControls={
            <CessionTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
          }
        />

      </div>
      {
        selectedTab === "pending-cessions-tab" &&
        <CessionPendingQueueGrid account={account} data={pendingCessions} />
      }

      {
        selectedTab === "first-level-cessions-tab" &&
        <CessionFirstLevelQueueGrid account={account} data={firstLevelCessions} />
      }

      {
        selectedTab === "second-level-cessions-tab" &&
        <CessionSecondLevelQueueGrid account={account} data={secondLevelCessions} />
      }

      {
        selectedTab === "approved-cessions-tab" &&
        <CessionActiveQueueGrid account={account} data={activeCessions} />
      }

      {
        selectedTab === "uplifted-cessions-tab" &&
        <CessionUpliftedQueueGrid account={account} data={upliftedCessions} />
      }

      <Modal modalId={MODAL_NAMES.ADMIN.CESSION_LOADING} >
        <CessionModal />
      </Modal>
    </div>
  )
});

export default Cession
