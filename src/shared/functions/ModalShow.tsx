import { IRecurringWithdrawalInstruction } from "../models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";

declare const UIkit: any;

export const hideModalFromId = (id: string) => {
	const element = document.querySelector(`#${id}`);
	UIkit.modal(element).hide();
};

export default function showModalFromId(id: string) {
	const element = document.querySelector(`#${id}`);
	UIkit.modal(element).show();
}

export function showModalFromIdProperty(id: string, props?: IRecurringWithdrawalInstruction) {
	const element = document.querySelector(`#${id}`);
	const modal = UIkit.modal(element);
	if (modal && props) {
		// If props are provided, set them on the modal component
		Object.entries(props).forEach(([key, value]) => {
			// Assuming modal.$props[prop] is the correct way to set modal properties
			modal.$props[key] = value;
		});
		modal.show();
	}
}
