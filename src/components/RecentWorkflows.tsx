import WorkflowCard from './WorkflowCard';

interface Workflow {
  name: string;
  time: string;
  onClick?: () => void;
}

interface RecentWorkflowsProps {
  title: string;
  workflows: Workflow[];
}

export default function RecentWorkflows({ title, workflows }: RecentWorkflowsProps) {
  return (
    <div className="mt-12 max-w-[1400px] mx-auto px-10">
      <h2 className="text-[22px] font-bold text-primary-400 mb-6 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-br from-primary-200 to-primary-300 rounded-sm"></span>
        {title}
      </h2>
      {workflows.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {workflows.map((workflow, index) => (
            <WorkflowCard
              key={`workflow-${index}`}
              name={workflow.name}
              time={workflow.time}
              onClick={workflow.onClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-5 text-[#8a9b99]">
          <div className="text-6xl mb-4 opacity-50">📝</div>
          <p>暂无最近工作流</p>
        </div>
      )}
    </div>
  );
}
