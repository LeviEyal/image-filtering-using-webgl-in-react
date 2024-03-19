import { BwFilterIcon } from "../assets/icons/BwFilterIcon";
import { ContrastFilterIcon } from "../assets/icons/ContrastFilterIcon";
import { HiFilterIcon } from "../assets/icons/HiFilterIcon";
import { InvertFilterIcon } from "../assets/icons/InvertFilterIcon";
import { o2FilterIcon } from "../assets/icons/O2FilterIcon";
import { OsFilterIcon } from "../assets/icons/OsFilterIcon";
import { ResetFiltersIcon } from "../assets/icons/ResetFiltersIcon";
import { SenFilterIcon } from "../assets/icons/SenFilterIcon";
import { VariFilterIcon } from "../assets/icons/VariFilterIcon";
import { FilterId } from "./useFiltersManager";

interface FilterConfig {
  id: FilterId;
  type: "slider" | "static" | "volume";
  disables?: FilterId[];
  min?: number;
  max?: number;
  step?: number;
  initial?: unknown[];
  bars?: number;
  label: string;
  show: boolean;
}

const filtersConfig: Record<FilterId, FilterConfig> = {
  sharpen: {
    id: "sharpen",
    label: "SEN",
    type: "static",
    disables: ["contrast"],
    show: true,
  },
  highPenetrationFilter: {
    id: "highPenetrationFilter",
    label: "HI",
    type: "static",
    disables: ["contrast"],
    show: true,
  },
  invert: {
    id: "invert",
    label: "Invert",
    type: "static",
    disables: ["contrast"],
    show: true,
  },
  blackWhite: {
    id: "blackWhite",
    label: "BW",
    type: "static",
    show: true,
  },
  varAbsorption: {
    id: "varAbsorption",
    label: "Vari",
    type: "volume",
    initial: [4],
    bars: 9,
    show: true,
  },
  contrast: {
    id: "contrast",
    label: "Contrast",
    type: "slider",
    min: -4,
    max: 4,
    step: 0.01,
    initial: [0],
    show: true,
  },
  osFilter: {
    id: "osFilter",
    label: "OS",
    type: "static",
    disables: ["o2Filter"],
    show: true,
  },
  o2Filter: {
    id: "o2Filter",
    label: "O2",
    type: "static",
    disables: ["osFilter"],
    show: true,
  },
};

export const getIconByFilter = (filter: FilterId) => {
  switch (filter) {
    case "sharpen":
      return SenFilterIcon;
    case "highPenetrationFilter":
      return HiFilterIcon;
    case "invert":
      return InvertFilterIcon;
    case "blackWhite":
      return BwFilterIcon;
    case "varAbsorption":
      return VariFilterIcon;
    case "contrast":
      return ContrastFilterIcon;
    case "osFilter":
      return OsFilterIcon;
    case "o2Filter":
      return o2FilterIcon;
    default:
      return ResetFiltersIcon;
  }
}

export const getFilterConfig = (filter: FilterId) =>
  filtersConfig[filter] || null;
