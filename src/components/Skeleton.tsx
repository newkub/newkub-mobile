import type { JSX } from "solid-js";

type SkeletonProps = {
  class?: string;
  children?: JSX.Element;
  ariaLabel?: string;
};

export function Skeleton(props: SkeletonProps) {
  return (
    <div
      class={`skeleton ${props.class || ""}`}
      aria-busy="true"
      aria-label={props.ariaLabel || "Loading"}
    >
      {props.children}
    </div>
  );
}

export function SkeletonText(props: { lines?: number; class?: string }) {
  const count = Math.max(1, props.lines ?? 1);
  return (
    <div class={`space-y-2 ${props.class || ""}`} aria-busy="true" aria-label="Loading text">
      {Array.from({ length: count }).map((_, i) => (
        <div class="skeleton h-4 w-full" style={{ "max-width": `${80 + (i % 3) * 10}%` }}  aria-busy="true" aria-label="Loading" />
      ))}
    </div>
  );
}

export function SkeletonCard(props: { count?: number; class?: string }) {
  const count = Math.max(1, props.count ?? 1);
  return (
    <div class={`space-y-3 ${props.class || ""}`} aria-busy="true" aria-label="Loading cards">
      {Array.from({ length: count }).map(() => (
        <div class="skeleton h-20 w-full"  aria-busy="true" aria-label="Loading" />
      ))}
    </div>
  );
}
