export const rippleEffect = (event: React.MouseEvent<HTMLElement>) => {
  const target = event.currentTarget as HTMLElement
  const div = document.createElement("div")
  div.classList.add("absolute", "rounded-full", "w-3", "h-3", "bg-surface-a10", "animate-rippleEffect")

  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  div.style.left = `${x}px`;
  div.style.top = `${y}px`;
  target.appendChild(div)

  setTimeout(() => div.remove(), 500)
}