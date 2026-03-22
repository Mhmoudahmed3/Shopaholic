"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface ClientMotionDivProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
}

export function ClientMotionDiv({ children, ...props }: ClientMotionDivProps) {
    return <motion.div {...props}>{children}</motion.div>;
}
