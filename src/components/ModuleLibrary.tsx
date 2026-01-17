import type { Module } from '../types/module';

interface ModuleLibraryProps {
  modules: Module[];
  onDragStart: (module: Module) => void;
}

export default function ModuleLibrary({ modules, onDragStart }: ModuleLibraryProps) {
  // 按分类分组
  const modulesByCategory = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-primary-400">模块库</h2>
      </div>
      <div className="p-4 space-y-6">
        {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {category}
            </h3>
            <div className="space-y-2">
              {categoryModules.map((module) => (
                <div
                  key={module.id}
                  draggable
                  onDragStart={() => {
                    onDragStart(module);
                    console.log('开始拖拽模块:', module.name);
                  }}
                  className="p-3 bg-white border border-gray-300 rounded-lg cursor-move hover:border-primary-200 hover:shadow-md transition-all"
                >
                  <div className="text-sm font-medium text-primary-400">{module.name}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{module.description}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
