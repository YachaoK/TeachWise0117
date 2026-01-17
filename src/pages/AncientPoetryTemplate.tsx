import { useState, useEffect, useRef } from 'react';
import type { Module, CanvasNode, Connection } from '../types/module';
import { modules } from '../data/modules';
import ModuleLibrary from '../components/ModuleLibrary';
import Canvas from '../components/Canvas';
import PropertyPanel from '../components/PropertyPanel';
import Navbar from '../components/Navbar';

interface AncientPoetryTemplateProps {
  onBackToHome?: () => void;
}

export default function AncientPoetryTemplate({ onBackToHome }: AncientPoetryTemplateProps = {}) {
  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [draggedModule, setDraggedModule] = useState<Module | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const initializedRef = useRef(false);

  // 初始化古诗词备课模版画布
  useEffect(() => {
    if (initializedRef.current || canvasNodes.length > 0) {
      return;
    }

    // 查找需要的模块
    const startModule = modules.find((m) => m.id === 'start');
    const videoSearchModule = modules.find((m) => m.id === 'video-search');
    const illustrationModule = modules.find((m) => m.id === 'illustration-generate');
    const knowledgeCardModule = modules.find((m) => m.id === 'knowledge-card');
    const blackboardModule = modules.find((m) => m.id === 'blackboard-generate');
    const exportModule = modules.find((m) => m.id === 'export');

    if (!startModule || !videoSearchModule || !illustrationModule || 
        !knowledgeCardModule || !blackboardModule || !exportModule) {
      console.warn('找不到所需的模块');
      return;
    }

    // 创建节点，根据用户调整后的位置设置坐标
    const startNode: CanvasNode = {
      id: 'node-start',
      moduleId: startModule.id,
      moduleName: startModule.name,
      x: 141,
      y: 300.5,
      fieldValues: {
        '课程内容、知识点': '《琵琶行》',
        '学习目标设置': '1. 品味诗歌语言，赏析音乐描写的精妙手法。\n2. 把握诗人与琵琶女的情感共鸣，理解"同是天涯沦落人"的深层内涵。\n3. 感知作品中的悲剧美，了解中唐文人的精神世界。',
        '学情分析输入': '高二学生，已具备一定的诗歌鉴赏能力，对白居易及其《长恨歌》有初步了解。但对中唐社会背景和"歌行体"特点认识不深，对音乐描写的艺术手法分析不够系统。',
      },
    };

    const videoSearchNode: CanvasNode = {
      id: 'node-video-search',
      moduleId: videoSearchModule.id,
      moduleName: videoSearchModule.name,
      x: 400, // 临时坐标，等待用户提供
      y: 200.5, // 向上移动100px (300.5 - 100)
      fieldValues: {
        // '检索词' 不设置初始值，让它从开始模块继承
        '视频语言': '中文',
        '全局智能推荐词': ['琵琶行赏析', '唐朝音乐', '琵琶名曲'], // 默认全选
      },
    };

    // 插图生成、知识卡片生成、教学板书生成与视频检索左对齐（x坐标相同）
    const ALIGNED_X = 400; // 与视频检索模块左对齐

    const illustrationNode: CanvasNode = {
      id: 'node-illustration',
      moduleId: illustrationModule.id,
      moduleName: illustrationModule.name,
      x: ALIGNED_X, // 与视频检索左对齐
      y: 300, // 向上移动100px (400 - 100)
      fieldValues: {
        '比例': '自定义',
        '比例自定义值': '1:1', // 自定义比例的值
        '为每个提示词生成的图片数量': 4,
        '参考风格': '中国水墨画.png', // 文件名
        '提示词，不同主题需用///分隔': '犹抱琵琶半遮面///江州司马青衫湿///琵琶女弹奏琵琶的特写，神情哀伤///月夜江边，唐代诗人与琵琶女相遇',
      },
    };

    const knowledgeCardNode: CanvasNode = {
      id: 'node-knowledge-card',
      moduleId: knowledgeCardModule.id,
      moduleName: knowledgeCardModule.name,
      x: ALIGNED_X, // 与视频检索左对齐
      y: 400, // 向上移动100px (500 - 100)
      fieldValues: {
        // '提示词' 不设置初始值，让它从开始模块继承
        '字数限制': '200',
        '全局智能推荐词': ['白居易生平与创作背景', '歌行体特点', '中唐乐伎文化'], // 默认全选
      },
    };

    const blackboardNode: CanvasNode = {
      id: 'node-blackboard',
      moduleId: blackboardModule.id,
      moduleName: blackboardModule.name,
      x: ALIGNED_X, // 与视频检索左对齐
      y: 500, // 向上移动100px (600 - 100)
      fieldValues: {
        // '生成依据' 不设置初始值，让它从开始模块继承
        '核心逻辑': '对比区别（适合：概念辨析、人物对比、优缺点分析）',
      },
    };

    const exportNode: CanvasNode = {
      id: 'node-export',
      moduleId: exportModule.id,
      moduleName: exportModule.name,
      x: 1600, // 临时坐标，等待用户提供
      y: 300.5, // 与开始模块顶部对齐
      fieldValues: {
        '生成方式': ['PPT', '素材打包'], // 默认全选
        'PPT尺寸': '16:9',
        '上传模板': '语文课堂模版.ppt',
      },
    };

    // 创建连接线：开始 -> 视频检索、插图生成、知识卡片生成、教学板书生成 -> 导出
    const initialConnections: Connection[] = [
      { id: 'conn-1', fromNodeId: 'node-start', toNodeId: 'node-video-search' },
      { id: 'conn-2', fromNodeId: 'node-start', toNodeId: 'node-illustration' },
      { id: 'conn-3', fromNodeId: 'node-start', toNodeId: 'node-knowledge-card' },
      { id: 'conn-4', fromNodeId: 'node-start', toNodeId: 'node-blackboard' },
      { id: 'conn-5', fromNodeId: 'node-video-search', toNodeId: 'node-export' },
      { id: 'conn-6', fromNodeId: 'node-illustration', toNodeId: 'node-export' },
      { id: 'conn-7', fromNodeId: 'node-knowledge-card', toNodeId: 'node-export' },
      { id: 'conn-8', fromNodeId: 'node-blackboard', toNodeId: 'node-export' },
    ];

    initializedRef.current = true;
    setCanvasNodes([
      startNode,
      videoSearchNode,
      illustrationNode,
      knowledgeCardNode,
      blackboardNode,
      exportNode,
    ]);
    setConnections(initialConnections);
  }, []);

  const handleDragStart = (module: Module) => {
    setDraggedModule(module);
    console.log('开始拖拽模块:', module.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedModule) {
      return;
    }

    const canvasElement = e.currentTarget as HTMLDivElement;
    if (!canvasElement) {
      return;
    }
    
    const rect = canvasElement.getBoundingClientRect();
    const NODE_WIDTH = 120;
    const NODE_HEIGHT = 60;
    
    const mouseX = e.clientX - rect.left + canvasElement.scrollLeft;
    const mouseY = e.clientY - rect.top + canvasElement.scrollTop;
    
    const x = mouseX - NODE_WIDTH / 2;
    const y = mouseY - NODE_HEIGHT / 2;

    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      moduleId: draggedModule.id,
      moduleName: draggedModule.name,
      x: Math.max(0, x),
      y: Math.max(0, y),
    };

    setCanvasNodes((prevNodes) => [...prevNodes, newNode]);
    setDraggedModule(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleNodeClick = (node: CanvasNode) => {
    const module = modules.find((m) => m.id === node.moduleId);
    if (module) {
      setSelectedModule(module);
      setSelectedNode(node);
      setSelectedConnectionId(null);
    }
  };

  const handleSave = (nodeId: string, fieldValues: Record<string, string | number | string[]>) => {
    setCanvasNodes((prevNodes) => {
      // 先更新保存的节点
      let updatedNodes = prevNodes.map((node) =>
        node.id === nodeId ? { ...node, fieldValues } : node
      );

      // 获取保存后的开始节点
      const savedNode = updatedNodes.find(n => n.id === nodeId);
      
      // 如果保存的是开始模块，检查是否需要更新继承字段
      if (savedNode?.moduleId === 'start') {
        const courseContent = savedNode.fieldValues?.['课程内容、知识点'] as string || '';
        const learningObjectives = savedNode.fieldValues?.['学习目标设置'] as string || '';
        
        // 更新视频检索模块的检索词（继承课程内容、知识点）
        updatedNodes = updatedNodes.map((node) => {
          if (node.moduleId === 'video-search') {
            return {
              ...node,
              fieldValues: {
                ...node.fieldValues,
                '检索词': courseContent,
              },
            };
          }
          return node;
        });

        // 更新知识卡片生成模块的提示词（继承课程内容、知识点）
        updatedNodes = updatedNodes.map((node) => {
          if (node.moduleId === 'knowledge-card') {
            return {
              ...node,
              fieldValues: {
                ...node.fieldValues,
                '提示词': courseContent,
              },
            };
          }
          return node;
        });

        // 更新教学板书生成模块的生成依据（继承课程内容、知识点和学习目标设置）
        updatedNodes = updatedNodes.map((node) => {
          if (node.moduleId === 'blackboard-generate') {
            const generateBasis = learningObjectives 
              ? `${courseContent}\n${learningObjectives}`
              : courseContent;
            return {
              ...node,
              fieldValues: {
                ...node.fieldValues,
                '生成依据': generateBasis,
              },
            };
          }
          return node;
        });
      }

      return updatedNodes;
    });
  };

  const handleDelete = (nodeId: string) => {
    setCanvasNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
    setConnections((prevConnections) =>
      prevConnections.filter(
        (conn) => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
      )
    );
    if (selectedNode?.id === nodeId) {
      setSelectedModule(null);
      setSelectedNode(null);
    }
  };

  const handleNodeMove = (nodeId: string, x: number, y: number) => {
    setCanvasNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId ? { ...node, x, y } : node
      )
    );
    if (selectedNode?.id === nodeId) {
      setSelectedNode({ ...selectedNode, x, y });
    }
  };

  const handleConnectionCreate = (fromNodeId: string, toNodeId: string) => {
    const exists = connections.some(
      (conn) => conn.fromNodeId === fromNodeId && conn.toNodeId === toNodeId
    );
    if (!exists) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        fromNodeId,
        toNodeId,
      };
      setConnections([...connections, newConnection]);
    }
  };

  const handleConnectionClick = (connectionId: string) => {
    if (connectionId === '') {
      setSelectedConnectionId(null);
    } else {
      setSelectedConnectionId(connectionId);
      setSelectedNode(null);
      setSelectedModule(null);
    }
  };

  const handleConnectionDelete = (connectionId: string) => {
    setConnections((prevConnections) => 
      prevConnections.filter((conn) => conn.id !== connectionId)
    );
    if (selectedConnectionId === connectionId) {
      setSelectedConnectionId(null);
    }
  };

  // 键盘事件监听：Delete 键删除选中的连接线
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = 
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable;
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedConnectionId && !isInputFocused) {
        e.preventDefault();
        handleConnectionDelete(selectedConnectionId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedConnectionId]);

  // 运行工作流
  const handleRun = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setRunStatus('running');
    
    try {
      const runDuration = Math.max(2000, connections.length * 500 + canvasNodes.length * 300);
      await new Promise(resolve => setTimeout(resolve, runDuration));
      
      setRunStatus('completed');
      
      setTimeout(() => {
        setRunStatus('idle');
        setIsRunning(false);
      }, 3000);
    } catch (error) {
      console.error('运行出错:', error);
      setRunStatus('idle');
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar
        logo="良师小助"
        navLinks={[
          { label: '模版商店', href: '#' },
          { label: '备课社区', href: '#' },
          { label: '我的资源库', href: '#' },
        ]}
        userAvatar="KK"
        onLogoClick={onBackToHome}
      />
      <div className="flex-1 flex overflow-hidden">
        <ModuleLibrary modules={modules} onDragStart={handleDragStart} />
        <div className="flex-1 flex flex-col relative">
          {/* 画布左上角显示文件名称 */}
          <div className="absolute top-4 left-4 z-50 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">古诗词备课模板</h2>
          </div>
          <Canvas
            nodes={canvasNodes}
            connections={connections}
            onNodeClick={handleNodeClick}
            onNodeMove={handleNodeMove}
            onConnectionCreate={handleConnectionCreate}
            onConnectionClick={handleConnectionClick}
            onConnectionDelete={handleConnectionDelete}
            selectedConnectionId={selectedConnectionId}
            isRunning={isRunning}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          />
          {/* 运行按钮 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-all ${
                isRunning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : runStatus === 'completed'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gradient-to-br from-primary-200 to-primary-300 hover:from-primary-300 hover:to-primary-400 hover:shadow-xl'
              }`}
            >
              {runStatus === 'running' && (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  运行中...
                </span>
              )}
              {runStatus === 'completed' && '✓ 运行完成'}
              {runStatus === 'idle' && '▶ 运行'}
            </button>
          </div>
        </div>
        <PropertyPanel
          selectedModule={selectedModule}
          selectedNode={selectedNode}
          allNodes={canvasNodes}
          connections={connections}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
