import TemplateCard from './TemplateCard';

interface Template {
  icon: string;
  title: string;
  description: string;
  features: string[];
  onClick?: () => void;
}

interface TemplatesSectionProps {
  title: string;
  templates: Template[];
}

export default function TemplatesSection({ title, templates }: TemplatesSectionProps) {
  return (
    <div className="mb-12 max-w-[1400px] mx-auto px-10">
      <h2 className="text-[22px] font-bold text-primary-400 mb-6 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-br from-primary-200 to-primary-300 rounded-sm"></span>
        {title}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        {templates.map((template, index) => (
          <TemplateCard
            key={`template-${index}`}
            icon={template.icon}
            title={template.title}
            description={template.description}
            features={template.features}
            onClick={template.onClick}
          />
        ))}
      </div>
    </div>
  );
}
