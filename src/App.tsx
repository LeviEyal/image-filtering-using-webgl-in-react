import { useEffect, useRef } from "react";
import { useFilters } from "./filters-controller/useFilters";
import { FiltersControllerBar } from "./filters-controller/FiltersController";
import { WebGLImageFilter } from "./filters-controller/core";

export const App = () => {
  const topCanvasRef = useRef<HTMLCanvasElement>(null);
  const sideCanvasRef = useRef<HTMLCanvasElement>(null);
  const state = useFilters();

  const topFilterManagerRef = useRef<WebGLImageFilter>();
  const sideFilterManagerRef = useRef<WebGLImageFilter>();
  const topImageRef = useRef<HTMLImageElement>(new Image());
  const sideImageRef = useRef<HTMLImageElement>(new Image());
  const topFilteredImageRef = useRef<HTMLImageElement>(new Image());
  const sideFilteredImageRef = useRef<HTMLImageElement>(new Image());
  const topRenderingContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const sideRenderingContextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    topImageRef.current.src = "3/top_view.png";
    sideImageRef.current.src = "3/side_view.png";

    topImageRef.current.onload = () => {
      topRenderingContextRef.current = topCanvasRef.current?.getContext(
        "2d"
      ) as CanvasRenderingContext2D;

      topFilterManagerRef.current = new WebGLImageFilter();
      topRenderingContextRef.current.drawImage(topImageRef.current, 0, 0);
    };

    sideImageRef.current.onload = () => {
      sideRenderingContextRef.current = sideCanvasRef.current?.getContext(
        "2d"
      ) as CanvasRenderingContext2D;

      sideFilterManagerRef.current = new WebGLImageFilter();
      sideRenderingContextRef.current.drawImage(sideImageRef.current, 0, 0);
    };
  }, []);

  useEffect(() => {
    if (
      !topRenderingContextRef.current ||
      !topFilteredImageRef.current ||
      !sideFilterManagerRef.current ||
      !topFilterManagerRef.current ||
      !sideRenderingContextRef.current ||
      !sideFilteredImageRef.current ||
      !sideImageRef.current
    )
      return;

    if (state.appliedFilters.length === 0) {
      topRenderingContextRef.current.drawImage(topImageRef.current, 0, 0);
      sideRenderingContextRef.current.drawImage(sideImageRef.current, 0, 0);
    } else {
      topFilteredImageRef.current = topFilterManagerRef.current.applyFilters(
        state.appliedFilters,
        topImageRef.current
      );
      topRenderingContextRef.current.drawImage(
        topFilteredImageRef.current,
        0,
        0
      );
      sideFilteredImageRef.current = sideFilterManagerRef.current.applyFilters(
        state.appliedFilters,
        sideImageRef.current
      );
      sideRenderingContextRef.current.drawImage(
        sideFilteredImageRef.current,
        0,
        0
      );
    }

    return () => {
      topFilterManagerRef.current?.reset();
      sideFilterManagerRef.current?.reset();
    };
  }, [state.appliedFilters]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
      <div className="flex items-center justify-center">
        <canvas ref={topCanvasRef} width={800} height={600} />
        <canvas ref={sideCanvasRef} width={800} height={600} />
      </div>
      <div className="w-full mt-5">
        <FiltersControllerBar filtersCtx={state} />
      </div>
    </div>
  );
}