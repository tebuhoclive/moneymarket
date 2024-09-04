import { ChangeEvent } from 'react';
import NumberInput from '../../../../../shared/components/number-input/NumberInput';
import SingleSelect from '../../../../../../../shared/components/single-select/SingleSelect';
import { useAppContext } from '../../../../../../../shared/functions/Context';
import { IFolderFile } from '../../../../../../../shared/models/FolderFile';
import { IBondPurchaseTransaction } from '../../../../../../../shared/models/purchases/bonds/BondPurchaseTransactionModel';

type ValidFieldNames = keyof IBondPurchaseTransaction;

interface IProps {
  index: number;
  id?: string,
  clientName: string;
  clientId?: string;
  moneyMarketAccountNumber: string;
  moneyMarketBalance: number;
  availableBalance: number;
  netBalance: number;
  newNominal: number;
  altTreasuryBill: string;
  tenderRate: number;
  margin: number;
  clientRate: number;
  counterParty: string;
  considerationBON: number;
  considerationClient: number;
  profit: number;
  notes: string;
  contactPerson: string;
  confirmation: string;
  document: IFolderFile,
  dtm: number,
  onItemChange: (index: number) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onItemRemoveFromTransactionFile: (index: number) => void;
  onNumberChange: (value: string | number, index: number, fieldName: ValidFieldNames) => void;
  onNumberOldChange: (value: string | number, index: number, fieldName: ValidFieldNames) => void;
  onClientChange: (value: string, index: number) => void;
  columnVisibility: { [key in keyof IBondPurchaseTransaction]: boolean };
  handleColumnVisibilityChange: (event: ChangeEvent<HTMLInputElement>) => void;
BondColumnNames: { [key in keyof IBondPurchaseTransaction]: string };
}

export const BondTransactionFileItem = (props: IProps) => {
  const {
    index,
    clientName,
    moneyMarketAccountNumber,
    availableBalance,
    newNominal,
    altTreasuryBill,
    tenderRate,
    margin,
    counterParty,
    considerationBON,
    considerationClient,
    notes,
    contactPerson,
    confirmation,
    onItemChange,
    onItemRemoveFromTransactionFile,
    onNumberChange,
    onNumberOldChange,
    onClientChange,
    columnVisibility,
  } = props;

  const { store } = useAppContext();

  const clients = [...store.client.naturalPerson.all, ...store.client.legalEntity.all];
  const clientAccountOptions = store.mma.all.filter((mma) => mma.asJson.parentEntity === clientName);

  const clientOptions = clients.map((cli) => ({
    label: cli.asJson.entityDisplayName,
    value: cli.asJson.entityId,
  }));

  const counterParties = store.counterParty.all;
  const counterPartyOptions = counterParties.map((counterParty) => ({
    label: counterParty.asJson.counterpartyName,
    value: counterParty.asJson.id,
  }));

  const clientId = () => {
    const account = store.mma.all.find((mma) => mma.asJson.id === moneyMarketAccountNumber);
    return account ? account.asJson.id : "";
  }

  const clientBalance = () => {
    const account = store.mma.all.find((mma) => mma.asJson.id === moneyMarketAccountNumber);
    return account ? account.asJson.balance : 0;
  }


  const _clientRate = tenderRate - margin;
  const _profit = Number(considerationClient) - Number(considerationBON)

  const _availableBalance = availableBalance + Number(clientBalance());
  const _netBalance = _availableBalance - Number(considerationClient);

  return (
    <tr className="row">
      <td>
        <SingleSelect
          options={clientOptions}
          name="clientName"
          value={clientName}
          onChange={(value) => onClientChange(value, index)}
          placeholder="e.g Surname/First Name"
          required
        />
      </td>
      {columnVisibility.moneyMarketAccountNumber && (
        <td>
          <select
            className="uk-select purchase-input uk-form-small uk-width-small"
            value={moneyMarketAccountNumber}
            id="moneyMarketAccountNumber"
            name={'moneyMarketAccountNumber'}
            onChange={onItemChange(index)}
            required
          >
            <option value={''} disabled>
              Select...
            </option>
            {clientAccountOptions.map((acc, index) => (
              <option key={acc.asJson.id} value={acc.asJson.id}>
                {acc.asJson.accountNumber}
              </option>
            ))}
          </select>
        </td>
      )}
      {columnVisibility.moneyMarketBalance && (
        <td>
          <NumberInput  
            id="moneyMarketBalance"
            className="auto-save uk-input purchase-input uk-form-small"
            placeholder="-"
            value={clientBalance()}
            onChange={(value) => onNumberChange(value, index, 'moneyMarketBalance')}
            disabled
          />
        </td>
      )}
      {columnVisibility.availableBalance && (
        <td>
          <NumberInput  
            id="availableBalance"
            className="auto-save uk-input purchase-input uk-form-small"
            placeholder="-"
            value={_availableBalance}
            onChange={(value) => onNumberChange(value, index, 'availableBalance')}
            disabled
          />
        </td>
      )}
      {columnVisibility.netBalance && (
        <td>
          <NumberInput  
            id="netBalance"
            className={`auto-save uk-input purchase-input uk-form-small ${_netBalance < 0 ? "text-danger" : ""} uk-form-small`}
            placeholder="-"
            value={_netBalance}
            onChange={(value) => onNumberChange(value, index, 'netBalance')}
            disabled
          />
        </td>
      )}
      {columnVisibility.newNominal && (
        <td>
          <NumberInput  
            id="newNominal"
            className="auto-save uk-input purchase-input uk-form-small"
            placeholder="-"
            value={newNominal}
            onChange={(value) => onNumberChange(value, index, 'newNominal')}
          />
        </td>
      )}
      {columnVisibility.altTreasuryBill && (
        <td>
          <select className="uk-select purchase-input uk-form-small uk-width-small" value={altTreasuryBill} id="altTreasuryBill" name={'altTreasuryBill'}
            onChange={onItemChange(index)} required
          >
            <option value={''} disabled>Select...</option>
            <option value={"Yes"}>No</option>
            <option value={"No"}>Yes</option>
          </select>
        </td>
      )}
      {columnVisibility.tenderRate && (
        <td>
          <NumberInput  
            id="tenderRate"
            className="auto-save uk-input purchase-input uk-form-small"
            placeholder="-"
            value={tenderRate}
            onChange={(value) => onNumberChange(value, index, 'tenderRate')}
          />
        </td>
      )}
      {columnVisibility.margin && (
        <td>
          <NumberInput  
            id="margin"
            className="auto-save uk-input purchase-input uk-form-small"
            placeholder="-"
            value={margin}
            onChange={(value) => onNumberChange(value, index, 'margin')}
          />
        </td>
      )}
      {columnVisibility.clientRate && (
        <td>
          <NumberInput  
            id="clientRate"
            className="auto-save uk-input purchase-input uk-form-small"
            placeholder="-"
            value={_clientRate}
            onChange={(value) => onNumberChange(value, index, "clientRate")}
            disabled
          />
        </td>
      )}
      {
        columnVisibility.counterParty && (
          <td>
            <SingleSelect
              options={counterPartyOptions}
              name="counterParty"
              value={counterParty}
              onChange={() => onItemChange(index)}
              placeholder="counter party"
              required
            />
          </td>
        )
      }
      {columnVisibility.considerationBON && (
        <td>
          <NumberInput  
            id="considerationBON"
            className="auto-save uk-input purchase-input uk-form-small"
            placeholder="-"
            value={considerationBON}
            onChange={(value) => onNumberChange(value, index, 'considerationBON')}
            disabled
          />
        </td>
      )}
      {columnVisibility.considerationClient && (
        <td>
          <NumberInput  
            id="considerationClient"
            className="uk-input purchase-input uk-form-small"
            placeholder="-"
            value={considerationClient}
            onChange={(value) => onNumberChange(value, index, "considerationClient")}
            disabled
          />
        </td>
      )}
      {columnVisibility.profit && (
        <td>
          <NumberInput  
            id="profit"
            className="uk-input purchase-input uk-form-small"
            placeholder="-"
            value={_profit.toFixed(2)}
            onChange={(value) => onNumberOldChange(value, index, "profit")}
            disabled
          />
        </td>
      )}

      {columnVisibility.notes && (
        <td>
          <input
            className={`uk-input purchase-input uk-form-small`}
            type="text"
            value={notes}
            name={"notes"}
            onChange={onItemChange(index)}
          />
        </td>
      )}
      {columnVisibility.contactPerson && (
        <td>
          <input
            className={`uk-input purchase-input uk-form-small`}
            type="text"
            value={contactPerson}
            name={"contactPerson"}
            onChange={onItemChange(index)}
          />
        </td>
      )}
      {columnVisibility.confirmation && (
        <td>
          <input
            className={`uk-input purchase-input uk-form-small`}
            type="text"
            value={confirmation}
            name={"confirmation"}
            onChange={onItemChange(index)}
          />
        </td>
      )}
      <td>
        <div className="uk-width-auto@s">
          <div className="uk-flex uk-flex-middle uk-flex-inline">
            <div className="uk-margin">
              <div className="icon">
                <span
                  data-uk-tooltip="Delete item"
                  onClick={() => onItemRemoveFromTransactionFile(index)}
                  data-uk-icon="icon: trash;"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </td>
      <td>
        <input
          className="uk-input purchase-input uk-form-small uk-display-none"
          type="text"
          value={clientId()}
          name={"accountId"}
          onChange={onItemChange(index)}
          hidden
        />
      </td>
    </tr>
  );
};
