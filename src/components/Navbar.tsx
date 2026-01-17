interface NavbarProps {
  logo: string;
  navLinks: Array<{ label: string; href: string; onClick?: () => void }>;
  userAvatar: string;
  onLogoClick?: () => void;
}

export default function Navbar({ logo, navLinks, userAvatar, onLogoClick }: NavbarProps) {
  return (
    <nav className="bg-white/95 backdrop-blur-md py-4 px-10 flex justify-between items-center shadow-md shadow-primary-400/8 sticky top-0 z-50">
      <div 
        className="text-2xl font-bold bg-gradient-to-br from-primary-200 to-primary-300 bg-clip-text text-transparent flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onLogoClick}
      >
        <span className="text-3xl bg-clip-text text-primary-200">📚</span>
        {logo}
      </div>
      <div className="flex items-center gap-6">
        {navLinks.map((link, index) => (
          <a
            key={`nav-link-${index}-${link.label}`}
            href={link.href}
            onClick={(e) => {
              if (link.onClick) {
                e.preventDefault();
                link.onClick();
              }
            }}
            className="text-primary-400 no-underline text-[15px] font-medium transition-colors py-2 px-4 rounded-lg hover:text-primary-200 hover:bg-primary-200/10"
          >
            {link.label}
          </a>
        ))}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center text-white font-semibold cursor-pointer transition-transform hover:scale-105">
          {userAvatar}
        </div>
      </div>
    </nav>
  );
}
