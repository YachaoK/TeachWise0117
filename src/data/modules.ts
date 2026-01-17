import type { Module } from '../types/module';

// 根据 CSV 文件解析的模块数据
export const modules: Module[] = [
  // 必备模块
  {
    id: 'start',
    category: '必备模块',
    name: '开始',
    description: '备课工作流的起点，教学重要信息',
    fields: [
      { name: '课程内容、知识点', required: true, inputType: 'textarea' },
      { name: '学习目标设置', required: false, inputType: 'textarea' },
      { name: '学情分析输入', required: false, inputType: 'textarea' },
    ],
  },
  {
    id: 'export',
    category: '必备模块',
    name: '导出',
    description: '用于设置备课材料的导出',
    fields: [
      { name: '生成方式', required: true, inputType: 'multiselect', options: ['PPT', '素材打包'] },
      { name: 'PPT尺寸', required: true, inputType: 'select', options: ['4:3', '16:9', '自定义'] },
      { name: '上传模板', required: false, inputType: 'file' },
    ],
  },
  // 课程导入
  {
    id: 'course-outline',
    category: '课程导入',
    name: '课程大纲生成',
    description: '为教师提供课程大纲思路',
    fields: [
      { name: '课程内容、知识点', required: true, inputType: 'textarea' },
      { name: '大纲框架', required: false, inputType: 'textarea' },
    ],
  },
  {
    id: 'illustration-generate',
    category: '课程导入',
    name: '插图生成',
    description: '依据主题生成课程插图',
    fields: [
      { name: '比例', required: true, inputType: 'select', options: ['16:9', '4:3', '自定义'] },
      { name: '为每个提示词生成的图片数量', required: true, inputType: 'slider', defaultValue: '1' },
      { name: '参考风格', required: true, inputType: 'file' },
      { name: '提示词，不同主题需用///分隔', required: true, inputType: 'textarea' },
    ],
  },
  {
    id: 'gif-generate',
    category: '课程导入',
    name: '动图生成',
    description: '依据主题生成动图，每张图时间不超过3秒',
    fields: [
      { name: '提示词，不同主题需用///分隔', required: true, inputType: 'textarea' },
    ],
  },
  {
    id: 'video-search',
    category: '课程导入',
    name: '视频检索',
    description: '收集网络中与主题相关的视频，并汇总链接',
    fields: [
      { name: '检索词', required: true, inputType: 'text' },
      { name: '视频语言', required: false, inputType: 'select', options: ['中文', '英文', '其他'] },
    ],
  },
  // 知识讲解
  {
    id: 'knowledge-card',
    category: '知识讲解',
    name: '知识卡片生成',
    description: '用于为背景知识或者概念生成知识卡',
    fields: [
      { name: '提示词', required: true, inputType: 'textarea' },
      { name: '字数限制', required: false, inputType: 'text' },
    ],
  },
  {
    id: 'reading-demo',
    category: '知识讲解',
    name: '示范朗读生成',
    description: '支持继承输出参数和自定义朗读字段',
    fields: [
      { name: '素材来源', required: true, inputType: 'select', options: ['文本输入', '文件上传', '参数'] },
      { name: '音色', required: true, inputType: 'select', options: ['亲切女声（普通话）', '磁性男声（普通话）', '童声', '故事旁白音', '角色扮演音（如老者、青年）'] },
      { name: '速度', required: false, inputType: 'slider', defaultValue: '常速' },
    ],
  },
  {
    id: 'blackboard-generate',
    category: '知识讲解',
    name: '教学板书生成',
    description: '为教师提供教学板书思路',
    fields: [
      { name: '生成依据', required: true, inputType: 'textarea' },
      { name: '核心逻辑', required: true, inputType: 'select', options: [
        '步骤流程（适合：解题步骤、实验顺序、历史事件）',
        '对比区别（适合：概念辨析、人物对比、优缺点分析）',
        '组成要素（适合：分析结构、讲解部件、介绍成分）',
        '因果关系（适合：分析原因影响、推导公式定理）',
        '中心发散（适合：围绕一个主题展开多个方面）',
      ]},
    ],
  },
  // 知识巩固
  {
    id: 'teaching-activity',
    category: '知识巩固',
    name: '教学活动生成',
    description: '用于生成课堂活动，增加课堂互动',
    fields: [
      { name: '活动主题', required: true, inputType: 'textarea' },
      { name: '活动类型', required: true, inputType: 'select', options: ['角色扮演', '课堂辩论', '分组活动', '游戏化', '其他（输入您的想法）'] },
      { name: '生成要求', required: true, inputType: 'textarea' },
    ],
  },
  {
    id: 'question-generate',
    category: '知识巩固',
    name: '题库智能出题',
    description: '用于从题库中选取题目并组合',
    fields: [
      { name: '核心知识点', required: true, inputType: 'textarea' },
      { name: '题目难度', required: true, inputType: 'select', options: ['基础（单一知识点）', '综合（2个知识点以上）', '拓展（综合型大题）'] },
      { name: '题目来源', required: false, inputType: 'select', options: ['习题册', '市区级考试题', '模拟题', '统考题'] },
      { name: '题目数量', required: true, inputType: 'slider', defaultValue: '5' },
    ],
  },
  {
    id: 'question-explanation',
    category: '知识巩固',
    name: '题目讲解生成',
    description: '用于为题目生成解题思路',
    fields: [
      { name: '题目来源', required: true, inputType: 'textarea' },
      { name: '讲解细度', required: true, inputType: 'slider', defaultValue: '中等' },
    ],
  },
  // 拓展评价
  {
    id: 'pbl-task',
    category: '拓展评价',
    name: 'PBL任务生成',
    description: '用于生成项目式学习方案',
    fields: [
      { name: '活动主题', required: true, inputType: 'textarea' },
      { name: '项目周期', required: true, inputType: 'select', options: ['1天', '1周', '1周-1学期'] },
      { name: '小组规模', required: false, inputType: 'slider', defaultValue: '3' },
      { name: '成果形式', required: false, inputType: 'select', options: ['调研报告', '实物展示', '纪录片', '自定义'] },
    ],
  },
  {
    id: 'evaluation-plan',
    category: '拓展评价',
    name: '评价方案生成',
    description: '用于生成多种评价方案',
    fields: [
      { name: '评价场景', required: true, inputType: 'select', options: ['整节课表现', '课堂活动表现', '单元学习成果', '小组活动表现', '自定义'] },
      { name: '评价类型', required: true, inputType: 'select', options: ['过程性分析', '总结性评价', '形成性反馈'] },
      { name: '评估方式', required: true, inputType: 'select', options: ['量规评估', '等级制', '描述性评价', '综合式'] },
    ],
  },
];

// 按分类分组模块
export const modulesByCategory = modules.reduce((acc, module) => {
  if (!acc[module.category]) {
    acc[module.category] = [];
  }
  acc[module.category].push(module);
  return acc;
}, {} as Record<string, Module[]>);
