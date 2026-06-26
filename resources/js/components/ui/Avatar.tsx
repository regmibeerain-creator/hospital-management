import { forwardRef } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../../lib/utils';

const Avatar = forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn(
            'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white dark:ring-gray-800',
            className
        )}
        {...props}
    />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn('aspect-square h-full w-full object-cover', className)}
        {...props}
    />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => {
    const colors = [
        'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
        'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
        'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
        'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
        'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400',
        'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    ];

    const fallbackText = props.children as string;
    const colorIndex = fallbackText
        ? fallbackText.toString().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length
        : 0;

    return (
        <AvatarPrimitive.Fallback
            ref={ref}
            className={cn(
                'flex h-full w-full items-center justify-center rounded-full text-sm font-medium select-none',
                colors[colorIndex],
                className
            )}
            {...props}
        />
    );
});
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
