import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
                secondary: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
                success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
                warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
                danger: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
                outline: 'border border-[var(--border)] text-[var(--text-secondary)]',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof badgeVariants> {
    dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant }), className)} {...props}>
            {dot && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />}
            {children}
        </span>
    );
}

export { Badge, badgeVariants };
