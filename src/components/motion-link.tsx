'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import type { ComponentProps } from 'react';

export function MotionLink(props: ComponentProps<typeof Link>) {
  const reduce = useReducedMotion();
  return <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.98 }} className="motion-link"><Link {...props} /></motion.div>;
}
