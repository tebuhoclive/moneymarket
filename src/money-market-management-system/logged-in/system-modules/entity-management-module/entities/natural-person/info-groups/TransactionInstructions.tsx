import { useEffect, useState } from "react";
import ErrorBoundary from "../../../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import showModalFromId from "../../../../../../../shared/functions/ModalShow";
import { INaturalPerson } from "../../../../../../../shared/models/clients/NaturalPersonModel";
import MODAL_NAMES from "../../../../../dialogs/ModalName";
import EditRecurringWithdrawalModal from "../../../../../dialogs/transactions/withdrawal-transaction/EditRecurringWithdrawal";
import NaturalPersonRecurringWithdrawalModal from "../../../../../dialogs/transactions/recurring-withdrawal-instruction/NaturalPersonRecurringWithdrawalModal";
import ViewRecurringWithdrawalModal from "../../../../../dialogs/transactions/recurring-withdrawal-instruction/ViewRecurringWithdrawalModal";
import { RecurringWithdrawalsBalanceReportGrid } from "../../../../money-market-transactions-module/withdrawal-transaction/recurring-withdrawals/RecurringWithdrawalsBalanceReport";
import RecurringWithdrawalTabs from "../../../../money-market-transactions-module/recurring-withdrawals/RecurringWithdrawalTabs";
import Toolbar from "../../../../../shared/components/toolbar/Toolbar";
import Modal from "../../../../../../../shared/components/Modal";

interface ITransactionInstructionsProps {
  client: INaturalPerson;
}

export const TransactionInstructions = (
  props: ITransactionInstructionsProps
) => {
  const { client } = props;
  const { store, api } = useAppContext();
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState("pending-tab");

  const verified = store.recurringWithdrawalInstruction.all
    .sort((a, b) => {
      const dateA = new Date(a.asJson.timeVerified || 0);
      const dateB = new Date(b.asJson.timeVerified || 0);

      return dateB.getTime() - dateA.getTime();
    })
    .filter(
      (u) =>
        u.asJson.transactionStatus === "Verified" &&
        u.asJson.entity === client.entityId
    )
    .map((u) => {
      return u.asJson;
    });

  // const pending = store.recurringWithdrawalInstruction.all
  //   .sort((a, b) => {
  //     const dateA = new Date(a.asJson.timeVerified || 0);
  //     const dateB = new Date(b.asJson.timeVerified || 0);

  //     return dateB.getTime() - dateA.getTime();
  //   })
  //   .filter(
  //     (u) =>
  //       u.asJson.transactionStatus === "Pending" &&
  //       u.asJson.entity === client.entityId
  //   )
  //   .map((u) => {
  //     return u.asJson;
  //   });
  const pendingAndStopped = store.recurringWithdrawalInstruction.all
    .sort((a, b) => {
      const dateA = new Date(a.asJson.timeVerified || 0);
      const dateB = new Date(b.asJson.timeVerified || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .filter(
      (u) =>
        (u.asJson.transactionStatus === "Pending" ||
          u.asJson.transactionStatus === "Stopped") &&
        u.asJson.entity === client.entityId
    )
    .map((u) => {
      return u.asJson;
    });


  const overdrafts = store.recuralWithdrawalBalanceReport.all.map((report) => {
    return report.asJson;
  });

  const onLoadNewRecurringWithdrawalInstruction = (client: INaturalPerson) => {
    const selectedClient = store.mma.all.find(entity => entity.asJson.parentEntity === client.entityId);

    if (selectedClient) {
      store.mma.select(selectedClient.asJson);
      showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_WITHDRAWAL_RECURRING_MODAL);
    }
  };

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      Promise.all([
        api.recurringWithdrawalInstruction.getAll(),
        api.recurringWithdrawalReport.getAll(),
        api.batches.getAll(),
      ])
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
        });
    };
    loadData();
  }, [api.batches, api.recurringWithdrawalInstruction, api.recurringWithdrawalReport]);

  return (
    <ErrorBoundary>
      <div className="uk-grid uk-grid-small" data-uk-grid>
        <div className="uk-card uk-width-1-2">
          <div className="uk-card-body">
            <Toolbar
              leftControls={<h4>Debit orders</h4>}
              rightControls={
                <>
                  <button className="btn btn-primary">Load Instruction</button>
                </>
              }
            />
            <hr />
            <div className="uk-grid"></div>
          </div>
        </div>

        <div className="uk-card uk-width-1-2">
          <div className="uk-card-body">
            <Toolbar
              leftControls={<h4>Recurring Withdrawals</h4>}
              rightControls={
                <>
                  <button
                    onClick={() =>
                      onLoadNewRecurringWithdrawalInstruction(client)
                    }
                    className="btn btn-primary">
                    Load Instruction
                  </button>
                </>
              }
            />
            <hr />
            <div className="uk-grid"></div>
          </div>
          <>
            <Toolbar
              rightControls={
                <div className="uk-margin-bottom">
                  <RecurringWithdrawalTabs
                    selectedTab={selected}
                    setSelectedTab={setSelected}
                  />
                </div>
              }
            />
            <>
              {/* {selected === "pending-tab" && (
                <RecurringWithdrawalsGrid
                  data={pendingAndStopped}
                  withdrawal={undefined}
                />
              )}
              {selected === "verified-tab" && (
                <RecurringWithdrawalsGrid
                  data={verified}
                  withdrawal={undefined}
                />
              )} */}
              {selected === "report-tab" && (
                <RecurringWithdrawalsBalanceReportGrid data={overdrafts} />
              )}
            </>
            {/* <RecurringWithdrawalsGrid
                data={verified}
                withdrawal={undefined}
              /> */}
          </>
        </div>
      </div>
      {/* <Modal
        modalId={MODAL_NAMES.BACK_OFFICE.RECORD_WITHDRAWAL_RECURRING_MODAL}>
        <NaturalPersonRecurringWithdrawalModal client={client} />
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.EDIT_WITHDRAWAL_RECURRING_MODAL}>
        <EditRecurringWithdrawalModal />
      </Modal>
      {/* <Modal modalId={MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_AMEND_MODAL}>
        <EditRecurringWithdrawalModal />
      </Modal> */}
      {/* <Modal
        modalId={MODAL_NAMES.BACK_OFFICE.RETURN_WITHDRAWAL_FOR_AMENDMENT_MODAL}>
        <ReturnWithdrawalForAmendmentModal />
      </Modal> */}
      {/*<Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL}>
        <ViewRecurringWithdrawalModal />
      </Modal> */}
    </ErrorBoundary>
  );
};
