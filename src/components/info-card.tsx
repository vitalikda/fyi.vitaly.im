import type { ComponentChildren } from "preact";

interface Props {
  title: string;
  class?: string;
  children?: ComponentChildren;
}

export function InfoCard({ title, class: cls, children }: Props) {
  return (
    <div class={`card bg-base-100 shadow-xl card-compact ${cls ?? ""}`}>
      <div class="card-body p-3">
        <h2 class="card-title text-base text-primary">{title}</h2>
        {children}
      </div>
    </div>
  );
}
