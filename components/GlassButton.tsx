import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import {
  glassButtonClasses,
  type GlassButtonSize,
  type GlassButtonVariant,
} from "@/lib/glass-button-classes";

type BaseProps = {
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  className?: string;
  children: ReactNode;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
    external?: boolean;
  };

export type GlassButtonProps = ButtonProps | LinkProps;

function isExternal(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export default function GlassButton(props: GlassButtonProps) {
  const {
    variant = "primary",
    size = "sm",
    className,
    children,
    ...rest
  } = props;

  const classes = cn(glassButtonClasses({ variant, size }), className);
  const label = <span className="glass-btn-label">{children}</span>;

  if ("href" in props && props.href) {
    const { href, external, ...anchorRest } = rest as LinkProps;
    if (external || isExternal(href)) {
      const isBlank =
        href.startsWith("http://") || href.startsWith("https://");
      return (
        <a
          href={href}
          className={classes}
          {...anchorRest}
          {...(isBlank ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          {label}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {label}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } = rest as ButtonProps;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {label}
    </button>
  );
}
