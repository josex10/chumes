export type BundleComponent = {
  component_product_id: string;
  quantity: number;
};

export function computeBundleAvailability(
  components: BundleComponent[],
  stockByProductId: Map<string, number>,
): number {
  if (components.length === 0) {
    return 0;
  }

  const availabilities = components.map((component) => {
    const stock = stockByProductId.get(component.component_product_id) ?? 0;
    return Math.floor(stock / component.quantity);
  });

  return Math.min(...availabilities);
}
