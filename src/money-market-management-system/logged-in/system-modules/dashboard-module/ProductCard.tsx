import { observer } from "mobx-react-lite";

interface IProps {
    productCode: string;
    productName: string;
    totalAccounts: number;
    balance: number;
}

const ProductCard = observer((props: IProps) => {
    const {productCode, productName, totalAccounts, balance} = props
    return (
        <div>
            <div className="page-main-card uk-card uk-card-default uk-card-body">
                <h3 className="uk-card-title">{productCode}</h3>
                <h3 className="uk-card-title">{productName}</h3>
                <span>{totalAccounts}</span>
                <span>{(balance)}</span>
                <hr />
                <button
                    style={{ color: "white" }}
                    className="btn btn-primary"
                >
                    View
                </button>
            </div>
        </div>
    )
})

export default ProductCard
