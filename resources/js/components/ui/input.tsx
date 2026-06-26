import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, ...props }, ref) => {
        return (
            <div className="relative">
                {icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-3.5 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'transition-all duration-200',
                        icon && 'pl-10',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
