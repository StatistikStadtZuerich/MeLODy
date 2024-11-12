export const toValidString = (input?: string | number) => input && input.toString().trim() !== "" && input.toString() !== '*' ? input.toString() : undefined;
