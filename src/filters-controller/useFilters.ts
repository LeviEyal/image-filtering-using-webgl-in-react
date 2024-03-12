import { useEffect, useReducer } from "react";
import { filtersConfig, getFilterConfig } from "./filtersConfig";

export type FilterType =
  | "sharpen"
  | "emboss"
  | "invert"
  | "blackWhite"
  | "contrast"
  | "osFilter"
  | "O2Filter";

export type FilterActionTypes =
  | FilterType
  | "reset"
  | "setValue"
  | "resetValue"
  | "stopEditValue";

export const filtersList: FilterType[] = [
  "emboss",
  "osFilter",
  "invert",
  "sharpen",
  "O2Filter",
  "contrast",
  "blackWhite",
];

interface IActionInterface {
  type: FilterActionTypes;
  value?: number;
}

interface ContrastAction extends IActionInterface {
  type: "contrast";
  value: number;
}

type Filter = ContrastAction | IActionInterface;

interface FiltersState {
  appliedFilters: Filter[];
  editMode?: FilterType;
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

  if (action.type === "reset") {
    return {
      appliedFilters: [],
      editMode: undefined,
    };
  }

  if (action.type === "setValue") {
    return {
      ...state,
      appliedFilters: state.appliedFilters.map((filter) => {
        if (filter.type === state.editMode) {
          return {
            ...filter,
            value: action.value,
          };
        }
        return filter;
      }),
    };
  }

  if (action.type === "resetValue") {
    return {
      ...state,
      editMode: undefined,
      appliedFilters: state.appliedFilters.filter(
        (filter) => filter.type !== state.editMode
      ),
    };
  }

  if (action.type === "stopEditValue") {
    return {
      ...state,
      editMode: undefined,
    };
  }

  const filterRule = filtersConfig[action.type];

  switch (filterRule.type) {
    case "static":
      return toggleFilter(action);
    case "slider":
      return {
        ...state,
        editMode: action.type,
        appliedFilters: [...state.appliedFilters, action],
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

  useEffect(() => {
    console.log({ state });
  }, [state]);

  const isFilterApplied = (filter: FilterType) =>
    state.appliedFilters.some((appliedFilter) => appliedFilter.type === filter);

  const isFilterDisabled = (filter: FilterType) =>
    state.appliedFilters.some((appliedFilter) =>
      filtersConfig[appliedFilter.type as FilterType].disables?.includes(filter)
    );

  return {
    appliedFilters: state.appliedFilters,
    isFilterApplied,
    isFilterDisabled,
    dispatch,
    currentFilter: getFilterConfig(state.editMode as FilterType),
  };
};

export type FiltersContext = ReturnType<typeof useFilters>;
