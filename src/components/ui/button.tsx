import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'quiet' | 'line';
  size?: 'default' | 'small';
};

export function Button({ className, variant = 'solid', size = 'default', ...props }: ButtonProps) {
  return <button className={cn('button', `button--${variant}`, `button--${size}`, className)} {...props} />;
}
