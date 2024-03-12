import { BwFilterIcon } from "../assets/icons/BwFilterIcon";
import { ContrastFilterIcon } from "../assets/icons/ContrastFilterIcon";
import { HiFilterIcon } from "../assets/icons/HiFilterIcon";
import { IconProps } from "../assets/icons/IconsProps";
import { InvertFilterIcon } from "../assets/icons/InvertFilterIcon";
import { O2FilterIcon } from "../assets/icons/O2FilterIcon";
import { OsFilterIcon } from "../assets/icons/OsFilterIcon";
import { SenFilterIcon } from "../assets/icons/SenFilterIcon";
import { FilterType } from "./useFilters";

interface FilterConfig {
  id: FilterType;
  type: "slider" | "static" | "equalizer";
  disables?: FilterType[];
  min?: number;
  max?: number;
  step?: number;
  icon?: (props: IconProps) => JSX.Element;
  label: string;
}

export const filtersConfig: Record<FilterType, FilterConfig> = {
  sharpen: {
    id: "sharpen",
    type: "static",
    icon: SenFilterIcon,
    label: "SEN",
  },
  emboss: {
    id: "emboss",
    type: "static",
    disables: ["sharpen"],
    icon: HiFilterIcon,
    label: "HI",
  },
  invert: {
    id: "invert",
    type: "static",
    disables: ["contrast"],
    icon: InvertFilterIcon,
    label: "Invert",
  },
  blackWhite: {
    id: "blackWhite",
    type: "static",
    icon: BwFilterIcon,
    label: "BW",
  },
  contrast: {
    id: "contrast",
    type: "slider",
    min: -4,
    max: 5,
    step: 0.5,
    icon: ContrastFilterIcon,
    label: "Contrast",
  },
  osFilter: {
    id: "osFilter",
    type: "static",
    disables: ["O2Filter"],
    icon: OsFilterIcon,
    label: "OS",
  },
  O2Filter: {
    id: "O2Filter",
    type: "static",
    disables: ["osFilter"],
    icon: O2FilterIcon,
    label: "O2",
  },
};

export const getFilterConfig = (filter: FilterType) =>
  filtersConfig[filter] || null;
