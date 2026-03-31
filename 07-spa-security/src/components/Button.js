const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-500',
  secondary: 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-[0.85rem]',
  lg: 'px-8 py-4 text-lg',
};

const base = 'inline-block rounded-[10px] border-0 font-normal text-center no-underline cursor-pointer';

export function Button({ text, variant = 'primary', size = 'md' }) {
  return `
    <button class="${base} ${variants[variant]} ${sizes[size]}">${text}</button>
  `;
}
