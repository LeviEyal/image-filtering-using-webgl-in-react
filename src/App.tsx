import { useRef } from "react";
import { useFilters } from "./filters-controller/useFilters";
import { FiltersControllerBar } from "./filters-controller/FiltersController";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filtersCtx = useFilters(canvasRef);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
      <div className="flex items-center justify-center">
        <canvas ref={canvasRef} width={800} height={600} />
      </div>
      <div className="w-full mt-5">
        <FiltersControllerBar filtersCtx={filtersCtx} />
      </div>
    </div>
  );
}

export default App;
