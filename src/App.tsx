import { useState } from 'react';
import Navbar from './components/Navbar';
import MainAction from './components/MainAction';
import TemplatesSection from './components/TemplatesSection';
import RecentWorkflows from './components/RecentWorkflows';
import WorkflowEditor from './pages/WorkflowEditor';
import AncientPoetryTemplate from './pages/AncientPoetryTemplate';
import LinearEquationTemplate from './pages/LinearEquationTemplate';
import EnglishScenarioTemplate from './pages/EnglishScenarioTemplate';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'workflow' | 'ancientPoetry' | 'linearEquation' | 'englishScenario'>('home');

  // 调试：确保组件渲染
  console.log('App 组件渲染，当前页面:', currentPage);

  const navLinks = [
    { label: '模版商店', href: '#', onClick: () => setCurrentPage('home') },
    { label: '备课社区', href: '#', onClick: () => setCurrentPage('home') },
    { label: '我的资源库', href: '#', onClick: () => setCurrentPage('home') },
  ];

  const templates = [
    {
      icon: '🔢',
      title: '一元一次方程拓展课模版',
      description: '帮助学生掌握一元一次方程的解题技巧，用于拓展课',
      features: ['题库智能出题', '题目讲解', 'PBL任务生成', '评价方案生成'],
      onClick: () => setCurrentPage('linearEquation'),
    },
    {
      icon: '🌍',
      title: '询问物品的英语情景课',
      description: '趣味化英语情景教学，让低年级学生爱上英语学习',
      features: ['知识卡片生成', '教学活动生成', '示范朗读生成', '视频资源检索'],
      onClick: () => setCurrentPage('englishScenario'),
    },
    {
      icon: '📖',
      title: '古诗词备课模版',
      description: '快速生成古诗教学所需的各种资源，让备课更高效',
      features: ['视频资源检索', '插图生成', '知识卡片生成', '板书生成'],
      onClick: () => setCurrentPage('ancientPoetry'),
    },
  ];

  const workflows = [
    { name: '《静夜思》古诗教学', time: '2小时前', onClick: () => setCurrentPage('workflow') },
    { name: '春天写景作文指导', time: '昨天', onClick: () => setCurrentPage('workflow') },
    { name: '一年级识字：动物篇', time: '3天前', onClick: () => setCurrentPage('workflow') },
    { name: '《咏鹅》古诗备课', time: '5天前', onClick: () => setCurrentPage('workflow') },
  ];

  if (currentPage === 'workflow') {
    return <WorkflowEditor onBackToHome={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'ancientPoetry') {
    return <AncientPoetryTemplate onBackToHome={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'linearEquation') {
    return <LinearEquationTemplate onBackToHome={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'englishScenario') {
    return <EnglishScenarioTemplate onBackToHome={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 text-primary-400">
      <Navbar
        logo="良师小助"
        navLinks={navLinks}
        userAvatar="KK"
      />
      <div className="pt-10">
        <MainAction
          productName="良师小助"
          slogan="聚合AI大模型,可视化、拖拽式一站备课平台"
          onCreateClick={() => setCurrentPage('workflow')}
        />
        <TemplatesSection
          title="精选模版"
          templates={templates}
        />
        <RecentWorkflows
          title="最近工作流"
          workflows={workflows}
        />
      </div>
      <footer className="py-6 text-center">
        <p className="text-xs text-[#8a9b99]">---Nora'Lab---</p>
      </footer>
    </div>
  );
}

export default App;
