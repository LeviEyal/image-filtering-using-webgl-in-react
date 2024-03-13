interface EqualizerProps {
  sections: boolean[];
  onChange: (sections: boolean[]) => void;
}

export const Equalizer = (props: EqualizerProps) => {
  return (
    <div className="w-full h-full rounded-3xl flex items-center justify-between m-auto divide-x divide-black bg-white overflow-hidden">
      {props.sections.map((section, index) => (
        <div
          key={index}
          className={`h-3 flex-1 ${
            section ? "bg-white" : "bg-gradient-to-r from-blue-950 to-cyan-500"
          } cursor-pointer`}
          onClick={() => {
            const newSections = [...props.sections];
            newSections[index] = !newSections[index];
            props.onChange(newSections);
          }}
        />
      ))}
    </div>
  );
};
