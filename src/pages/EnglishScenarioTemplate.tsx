import { useState, useEffect, useRef } from 'react';
import type { Module, CanvasNode, Connection } from '../types/module';
import { modules } from '../data/modules';
import ModuleLibrary from '../components/ModuleLibrary';
import Canvas from '../components/Canvas';
import PropertyPanel from '../components/PropertyPanel';
import Navbar from '../components/Navbar';

interface EnglishScenarioTemplateProps {
  onBackToHome?: () => void;
}

export default function EnglishScenarioTemplate({ onBackToHome }: EnglishScenarioTemplateProps = {}) {
  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [draggedModule, setDraggedModule] = useState<Module | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const initializedRef = useRef(false);

  // 初始化询问物品的英语情景课模版画布
  useEffect(() => {
    if (initializedRef.current || canvasNodes.length > 0) {
      return;
    }

    const canvasHeight = window.innerHeight - 64;
    const centerY = canvasHeight / 2;

    // 查找需要的模块
    const startModule = modules.find((m) => m.id === 'start');
    const teachingActivityModule = modules.find((m) => m.id === 'teaching-activity');
    const exportModule = modules.find((m) => m.id === 'export');

    if (!startModule || !teachingActivityModule || !exportModule) {
      console.warn('找不到所需的模块');
      return;
    }

    // 创建节点，根据 CSV 文件中的样例值设置字段值
    const startNode: CanvasNode = {
      id: 'node-start',
      moduleId: startModule.id,
      moduleName: startModule.name,
      x: 100,
      y: centerY - 100, // 向上移动100px
      fieldValues: {
        '课程内容、知识点': 'What is it? 句型教学与常见物品词汇',
        '学习目标设置': '1. 学生能听懂并跟读 What is it? 和 It\'s a...。\n2. 学生能在模拟情景中，用该句型进行简单的物品问答。\n3. 对英语询问句产生兴趣，愿意开口尝试。',
        '学情分析输入': '学生起点：刚学完"This is a..."陈述句和一些单词，但对疑问句完全陌生。\n教学难点：1. 从陈述到疑问的思维转换（语序、语调）。2. 在真实动机下使用句子，而不是机械重复。\n学生特点：喜欢新奇、有趣的东西，注意力容易被具体事物吸引。',
      },
    };

    // 教学活动生成：活动主题不设置，让它从开始模块继承
    const teachingActivityNode: CanvasNode = {
      id: 'node-teaching-activity',
      moduleId: teachingActivityModule.id,
      moduleName: teachingActivityModule.name,
      x: 400,
      y: centerY - 100, // 向上移动100px
      fieldValues: {
        // '活动主题' 不设置初始值，让它从开始模块继承
        '活动类型': '游戏化',
        '生成要求': '需要有趣、能让学生有真实提问动机的情景活动创意',
      },
    };

    // 导出模块（暂时不连接）
    const exportNode: CanvasNode = {
      id: 'node-export',
      moduleId: exportModule.id,
      moduleName: exportModule.name,
      x: 1000, // 向右移动300px (从700改为1000)
      y: centerY - 100, // 向上移动100px
      fieldValues: {
        // 导出模块的字段暂时不设置初始值
      },
    };

    // 创建连接线：开始 → 教学活动生成（暂时不连接到导出）
    const initialConnections: Connection[] = [
      { id: 'conn-1', fromNodeId: 'node-start', toNodeId: 'node-teaching-activity' },
    ];

    initializedRef.current = true;
    setCanvasNodes([
      startNode,
      teachingActivityNode,
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
    setCanvasNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId ? { ...node, fieldValues } : node
      )
    );
  };

  const handleCreateNodes = (newNodes: CanvasNode[], newConnections: Connection[]) => {
    setCanvasNodes((prevNodes) => [...prevNodes, ...newNodes]);
    setConnections((prevConnections) => [...prevConnections, ...newConnections]);
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
            <h2 className="text-lg font-semibold text-gray-800">询问物品的英语情景课</h2>
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
          onCreateNodes={handleCreateNodes}
        />
      </div>
    </div>
  );
}
