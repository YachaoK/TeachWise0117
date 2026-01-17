import { useState, useRef, useEffect, useCallback } from 'react';
import type { CanvasNode, Connection } from '../types/module';

interface CanvasProps {
  nodes: CanvasNode[];
  connections: Connection[];
  onNodeClick: (node: CanvasNode) => void;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onConnectionCreate: (fromNodeId: string, toNodeId: string) => void;
  onConnectionClick?: (connectionId: string) => void;
  onConnectionDelete?: (connectionId: string) => void;
  selectedConnectionId?: string | null;
  isRunning?: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

// 节点尺寸常量
const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const CONNECTION_POINT_RADIUS = 5;

export default function Canvas({
  nodes,
  connections,
  onNodeClick,
  onNodeMove,
  onConnectionCreate,
  onConnectionClick,
  onConnectionDelete,
  selectedConnectionId,
  isRunning = false,
  onDrop,
  onDragOver,
}: CanvasProps) {
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [connectingFromNodeId, setConnectingFromNodeId] = useState<string | null>(null);
  const [tempConnectionEnd, setTempConnectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [nearbyNodeId, setNearbyNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    draggingNodeId,
    connectingFromNodeId,
    nearbyNodeId,
    nodes,
  });

  // 更新 ref 中的状态
  useEffect(() => {
    stateRef.current = {
      draggingNodeId,
      connectingFromNodeId,
      nearbyNodeId,
      nodes,
    };
  }, [draggingNodeId, connectingFromNodeId, nearbyNodeId, nodes]);

  // 获取节点的连接点位置（与实际渲染位置一致）
  // 获取节点的连接点位置（使用 DOM API 获取实际位置）
  const getNodeConnectionPoints = useCallback((node: CanvasNode) => {
    if (!canvasRef.current) {
      // 如果画布未准备好，使用计算值
      const centerY = node.y + NODE_HEIGHT / 2;
      const outputX = node.x + NODE_WIDTH - CONNECTION_POINT_RADIUS;
      const inputX = node.x + CONNECTION_POINT_RADIUS;
      return {
        output: { x: outputX, y: centerY },
        input: { x: inputX, y: centerY },
      };
    }

    // 使用 DOM API 获取节点的实际位置
    const nodeElement = canvasRef.current.querySelector(`[data-node-id="${node.id}"]`) as HTMLElement;
    if (!nodeElement) {
      // 如果节点元素不存在，使用计算值
      const centerY = node.y + NODE_HEIGHT / 2;
      const outputX = node.x + NODE_WIDTH - CONNECTION_POINT_RADIUS;
      const inputX = node.x + CONNECTION_POINT_RADIUS;
      return {
        output: { x: outputX, y: centerY },
        input: { x: inputX, y: centerY },
      };
    }

    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // 获取连接点元素
    const outputPoint = nodeElement.querySelector('[data-connection-point="output"]') as HTMLElement;
    const inputPoint = nodeElement.querySelector('[data-connection-point="input"]') as HTMLElement;
    
    if (outputPoint && inputPoint) {
      // 使用连接点的实际位置
      const outputRect = outputPoint.getBoundingClientRect();
      const inputRect = inputPoint.getBoundingClientRect();
      
      return {
        output: { 
          x: outputRect.left - canvasRect.left + outputRect.width / 2 + canvasRef.current.scrollLeft,
          y: outputRect.top - canvasRect.top + outputRect.height / 2 + canvasRef.current.scrollTop,
        },
        input: { 
          x: inputRect.left - canvasRect.left + inputRect.width / 2 + canvasRef.current.scrollLeft,
          y: inputRect.top - canvasRect.top + inputRect.height / 2 + canvasRef.current.scrollTop,
        },
      };
    }
    
    // 如果连接点元素不存在，使用计算值
    const centerY = node.y + NODE_HEIGHT / 2;
    const outputX = node.x + NODE_WIDTH - CONNECTION_POINT_RADIUS;
    const inputX = node.x + CONNECTION_POINT_RADIUS;
    return {
      output: { x: outputX, y: centerY },
      input: { x: inputX, y: centerY },
    };
  }, []);

  // 计算贝塞尔曲线路径（Coze 风格：平滑曲线）
  const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    // 控制点偏移量，根据距离动态调整
    const distance = Math.sqrt(dx * dx + dy * dy);
    const controlPointOffset = Math.min(Math.max(distance * 0.4, 50), 150);
    
    // 水平方向的控制点
    const cp1x = x1 + controlPointOffset;
    const cp1y = y1;
    const cp2x = x2 - controlPointOffset;
    const cp2y = y2;
    
    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  };

  // 检查鼠标是否靠近节点的输入连接点
  const checkNearbyNode = (x: number, y: number, nodeList: CanvasNode[], excludeNodeId?: string): string | null => {
    let closestNodeId: string | null = null;
    let minDistance = Infinity;
    const SNAP_DISTANCE = 100; // 吸附距离，增加到 100px

    for (const node of nodeList) {
      // 排除源节点
      if (excludeNodeId && node.id === excludeNodeId) continue;
      
      const points = getNodeConnectionPoints(node);
      
      // 检查是否在节点左侧区域（更宽松的检测）
      const isInLeftArea = x >= node.x - 50 && x <= node.x + 50 && 
                          y >= node.y - 20 && y <= node.y + NODE_HEIGHT + 20;
      
      // 计算到输入点的距离
      const distance = Math.sqrt(
        Math.pow(x - points.input.x, 2) + Math.pow(y - points.input.y, 2)
      );
      
      // 如果在左侧区域或距离足够近
      if (isInLeftArea || distance < SNAP_DISTANCE) {
        if (distance < minDistance) {
          minDistance = distance;
          closestNodeId = node.id;
          // 调试日志已注释，减少控制台输出
          // console.log('检测到附近节点:', {
          //   nodeId: node.id,
          //   nodeName: node.moduleName,
          //   distance: distance.toFixed(2),
          //   mousePos: { x, y },
          //   inputPoint: points.input,
          //   nodePos: { x: node.x, y: node.y },
          //   isInLeftArea,
          // });
        }
      }
    }
    
    return closestNodeId;
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: CanvasNode) => {
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return;

    const nodeX = node.x;
    const nodeY = node.y;
    // 考虑画布的滚动偏移
    const mouseX = e.clientX - rect.left + canvasRef.current.scrollLeft;
    const mouseY = e.clientY - rect.top + canvasRef.current.scrollTop;

    dragOffsetRef.current = {
      x: mouseX - nodeX,
      y: mouseY - nodeY,
    };
    setDraggingNodeId(node.id);
    setIsDragging(false);
  };

  const handleOutputPointMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    // console.log('开始连接，节点ID:', nodeId);
    setConnectingFromNodeId(nodeId);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && canvasRef.current) {
      // 考虑画布的滚动偏移
      const mouseX = e.clientX - rect.left + canvasRef.current.scrollLeft;
      const mouseY = e.clientY - rect.top + canvasRef.current.scrollTop;
      // console.log('设置临时连接终点:', mouseX, mouseY);
      setTempConnectionEnd({ x: mouseX, y: mouseY });
    }
  };


  // 添加全局鼠标事件监听
  useEffect(() => {
    const moveHandler = (e: MouseEvent) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      // 考虑画布的滚动偏移
      const mouseX = e.clientX - rect.left + canvasRef.current.scrollLeft;
      const mouseY = e.clientY - rect.top + canvasRef.current.scrollTop;
      const state = stateRef.current;

      // 处理节点拖拽
      if (state.draggingNodeId) {
        setIsDragging(true);
        const newX = mouseX - dragOffsetRef.current.x;
        const newY = mouseY - dragOffsetRef.current.y;
        onNodeMove(state.draggingNodeId, Math.max(0, newX), Math.max(0, newY));
      }

      // 处理连接线拖拽
      if (state.connectingFromNodeId) {
        setTempConnectionEnd({ x: mouseX, y: mouseY });
        const nearby = checkNearbyNode(mouseX, mouseY, state.nodes, state.connectingFromNodeId);
        // 强制更新 nearbyNodeId
        setNearbyNodeId(nearby);
      }
    };

    const upHandler = (e: MouseEvent) => {
      // 使用最新的状态值
      const currentConnectingFrom = connectingFromNodeId;
      let currentNearby = nearbyNodeId;
      
      // 如果 nearbyNodeId 为 null，在鼠标松开时再次检测一次
      if (currentConnectingFrom && !currentNearby && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        // 考虑画布的滚动偏移
        const mouseX = e.clientX - rect.left + canvasRef.current.scrollLeft;
        const mouseY = e.clientY - rect.top + canvasRef.current.scrollTop;
        const nearby = checkNearbyNode(mouseX, mouseY, nodes, currentConnectingFrom);
        if (nearby) {
          currentNearby = nearby;
          setNearbyNodeId(nearby);
          // console.log('鼠标松开时检测到附近节点:', nearby);
        }
      }
      
      console.log('鼠标松开，当前状态:', {
        connectingFromNodeId: currentConnectingFrom,
        nearbyNodeId: currentNearby,
      });
      
      // 完成连接
      if (currentConnectingFrom && currentNearby && currentConnectingFrom !== currentNearby) {
        // console.log('创建连接:', currentConnectingFrom, '->', currentNearby);
        onConnectionCreate(currentConnectingFrom, currentNearby);
      }
      // 调试日志已注释
      // else {
      //   console.log('连接未完成，原因:', {
      //     hasFrom: !!currentConnectingFrom,
      //     hasTo: !!currentNearby,
      //     isSame: currentConnectingFrom === currentNearby,
      //     fromId: currentConnectingFrom,
      //     toId: currentNearby,
      //   });
      // }

      setDraggingNodeId(null);
      setIsDragging(false);
      setConnectingFromNodeId(null);
      setTempConnectionEnd(null);
      setNearbyNodeId(null);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    return () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
  }, [connectingFromNodeId, nearbyNodeId, nodes, onNodeMove, onConnectionCreate]);

  return (
    <>
      {/* 添加流动动画样式 */}
      <style>
        {`
          @keyframes flow {
            0% {
              stroke-dashoffset: 0;
            }
            100% {
              stroke-dashoffset: 12;
            }
          }
        `}
      </style>
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-auto bg-gray-50"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
        onDrop={(e) => {
          // 直接调用 onDrop，事件冒泡确保 e.currentTarget 是画布元素
          onDrop(e);
        }}
        onDragOver={onDragOver}
        onMouseLeave={() => {
          setHoveredNodeId(null);
          if (!connectingFromNodeId) {
            setTempConnectionEnd(null);
          }
        }}
        onClick={(e) => {
          // 点击画布空白处时取消选中连接线
          // 只有当点击的是画布本身（不是节点或连接线）时才取消选中
          if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-background')) {
            if (onConnectionClick && selectedConnectionId) {
              onConnectionClick('');
            }
          }
        }}
      >
      {/* SVG 层用于绘制连接线 - 在节点下方 */}
      <svg
        className="absolute inset-0"
        style={{ 
          zIndex: 5, 
          width: '100%', 
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none', // 默认不接收鼠标事件，只有 path 元素接收
        }}
      >
        {/* 绘制已存在的连接线 */}
        {connections.map((connection) => {
          const fromNode = nodes.find((n) => n.id === connection.fromNodeId);
          const toNode = nodes.find((n) => n.id === connection.toNodeId);
          if (!fromNode || !toNode) {
            console.warn('连接线节点不存在:', { connection, fromNodeId: connection.fromNodeId, toNodeId: connection.toNodeId });
            return null;
          }

          const fromPoints = getNodeConnectionPoints(fromNode);
          const toPoints = getNodeConnectionPoints(toNode);
          
          // 调试日志已注释，减少控制台输出
          // console.log('绘制连接线:', {
          //   connectionId: connection.id,
          //   fromNode: { id: fromNode.id, name: fromNode.moduleName, pos: { x: fromNode.x, y: fromNode.y } },
          //   toNode: { id: toNode.id, name: toNode.moduleName, pos: { x: toNode.x, y: toNode.y } },
          //   fromPoint: fromPoints.output,
          //   toPoint: toPoints.input,
          // });
          
          const path = getBezierPath(
            fromPoints.output.x,
            fromPoints.output.y,
            toPoints.input.x,
            toPoints.input.y
          );

          const isSelected = selectedConnectionId === connection.id;

          return (
            <g key={connection.id}>
              {/* 基础连接线 */}
              <path
                d={path}
                fill="none"
                stroke={isSelected ? "#2d7a73" : "#4a9b94"}
                strokeWidth={isSelected ? "4" : "2.5"}
                className="pointer-events-auto cursor-pointer"
                style={{ 
                  filter: isSelected 
                    ? 'drop-shadow(0 2px 4px rgba(45, 122, 115, 0.3))' 
                    : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                  transition: 'stroke 0.2s, stroke-width 0.2s',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onConnectionClick) {
                    onConnectionClick(connection.id);
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.setAttribute('stroke', '#3a8b83');
                    e.currentTarget.setAttribute('stroke-width', '3');
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.setAttribute('stroke', '#4a9b94');
                    e.currentTarget.setAttribute('stroke-width', '2.5');
                  }
                }}
              />
              {/* 运行时的流动动画效果 */}
              {isRunning && (
                <path
                  d={path}
                  fill="none"
                  stroke="#60d4c3"
                  strokeWidth="3"
                  strokeDasharray="8 4"
                  opacity="0.8"
                  className="pointer-events-none"
                  style={{
                    animation: 'flow 1.5s linear infinite',
                    filter: 'drop-shadow(0 0 4px rgba(96, 212, 195, 0.6))',
                    strokeDashoffset: 0,
                  }}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="12"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </path>
              )}
            </g>
          );
        })}

        {/* 绘制临时连接线 */}
        {connectingFromNodeId && tempConnectionEnd && (() => {
          const fromNode = nodes.find((n) => n.id === connectingFromNodeId);
          if (!fromNode) {
            console.log('找不到源节点:', connectingFromNodeId);
            return null;
          }

          const fromPoints = getNodeConnectionPoints(fromNode);
          let endX = tempConnectionEnd.x;
          let endY = tempConnectionEnd.y;

          // 如果靠近目标节点，吸附到输入点
          if (nearbyNodeId && nearbyNodeId !== connectingFromNodeId) {
            const toNode = nodes.find((n) => n.id === nearbyNodeId);
            if (toNode) {
              const toPoints = getNodeConnectionPoints(toNode);
              endX = toPoints.input.x;
              endY = toPoints.input.y;
              // 调试日志已注释
              // console.log('吸附到目标节点输入点:', { 
              //   nodeId: nearbyNodeId, 
              //   endX, 
              //   endY,
              //   inputPoint: toPoints.input 
              // });
            }
          }

          const path = getBezierPath(fromPoints.output.x, fromPoints.output.y, endX, endY);
          // 调试日志已注释
          // console.log('绘制临时连接线:', {
          //   from: { x: fromPoints.output.x, y: fromPoints.output.y },
          //   to: { x: endX, y: endY },
          //   path,
          // });
          
          return (
            <path
              key="temp-connection"
              d={path}
              fill="none"
              stroke="#4a9b94"
              strokeWidth="2.5"
              strokeDasharray="6,4"
              opacity="0.7"
              className="pointer-events-none"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
            />
          );
        })()}
      </svg>

      {/* 节点层 */}
      {nodes.map((node) => {
        const isHovered = hoveredNodeId === node.id;
        const showOutputPoint = isHovered || connectingFromNodeId === node.id;
        const showInputPoint = isHovered || nearbyNodeId === node.id;

        return (
          <div
            key={node.id}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => {
              if (connectingFromNodeId !== node.id) {
                setHoveredNodeId(null);
              }
            }}
            onMouseDown={(e) => {
              // 如果点击的是连接点，不触发节点拖拽
              const target = e.target as HTMLElement;
              if (!target.classList.contains('connection-point') && !target.closest('.connection-point')) {
                handleNodeMouseDown(e, node);
              }
            }}
            onClick={(e) => {
              // 如果点击的是连接点，不触发节点选中
              const target = e.target as HTMLElement;
              if (!target.classList.contains('connection-point') && !isDragging && !connectingFromNodeId) {
                onNodeClick(node);
              }
            }}
            className={`absolute bg-white border-2 rounded-lg relative ${
              draggingNodeId === node.id
                ? 'border-primary-300 shadow-lg cursor-move z-50'
                : 'border-primary-200 hover:border-primary-300 hover:shadow-md cursor-move'
            } transition-all`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: `${NODE_WIDTH}px`,
              height: `${NODE_HEIGHT}px`, // 使用固定高度确保底部对齐
              padding: '16px', // 使用内联样式确保 padding 一致
              boxSizing: 'border-box', // 确保高度包含 padding 和 border
              userSelect: 'none',
              zIndex: draggingNodeId === node.id ? 50 : 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden', // 确保内容不会溢出影响高度
              minHeight: `${NODE_HEIGHT}px`, // 添加 minHeight 作为额外保障
              maxHeight: `${NODE_HEIGHT}px`, // 添加 maxHeight 防止被内容撑开
            }}
            data-node-id={node.id}
          >
            <div 
              className="text-sm font-medium text-gray-700 text-center leading-tight"
              style={{
                lineHeight: '1.25', // 固定行高
                overflow: 'hidden', // 防止文本溢出
                textOverflow: 'ellipsis', // 超出部分显示省略号
              }}
            >
              {node.moduleName}
            </div>

            {/* 输出连接点（右侧）- Coze 风格：始终显示在框边缘 */}
            <div
              data-connection-point="output"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                // console.log('输出连接点被点击，节点ID:', node.id, '当前状态:', { connectingFromNodeId, tempConnectionEnd });
                handleOutputPointMouseDown(e, node.id);
              }}
              className={`connection-point absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full border-2 shadow-sm cursor-crosshair transition-all ${
                showOutputPoint || connectingFromNodeId === node.id
                  ? 'w-3 h-3 bg-primary-200 border-primary-300 hover:bg-primary-300 hover:scale-125 opacity-100'
                  : 'w-2.5 h-2.5 bg-gray-300 border-gray-400 opacity-40 hover:opacity-100'
              }`}
              style={{
                right: `-${CONNECTION_POINT_RADIUS}px`,
                pointerEvents: 'auto',
                zIndex: 30,
              }}
              onMouseEnter={() => {
                setHoveredNodeId(node.id);
                // console.log('鼠标进入输出连接点，节点ID:', node.id);
              }}
            />

            {/* 输入连接点（左侧）- Coze 风格：始终显示在框边缘 */}
            <div
              data-connection-point="input"
              className={`connection-point absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full border-2 shadow-sm ${
                showInputPoint || nearbyNodeId === node.id
                  ? 'w-3 h-3 bg-primary-200 border-primary-300 opacity-100'
                  : 'w-2.5 h-2.5 bg-gray-300 border-gray-400 opacity-40 hover:opacity-100'
              }`}
              style={{
                left: `-${CONNECTION_POINT_RADIUS}px`,
                backgroundColor: nearbyNodeId === node.id ? '#2d7a73' : (showInputPoint ? '#4a9b94' : '#d1d5db'),
                pointerEvents: 'auto',
                zIndex: 30,
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
            />
          </div>
        );
      })}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <p className="text-sm">拖拽左侧模块到此处开始构建工作流</p>
        </div>
      )}
      </div>
    </>
  );
}
