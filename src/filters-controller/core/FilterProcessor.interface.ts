import { FilterId } from "../useFiltersManager";

interface FilterFunction {
  type: FilterId;
  func?: (...args: unknown[]) => void;
  args?: unknown[];
}

export interface FilterProcessor {
  reset(): void;
  applyFilters(
    filters: FilterFunction[],
    image: HTMLImageElement
  ): HTMLCanvasElement;
  contrast(amount: number): void;
  invert(): void;
  blackWhite(): void;
  detectEdges(): void;
  highPenetrationFilter(): void;
  sharpen(): void;
  osFilter(): void;
  o2Filter(): void;
  varAbsorption(amount: number): void;
}
