interface MainActionProps {
  productName: string;
  slogan: string;
  onCreateClick?: () => void;
}

export default function MainAction({ productName, slogan, onCreateClick }: MainActionProps) {
  return (
    <div className="mb-12 flex items-center gap-16 max-w-[1400px] mx-auto px-10">
      <div className="flex-1 flex flex-col">
        <div className="text-[36px] font-bold leading-tight mb-8 text-gray-800">
          {productName}
          <br />
          {slogan}
        </div>
        <button
          onClick={onCreateClick}
          className="bg-gradient-to-br from-primary-200 to-primary-300 text-white border-none py-5 px-12 text-xl font-semibold rounded-2xl cursor-pointer shadow-lg shadow-primary-200/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-200/40 inline-flex items-center gap-3 w-fit"
        >
          <span className="text-3xl font-light">+</span>
          新建工作流
        </button>
      </div>
      <div className="flex-shrink-0 w-[400px] h-auto max-w-full">
        <img
          src="/character.png"
          alt="良师小助人物形象"
          className="w-full h-auto animate-float"
          onError={(e) => {
            // 如果图片不存在，隐藏图片
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
}
