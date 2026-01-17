import { useState, useEffect, useRef } from 'react';
import type { Module, CanvasNode, Connection } from '../types/module';
import { modules } from '../data/modules';
import ModuleLibrary from '../components/ModuleLibrary';
import Canvas from '../components/Canvas';
import PropertyPanel from '../components/PropertyPanel';
import Navbar from '../components/Navbar';

interface LinearEquationTemplateProps {
  onBackToHome?: () => void;
}

export default function LinearEquationTemplate({ onBackToHome }: LinearEquationTemplateProps = {}) {
  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [draggedModule, setDraggedModule] = useState<Module | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const initializedRef = useRef(false);

  // 初始化一元一次拓展课模版画布
  useEffect(() => {
    if (initializedRef.current || canvasNodes.length > 0) {
      return;
    }

    const canvasHeight = window.innerHeight - 64;
    const centerY = canvasHeight / 2;

    // 查找需要的模块
    const startModule = modules.find((m) => m.id === 'start');
    const questionGenerateModule = modules.find((m) => m.id === 'question-generate');
    const questionExplanationModule = modules.find((m) => m.id === 'question-explanation');
    const pblTaskModule = modules.find((m) => m.id === 'pbl-task');
    const evaluationModule = modules.find((m) => m.id === 'evaluation-plan');
    const exportModule = modules.find((m) => m.id === 'export');

    if (!startModule || !questionGenerateModule || !questionExplanationModule || 
        !pblTaskModule || !evaluationModule || !exportModule) {
      console.warn('找不到所需的模块');
      return;
    }

    // 创建节点，根据 CSV 文件中的样例值设置字段值
    const startNode: CanvasNode = {
      id: 'node-start',
      moduleId: startModule.id,
      moduleName: startModule.name,
      x: 100,
      y: centerY - 100,
      fieldValues: {
        '课程内容、知识点': '一元一次方程的应用与拓展',
        '学习目标设置': '1.能够熟练解一元一次方程，并解决基础应用题。\n2.通过项目式学习，能将方程知识应用于解决真实生活问题。\n3. 培养数学建模意识和小组协作能力。',
        '学情分析输入': '学生已掌握一元一次方程的基本解法，但在复杂应用题建模和实际应用方面存在困难。',
      },
    };

    // 题库智能出题：核心知识点不设置，让它从开始模块继承
    const questionGenerateNode: CanvasNode = {
      id: 'node-question-generate',
      moduleId: questionGenerateModule.id,
      moduleName: questionGenerateModule.name,
      x: 400,
      y: centerY - 300, // 向上移动200px (centerY - 100 - 200)
      fieldValues: {
        // '核心知识点' 不设置初始值，让它从开始模块继承
        '题目难度': '综合（2个知识点以上）',
        '题目来源': '市区级考试题',
        '题目数量': 10,
      },
    };

    // 题目讲解生成：题目来源不设置，让它从题库智能出题继承
    const questionExplanationNode: CanvasNode = {
      id: 'node-question-explanation',
      moduleId: questionExplanationModule.id,
      moduleName: questionExplanationModule.name,
      x: 700,
      y: centerY - 300, // 向上移动200px (centerY - 100 - 200)
      fieldValues: {
        // '题目来源' 不设置初始值，让它从题库智能出题继承
        '讲解细度': 100, // 滑块设置为最细思考过程（滑块范围是0-100，100为最细）
      },
    };

    // PBL任务生成：活动主题不设置，让它从开始模块继承
    const pblTaskNode: CanvasNode = {
      id: 'node-pbl-task',
      moduleId: pblTaskModule.id,
      moduleName: pblTaskModule.name,
      x: 400,
      y: centerY - 150, // 向上移动200px (centerY + 50 - 200)
      fieldValues: {
        // '活动主题' 不设置初始值，让它从开始模块继承
        '项目周期': '1周',
        '小组规模': 4,
        '成果形式': '调研报告',
      },
    };

    // 评价方案生成
    const evaluationNode: CanvasNode = {
      id: 'node-evaluation',
      moduleId: evaluationModule.id,
      moduleName: evaluationModule.name,
      x: 700,
      y: centerY - 150, // 向上移动200px (centerY + 50 - 200)
      fieldValues: {
        '评价场景': '单元学习成果',
        '评价类型': '过程性分析', // CSV中是"过程性评估"，但模块定义中是"过程性分析"
        '评估方式': '量规评估',
      },
    };

    // 导出模块
    const exportNode: CanvasNode = {
      id: 'node-export',
      moduleId: exportModule.id,
      moduleName: exportModule.name,
      x: 1000,
      y: centerY - 400, // 再向上移动200px (centerY - 200 - 200)
      fieldValues: {
        '生成方式': ['PPT', '素材打包'], // 默认全选
        'PPT尺寸': '16:9',
        // '上传模板' 不设置初始值
      },
    };

    // 创建连接线
    const initialConnections: Connection[] = [
      { id: 'conn-1', fromNodeId: 'node-start', toNodeId: 'node-question-generate' },
      { id: 'conn-2', fromNodeId: 'node-question-generate', toNodeId: 'node-question-explanation' },
      { id: 'conn-3', fromNodeId: 'node-start', toNodeId: 'node-pbl-task' },
      { id: 'conn-4', fromNodeId: 'node-pbl-task', toNodeId: 'node-evaluation' },
      { id: 'conn-5', fromNodeId: 'node-evaluation', toNodeId: 'node-export' },
      { id: 'conn-6', fromNodeId: 'node-question-generate', toNodeId: 'node-export' },
      { id: 'conn-7', fromNodeId: 'node-question-explanation', toNodeId: 'node-export' },
      { id: 'conn-8', fromNodeId: 'node-pbl-task', toNodeId: 'node-export' },
    ];

    initializedRef.current = true;
    setCanvasNodes([
      startNode,
      questionGenerateNode,
      questionExplanationNode,
      pblTaskNode,
      evaluationNode,
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
    
    // 如果之前已经完成过，再次运行时重置状态，隐藏下载按钮
    if (runStatus === 'completed') {
      setRunStatus('idle');
    }
    
    setIsRunning(true);
    setRunStatus('running');
    
    try {
      const runDuration = Math.max(2000, connections.length * 500 + canvasNodes.length * 300);
      await new Promise(resolve => setTimeout(resolve, runDuration));
      
      setRunStatus('completed');
      setIsRunning(false);
      // 移除自动重置的 setTimeout，让下载按钮一直显示直到用户再次点击运行
    } catch (error) {
      console.error('运行出错:', error);
      setRunStatus('idle');
      setIsRunning(false);
    }
  };

  // 下载文件
  const handleDownload = async () => {
    try {
      const filePath = '/一元一次方程习题拓展课-原型展示用.pptx';
      const fileName = '一元一次方程习题拓展课-原型展示用.pptx';
      
      // 使用 fetch 下载文件
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('文件未找到');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请确保文件已放置在 public 目录中');
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
            <h2 className="text-lg font-semibold text-gray-800">一元一次方程拓展课模版</h2>
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
          {/* 运行按钮和下载按钮 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
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
              {runStatus === 'completed' && (
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 shadow-lg transition-all"
                >
                  现在下载
                </button>
              )}
            </div>
            {runStatus === 'completed' && (
              <div className="text-sm text-gray-600 mt-1">
                已生成：一元一次方程习题拓展课-原型展示用.pptx
              </div>
            )}
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
