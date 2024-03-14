interface VolumeMeterProps {
  value: number;
  onChange: (value: number) => void;
}

export const VolumeMeter = ({ onChange, value }: VolumeMeterProps) => {
  const levels = [-4, -3, -2, -1, 1, 2, 3, 4, 5];
  const currentIndex = levels.indexOf(value);

  const handleVolumeChange = (index: number) => {
    console.log({ index, currentIndex });

    let newVolumeIndex = currentIndex;

    if (index < currentIndex) {
      newVolumeIndex = currentIndex - 1;
    } else if (index > currentIndex) {
      newVolumeIndex = currentIndex + 1;
    }

    onChange(levels[newVolumeIndex]);
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
