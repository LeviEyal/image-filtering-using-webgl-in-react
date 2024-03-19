import { useState } from "react";
import { useFiltersManager } from "./filters-controller/useFiltersManager";
import { FiltersControllerBar } from "./filters-controller/FiltersController";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { InteractiveImage } from "./InteractiveImage";

export const DualViewInspectTemplate = () => {
  const filtersState = useFiltersManager();
  const [currentBag, setCurrentBag] = useState(1);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
      <h1 className="text-3xl mb-5">XRAY 2.0 Filters Management POC</h1>
      <div>
        <button
          className="mb-5 border p-2 px-4 rounded-xl bg-gradient-to-r from-blue-800 to-cyan-600 text-white"
          onClick={() => setCurrentBag((prev) => (prev + 4) % 5)}
        >
          Prev Bag
        </button>
        <button
          className="mb-5 border p-2 px-4 rounded-xl bg-gradient-to-r from-blue-800 to-cyan-600 text-white"
          onClick={() => setCurrentBag((prev) => (prev + 1) % 5)}
        >
          Next Bag
        </button>
      </div>
      <div className="flex items-center justify-center gap-5">
        <TransformWrapper>
          <TransformComponent>
            <InteractiveImage
              src={`${currentBag}/top_view.png`}
              filtersState={filtersState}
            />
          </TransformComponent>
        </TransformWrapper>
        <TransformWrapper>
          <TransformComponent>
            <InteractiveImage
              src={`${currentBag}/side_view.png`}
              filtersState={filtersState}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
      <div className="w-full mt-5">
        <FiltersControllerBar filtersCtx={filtersState} />
      </div>
    </div>
  );
};
