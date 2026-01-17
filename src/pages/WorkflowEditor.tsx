import { useState, useEffect, useRef } from 'react';
import type { Module, CanvasNode, Connection } from '../types/module';
import { modules } from '../data/modules';
import ModuleLibrary from '../components/ModuleLibrary';
import Canvas from '../components/Canvas';
import PropertyPanel from '../components/PropertyPanel';
import Navbar from '../components/Navbar';

// 节点尺寸常量（与 Canvas 组件中的常量保持一致）
const NODE_HEIGHT = 60;

interface WorkflowEditorProps {
  onBackToHome?: () => void;
}

export default function WorkflowEditor({ onBackToHome }: WorkflowEditorProps = {}) {
  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [draggedModule, setDraggedModule] = useState<Module | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const initializedRef = useRef(false);

  // 初始化时自动添加"开始"和"导出"模块
  useEffect(() => {
    // 确保只初始化一次
    if (initializedRef.current || canvasNodes.length > 0) {
      return;
    }

    const startModule = modules.find((m) => m.id === 'start');
    const exportModule = modules.find((m) => m.id === 'export');

    if (!startModule || !exportModule) {
      console.warn('找不到"开始"或"导出"模块');
      return;
    }

    // 计算画布高度（考虑窗口高度，减去顶部导航栏等）
    const canvasHeight = window.innerHeight - 64; // 64px 是导航栏高度的大概值
    // 计算页面中部位置，让节点位于页面中部
    // 页面中部 = canvasHeight / 2，然后减去节点高度的一半，使节点中心在页面中部
    // 或者让节点顶部在页面中部偏上一点的位置
    const centerY = canvasHeight / 2;
    const commonTopY = Math.max(100, centerY - NODE_HEIGHT / 2);

    // 创建初始节点 - 使用完全相同的顶部 y 坐标确保底部对齐
    // 注意：必须使用完全相同的 commonTopY 值
    const startNode: CanvasNode = {
      id: 'node-start',
      moduleId: startModule.id,
      moduleName: startModule.name,
      x: 60, // 左侧位置
      y: commonTopY, // 顶部 y 坐标 - 使用相同值
    };

    const exportNode: CanvasNode = {
      id: 'node-export',
      moduleId: exportModule.id,
      moduleName: exportModule.name,
      x: 1200, // 中间右侧位置（增大间距，与开始节点相隔更远）
      y: commonTopY, // 顶部 y 坐标 - 使用完全相同的值
    };

    // 验证两个节点的 y 坐标是否完全相同
    if (startNode.y !== exportNode.y) {
      console.error('错误：两个节点的 y 坐标不一致！', {
        startNodeY: startNode.y,
        exportNodeY: exportNode.y,
      });
    }

    console.log('初始化画布节点（底部对齐）:', {
      canvasHeight,
      centerY,
      commonTopY,
      startNode: { 
        ...startNode, 
        calculatedBottom: startNode.y + NODE_HEIGHT,
        actualY: startNode.y,
      },
      exportNode: { 
        ...exportNode, 
        calculatedBottom: exportNode.y + NODE_HEIGHT,
        actualY: exportNode.y,
      },
      yValuesMatch: startNode.y === exportNode.y,
    });

    initializedRef.current = true;
    setCanvasNodes([startNode, exportNode]);
  }, []); // 空依赖数组，只在组件挂载时执行一次

  const handleDragStart = (module: Module) => {
    setDraggedModule(module);
    console.log('开始拖拽模块:', module.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件继续冒泡
    
    console.log('handleDrop 被调用', { draggedModule, currentTarget: e.currentTarget });
    
    if (!draggedModule) {
      console.log('没有 draggedModule，退出');
      return;
    }

    // 确保使用画布元素（e.currentTarget 应该是画布）
    const canvasElement = e.currentTarget as HTMLDivElement;
    
    if (!canvasElement) {
      console.error('canvasElement 为 null');
      return;
    }
    
    const rect = canvasElement.getBoundingClientRect();
    
    // 节点尺寸：NODE_WIDTH = 120, NODE_HEIGHT = 60
    const NODE_WIDTH = 120;
    const NODE_HEIGHT = 60;
    
    // 计算鼠标相对于画布内容区域的位置（考虑滚动）
    // getBoundingClientRect() 返回的是相对于视口的位置
    // 需要加上滚动偏移来得到相对于画布内容的位置
    const mouseX = e.clientX - rect.left + canvasElement.scrollLeft;
    const mouseY = e.clientY - rect.top + canvasElement.scrollTop;
    
    // 让节点中心对齐鼠标位置
    const x = mouseX - NODE_WIDTH / 2;
    const y = mouseY - NODE_HEIGHT / 2;

    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      moduleId: draggedModule.id,
      moduleName: draggedModule.name,
      x: Math.max(0, x),
      y: Math.max(0, y),
    };

    console.log('创建新节点:', {
      newNode,
      mouseX,
      mouseY,
      x,
      y,
      scrollLeft: canvasElement.scrollLeft,
      scrollTop: canvasElement.scrollTop,
      rect,
    });

    setCanvasNodes((prevNodes) => {
      const newNodes = [...prevNodes, newNode];
      console.log('更新节点列表，新节点数量:', newNodes.length);
      return newNodes;
    });
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
      // 点击节点时取消选中连接线
      setSelectedConnectionId(null);
      console.log('选中模块:', module.name);
    }
  };

  const handleSave = (nodeId: string, fieldValues: Record<string, string | number | string[]>) => {
    setCanvasNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId ? { ...node, fieldValues } : node
      )
    );
    console.log('已保存节点数据:', nodeId, fieldValues);
  };

  const handleDelete = (nodeId: string) => {
    setCanvasNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
    // 删除与该节点相关的所有连接
    setConnections((prevConnections) =>
      prevConnections.filter(
        (conn) => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
      )
    );
    if (selectedNode?.id === nodeId) {
      setSelectedModule(null);
      setSelectedNode(null);
    }
    console.log('已删除节点:', nodeId);
  };

  const handleNodeMove = (nodeId: string, x: number, y: number) => {
    setCanvasNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId ? { ...node, x, y } : node
      )
    );
    // 如果移动的是当前选中的节点，更新选中节点的位置
    if (selectedNode?.id === nodeId) {
      setSelectedNode({ ...selectedNode, x, y });
    }
  };

  const handleConnectionCreate = (fromNodeId: string, toNodeId: string) => {
    // 检查是否已存在相同的连接
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
      console.log('创建连接:', newConnection);
    }
  };

  const handleConnectionClick = (connectionId: string) => {
    // 点击连接线时选中它，取消选中节点
    // 如果 connectionId 为空字符串，则取消选中
    if (connectionId === '') {
      setSelectedConnectionId(null);
    } else {
      setSelectedConnectionId(connectionId);
      setSelectedNode(null);
      setSelectedModule(null);
      console.log('选中连接线:', connectionId);
    }
  };

  const handleConnectionDelete = (connectionId: string) => {
    setConnections((prevConnections) => 
      prevConnections.filter((conn) => conn.id !== connectionId)
    );
    if (selectedConnectionId === connectionId) {
      setSelectedConnectionId(null);
    }
    console.log('已删除连接线:', connectionId);
  };

  // 键盘事件监听：Delete 键删除选中的连接线
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否按下了 Delete 或 Backspace 键，且当前有选中的连接线
      // 同时确保不是在输入框中输入（避免误删）
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
  }, [selectedConnectionId]); // 依赖 selectedConnectionId

  // 运行工作流
  const handleRun = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setRunStatus('running');
    
    // 模拟运行过程（根据连接关系执行节点）
    // 这里可以根据实际的业务逻辑来实现
    try {
      // 模拟运行时间（根据节点数量和连接关系计算）
      const runDuration = Math.max(2000, connections.length * 500 + canvasNodes.length * 300);
      
      await new Promise(resolve => setTimeout(resolve, runDuration));
      
      setRunStatus('completed');
      
      // 3秒后恢复按钮状态
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
