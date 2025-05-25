import { Check } from "./Icons";

export default function Checkbox({
  checked,
  className,
  onClick,
}: Readonly<{
  checked: boolean;
  className?: string;
  onClick?: () => void;
}>) {
  return (
    <div
      onClick={() => setTimeout(() => onClick && onClick(), 0)}
      
      className={`${className} cursor-pointer border-2 border-surface-a20 rounded-md duration-100 select-none ${
        checked && "bg-primary"
      }`}
    >
      <div
        className={`w-6 h-6 ${
          checked ? "opacity-100" : "opacity-0"
        } duration-100`}
      >
        <Check width="1.5rem" height="1.5rem" />
      </div>
    </div>
  );
}
