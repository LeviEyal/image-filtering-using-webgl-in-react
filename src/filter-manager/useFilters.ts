import { useReducer } from "react";

export type FilterType =
  | "sharpen"
  | "emboss"
  | "negative"
  | "blackWhite"
  | "contrast"
  | "osFilter"
  | "O2Filter"
  | "senFilter"
  | "reset"
  | "setContrast"
  | "editContrast"
  | "stopEditContrast"
  | "resetContrast";

export const filtersList: FilterType[] = [
  "sharpen",
  "emboss",
  "negative",
  "blackWhite",
  "contrast",
  "osFilter",
  "O2Filter",
  "senFilter",
];

interface FilterRule {
  type: "number" | "boolean";
  value?: number;
  disables?: FilterType[];
  min?: number;
  max?: number;
}

export const filtersRules: Record<FilterType, FilterRule> = {
  sharpen: {
    type: "boolean",
  },
  emboss: {
    type: "boolean",
  },
  negative: {
    type: "boolean",
    disables: ["contrast"],
  },
  blackWhite: {
    type: "boolean",
  },
  contrast: {
    type: "number",
    min: 0,
    max: 5,
  },
  osFilter: {
    type: "boolean",
  },
  O2Filter: {
    type: "boolean",
  },
  senFilter: {
    type: "boolean",
  },
  reset: {
    type: "boolean",
  },
};

interface IActionInterface {
  type: FilterType;
  value?: number;
}

interface ContrastAction extends IActionInterface {
  type: "contrast";
  value: number;
}

type Filter = ContrastAction | IActionInterface;

interface FiltersState {
  appliedFilters: Filter[];
  editMode?: {
    type: FilterType;
    value: number;
  };
}

const filtersReducer = (state: FiltersState, action: Filter) => {
  const toggleFilter = (newFilter: Filter, on: boolean = false) => {
    let newAppliedFilters: Filter[] = [];

    const isFilterApplied = state.appliedFilters.some(
      (filter) => filter.type === newFilter.type
    );

    if (isFilterApplied && !on) {
      newAppliedFilters = state.appliedFilters.filter(
        (filter) => filter.type !== newFilter.type
      );
    } else {
      newAppliedFilters = [...state.appliedFilters, newFilter];
    }

    return {
      ...state,
      appliedFilters: newAppliedFilters,
    };
  };

  switch (action.type) {
    case "sharpen":
    case "emboss":
    case "negative":
    case "blackWhite":
    case "osFilter":
    case "O2Filter":
    case "senFilter":
      return toggleFilter(action);
    case "reset":
      return {
        appliedFilters: [],
        editMode: undefined,
      };
    case "contrast":
      return {
        ...toggleFilter(action, true),

        editMode: {
          type: "contrast",
          value: action.value,
        } as FiltersState["editMode"],
      };
    case "setContrast":
      return {
        ...state,
        appliedFilters: state.appliedFilters.map((filter) => {
          if (filter.type === "contrast") {
            return {
              ...filter,
              value: action.value || 0.5,
            };
          }
          return filter;
        }),
      };
    case "stopEditContrast":
      return {
        ...state,
        editMode: undefined,
      };
    case "resetContrast":
      return {
        ...state,
        editMode: undefined,
        appliedFilters: state.appliedFilters.filter(
          (filter) => filter.type !== "contrast"
        ),
      };
    default:
      return state;
  }
};

export const useFilters = () => {
  const [state, dispatch] = useReducer(filtersReducer, {
    appliedFilters: [],
    editMode: undefined,
  } as FiltersState);

  const isFilterApplied = (filter: FilterType) =>
    state.appliedFilters.some((appliedFilter) => appliedFilter.type === filter);

  const isFilterDisabled = (filter: FilterType) =>
    state.appliedFilters.some((appliedFilter) =>
      filtersRules[appliedFilter.type].disables?.includes(filter)
    );

  const isEditMode = !!state.editMode;

  return {
    appliedFilters: state.appliedFilters,
    isFilterApplied,
    isFilterDisabled,
    isEditMode,
    dispatch,
  };
};
