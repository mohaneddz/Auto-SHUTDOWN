interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  text: string;
  textColor?: string;
  bgHover?: string;
  bg?: string;
  enabled?: boolean;
}

export default function Button({ onClick, disabled, text, textColor, bgHover, bg, enabled }: ButtonProps) {
  return (
    <div className="relative inline-block w-[80vw] h-[60px]">
      {/* Gradient border container */}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`hover:cursor-pointer border-white relative z-10 w-full h-full rounded-xl ${bg ? bg : `bg-white`} ${textColor ? textColor : `text-black`} font-semibold ${enabled? ` transition-all duration-200 hover:scale-105 disabled:opacity-50 ` : ` `}  ${bgHover ? `${bgHover} active:bg-gray-200 active:scale-95` : `hover:bg-gray-600 hover:text-slate-500`} `}
      >
        {text}
      </button>
    </div>
  );
}
