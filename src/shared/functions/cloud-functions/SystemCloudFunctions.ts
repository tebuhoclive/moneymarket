import swal from "sweetalert";
import { IProductUpdate } from '../../interfaces/CloudFunctionInterfaces';
import { CLOUD_FUNCTION_LINKS } from "./ENV";

const SELECTED_ENV = "LIVE" // to use for easy changing

export const updateProductRateCloudFunction = async (data: IProductUpdate) => {
    const response = await fetch(CLOUD_FUNCTION_LINKS.LIVE.UPDATE_RATE,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    if (response.ok) {
        swal("updating")
    } else {
        swal("failed to update")
    }
}