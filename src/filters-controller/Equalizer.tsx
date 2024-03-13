interface EqualizerProps {
  sections: boolean[];
  onChange: (sections: boolean[]) => void;
}

export const Equalizer = ({ onChange, sections }: EqualizerProps) => {
  return (
    <div className="w-full h-4 rounded-3xl flex m-auto bg-white overflow-hidden divide-x divide-black">
      {sections.map((section, index) => (
        <div
          key={index}
          className={`h-full w-full cursor-pointer ${
            section ? "bg-white" : "bg-gradient-to-r from-blue-950 to-cyan-500"
          }`}
          onClick={() => {
            const newSections = [...sections];
            newSections[index] = !newSections[index];
            onChange(newSections);
          }}
        />
      ))}
    </div>
  );
};
