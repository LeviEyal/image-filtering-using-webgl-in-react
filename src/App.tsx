import { useEffect, useRef } from "react";
import { WebGLImageFilter } from "./filter-manager";
import {
  FilterType,
  useFilters,
  filtersList,
} from "./filter-manager/useFilters";
import { Slider } from "./filter-manager/Slider";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputCanvasRef = useRef<HTMLCanvasElement>(null);
  const {
    appliedFilters,
    dispatch,
    isFilterApplied,
    isFilterDisabled,
    isEditMode,
  } = useFilters();

  const handleFilterChange = (newFilter: FilterType) => {
    console.log("toggle", newFilter);
    dispatch({ type: newFilter, value: 0.5 });
  };

  useEffect(() => {
    const inputImage = new Image();
    inputImage.src = "/top_view.png";
    console.log({
      appliedFilters,
    });

    inputImage.onload = () => {
      const canvas = canvasRef.current;
      const inputCanvas = inputCanvasRef.current;

      if (!canvas || !inputCanvas) return;

      const filterManager = new WebGLImageFilter();

      filterManager.reset();

      if (appliedFilters.length === 0) {
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.drawImage(inputImage, 0, 0);
        return;
      }
      appliedFilters.forEach((filter) => {
        filterManager.addFilter(filter.type, filter.value || 0);
      });

      const filteredImage = filterManager.apply(inputImage);

      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      ctx.drawImage(filteredImage, 0, 0);

      const inputCtx = inputCanvas.getContext("2d") as CanvasRenderingContext2D;
      inputCtx.drawImage(inputImage, 0, 0);
    };

    return () => {
      console.log("cleanup");
    };
  }, [appliedFilters]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          margin: "auto",
        }}
      >
        <canvas ref={canvasRef} width={800} height={600} />
        <canvas ref={inputCanvasRef} width={800} height={600} />
      </div>
      <div
        style={{
          display: "flex",
          paddingBottom: "150px",
        }}
      >
        {!isEditMode ? (
          <>
            {filtersList.map((f) => {
              return (
                <button
                  disabled={isFilterDisabled(f)}
                  style={{
                    margin: "5px",
                    border: isFilterApplied(f)
                      ? "2px solid green"
                      : "2px solid black",
                  }}
                  onClick={() => handleFilterChange(f)}
                >
                  {f}
                </button>
              );
            })}
            <button onClick={() => dispatch({ type: "reset" })}>RESET</button>
          </>
        ) : (
          <>
            <Slider
              value={
                appliedFilters.find((f) => f.type === "contrast")?.value || 0
              }
              min={0}
              max={10}
              step={0.01}
              onChange={(value) => dispatch({ type: "setContrast", value })}
            />
            <button onClick={() => dispatch({ type: "stopEditContrast" })}>OK</button>
            <button onClick={() => dispatch({ type: "resetContrast" })}>RESET</button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
