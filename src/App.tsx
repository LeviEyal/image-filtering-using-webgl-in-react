import { useEffect, useRef } from "react";
import { WebGLImageFilter } from "./filters-controller/core";
import { useFilters } from "./filters-controller/useFilters";
import { FiltersControllerBar } from "./filters-controller/FiltersController";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterManagerRef = useRef<WebGLImageFilter>(new WebGLImageFilter());
  const filtersCtx = useFilters();
  const { appliedFilters } = filtersCtx;
  const inputImageRef = useRef<HTMLImageElement>(new Image());
  const renderingContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const filteredImageRef = useRef<HTMLImageElement>(new Image());

  useEffect(() => {
    inputImageRef.current = new Image();
    const inputImage = inputImageRef.current;
    inputImage.src = "/top_view.png";

    if (!inputImage) return;

    inputImage.onload = () => {
      renderingContextRef.current = canvasRef.current?.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      renderingContextRef.current.drawImage(inputImage, 0, 0);
    };

    return () => {
      console.log("cleanup");
    };
  }, []);

  useEffect(() => {
    const filterManager = filterManagerRef.current;
    const ctx = renderingContextRef.current;

    if (!ctx) return;

    if (appliedFilters.length === 0) {
      ctx.drawImage(inputImageRef.current, 0, 0);
    } else {
      appliedFilters.forEach((filter) => {
        filterManager.addFilter(filter.type, filter.value || 0);
      });

      filteredImageRef.current = filterManager.apply(inputImageRef.current);
      ctx.drawImage(filteredImageRef.current, 0, 0);
    }

    return () => {
      filterManager.reset();
    };
  }, [appliedFilters]);

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
