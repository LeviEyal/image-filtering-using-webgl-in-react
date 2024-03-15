import { useEffect, useReducer } from "react";
import { getFilterConfig } from "./filtersConfig";

export type FilterId =
  | "sharpen"
  | "emboss"
  | "invert"
  | "blackWhite"
  | "contrast"
  | "osFilter"
  | "O2Filter"
  | "variance";

export type ActionType =
  | FilterId
  | "reset"
  | "setCurrentFilterArgs"
  | "resetCurrentFilterArgs"
  | "stopEditCurrentFilter";

export const filtersList: FilterId[] = [
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
  type: ActionType;
  args?: unknown[];
}

interface ContrastAction extends IActionInterface {
  type: "contrast";
  args: unknown[];
}

interface VarianceAction extends IActionInterface {
  type: "variance";
  args: unknown[];
}

type Filter = ContrastAction | IActionInterface | VarianceAction;

interface FiltersState {
  appliedFilters: Filter[];
  editMode?: FilterId;
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

  if (action.type === "setCurrentFilterArgs") {
    return {
      ...state,
      appliedFilters: state.appliedFilters.map((filter) => {
        if (filter.type === state.editMode) {
          return {
            ...filter,
            args: action.args,
          };
        }
        return filter;
      }),
    };
  }

  if (action.type === "resetCurrentFilterArgs") {
    return {
      ...state,
      editMode: undefined,
      appliedFilters: state.appliedFilters.filter(
        (filter) => filter.type !== state.editMode
      ),
    };
  }

  if (action.type === "stopEditCurrentFilter") {
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

  const isFilterApplied = (filter: FilterId) =>
    state.appliedFilters.some((appliedFilter) => appliedFilter.type === filter);

  const isFilterDisabled = (filter: FilterId) =>
    state.appliedFilters.some((appliedFilter) =>
      getFilterConfig(appliedFilter.type as FilterId).disables?.includes(filter)
    );

  const currentFilterConf = getFilterConfig(state.editMode as FilterId);

  const currentFilter = {
    ...currentFilterConf,
    args:
      state.appliedFilters.find((filter) => filter.type === state.editMode)
        ?.args || currentFilterConf?.initial,
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
