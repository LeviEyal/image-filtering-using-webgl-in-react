import { Slider } from "./Slider";
import { FilterType, FiltersContext } from "./useFilters";
import { getFilterConfig } from "./filtersConfig";
import { ResetFiltersIcon } from "../assets/icons/ResetFiltersIcon";
import { Equalizer } from "./Equalizer";

interface FiltersControllerBarProps {
  filtersCtx: FiltersContext;
}

export const FiltersControllerBar = ({
  filtersCtx,
}: FiltersControllerBarProps) => {
  const {
    isFilterApplied,
    isFilterDisabled,
    dispatch,
    currentFilter,
    availableFilters
  } = filtersCtx;

  const handleFilterChange = (newFilter: FilterType) => {
    dispatch({ type: newFilter });
  };

  const handleSectionsChange = (newSections: boolean[]) => {
    dispatch({ type: "setValue", value: newSections });
  };

  return (
    <div className="flex items-center justify-center gap-1 h-32 font-bold text-gray-700">
      {!currentFilter.value ? (
        <>
          {availableFilters.map((f) => {
            const Icon = getFilterConfig(f).icon || (() => <></>);
            return (
              <button
                key={f}
                className={`gap-2 w-32 rounded-lg px-6 py-2 flex flex-col justify-center items-center hover:shadow disabled:opacity-40  disabled:cursor-not-allowed ${
                  isFilterApplied(f) ? "bg-gray-300" : "bg-gray-100 "
                }`}
                disabled={isFilterDisabled(f)}
                onClick={() => handleFilterChange(f)}
              >
                <Icon size={40} />
                {getFilterConfig(f).label}
              </button>
            );
          })}
          <button
            className="w-32 rounded-lg px-6 py-2 flex flex-col justify-center items-center  hover:shadow disabled:opacity-40  disabled:cursor-not-allowed"
            onClick={() => dispatch({ type: "reset" })}
          >
            <ResetFiltersIcon size={45} />
            Reset
          </button>
        </>
      ) : (
        <div className="flex gap-4 w-1/2 items-center justify-between">
          <h1>{currentFilter.label}</h1>
          <div className="flex w-full bg-gray-300 rounded-3xl px-5 py-2 gap-10">
            {currentFilter.type === "slider" && (
              <Slider
                value={currentFilter.value as number}
                min={currentFilter.min || 0}
                max={currentFilter.max || 1}
                step={currentFilter.step || 0.01}
                onChange={(value) => dispatch({ type: "setValue", value })}
              />
            )}
            {currentFilter.type === "equalizer" && (
              <Equalizer
                sections={currentFilter.value as boolean[]}
                onChange={handleSectionsChange}
              />
            )}
            <button
              className="text-gray-600 rounded-3xl px-6 py-2 bg-white"
              onClick={() => dispatch({ type: "resetValue" })}
            >
              Reset
            </button>
            <button
              className="bg-gray-600 rounded-3xl px-6 py-2 text-white"
              onClick={() => dispatch({ type: "stopEditValue" })}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
