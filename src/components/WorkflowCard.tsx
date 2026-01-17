interface WorkflowCardProps {
  name: string;
  time: string;
  onClick?: () => void;
}

export default function WorkflowCard({ name, time, onClick }: WorkflowCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-5 shadow-sm shadow-primary-400/8 transition-all cursor-pointer border-l-4 border-primary-200 hover:translate-x-1 hover:shadow-md hover:shadow-primary-200/15"
    >
      <div className="text-base font-semibold text-primary-400 mb-2">{name}</div>
      <div className="text-[13px] text-[#8a9b99] flex items-center gap-4">
        <span className="flex items-center gap-1">
          🕐 {time}
        </span>
      </div>
    </div>
  );
}
