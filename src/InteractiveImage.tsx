import React, { useRef, useEffect } from "react";
import { WebGLFilterProcessor } from "./filters-controller/core";
import { useFiltersManager } from "./filters-controller/useFiltersManager";
// import { Logo } from '@seetrue/shared-components/src';


interface Props {
  src: string;
  filtersState: ReturnType<typeof useFiltersManager>;
}

export const InteractiveImage: React.FC<Props> = ({ src, filtersState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filterProcessorRef = useRef<WebGLFilterProcessor>();
  const imageRef = useRef<HTMLImageElement>(new Image());
  const renderingContextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
      
      imageRef.current.onload = () => {
          renderingContextRef.current?.clearRect(0, 0, 700, 500);
          renderingContextRef.current = canvasRef.current?.getContext(
              "2d"
              ) as CanvasRenderingContext2D;
              
              filterProcessorRef.current = new WebGLFilterProcessor();
              
        renderingContextRef.current?.drawImage(imageRef.current, 0, 0, 700, 500);
        filtersState.dispatch({ type: "reset" });
    };

    imageRef.current.src = src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    const top =
      filterProcessorRef.current?.applyFilters(
        filtersState.appliedFilters,
        imageRef.current
      ) || imageRef.current;
    renderingContextRef.current?.drawImage(top, 0, 0, 700, 500);
    return () => {
      filterProcessorRef.current?.reset();
    };
  }, [filtersState]);

  return (
    <canvas
      data-testid="InteractiveImageCanvas"
      ref={canvasRef}
      width={700}
      height={500}
    />
  );
};
