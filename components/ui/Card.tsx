import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div
            className={twMerge(
                clsx(
                    'bg-black/ text-white rounded-2xl shadow-lg  border border-blue-500  md:p-4 p-2 transition-all duration-200',
                    className
                )
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: CardProps) {
    return <div className={twMerge(clsx('mb-4', className))}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <h3 className={twMerge(clsx('text-lg font-semibold text-white', className))}>
            {children}
        </h3>
    );
}

export function CardContent({ children, className }: CardProps) {
    return <div className={twMerge(clsx('', className))}>{children}</div>;
}
