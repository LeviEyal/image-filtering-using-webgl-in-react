import { useEffect, useReducer } from "react";
import { getFilterConfig } from "./filtersConfig";

export type ActionType =
  | FilterId
  | "reset"
  | "setCurrentFilterArgs"
  | "resetCurrentFilterArgs"
  | "stopEditCurrentFilter";

export const filtersList = [
  "emboss",
  "osFilter",
  "invert",
  "sharpen",
  "O2Filter",
  "contrast",
  "blackWhite",
  "variance",
];

export type FilterId = (typeof filtersList)[number];

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
  /**
   * Helper function to toggle a filter:
   * - If the filter is already applied, it will be removed.
   * - If the filter is not applied, it will be added.
   */
  const toggleFilter = (newFilter: Filter) => {
    const isFilterApplied = state.appliedFilters.some(
      (filter) => filter.type === newFilter.type
    );

    return {
      ...state,
      appliedFilters: isFilterApplied
        ? state.appliedFilters.filter(
            (filter) => filter.type !== newFilter.type
          )
        : [...state.appliedFilters, newFilter],
    };
  };

  switch (action.type) {
    case "reset":
      return {
        ...state,
        appliedFilters: [],
        editMode: undefined,
      };
    case "setCurrentFilterArgs":
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
    case "resetCurrentFilterArgs":
      return {
        ...state,
        editMode: undefined,
        appliedFilters: state.appliedFilters.filter(
          (filter) => filter.type !== state.editMode
        ),
      };
    case "stopEditCurrentFilter":
      return {
        ...state,
        editMode: undefined,
      };

    default: {
      const filterRule = getFilterConfig(action.type);

      switch (filterRule.type) {
        case "static":
          return toggleFilter(action);
        case "slider":
        case "volume":
          return {
            ...(state.appliedFilters.some(
              (filter) => filter.type === action.type
            )
              ? state
              : toggleFilter(action)),
            editMode: action.type,
          };

        default:
          return state;
      }
    }
  }
};

/**
 * Custom hook for managing filters in an image processing application.
 */
export const useFiltersManager = () => {
  const [state, dispatch] = useReducer(filtersReducer, {
    appliedFilters: [],
    editMode: undefined,
  });

  useEffect(() => console.log({ state }), [state]);

  const currentFilterConf = getFilterConfig(state.editMode as FilterId);

  const currentFilter = {
    ...currentFilterConf,
    args:
      state.appliedFilters.find((filter) => filter.type === state.editMode)
        ?.args || currentFilterConf?.initial,
  };

  /**
   * List of all the filters with their current state.
   * - applied: whether the filter is currently applied.
   * - disabled: whether the filter is disabled.
   * - args: the arguments of the filter.
   * - id: the id of the filter.
   * - label: the label of the filter. (Display name)
   * - type: the type of the filter. (static, slider, volume)
   * - icon: the icon of the filter.
   */
  const filters = filtersList
    .filter((filter) => getFilterConfig(filter).on)
    .map((filter) => ({
      ...getFilterConfig(filter),
      args: state.appliedFilters.find((f) => f.type === filter)?.args,
      applied: state.appliedFilters.some((f) => f.type === filter),
      disabled: getFilterConfig(filter).disables?.some((f) =>
        state.appliedFilters.some((af) => af.type === f)
      ),
    }));

  return {
    appliedFilters: state.appliedFilters as Filter[],
    dispatch,
    currentFilter,
    filters,
  };
};

export type FiltersManagerContext = ReturnType<typeof useFiltersManager>;
