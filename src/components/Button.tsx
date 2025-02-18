interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  text: string;
  textColor?: string;
  bgHover?: string;
  bg?: string;
}

export default function Button({ onClick, disabled, text, textColor, bgHover, bg }: ButtonProps) {
  return (
    <div className="relative inline-block w-[80vw] h-[60px]">
      {/* Gradient border container */}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`hover:cursor-pointer border-white relative z-10 w-full h-full rounded-xl ${bg ? bg : 'bg-white'} ${textColor ? textColor : 'text-black'} font-semibold disabled:opacity-50 transition-all duration-200 hover:scale-105 ${bgHover ? bgHover : 'hover:bg-gray-400 hover:text-white'} active:bg-gray-200 active:scale-95`}
      >
        {text}
      </button>
    </div>
  );
}
