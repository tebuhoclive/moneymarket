import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import { IWithdrawalPaymentBatch, defaultPaymentBatchFile } from "../../../../../../../shared/models/batches/BatchesModel";
import { BatchTransactionsGrid } from "./BatchTransactionsGrid";
import { LoadingEllipsis } from "../../../../../../../shared/components/loading/Loading";

export const BatchDetailsModal = observer(() => {
  const { store, api } = useAppContext();
  const [batch, setBatch] = useState<IWithdrawalPaymentBatch>({
    ...defaultPaymentBatchFile,
  });
  const [loading, setLoading] = useState(false);
  const foundBatch = store.batches.all.find((b) => b.asJson.id === batch.id);
  const foundBatchAsInterface = store.batches.all.find((b) => b.asJson.id === batch.id)?.asJson as IWithdrawalPaymentBatch;

  const transactions = foundBatch?.asJson.paymentBatchFileTransactions.sort((a, b) =>
    new Date(b.valueDate || 0).getTime() - new Date(a.valueDate || 0).getTime()
  ).map((t) => {
    return t;
  }) || [];

  useEffect(() => {
    if (store.batches.selected) {
      setBatch(store.batches.selected);
    } else {
    }
  }, [store.batches.selected]);

  useEffect(() => {
    const getBatches = async () => {

      try {
        await api.batches.getAll();
      } catch (error) {
      }
    };

    getBatches();
  }, [api.batches]);

  const onCancel = () => {
    // setVisible(false);
  }

  return (
    <div className="custom-modal-style uk-modal-dialog uk-width-4-5 ">
      <button className="uk-modal-close-default" onClick={onCancel} type="button" data-uk-close></button>
      <div className="form-title">
        <h3 style={{ marginRight: "1rem" }}>
          WITHDRAWAL
        </h3>
        <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
        <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
          {batch.paymentBatchFileType === "ZAR" ? "ZAR" : `${batch.paymentBatchFileType} Value`} - Payment Batch File ({batch.batchNumber})
        </h3>
      </div>
      <hr />
      {loading ?
        <LoadingEllipsis />
        :
        <div className="dialog-content uk-position-relative">
          <BatchTransactionsGrid data={transactions} batch={foundBatchAsInterface} />
        </div>
      }
    </div>
  );
});

