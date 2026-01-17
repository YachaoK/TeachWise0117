import { useState, useEffect } from 'react';
import type { Module, ModuleField, CanvasNode } from '../types/module';
import { modules } from '../data/modules';

interface PropertyPanelProps {
  selectedModule: Module | null;
  selectedNode: CanvasNode | null;
  allNodes: CanvasNode[];
  connections: Array<{ id: string; fromNodeId: string; toNodeId: string }>;
  onSave: (nodeId: string, fieldValues: Record<string, string | number | string[]>) => void;
  onDelete: (nodeId: string) => void;
  onCreateNodes?: (nodes: CanvasNode[], connections: Array<{ id: string; fromNodeId: string; toNodeId: string }>) => void;
}

export default function PropertyPanel({ selectedModule, selectedNode, allNodes, connections, onSave, onDelete, onCreateNodes }: PropertyPanelProps) {
  // 跟踪"素材来源"字段的值（用于示范朗读生成模块）
  const [materialSource, setMaterialSource] = useState<string>('');
  // 跟踪"活动类型"字段的值（用于教学活动生成模块）
  const [activityType, setActivityType] = useState<string>('');
  // 跟踪"比例"字段的值（用于插图生成模块）
  const [ratio, setRatio] = useState<string>('');
  // 跟踪"生成方式"字段的值（用于导出模块）
  const [exportMethods, setExportMethods] = useState<string[]>(['PPT', '素材打包']); // 默认全选
  // 跟踪上传模板文件的删除状态（用于导出模块）
  const [uploadedFileDeleted, setUploadedFileDeleted] = useState<boolean>(false);
  // 跟踪教学活动生成模块的创意方案浮窗显示状态
  const [showActivityIdeasModal, setShowActivityIdeasModal] = useState<boolean>(false);
  // 当选中节点改变时，更新素材来源和活动类型的值
  useEffect(() => {
    if (selectedModule?.id === 'reading-demo' && selectedNode) {
      // 尝试从已保存的值中获取
      const savedMaterialSource = selectedNode.fieldValues?.['素材来源'] as string;
      if (savedMaterialSource) {
        setMaterialSource(savedMaterialSource);
      } else {
        // 如果没有保存的值，检查 select 元素的当前值
        setTimeout(() => {
          const materialSourceFieldIndex = selectedModule.fields.findIndex(f => f.name === '素材来源');
          if (materialSourceFieldIndex !== -1) {
            const fieldId = `field-${selectedModule.id}-${materialSourceFieldIndex}`;
            const selectElement = document.getElementById(fieldId) as HTMLSelectElement;
            if (selectElement && selectElement.value) {
              setMaterialSource(selectElement.value);
            }
          }
        }, 0);
      }
    } else {
      setMaterialSource('');
    }

    // 处理教学活动生成模块的活动类型
    if (selectedModule?.id === 'teaching-activity' && selectedNode) {
      const savedActivityType = selectedNode.fieldValues?.['活动类型'] as string;
      if (savedActivityType) {
        setActivityType(savedActivityType);
      } else {
        setTimeout(() => {
          const activityTypeFieldIndex = selectedModule.fields.findIndex(f => f.name === '活动类型');
          if (activityTypeFieldIndex !== -1) {
            const fieldId = `field-${selectedModule.id}-${activityTypeFieldIndex}`;
            const selectElement = document.getElementById(fieldId) as HTMLSelectElement;
            if (selectElement && selectElement.value) {
              setActivityType(selectElement.value);
            }
          }
        }, 0);
      }
    } else {
      setActivityType('');
    }

    // 处理插图生成模块的比例
    if (selectedModule?.id === 'illustration-generate' && selectedNode) {
      const savedRatio = selectedNode.fieldValues?.['比例'] as string;
      if (savedRatio) {
        setRatio(savedRatio);
      } else {
        setTimeout(() => {
          const ratioFieldIndex = selectedModule.fields.findIndex(f => f.name === '比例');
          if (ratioFieldIndex !== -1) {
            const fieldId = `field-${selectedModule.id}-${ratioFieldIndex}`;
            const selectElement = document.getElementById(fieldId) as HTMLSelectElement;
            if (selectElement && selectElement.value) {
              setRatio(selectElement.value);
            }
          }
        }, 0);
      }
    } else {
      setRatio('');
    }

    // 处理导出模块的生成方式
    if (selectedModule?.id === 'export' && selectedNode) {
      const savedMethods = selectedNode.fieldValues?.['生成方式'] as string[];
      if (savedMethods && Array.isArray(savedMethods)) {
        setExportMethods(savedMethods);
      } else {
        // 默认全选
        setExportMethods(['PPT', '素材打包']);
      }
    } else {
      setExportMethods(['PPT', '素材打包']);
    }
    
    // 重置上传文件删除状态
    setUploadedFileDeleted(false);
  }, [selectedNode, selectedModule]);

  // 获取继承的字段值
  const getInheritedValue = (fieldName: string, moduleId: string): string => {
    // 根据模块ID和字段名，确定继承关系
    let sourceModuleId: string | null = null;
    let sourceFieldNames: string[] = [];
    
    // 定义继承规则（根据 CSV 文件）
    if (moduleId === 'course-outline' && fieldName === '课程内容、知识点') {
      sourceModuleId = 'start';
      sourceFieldNames = ['课程内容、知识点'];
    } else if (moduleId === 'video-search' && fieldName === '检索词') {
      // 视频检索模块的检索词继承开始模块的课程内容、知识点
      sourceModuleId = 'start';
      sourceFieldNames = ['课程内容、知识点'];
    } else if (moduleId === 'knowledge-card' && fieldName === '提示词') {
      // 知识卡片生成模块的提示词继承开始模块的课程内容、知识点
      sourceModuleId = 'start';
      sourceFieldNames = ['课程内容、知识点'];
    } else if (moduleId === 'blackboard-generate' && fieldName === '生成依据') {
      sourceModuleId = 'start';
      sourceFieldNames = ['课程内容、知识点', '学习目标设置'];
    } else if (moduleId === 'teaching-activity' && fieldName === '活动主题') {
      sourceModuleId = 'start';
      sourceFieldNames = ['课程内容、知识点', '学习目标设置'];
    } else if (moduleId === 'question-generate' && fieldName === '核心知识点') {
      sourceModuleId = 'start';
      sourceFieldNames = ['课程内容、知识点'];
    } else if (moduleId === 'pbl-task' && fieldName === '活动主题') {
      sourceModuleId = 'start';
      sourceFieldNames = ['课程内容、知识点', '学习目标设置'];
    } else if (moduleId === 'question-explanation' && fieldName === '题目来源') {
      // 题目讲解生成继承题库智能出题的输出，需要通过连接关系找到父节点
      const parentConnection = connections.find(conn => conn.toNodeId === selectedNode?.id);
      if (parentConnection) {
        const parentNode = allNodes.find(node => node.id === parentConnection.fromNodeId);
        if (parentNode && parentNode.moduleId === 'question-generate') {
          // 继承题库智能出题的输出（可能是多个字段的组合）
          const questionFields = ['核心知识点', '题目难度', '题目数量'];
          const inheritedValues = questionFields
            .map(field => parentNode.fieldValues?.[field])
            .filter(v => v !== undefined && v !== null && v !== '')
            .map(v => String(v));
          return inheritedValues.length > 0 ? inheritedValues.join('\n') : '';
        }
      }
      return '';
    }
    
    // 如果找到源模块ID，从开始模块获取值
    if (sourceModuleId === 'start') {
      const startNode = allNodes.find(node => node.moduleId === 'start');
      if (startNode && startNode.fieldValues) {
        // 如果有多个字段，合并它们
        const values = sourceFieldNames
          .map(fieldName => startNode.fieldValues?.[fieldName])
          .filter(v => v !== undefined && v !== null && v !== '')
          .map(v => String(v));
        return values.length > 0 ? values.join('\n') : '';
      }
    }
    
    return '';
  };

  if (!selectedModule || !selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <h2 className="text-lg font-bold text-primary-400 mb-4">属性面板</h2>
        <p className="text-sm text-gray-500">请选择一个模块以编辑属性</p>
      </div>
    );
  }

  const handleSave = () => {
    if (!selectedNode) return;
    
    const fieldValues: Record<string, string | number> = {};
    selectedModule.fields.forEach((field, index) => {
      const fieldId = `field-${selectedModule.id}-${index}`;
      const element = document.getElementById(fieldId) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      
      if (element) {
        if (field.inputType === 'slider') {
          fieldValues[field.name] = parseInt((element as HTMLInputElement).value);
        } else if (field.inputType === 'file') {
          const fileInput = element as HTMLInputElement;
          fieldValues[field.name] = fileInput.files?.[0]?.name || '';
        } else {
          fieldValues[field.name] = element.value;
        }
      }
    });
    
    // 保存示范朗读生成模块的动态字段
    if (selectedModule.id === 'reading-demo') {
      const materialSourceFieldIndex = selectedModule.fields.findIndex(f => f.name === '素材来源');
      if (materialSourceFieldIndex !== -1) {
        const materialSourceId = `field-${selectedModule.id}-${materialSourceFieldIndex}`;
        const currentMaterialSource = materialSource || (document.getElementById(materialSourceId) as HTMLSelectElement)?.value || '';
        
        if (currentMaterialSource === '文本输入') {
          const textInputId = `${materialSourceId}-text-input`;
          const textInput = document.getElementById(textInputId) as HTMLTextAreaElement;
          if (textInput) {
            fieldValues['文本内容'] = textInput.value;
          }
        } else if (currentMaterialSource === '文件上传') {
          const fileUploadId = `${materialSourceId}-file-upload`;
          const fileInput = document.getElementById(fileUploadId) as HTMLInputElement;
          if (fileInput && fileInput.files?.[0]) {
            fieldValues['上传文件'] = fileInput.files[0].name;
          }
        }
        // "参数"选项不需要额外的值，只显示"默认值"
      }
    }
    
    // 保存教学活动生成模块的动态字段
    if (selectedModule.id === 'teaching-activity') {
      const activityTypeFieldIndex = selectedModule.fields.findIndex(f => f.name === '活动类型');
      if (activityTypeFieldIndex !== -1) {
        const activityTypeId = `field-${selectedModule.id}-${activityTypeFieldIndex}`;
        const currentActivityType = activityType || (document.getElementById(activityTypeId) as HTMLSelectElement)?.value || '';
        
        if (currentActivityType === '其他（输入您的想法）') {
          const customIdeaId = `${activityTypeId}-custom-idea`;
          const textArea = document.getElementById(customIdeaId) as HTMLTextAreaElement;
          if (textArea) {
            fieldValues['活动类型想法'] = textArea.value;
          }
        }
      }
    }
    
    // 保存视频检索模块的全局智能推荐词选择状态（仅限古诗词页面）
    if (selectedModule.id === 'video-search') {
      const searchTermFieldIndex = selectedModule.fields.findIndex(f => f.name === '检索词');
      if (searchTermFieldIndex !== -1) {
        const searchTermId = `field-${selectedModule.id}-${searchTermFieldIndex}`;
        const searchTermElement = document.getElementById(searchTermId) as HTMLInputElement;
        const searchTerm = searchTermElement?.value || '';
        
        // 仅当检索词包含"琵琶行"相关关键词时，才保存推荐词选择状态（古诗词页面）
        const isAncientPoetryPage = searchTerm && (searchTerm.includes('琵琶行') || searchTerm.includes('《琵琶行》'));
        if (isAncientPoetryPage && searchTerm.trim() !== '') {
          const recommendedTerms = ['琵琶行赏析', '唐朝音乐', '琵琶名曲'];
          const selectedRecommendedTerms: string[] = [];
          
          recommendedTerms.forEach((term) => {
            const checkboxId = `${searchTermId}-recommend-${term}`;
            const checkbox = document.getElementById(checkboxId) as HTMLInputElement;
            if (checkbox && checkbox.checked) {
              selectedRecommendedTerms.push(term);
            }
          });
          
          // 如果没有保存过，默认为全选
          if (selectedRecommendedTerms.length === 0) {
            fieldValues['全局智能推荐词'] = recommendedTerms;
          } else {
            fieldValues['全局智能推荐词'] = selectedRecommendedTerms;
          }
        }
      }
    }
    
    // 保存知识卡片生成模块的全局智能推荐词选择状态（仅限古诗词页面）
    if (selectedModule.id === 'knowledge-card') {
      const promptFieldIndex = selectedModule.fields.findIndex(f => f.name === '提示词');
      if (promptFieldIndex !== -1) {
        const promptId = `field-${selectedModule.id}-${promptFieldIndex}`;
        const promptElement = document.getElementById(promptId) as HTMLTextAreaElement;
        const prompt = promptElement?.value || '';
        
        // 仅当提示词包含"琵琶行"相关关键词时，才保存推荐词选择状态（古诗词页面）
        const isAncientPoetryPage = prompt && (prompt.includes('琵琶行') || prompt.includes('《琵琶行》'));
        if (isAncientPoetryPage && prompt.trim() !== '') {
          const recommendedTerms = ['白居易生平与创作背景', '歌行体特点', '中唐乐伎文化'];
          const selectedRecommendedTerms: string[] = [];
          
          recommendedTerms.forEach((term) => {
            const checkboxId = `${promptId}-recommend-${term}`;
            const checkbox = document.getElementById(checkboxId) as HTMLInputElement;
            if (checkbox && checkbox.checked) {
              selectedRecommendedTerms.push(term);
            }
          });
          
          // 如果没有保存过，默认为全选
          if (selectedRecommendedTerms.length === 0) {
            fieldValues['全局智能推荐词'] = recommendedTerms;
          } else {
            fieldValues['全局智能推荐词'] = selectedRecommendedTerms;
          }
        }
      }
    }
    
    // 保存插图生成模块的自定义比例值
    if (selectedModule.id === 'illustration-generate') {
      const ratioFieldIndex = selectedModule.fields.findIndex(f => f.name === '比例');
      if (ratioFieldIndex !== -1) {
        const ratioId = `field-${selectedModule.id}-${ratioFieldIndex}`;
        const ratioElement = document.getElementById(ratioId) as HTMLSelectElement;
        const currentRatio = ratioElement?.value || ratio || '';
        
        // 如果选择的是"自定义"，保存自定义值
        if (currentRatio === '自定义') {
          const customRatioId = `${ratioId}-custom-ratio`;
          const customRatioElement = document.getElementById(customRatioId) as HTMLInputElement;
          if (customRatioElement) {
            fieldValues['比例自定义值'] = customRatioElement.value;
          }
        }
      }
    }
    
    // 保存导出模块的生成方式（多选）
    if (selectedModule.id === 'export') {
      const generateMethodFieldIndex = selectedModule.fields.findIndex(f => f.name === '生成方式');
      if (generateMethodFieldIndex !== -1) {
        // 保存当前选中的生成方式
        fieldValues['生成方式'] = exportMethods;
      }
    }
    
    onSave(selectedNode.id, fieldValues);
    console.log('保存节点数据:', selectedNode.id, fieldValues);
  };

  const handleDelete = () => {
    if (!selectedNode) return;
    if (confirm(`确定要删除"${selectedModule.name}"节点吗？`)) {
      onDelete(selectedNode.id);
    }
  };

  const renderField = (field: ModuleField, index: number) => {
    const fieldId = `field-${selectedModule.id}-${index}`;
    const savedValue = selectedNode.fieldValues?.[field.name];
    // 获取继承的值（如果没有保存的值）
    const inheritedValue = !savedValue ? getInheritedValue(field.name, selectedModule.id) : '';
    // 优先使用保存的值，如果没有则使用继承的值
    const displayValue = savedValue || inheritedValue;

    switch (field.inputType) {
      case 'multiselect':
        // 特殊处理导出模块的"生成方式"字段
        if (field.name === '生成方式' && selectedModule.id === 'export') {
          return (
            <div key={index} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="space-y-2">
                {field.options?.map((option) => {
                  const isChecked = exportMethods.includes(option);
                  return (
                    <label
                      key={option}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        id={`${fieldId}-${option}`}
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportMethods([...exportMethods, option]);
                          } else {
                            setExportMethods(exportMethods.filter(m => m !== option));
                          }
                        }}
                        className="w-4 h-4 text-primary-200 border-gray-300 rounded focus:ring-primary-200"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        }
        return null;

      case 'select':
        // 特殊处理"素材来源"字段（示范朗读生成模块）
        const isMaterialSource = field.name === '素材来源' && selectedModule.id === 'reading-demo';
        // 特殊处理"活动类型"字段（教学活动生成模块）
        const isActivityType = field.name === '活动类型' && selectedModule.id === 'teaching-activity';
        // 特殊处理"比例"字段（插图生成模块）
        const isRatio = field.name === '比例' && selectedModule.id === 'illustration-generate';
        return (
          <div key={index} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={fieldId}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
              defaultValue={savedValue as string || field.defaultValue || ''}
              onChange={(e) => {
                if (isMaterialSource) {
                  setMaterialSource(e.target.value);
                }
                if (isActivityType) {
                  setActivityType(e.target.value);
                }
                if (isRatio) {
                  setRatio(e.target.value);
                }
              }}
            >
              <option value="">请选择</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'slider':
        // 特殊处理示范朗读模块的速度字段，范围是0.5-3倍速，步长0.1
        const isReadingSpeed = field.name === '速度' && selectedModule.id === 'reading-demo';
        // 特殊处理小组规模字段，范围是1-6
        const isGroupSize = field.name === '小组规模';
        // 特殊处理插图生成模块的"为每个提示词生成的图片数量"字段，范围是1-8
        const isIllustrationImageCount = field.name === '为每个提示词生成的图片数量' && selectedModule.id === 'illustration-generate';
        
        let min: number;
        let max: number;
        let step: number;
        let defaultValue: number;
        let sliderDisplayValue: string | number;
        
        if (isReadingSpeed) {
          // 速度：0.5-3倍速，步长0.1，内部存储为5-30（乘以10）
          min = 5; // 0.5倍速
          max = 30; // 3.0倍速
          step = 1; // 0.1倍速
          const savedSpeedValue = savedValue as number;
          if (savedSpeedValue !== undefined && savedSpeedValue !== null) {
            defaultValue = savedSpeedValue;
            sliderDisplayValue = (savedSpeedValue / 10).toFixed(1) + '倍速';
          } else {
            defaultValue = 10; // 1.0倍速（默认）
            sliderDisplayValue = '1.0倍速';
          }
        } else if (isGroupSize) {
          min = 1;
          max = 6;
          step = 1;
          defaultValue = field.defaultValue ? parseInt(field.defaultValue) : 3;
          sliderDisplayValue = savedValue as number || defaultValue;
        } else if (isIllustrationImageCount) {
          min = 1;
          max = 8;
          step = 1;
          defaultValue = field.defaultValue ? parseInt(field.defaultValue) : 1;
          sliderDisplayValue = savedValue as number || defaultValue;
        } else {
          min = field.name.includes('数量') ? 1 : 0;
          max = field.name.includes('数量') ? 20 : 100;
          step = 1;
          defaultValue = field.defaultValue ? parseInt(field.defaultValue) : Math.floor((min + max) / 2);
          sliderDisplayValue = savedValue as number || defaultValue;
        }
        
        return (
          <div key={index} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="range"
              id={fieldId}
              min={min}
              max={max}
              step={step}
              defaultValue={defaultValue}
              className="w-full"
              onChange={(e) => {
                const value = parseInt(e.target.value);
                const valueSpan = document.getElementById(`${fieldId}-value`);
                if (valueSpan) {
                  if (isReadingSpeed) {
                    valueSpan.textContent = (value / 10).toFixed(1) + '倍速';
                  } else {
                    valueSpan.textContent = value.toString();
                  }
                }
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{isReadingSpeed ? '0.5倍速' : min}</span>
              <span id={`${fieldId}-value`} className="font-medium text-primary-400">
                {sliderDisplayValue}
              </span>
              <span>{isReadingSpeed ? '3.0倍速' : max}</span>
            </div>
          </div>
        );

      case 'file':
        // 特殊处理导出模块的"上传模板"字段，显示已上传的文件和删除功能
        const isUploadTemplate = field.name === '上传模板' && selectedModule.id === 'export';
        const uploadedFileName = savedValue as string || '';
        
        // 检查是否应该显示已上传的文件（有文件名且未被删除）
        if (isUploadTemplate && uploadedFileName && !uploadedFileDeleted) {
          return (
            <div key={index} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm text-gray-700 flex-1">
                  已上传：{uploadedFileName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    // 删除文件：清空 fieldValues 中的上传模板字段
                    const updatedFieldValues = { ...selectedNode.fieldValues };
                    delete updatedFieldValues[field.name];
                    onSave(selectedNode.id, updatedFieldValues);
                    // 立即更新本地状态，使UI重新渲染
                    setUploadedFileDeleted(true);
                  }}
                  className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                  title="删除文件"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* 重新上传的输入框 */}
              <input
                type="file"
                id={fieldId}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const updatedFieldValues = {
                      ...selectedNode.fieldValues,
                      [field.name]: file.name,
                    };
                    onSave(selectedNode.id, updatedFieldValues);
                    // 重置删除状态
                    setUploadedFileDeleted(false);
                  }
                }}
              />
            </div>
          );
        }
        
        return (
          <div key={index} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              id={fieldId}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const updatedFieldValues = {
                    ...selectedNode.fieldValues,
                    [field.name]: file.name,
                  };
                  onSave(selectedNode.id, updatedFieldValues);
                }
              }}
            />
          </div>
        );

      case 'textarea':
        // 特殊处理"题目讲解生成"模块的"题目来源"字段
        const isQuestionSource = field.name === '题目来源' && selectedModule.id === 'question-explanation';
        
        if (isQuestionSource) {
          // 显示继承的值或提示文字
          const inheritedValueForQuestion = getInheritedValue(field.name, selectedModule.id);
          return (
            <div key={index} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {inheritedValueForQuestion ? (
                <div className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                  {inheritedValueForQuestion}
                  <div className="text-xs text-blue-600 mt-1">（继承自题库智能出题）</div>
                </div>
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600">
                  默认继承题库智能出题的输出，暂不支持上传文件
                </div>
              )}
            </div>
          );
        }
        
        return (
          <div key={index} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
              {inheritedValue && !savedValue && (
                <span className="text-xs text-blue-600 ml-2">（继承自开始模块）</span>
              )}
            </label>
            <textarea
              id={fieldId}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                inheritedValue && !savedValue ? 'bg-blue-50 border-blue-200' : 'border-gray-300'
              }`}
              placeholder={inheritedValue ? `继承值: ${inheritedValue.substring(0, 50)}...` : `请输入${field.name}`}
              defaultValue={displayValue as string || ''}
            />
          </div>
        );

      default:
        return (
          <div key={index} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
              {inheritedValue && !savedValue && (
                <span className="text-xs text-blue-600 ml-2">（继承自开始模块）</span>
              )}
            </label>
            <input
              type="text"
              id={fieldId}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                inheritedValue && !savedValue ? 'bg-blue-50 border-blue-200' : 'border-gray-300'
              }`}
              placeholder={inheritedValue ? `继承值: ${inheritedValue.substring(0, 30)}...` : `请输入${field.name}`}
              defaultValue={displayValue as string || ''}
            />
          </div>
        );
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto h-full">
      <div className="p-6">
        <h2 className="text-lg font-bold text-primary-400 mb-4">属性面板</h2>
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-800 mb-2">{selectedModule.name}</h3>
          <p className="text-sm text-gray-600">{selectedModule.description}</p>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">字段配置</h4>
          {selectedModule.fields.map((field, index) => {
            const fieldElement = renderField(field, index);
            const fieldId = `field-${selectedModule.id}-${index}`;
            
            // 对于示范朗读生成模块的"素材来源"字段，根据选择显示不同的输入控件
            if (selectedModule.id === 'reading-demo' && field.name === '素材来源') {
              const currentMaterialSource = materialSource || (selectedNode.fieldValues?.['素材来源'] as string) || '';
              
              return (
                <div key={index}>
                  {fieldElement}
                  {/* 根据素材来源的选择，显示不同的输入控件 */}
                  {currentMaterialSource === '文本输入' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        文本内容
                      </label>
                      <textarea
                        id={`${fieldId}-text-input`}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                        placeholder="请输入文本内容"
                        defaultValue={selectedNode.fieldValues?.['文本内容'] as string || ''}
                      />
                    </div>
                  )}
                  {currentMaterialSource === '文件上传' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        上传文件
                      </label>
                      <input
                        type="file"
                        id={`${fieldId}-file-upload`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                      />
                    </div>
                  )}
                  {currentMaterialSource === '参数' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        默认值
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600">
                        默认值
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            
            // 对于教学活动生成模块的"活动类型"字段，当选择"其他（输入您的想法）"时显示文本域
            if (selectedModule.id === 'teaching-activity' && field.name === '活动类型') {
              const currentActivityType = activityType || (selectedNode.fieldValues?.['活动类型'] as string) || '';
              
              return (
                <div key={index}>
                  {fieldElement}
                  {/* 当选择"其他（输入您的想法）"时，显示文本域 */}
                  {currentActivityType === '其他（输入您的想法）' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        请输入您的想法
                      </label>
                      <textarea
                        id={`${fieldId}-custom-idea`}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                        placeholder="请输入您的想法"
                        defaultValue={selectedNode.fieldValues?.['活动类型想法'] as string || ''}
                      />
                    </div>
                  )}
                </div>
              );
            }
            
            // 对于插图生成模块的"比例"字段，当选择"自定义"时显示输入框
            if (selectedModule.id === 'illustration-generate' && field.name === '比例') {
              const currentRatio = ratio || (selectedNode.fieldValues?.['比例'] as string) || '';
              
              return (
                <div key={index}>
                  {fieldElement}
                  {/* 当选择"自定义"时，显示输入框 */}
                  {currentRatio === '自定义' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        自定义比例
                      </label>
                      <input
                        type="text"
                        id={`${fieldId}-custom-ratio`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                        placeholder="请输入比例，如 1:1"
                        defaultValue={selectedNode.fieldValues?.['比例自定义值'] as string || ''}
                      />
                    </div>
                  )}
                </div>
              );
            }
            
            // 对于视频检索模块的"检索词"字段，当有继承值时显示全局智能推荐词（仅限古诗词页面）
            if (selectedModule.id === 'video-search' && field.name === '检索词') {
              // 重新计算检索词的值（因为 displayValue 只在 renderField 内有效）
              const savedSearchTerm = selectedNode.fieldValues?.['检索词'] as string;
              const inheritedSearchTerm = !savedSearchTerm ? getInheritedValue('检索词', selectedModule.id) : '';
              const searchTerm = savedSearchTerm || inheritedSearchTerm || '';
              
              // 仅当检索词包含"琵琶行"相关关键词时，才显示推荐词选项（古诗词页面）
              const isAncientPoetryPage = searchTerm && (searchTerm.includes('琵琶行') || searchTerm.includes('《琵琶行》'));
              const shouldShowRecommendations = isAncientPoetryPage && searchTerm.trim() !== '';
              const recommendedTerms = ['琵琶行赏析', '唐朝音乐', '琵琶名曲'];
              
              // 获取已保存的推荐词选择状态，默认为全选
              const savedRecommendedTermsValue = selectedNode.fieldValues?.['全局智能推荐词'];
              let savedRecommendedTerms: string[] = recommendedTerms; // 默认为全选
              if (Array.isArray(savedRecommendedTermsValue)) {
                savedRecommendedTerms = savedRecommendedTermsValue;
              }
              
              return (
                <div key={index}>
                  {fieldElement}
                  {shouldShowRecommendations && (
                    <div className="mb-4 mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        全局智能推荐词
                      </label>
                      <div className="space-y-2">
                        {recommendedTerms.map((term) => {
                          const isChecked = savedRecommendedTerms.includes(term);
                          return (
                            <label
                              key={term}
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                id={`${fieldId}-recommend-${term}`}
                                defaultChecked={isChecked}
                                className="w-4 h-4 text-primary-200 border-gray-300 rounded focus:ring-primary-200"
                              />
                              <span className="text-sm text-gray-700">{term}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            
            // 对于知识卡片生成模块的"提示词"字段，当有继承值时显示全局智能推荐词（仅限古诗词页面）
            if (selectedModule.id === 'knowledge-card' && field.name === '提示词') {
              // 重新计算提示词的值
              const savedPrompt = selectedNode.fieldValues?.['提示词'] as string;
              const inheritedPrompt = !savedPrompt ? getInheritedValue('提示词', selectedModule.id) : '';
              const prompt = savedPrompt || inheritedPrompt || '';
              
              // 仅当提示词包含"琵琶行"相关关键词时，才显示推荐词选项（古诗词页面）
              const isAncientPoetryPage = prompt && (prompt.includes('琵琶行') || prompt.includes('《琵琶行》'));
              const shouldShowRecommendations = isAncientPoetryPage && prompt.trim() !== '';
              const recommendedTerms = ['白居易生平与创作背景', '歌行体特点', '中唐乐伎文化'];
              
              // 获取已保存的推荐词选择状态，默认为全选
              const savedRecommendedTermsValue = selectedNode.fieldValues?.['全局智能推荐词'];
              let savedRecommendedTerms: string[] = recommendedTerms; // 默认为全选
              if (Array.isArray(savedRecommendedTermsValue)) {
                savedRecommendedTerms = savedRecommendedTermsValue;
              }
              
              return (
                <div key={index}>
                  {fieldElement}
                  {shouldShowRecommendations && (
                    <div className="mb-4 mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        全局智能推荐词
                      </label>
                      <div className="space-y-2">
                        {recommendedTerms.map((term) => {
                          const isChecked = savedRecommendedTerms.includes(term);
                          return (
                            <label
                              key={term}
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                id={`${fieldId}-recommend-${term}`}
                                defaultChecked={isChecked}
                                className="w-4 h-4 text-primary-200 border-gray-300 rounded focus:ring-primary-200"
                              />
                              <span className="text-sm text-gray-700">{term}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            
            // 对于导出模块的"PPT尺寸"和"上传模板"字段，当选择了"PPT"时才显示
            if (selectedModule.id === 'export' && (field.name === 'PPT尺寸' || field.name === '上传模板')) {
              const hasPPT = exportMethods.includes('PPT');
              
              if (!hasPPT) {
                // 如果没有选择PPT，不显示这些字段
                return null;
              }
              
              // 如果选择了PPT，正常显示字段
              return fieldElement;
            }
            
            return fieldElement;
          })}
        </div>
        <div className="border-t border-gray-200 pt-6 mt-6 flex flex-col gap-3">
          {/* 教学活动生成模块的特殊运行按钮 */}
          {selectedModule.id === 'teaching-activity' && (
            <button
              onClick={() => setShowActivityIdeasModal(true)}
              className="w-full bg-gradient-to-br from-primary-200 to-primary-300 text-white py-2 px-4 rounded-lg font-medium hover:shadow-md transition-all"
            >
              运行
            </button>
          )}
          <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-br from-primary-200 to-primary-300 text-white py-2 px-4 rounded-lg font-medium hover:shadow-md transition-all"
          >
            确定
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-all"
          >
            删除节点
          </button>
        </div>
      </div>
      </div>
      
      {/* 教学活动生成模块的创意方案浮窗 */}
      {showActivityIdeasModal && selectedModule.id === 'teaching-activity' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowActivityIdeasModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">活动创意推荐</h3>
                <button
                  onClick={() => setShowActivityIdeasModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-700 mb-6">
                基于您的教学目标"在真实动机下使用疑问句"和学情"喜欢新奇事物"，为您推荐以下三种活动思路，请选择其中一个方案继续生成相关材料。
                <span className="text-primary-400 font-semibold">（原型体验：请选择创意C）</span>
              </p>
              
              <div className="space-y-4">
                {/* 创意A */}
                <button
                  onClick={() => {
                    console.log('选择了创意A');
                    setShowActivityIdeasModal(false);
                    // 这里可以添加选择创意A后的处理逻辑
                  }}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
                >
                  <div className="font-semibold text-lg text-gray-800 mb-2">创意A：【神秘盲盒猜猜乐】</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">核心情景：</span>利用"未知"制造好奇。准备不透明袋子或盒子，内放物品。</p>
                    <p><span className="font-medium">如何激发提问：</span>学生通过触摸或摇晃盒子，产生强烈好奇心，自然驱动他们想问"What is it?"。</p>
                    <p><span className="font-medium">亮点：</span>低成本、强互动、直击"真实动机"痛点。</p>
                  </div>
                </button>
                
                {/* 创意B */}
                <button
                  onClick={() => {
                    console.log('选择了创意B');
                    setShowActivityIdeasModal(false);
                    // 这里可以添加选择创意B后的处理逻辑
                  }}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
                >
                  <div className="font-semibold text-lg text-gray-800 mb-2">创意B：【魔术师的小道具】</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">核心情景：</span>教师扮演魔术师，用布盖住物品或从"空"手中变出物品。</p>
                    <p><span className="font-medium">如何激发提问：</span>魔术的"悬念"和"惊喜"是绝佳的提问触发器。"接下来会变出什么？"让学生忍不住发问。</p>
                    <p><span className="font-medium">亮点：</span>戏剧性强，教师主导，课堂节奏容易控制。</p>
                  </div>
                </button>
                
                {/* 创意C */}
                <button
                  onClick={() => {
                    console.log('选择了创意C');
                    setShowActivityIdeasModal(false);
                    // 创建相关模块节点
                    if (onCreateNodes && selectedNode) {
                      const teachingActivityNode = selectedNode;
                      const canvasHeight = window.innerHeight - 64;
                      const centerY = canvasHeight / 2;
                      
                      // 查找需要的模块
                      const illustrationModule = modules.find((m) => m.id === 'illustration-generate');
                      const gifModule = modules.find((m) => m.id === 'gif-generate');
                      const videoSearchModule = modules.find((m) => m.id === 'video-search');
                      const knowledgeCardModule = modules.find((m) => m.id === 'knowledge-card');
                      const readingDemoModule = modules.find((m) => m.id === 'reading-demo');
                      
                      if (illustrationModule && videoSearchModule && knowledgeCardModule && readingDemoModule) {
                        // 创建新节点
                        const newNodes: CanvasNode[] = [
                          {
                            id: `node-illustration-${Date.now()}`,
                            moduleId: illustrationModule.id,
                            moduleName: illustrationModule.name,
                            x: teachingActivityNode.x + 300,
                            y: teachingActivityNode.y - 400, // 向上移动250px (从-150改为-400)
                            fieldValues: {
                              '比例': '自定义',
                              '比例自定义值': '1:1',
                              '为每个提示词生成的图片数量': 2, // 英语情景课预设值为2
                              '参考风格': '动态模糊.png',
                              '提示词，不同主题需用///分隔': '一个红色苹果的严重像素化图片 /// 一支铅笔笔尖的特写模糊照片 /// 一本透过磨砂玻璃只能看到形状的书 /// 猫咪眼睛和毛发的极端特写 /// 一辆玩具车藏在深影中，只露出一个轮子 /// 一个书包，中间有大片的故障条纹遮挡',
                            },
                          },
                          {
                            id: `node-video-search-${Date.now()}`,
                            moduleId: videoSearchModule.id,
                            moduleName: videoSearchModule.name,
                            x: teachingActivityNode.x + 300,
                            y: teachingActivityNode.y - 300, // 向上移动250px (从-50改为-300)
                            fieldValues: {
                              '检索词': '机器人///猜模糊物品///你划我猜///瓦力初到地球',
                              '视频语言': '英文',
                            },
                          },
                          {
                            id: `node-knowledge-card-${Date.now()}`,
                            moduleId: knowledgeCardModule.id,
                            moduleName: knowledgeCardModule.name,
                            x: teachingActivityNode.x + 300,
                            y: teachingActivityNode.y - 200, // 向上移动250px (从+50改为-200)
                            fieldValues: {
                              '提示词': 'What提问的方式，what is ...,疑问语气，常见物品的英文和音标，what提问情景对话脚本',
                              '字数限制': '100',
                            },
                          },
                          {
                            id: `node-reading-demo-${Date.now()}`,
                            moduleId: readingDemoModule.id,
                            moduleName: readingDemoModule.name,
                            x: teachingActivityNode.x + 300,
                            y: teachingActivityNode.y - 100, // 向上移动250px (从+150改为-100)
                            fieldValues: {
                              '素材来源': '文本输入',
                              '文本内容': '(机器人电子音) My vision is blurry. What... is... this?\n(清晰童声) It\'s an apple!\n(机器人音) Thank you. Next image. What... is... that?\n(自信童声) It\'s a pencil!\n(机器人高兴音) Excellent! You are great helpers!',
                              '音色': '童声',
                              '速度': 9, // 0.9倍速（滑块值：5-30，9表示0.9倍速）
                            },
                          },
                        ];
                        
                        // 查找导出模块
                        const exportNode = allNodes.find(node => node.moduleId === 'export');
                        
                        // 创建连接：教学活动生成 → 新模块，以及新模块 → 导出模块
                        const timestamp = Date.now();
                        const newConnections = [
                          { id: `conn-${timestamp}-1`, fromNodeId: teachingActivityNode.id, toNodeId: newNodes[0].id },
                          { id: `conn-${timestamp}-2`, fromNodeId: teachingActivityNode.id, toNodeId: newNodes[1].id },
                          { id: `conn-${timestamp}-3`, fromNodeId: teachingActivityNode.id, toNodeId: newNodes[2].id },
                          { id: `conn-${timestamp}-4`, fromNodeId: teachingActivityNode.id, toNodeId: newNodes[3].id },
                        ];
                        
                        // 如果找到导出模块，添加从新模块到导出模块的连接
                        if (exportNode) {
                          newConnections.push(
                            { id: `conn-${timestamp}-5`, fromNodeId: newNodes[0].id, toNodeId: exportNode.id },
                            { id: `conn-${timestamp}-6`, fromNodeId: newNodes[1].id, toNodeId: exportNode.id },
                            { id: `conn-${timestamp}-7`, fromNodeId: newNodes[2].id, toNodeId: exportNode.id },
                            { id: `conn-${timestamp}-8`, fromNodeId: newNodes[3].id, toNodeId: exportNode.id }
                          );
                        }
                        
                        onCreateNodes(newNodes, newConnections);
                      }
                    }
                  }}
                  className="w-full text-left p-4 border-2 border-primary-300 bg-primary-50 rounded-lg hover:border-primary-400 hover:bg-primary-100 transition-all"
                >
                  <div className="font-semibold text-lg text-gray-800 mb-2">创意C：【故障的机器人助手】</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">核心情景：</span>课件或玩偶扮演一个"视力不好"的机器人，它需要学生帮助识别屏幕上的模糊图片或局部图片。</p>
                    <p><span className="font-medium">如何激发提问：</span>将学生置于"帮助者"角色。机器人会问"What's this?"，学生回答后，机器人才能"看清"。</p>
                    <p><span className="font-medium">亮点：</span>融入角色扮演和信息技术，适合多媒体教室。</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
