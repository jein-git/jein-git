import { ButtonHTMLAttributes, forwardRef } from 'react';

type CategoryChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon?: string;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export const CategoryChip = forwardRef<HTMLButtonElement, CategoryChipProps>(
  ({ label, icon, selected = false, size = 'md', className = '', ...props }, ref) => {
    const sizeStyles = {
      sm: 'px-3 py-2 text-caption',
      md: 'px-4 py-3 text-body min-h-touch',
      lg: 'px-6 py-4 text-body-lg min-h-touch-lg',
    };

    return (
      <button
        ref={ref}
        className={`
          rounded-lg border-2 font-medium transition-all
          flex items-center justify-center gap-2
          ${sizeStyles[size]}
          ${
            selected
              ? 'border-primary bg-primary-light text-primary-dark'
              : 'border-line bg-surface-card text-ink-muted hover:border-line-strong'
          }
          ${className}
        `}
        {...props}
      >
        {icon && <span className="text-xl">{icon}</span>}
        {label}
      </button>
    );
  }
);

CategoryChip.displayName = 'CategoryChip';
