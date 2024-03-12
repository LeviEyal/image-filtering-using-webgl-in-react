interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export const Slider = (props: SliderProps) => {
  const gradientStyle = {
    background: `linear-gradient(to right, #1c1c35, #0a8db4 ${
      ((props.value - props.min) / (props.max - props.min)) * 100
    }%, transparent 0%)`,
  };

  return (
    <div className="w-full h-full bg-white rounded-3xl flex items-center justify-center p-1 m-auto">
      <input
        className="w-full appearance-none rounded-3xl"
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(parseFloat(e.target.value))}
        style={gradientStyle}
      />
    </div>
  );
};
