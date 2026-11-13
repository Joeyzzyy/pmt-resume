import styles from "@/styles/home.module.css";

export interface TooltipPlacement {
  align: "left" | "center" | "right";
  side: "above" | "below";
}

export function getTooltipPlacement(element: HTMLElement): TooltipPlacement {
  const rect = element.getBoundingClientRect();
  const tooltipWidth = Math.min(320, window.innerWidth - 24);
  const center = rect.left + rect.width / 2;
  const align = center - tooltipWidth / 2 < 12
    ? "left"
    : center + tooltipWidth / 2 > window.innerWidth - 12
      ? "right"
      : "center";

  return {
    align,
    side: rect.top > 360 ? "above" : "below",
  };
}

interface HoverTooltipProps {
  id: string;
  eyebrow: string;
  title: string;
  placement: TooltipPlacement;
  onClose: () => void;
  children: React.ReactNode;
}

const alignClasses = {
  left: styles.hoverTooltipLeft,
  center: styles.hoverTooltipCenter,
  right: styles.hoverTooltipRight,
};

export default function HoverTooltip({
  id,
  eyebrow,
  title,
  placement,
  onClose,
  children,
}: HoverTooltipProps) {
  return (
    <div
      id={id}
      role="tooltip"
      className={`${styles.hoverTooltip} ${alignClasses[placement.align]} ${placement.side === "above" ? styles.hoverTooltipAbove : styles.hoverTooltipBelow}`}
    >
      <div className={styles.hoverTooltipHeader}>
        <div>
          <span>{eyebrow}</span>
          <h3>{title}</h3>
        </div>
        <button type="button" onClick={onClose} aria-label={`收起 ${title} 详情`}>
          收起
        </button>
      </div>
      {children}
    </div>
  );
}
