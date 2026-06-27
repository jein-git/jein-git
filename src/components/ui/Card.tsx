import { HTMLAttributes, forwardRef } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'muted' | 'primary' | 'warm';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { children, variant = 'default', padding = 'md', hoverable = false, className = '', ...props },
    ref
  ) => {
    const baseStyles = 'rounded-lg border transition-all';

    const variantStyles = {
      default: 'bg-surface-card border-line',
      muted: 'bg-surface-muted border-line',
      primary: 'bg-primary text-white border-primary',
      warm: 'bg-primary-light border-primary-light',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${hoverable ? 'hover:border-primary cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
