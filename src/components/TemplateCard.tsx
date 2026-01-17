interface TemplateCardProps {
  icon: string;
  title: string;
  description: string;
  features: string[];
  onClick?: () => void;
}

export default function TemplateCard({ icon, title, description, features, onClick }: TemplateCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-7 shadow-md shadow-primary-400/10 transition-all cursor-pointer border-2 border-transparent hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-200/20 hover:border-primary-200"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center text-3xl mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-primary-400 mb-3">{title}</h3>
      <p className="text-sm text-[#5a7a78] leading-relaxed mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {features.map((feature, index) => (
          <span
            key={index}
            className="bg-primary-200/10 text-primary-300 py-1.5 px-3 rounded-full text-xs font-medium"
          >
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}
