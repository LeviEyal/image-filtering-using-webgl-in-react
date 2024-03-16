interface VolumeMeterProps {
  value: number;
  onChange: (value: number) => void;
  bars: number;
}

export const VolumeMeter = ({ onChange, value, bars }: VolumeMeterProps) => {
  const levels = Array.from(
    { length: bars },
    (_, i) => i - Math.floor(bars / 2) + 1
  );
  const currentIndex = value;

  const handleVolumeChange = (index: number) => {
    console.log({ index, currentIndex });

    let newVolumeIndex = currentIndex;

    if (index < currentIndex) {
      newVolumeIndex = currentIndex - 1;
    } else if (index > currentIndex) {
      newVolumeIndex = currentIndex + 1;
    }

    onChange(newVolumeIndex);
  };

  return (
    <div className="w-full h-4 rounded-3xl flex m-auto bg-white overflow-hidden divide-x divide-black">
      {levels.map((level, index) => (
        <div
          key={level}
          className={`h-full w-full cursor-pointer ${
            level === levels[currentIndex]
              ? "bg-gradient-to-r from-blue-950 to-cyan-500"
              : "bg-white"
          }`}
          onClick={() => handleVolumeChange(index)}
        />
      ))}
    </div>
  );
};
