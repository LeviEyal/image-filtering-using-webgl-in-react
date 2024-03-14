import { BwFilterIcon } from "../assets/icons/BwFilterIcon";
import { ContrastFilterIcon } from "../assets/icons/ContrastFilterIcon";
import { HiFilterIcon } from "../assets/icons/HiFilterIcon";
import { IconProps } from "../assets/icons/IconsProps";
import { InvertFilterIcon } from "../assets/icons/InvertFilterIcon";
import { O2FilterIcon } from "../assets/icons/O2FilterIcon";
import { OsFilterIcon } from "../assets/icons/OsFilterIcon";
import { SenFilterIcon } from "../assets/icons/SenFilterIcon";
import { VariFilterIcon } from "../assets/icons/VariFilterIcon";
import { FilterType } from "./useFilters";

interface FilterConfig {
  id: FilterType;
  type: "slider" | "static" | "volume";
  disables?: FilterType[];
  min?: number;
  max?: number;
  step?: number;
  initial?: number;
  icon?: (props: IconProps) => JSX.Element;
  label: string;
  on: boolean;
}

const filtersConfig: Record<FilterType, FilterConfig> = {
  sharpen: {
    id: "sharpen",
    type: "static",
    icon: SenFilterIcon,
    label: "SEN",
    on: true,
  },
  emboss: {
    id: "emboss",
    type: "static",
    disables: ["sharpen"],
    icon: HiFilterIcon,
    label: "HI",
    on: true,
  },
  invert: {
    id: "invert",
    type: "static",
    disables: ["contrast"],
    icon: InvertFilterIcon,
    label: "Invert",
    on: true,
  },
  blackWhite: {
    id: "blackWhite",
    type: "static",
    icon: BwFilterIcon,
    label: "BW",
    on: true,
  },
  variance: {
    id: "variance",
    type: "volume",
    icon: VariFilterIcon,
    label: "Vari",
    initial: 1,
    on: true,
  },
  contrast: {
    id: "contrast",
    type: "slider",
    min: -4,
    max: 5,
    step: 0.01,
    initial: 4,
    icon: ContrastFilterIcon,
    label: "Contrast",
    on: true,
  },
  osFilter: {
    id: "osFilter",
    type: "static",
    disables: ["O2Filter"],
    icon: OsFilterIcon,
    label: "OS",
    on: true,
  },
  O2Filter: {
    id: "O2Filter",
    type: "static",
    disables: ["osFilter"],
    icon: O2FilterIcon,
    label: "O2",
    on: true,
  },
};

export const getFilterConfig = (filter: FilterType) =>
  filtersConfig[filter] || null;
