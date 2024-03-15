import { useEffect, useReducer } from "react";
import { getFilterConfig } from "./filtersConfig";

export type FilterType =
  | "sharpen"
  | "emboss"
  | "invert"
  | "blackWhite"
  | "contrast"
  | "osFilter"
  | "O2Filter"
  | "variance";

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
  "variance",
];

interface IActionInterface {
  type: FilterActionTypes;
  value?: number;
}

interface ContrastAction extends IActionInterface {
  type: "contrast";
  value: number;
}

interface VarianceAction extends IActionInterface {
  type: "variance";
  value: number;
}

type Filter = ContrastAction | IActionInterface | VarianceAction;

interface FiltersState {
  appliedFilters: Filter[];
  editMode?: FilterType;
}

const filtersReducer = (state: FiltersState, action: Filter) => {
  const toggleFilter = (newFilter: Filter) => {
    let newAppliedFilters: Filter[] = [];

    const isFilterApplied = state.appliedFilters.some(
      (filter) => filter.type === newFilter.type
    );

    if (isFilterApplied) {
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
      ...state,
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

  const filterRule = getFilterConfig(action.type);

  switch (filterRule.type) {
    case "static":
      return toggleFilter(action);
    case "slider":
    case "volume":
      return {
        ...(state.appliedFilters.some((filter) => filter.type === action.type)
          ? state
          : toggleFilter(action)),
        editMode: action.type,
      };

    default:
      return state;
  }
};

/**
 * Custom hook for managing filters in an image processing application.
 */
export const useFilters = () => {
  const [state, dispatch] = useReducer(filtersReducer, {
    appliedFilters: [],
    editMode: undefined,
  });

  useEffect(() => {
    console.log({ state });
  }, [state]);

  const isFilterApplied = (filter: FilterType) =>
    state.appliedFilters.some((appliedFilter) => appliedFilter.type === filter);

  const isFilterDisabled = (filter: FilterType) =>
    state.appliedFilters.some((appliedFilter) =>
      getFilterConfig(appliedFilter.type as FilterType).disables?.includes(
        filter
      )
    );

  const currentFilterConf = getFilterConfig(state.editMode as FilterType);

  const currentFilter = {
    ...currentFilterConf,
    value:
      state.appliedFilters.find((filter) => filter.type === state.editMode)
        ?.value || currentFilterConf?.initial,
  };

  const availableFilters = filtersList.filter(
    (filter) => getFilterConfig(filter).on
  );

  return {
    appliedFilters: state.appliedFilters,
    isFilterApplied,
    isFilterDisabled,
    dispatch,
    currentFilter,
    availableFilters,
  };
};

export type FiltersContext = ReturnType<typeof useFilters>;
