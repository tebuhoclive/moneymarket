import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../shared/functions/Context";
import Modal from "../../../../shared/components/Modal";
import ErrorBoundary from "../../../../shared/components/error-boundary/ErrorBoundary";
import showModalFromId from "../../../../shared/functions/ModalShow";

import { useNavigate } from "react-router-dom";

import MODAL_NAMES from "../../dialogs/ModalName";
import BondModal from "../../dialogs/instruments/BondModal";
import EquityModal from "../../dialogs/instruments/EquityModal";
import FixedDepositModal from "../../dialogs/instruments/FixedDepositModal";
import TreasuryBillModal from "../../dialogs/instruments/TreasuryBillModal";
import UnitTrustModal from "../../dialogs/instruments/UnitTrustModal";
import Toolbar from "../../shared/components/toolbar/Toolbar";

interface ICardProps {
  title: string;
  onCreateNew: () => void;
  onView: () => void;
}

const InstrumentCard = (props: ICardProps) => {
  const { store } = useAppContext();
  const user = store.auth.meJson;

  const { title, onCreateNew, onView } = props;
  const hasInstrumentManagementPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Instrument Management" && feature.create === true
  );
  return (
    <ErrorBoundary>
      <div className="instrument-card uk-card uk-card-body">
        <div>
          <h4 className="uk-card-title in-title">{title}</h4>
          <div className="in-card-footer">
            {hasInstrumentManagementPermission && (
              <>
                {" "}
                <div>
                  <button className="btn btn-primary" onClick={onView}>
                    View
                  </button>
                </div>
                <div>
                  <button className="btn btn-primary" onClick={onCreateNew}>
                    Add New
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

const Instruments = observer(() => {
  const { api } = useAppContext();
  const navigate = useNavigate();

  const createTreasuryBill = () => {
    showModalFromId(MODAL_NAMES.ADMIN.TREASURY_BILL_MODAL);
  };
  const createBond = () => {
    showModalFromId(MODAL_NAMES.ADMIN.BOND_MODAL);
  };

  const createFixedDeposit = () => {
    showModalFromId(MODAL_NAMES.ADMIN.FIXED_DEPOSIT_MODAL);
  };
  const createEquity = () => {
    showModalFromId(MODAL_NAMES.ADMIN.EQUITY_MODAL);
  };
  const createUnitTrust = () => {
    showModalFromId(MODAL_NAMES.ADMIN.UNIT_TRUST_MODAL);
  };
  const createCallDeposit = () => {
    showModalFromId(MODAL_NAMES.ADMIN.UNIT_TRUST_MODAL);
  };

  const onViewTreasuryBill = () => {
    navigate(`/c/instruments/tbill`);
  };
  const onViewBond = () => {
    navigate(`/c/instruments/bond`);
  };
  const onViewFixedDeposit = () => {
    navigate(`/c/instruments/fd`);
  };
  const onViewEquity = () => {
    navigate(`/c/instruments/equities`);
  };
  const onViewUnitTrust = () => {
    navigate(`/c/instruments/ut`);
  };
  const onViewCallDeposit = () => {
    navigate(`/c/instruments/cd`);
  };


  useEffect(() => {
    const loadAll = async () => {
      try {
        await api.issuer.getAll();
      } catch (error) {}
    };
    loadAll();
  }, [api.issuer]);

  return (
    <ErrorBoundary>
      <div className="page uk-section uk-section-small">
        <div className="uk-container uk-container-expand">
          <div className="sticky-top">
            <Toolbar title="Instrument Categories" />
            <hr />
          </div>

          <div className="page-main-card uk-card uk-card-default uk-card-body">
            <div className="uk-child-width-1-3@s uk-grid-match" data-uk-grid>
              <div>
                <InstrumentCard
                  title={"Treasury Bills"}
                  onCreateNew={createTreasuryBill}
                  onView={onViewTreasuryBill}
                />
              </div>
              <div>
                <InstrumentCard
                  title={"Bonds"}
                  onCreateNew={createBond}
                  onView={onViewBond}
                />
              </div>
              <div>
                <InstrumentCard
                  title={"Fixed Deposits"}
                  onCreateNew={createFixedDeposit}
                  onView={onViewFixedDeposit}
                />
              </div>
              <div>
                <InstrumentCard
                  title={"Equities"}
                  onCreateNew={createEquity}
                  onView={onViewEquity}
                />
              </div>
              <div>
                <InstrumentCard
                  title={"Unit Trusts"}
                  onCreateNew={createUnitTrust}
                  onView={onViewUnitTrust}
                />
              </div>
              <div>
                <InstrumentCard
                  title={"Call Deposits"}
                  onCreateNew={createCallDeposit}
                  onView={onViewCallDeposit}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal modalId={MODAL_NAMES.ADMIN.FIXED_DEPOSIT_MODAL}>
        <FixedDepositModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.ADMIN.TREASURY_BILL_MODAL}>
        <TreasuryBillModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.ADMIN.BOND_MODAL}>
        <BondModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.ADMIN.UNIT_TRUST_MODAL}>
        <UnitTrustModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.ADMIN.EQUITY_MODAL}>
        <EquityModal />
      </Modal>
    </ErrorBoundary>
  );
});

export default Instruments;
