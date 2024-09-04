import { useEffect, useState } from "react";

import swal from "sweetalert";

import { observer } from "mobx-react-lite";
import MODAL_NAMES from "../../ModalName";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { IMoneyMarketAccountPurchase } from "../../../../../shared/models/MoneyMarketAccountPurchase";
import { IPurchaseTreasuryBill, defaultPurchaseTreasuryBill } from "../../../../../shared/models/purchases/treasury-bills/TreasuryBillPurchaseModel";

const TreasuryBillHoldingsModal = observer(() => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [treasuryBill, setTreasuryBill] = useState<IPurchaseTreasuryBill>({
    ...defaultPurchaseTreasuryBill,
  });

  const executionFIle = store.purchase.treasuryBillExecution.all;

  const moneyMarketAccountNumber = (moneyMarketAccountId: string) => {
    const account = store.mma.all.find(
      (mma) => mma.asJson.id === moneyMarketAccountId
    );
    return account ? account.asJson.accountNumber : "";
  };

  const clientBalance = (moneyMarketAccountNumber: string) => {
    const account = store.mma.all.find(
      (mma) => mma.asJson.id === moneyMarketAccountNumber
    );
    return account ? account.asJson.balance : 0;
  };

  const onCancel = () => {
    store.purchase.treasuryBill.clearSelected();
    hideModalFromId(
      MODAL_NAMES.BACK_OFFICE.TREASURY_BILL_PURCHASE_PROCESSING_MODAL
    );
  };

  const onProcess = async (allocation: any) => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Process"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        if (treasuryBill) {
          await api.purchase.treasuryBill.createPurchaseHolding(
            treasuryBill.id,
            allocation
          );
          allocation.status = "successfull";
          await api.purchase.treasuryBill.updatePurchaseNewTenderSheet(
            treasuryBill.id,
            allocation
          );
          const mmaPurchase: IMoneyMarketAccountPurchase = {
            instrumentType: "Treasury Bill",
            ...allocation,
          };
          await api.purchase.treasuryBill.createPurchaseInAccount(
            allocation.moneyMarketAccountNumber,
            mmaPurchase
          );
          const newBalance =
            clientBalance(allocation.moneyMarketAccountNumber) -
            allocation.considerationClient;

          const selectedMMA = store.mma.getItemById(
            allocation.moneyMarketAccountNumber
          );

          if (selectedMMA) {
            selectedMMA.asJson.balance = newBalance;
            onCancel();
          }
          console.log("jgkdjkfdj");

          // TODO save the clients transaction file to the database under the purchase

          // TODO send the wealth manage and client
          // const email = MAIL_TB_DESK_DEALING_SHEET(allocator?.displayName, purchase.instrumentName, dealingDesk)
          // await api.mail.sendMail(["peangesheya@yahoo.com"], "np-reply@ijgmms.net", "TB Tender Submission", email.BODY)
        } else {
        }
        swal({
          text: "Tender processed!",
          icon: "success",
        });
      } else {
        swal({
          text: "The tender has not been processed, the user has cancelled the action!",
          icon: "error",
        });
      }
    });
  };

  useEffect(() => {
    if (store.purchase.treasuryBill.selected) {
      setTreasuryBill(store.purchase.treasuryBill.selected);
    }
  }, [store.purchase.treasuryBill.selected]);

  useEffect(() => {

      if (treasuryBill) {
        const loadOtherData = async () => {
          setLoading(true);
          if(treasuryBill){
            console.log(treasuryBill.id);
            
          }
          setLoading(false);
        };
        loadOtherData();
    }
  }, [api.purchase.treasuryBill, store.purchase.treasuryBill.selected, treasuryBill]);

  return (
    <div className="uk-modal-dialog uk-modal-body uk-width-expand">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
        onClick={onCancel}
      />
      <h4 className="main-title-sm">Processing Treasury Bill Purchases</h4>
      {!loading && (
        <table className="uk-table uk-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>MM Account</th>
              <th>MM Account Balance</th>
              <th>Available Balance</th>
              <th>Net Balance</th>
              <th>Nominal</th>
              <th>Tender Rate</th>
              <th>Client Rate</th>
              <th>Consideration BON</th>
              <th>Consideration Client</th>
              <th>Counter Party</th>
              <th>Profit</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {executionFIle.map((tender) => (
              <tr key={tender.asJson.id}>
                <td>{tender.asJson.clientName}</td>
                <td>
                  {moneyMarketAccountNumber(
                    tender.asJson.moneyMarketAccountNumber
                  )}
                </td>
                <td>
                  {(
                    clientBalance(tender.asJson.moneyMarketAccountNumber)
                  )}
                </td>
                <td>
                  {(
                    clientBalance(tender.asJson.moneyMarketAccountNumber)
                  )}
                </td>
                <td>
                  {(
                    clientBalance(tender.asJson.moneyMarketAccountNumber) -
                      tender.asJson.considerationClient
                  )}
                </td>
                <td>{(tender.asJson.newNominal)}</td>
                <td>{tender.asJson.tenderRate}</td>
                <td>{tender.asJson.clientRate}</td>
                <td>{(tender.asJson.considerationBON)}</td>
                <td>{(tender.asJson.considerationClient)}</td>
                <td>{tender.asJson.counterParty}</td>
                <td>{(tender.asJson.profit)}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => onProcess(tender.asJson)}
                  >
                    Process
                  </button>
                </td>
              </tr>
            ))}
            {executionFIle.length === 0 && <td colSpan={13}>No data</td>}
          </tbody>
        </table>
      )}
      {loading && <LoadingEllipsis />}
    </div>
  );
});

export default TreasuryBillHoldingsModal;
