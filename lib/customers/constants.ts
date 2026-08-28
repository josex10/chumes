export const CUSTOMER_COMBOBOX_PAGE_SIZE = 10;
export const CUSTOMER_LIST_PAGE_SIZE = 20;
export const CUSTOMER_SEARCH_DEBOUNCE_MS = 300;
export const INDIVIDUAL_CUSTOMER_TYPE_CODE = "INDIVIDUAL";

export function getIndividualCustomerTypeId(
  types: Array<{ id: number; code: string }>,
): number | undefined {
  return (
    types.find((type) => type.code === INDIVIDUAL_CUSTOMER_TYPE_CODE)?.id ??
    types[0]?.id
  );
}
