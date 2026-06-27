import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'lg',
      loading = false,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'font-medium rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2';

    const variantStyles = {
      primary: 'bg-primary text-white hover:bg-primary-dark',
      secondary: 'bg-white text-primary-dark border-2 border-primary hover:bg-primary-light',
      danger: 'bg-accent text-white hover:bg-accent/90',
      ghost: 'bg-transparent text-ink hover:bg-surface-muted',
    };

    const sizeStyles = {
      sm: 'px-4 py-2 text-body min-h-touch text-sm',
      md: 'px-5 py-3 text-body-lg min-h-touch',
      lg: 'px-6 py-4 text-body-lg min-h-touch-lg',
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
