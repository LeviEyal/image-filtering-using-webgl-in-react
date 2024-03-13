import { RefObject, useEffect, useReducer, useRef } from "react";
import { getFilterConfig } from "./filtersConfig";
import { WebGLImageFilter } from "./core";

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
  value?: number | boolean[];
}

interface ContrastAction extends IActionInterface {
  type: "contrast";
  value: number;
}

interface VarianceAction extends IActionInterface {
  type: "variance";
  value: boolean[];
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
      return {
        ...(state.appliedFilters.some((filter) => filter.type === action.type)
          ? state
          : toggleFilter(action)),
        editMode: action.type,
      };

    case "equalizer":
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
 *
 * @param canvasRef - Reference to the canvas element.
 * @returns An object containing the applied filters, helper functions, and the current filter configuration.
 */
export const useFilters = (canvasRef: RefObject<HTMLCanvasElement>) => {
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
      getFilterConfig(appliedFilter.type as FilterType).disables?.includes(
        filter
      )
    );

  const filterManagerRef = useRef<WebGLImageFilter>();
  const inputImageRef = useRef<HTMLImageElement>(new Image());
  const filteredImageRef = useRef<HTMLImageElement>(new Image());
  const renderingContextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    inputImageRef.current.src = "4/top_view.png";

    inputImageRef.current.onload = () => {
      renderingContextRef.current = canvasRef.current?.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      filterManagerRef.current = new WebGLImageFilter();
      renderingContextRef.current.drawImage(inputImageRef.current, 0, 0);
    };
  }, [canvasRef]);

  useEffect(() => {
    if (!renderingContextRef.current || !filteredImageRef.current) return;

    if (state.appliedFilters.length === 0) {
      renderingContextRef.current.drawImage(inputImageRef.current, 0, 0);
    } else {
      state.appliedFilters.forEach((filter) => {
        filterManagerRef.current?.addFilter(filter.type, filter.value);
      });

      filteredImageRef.current = filterManagerRef.current?.apply(
        inputImageRef.current
      )
      renderingContextRef.current.drawImage(filteredImageRef.current, 0, 0);
    }

    return () => {
      filterManagerRef.current?.reset();
    };
  }, [state.appliedFilters]);

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
