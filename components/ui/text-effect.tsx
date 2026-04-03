"use client";

import { motion, Variants, HTMLMotionProps } from "framer-motion";
import { ElementType, ReactNode } from "react";

type TextEffectProps = {
  children: string;
  className?: string;
  preset?: "fade" | "slide" | "scale" | "blur";
  per?: "word" | "char" | "line";
  delay?: number;
  as?: ElementType;
  trigger?: boolean;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
};

const defaultContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const presetItemVariants: Record<
  NonNullable<TextEffectProps["preset"]>,
  Variants
> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
  },
  slide: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.4 },
    },
  },
};

export function TextEffect({
  children,
  className,
  preset = "fade",
  per = "word",
  delay = 0,
  as: Component = "p",
  trigger = true,
  variants,
}: TextEffectProps) {
  const containerVariants = variants?.container ?? {
    ...defaultContainerVariants,
    visible: {
      ...defaultContainerVariants.visible,
      transition: {
        staggerChildren: per === "char" ? 0.03 : 0.08,
        delayChildren: delay,
      },
    },
  };
  const itemVariants = variants?.item ?? presetItemVariants[preset];

  let segments: string[] = [];
  if (per === "word") {
    segments = children.split(" ");
  } else if (per === "char") {
    segments = children.split("");
  } else {
    segments = children.split("\n");
  }

  const MotionComponent = motion(Component as "p");

  return (
    <MotionComponent
      initial="hidden"
      animate={trigger ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {segments.map((segment, i) => (
        <motion.span
          key={i}
          variants={itemVariants}
          className="inline-block"
          style={{ marginRight: per === "word" ? "0.25em" : undefined }}
        >
          {segment === " " ? "\u00A0" : segment}
        </motion.span>
      ))}
    </MotionComponent>
  );
}
