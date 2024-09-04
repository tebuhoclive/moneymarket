import { useAppContext } from "../../../../shared/functions/Context";
import showModalFromId from "../../../../shared/functions/ModalShow";
import { IInstrumentCategory } from "../../../../shared/models/InstrumentCategory";
import { IIssuer } from "../../../../shared/models/IssuerModel";
import { ICounterParty } from "../../../../shared/models/clients/counter-party/CounterPartyModel";
import MODAL_NAMES from "../../dialogs/ModalName";

interface IProps {
  category: IInstrumentCategory;
}

const CategoryItem = (props: IProps) => {
  const { api, store, } = useAppContext();

  const { category } = props;

  const handleEdit = () => {
    store.category.select(category); // set selected category
    showModalFromId(MODAL_NAMES.ADMIN.INSTRUMENT_CATEGORY_MODAL); // show modal
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove category?")) return;
    api.category.delete(category);
  };

  return (
    <div className={`settings-item uk-card uk-card-body uk-card-small`}>
      <div className="uk-grid-small uk-grid-match" data-uk-grid>
        <div className="uk-flex uk-flex-middle uk-width-1-1 uk-width-expand@m">
          <h6 className="name">
            <span className="span-label">name</span>
            {category.categoryName}
          </h6>
        </div>
        <button className="btn-icon btn-primary" onClick={handleEdit}>
          <span data-uk-icon="pencil"></span>
        </button>
        <button className="btn-icon btn-danger" onClick={handleDelete}>
          <span data-uk-icon="trash"></span>
        </button>
      </div>
    </div>
  );
};

export default CategoryItem;


interface IssuerProps {
  issuer: IIssuer;
}

export const IssuerItem = (props: IssuerProps) => {
  const { api, store, } = useAppContext();

  const { issuer } = props;

  const handleEdit = () => {
    store.issuer.select(issuer);
    showModalFromId(MODAL_NAMES.ADMIN.ISSUER_MODAL);
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove?")) return;
    api.issuer.delete(issuer);
  };

  return (
    <div className={`settings-item uk-card uk-card-body uk-card-small`}>
      <div className="uk-grid-small uk-grid-match" data-uk-grid>
        <div className="uk-flex uk-flex-middle uk-width-1-1 uk-width-expand@m">
          <h6 className="name">
            <span className="span-label">name</span>
            {issuer.issuerName}
          </h6>
        </div>
        <button className="btn-icon btn-primary" onClick={handleEdit}>
          <span data-uk-icon="pencil"></span>
        </button>
        <button className="btn-icon btn-danger" onClick={handleDelete}>
          <span data-uk-icon="trash"></span>
        </button>
      </div>
    </div>
  );
};


interface ICounterProps {
  counter: ICounterParty;
}

export const CounterPartyItem = (props: ICounterProps) => {
  const { api, store, } = useAppContext();

  const { counter } = props;

  const handleEdit = () => {
    store.counterParty.select(counter);
    showModalFromId(MODAL_NAMES.ADMIN.COUNTER_PARTY_MODAL);
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove?")) return;
    api.counterParty.delete(counter);
  };

  return (
    <div className={`settings-item uk-card uk-card-body uk-card-small`}>
      <div className="uk-grid-small uk-grid-match" data-uk-grid>
        <div className="uk-flex uk-flex-middle uk-width-1-1 uk-width-expand@m">
          <h6 className="name">
            <span className="span-label">name</span>
            {counter.counterpartyName}
          </h6>
        </div>
        <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
          <p className="role">
            <span className="span-label">Bank Name</span>
            {counter.bankName}
          </p>
        </div>
        <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
          <p className="role">
            <span className="span-label">Branch</span>
            {counter.branch}
          </p>
        </div>
        <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
          <p className="role">
            <span className="span-label">Account Number</span>
            {counter.accountNumber}
          </p>
        </div>
        <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
          <p className="role">
            <span className="span-label">Account Holder</span>
            {counter.accountHolder}
          </p>
        </div>
        <button className="btn-icon btn-primary" onClick={handleEdit}>
          <span data-uk-icon="pencil"></span>
        </button>
        <button className="btn-icon btn-danger" onClick={handleDelete}>
          <span data-uk-icon="trash"></span>
        </button>
      </div>
    </div>
  );
};