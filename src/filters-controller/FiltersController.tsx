import { Slider } from "./Slider";
import { FilterId, FiltersManagerContext } from "./useFiltersManager";
import { VolumeMeter } from "./VolumeMeter";
import { forwardRef } from "react";
import { getIconByFilter } from "./filtersConfig";

interface FiltersControllerBarProps {
  filtersCtx: FiltersManagerContext;
}

export const FilterButton = forwardRef<
  HTMLButtonElement,
  {
    filter: any;
    applied: boolean;
    disabled: boolean;
    onClick: () => void;
  }
>(({ filter, applied, disabled, onClick }, ref) => {
  const Icon = getIconByFilter(filter.id);
  return (
    <button
      ref={ref}
      className={`gap-2 w-32 rounded-lg px-6 py-2 flex flex-col justify-center items-center hover:shadow disabled:opacity-40  disabled:cursor-not-allowed ${
        applied ? "bg-gray-300" : "bg-gray-100 "
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {Icon && <Icon size={45} />}
      {filter.label}
    </button>
  );
});

export const FiltersControllerBar = ({
  filtersCtx,
}: FiltersControllerBarProps) => {
  const { dispatch, currentFilter, filters } = filtersCtx;

  const handleFilterChange = (newFilter: FilterId) => {
    dispatch({ type: newFilter });
  };

  return (
    <div className="flex items-center justify-center gap-1 h-32 font-bold text-gray-700">
      {!currentFilter.args ? (
        <>
          {filters.map((f) => {
            return (
              <FilterButton
                key={f.id}
                filter={f}
                applied={f.applied}
                disabled={f.disabled || false}
                onClick={() => handleFilterChange(f.id)}
              />
            );
          })}
          <FilterButton
            filter={{
              id: "reset",
              label: "Reset",
            }}
            applied={false}
            disabled={false}
            onClick={() => dispatch({ type: "reset" })}
          />
        </>
      ) : (
        <div className="flex gap-4 w-1/2 items-center justify-between">
          <h1>{currentFilter.label}</h1>
          <div className="flex w-full bg-gray-300 rounded-3xl px-5 py-2 gap-10">
            {currentFilter.type === "slider" && (
              <Slider
                value={currentFilter.args[0] as number}
                min={currentFilter.min || 0}
                max={currentFilter.max || 1}
                step={currentFilter.step || 0.01}
                onChange={(value) =>
                  dispatch({ type: "setCurrentFilterArgs", args: [value] })
                }
              />
            )}
            {currentFilter.type === "volume" && (
              <VolumeMeter
                value={currentFilter.args[0] as number}
                bars={currentFilter.bars || 9}
                onChange={(value) =>
                  dispatch({ type: "setCurrentFilterArgs", args: [value] })
                }
              />
            )}
            <button
              className="text-gray-600 rounded-3xl px-6 py-2 bg-white"
              onClick={() => dispatch({ type: "resetCurrentFilterArgs" })}
            >
              Reset
            </button>
            <button
              className="bg-gray-600 rounded-3xl px-6 py-2 text-white"
              onClick={() => dispatch({ type: "stopEditCurrentFilter" })}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
