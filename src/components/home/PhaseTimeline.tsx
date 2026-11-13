"use client";

import { useState } from "react";
import styles from "@/styles/home.module.css";

type Phase = "early" | "rescue";

interface PhaseTimelineProps {
  early: React.ReactNode;
  rescue: React.ReactNode;
}

const phases = [
  {
    key: "early" as const,
    eyebrow: "从 0 到 1",
    title: "前 3 个月",
    subtitle: "新站快速起量 · 5 个维度",
  },
  {
    key: "rescue" as const,
    eyebrow: "从诊断到修复",
    title: "拯救",
    subtitle: "止跌 · 新高 · 延续增长",
  },
];

export default function PhaseTimeline({ early, rescue }: PhaseTimelineProps) {
  const [activePhase, setActivePhase] = useState<Phase | null>(null);

  return (
    <div className={styles.phaseInteractive}>
      <div className={styles.phaseTimeline} role="group" aria-label="选择要查看的阶段">
        {phases.map((phase) => {
          const active = activePhase === phase.key;

          return (
            <div className={styles.phasePoint} key={phase.key}>
              <button
                type="button"
                className={`${styles.phasePointButton} ${active ? styles.phasePointActive : ""}`}
                aria-expanded={active}
                aria-controls={`phase-panel-${phase.key}`}
                aria-describedby="phase-interaction-hint"
                onMouseEnter={() => setActivePhase(phase.key)}
                onClick={() => setActivePhase(active ? null : phase.key)}
              >
                <span className={styles.phasePointDot} aria-hidden="true" />
                <span className={styles.phasePointEyebrow}>{phase.eyebrow}</span>
                <span className={styles.phasePointTitle}>{phase.title}</span>
                <span className={styles.phasePointSubtitle}>{phase.subtitle}</span>
              </button>
            </div>
          );
        })}
      </div>
      <p className={styles.phaseInteractionHint} id="phase-interaction-hint">
        桌面悬停展开 · 手机点击展开 · 再次点击当前节点收起
      </p>

      {activePhase && (
        <div
          key={activePhase}
          id={`phase-panel-${activePhase}`}
          role="region"
          aria-label={activePhase === "early" ? "前 3 个月成果" : "拯救阶段成果"}
          className={`${styles.phaseDetails} ${styles.phasePanel} ${activePhase === "early" ? styles.earlyPhase : ""}`}
        >
          {activePhase === "early" ? early : rescue}
        </div>
      )}
    </div>
  );
}
