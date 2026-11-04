import { CopyButton } from "@/components/copy-button";
import { Link } from "@/components/link";
import { WorkSection } from "@/components/work/section";

const INSTALL_COMMAND = "bun add @maniktherana/gust";

export function Details() {
  return (
    <WorkSection title="About">
      <div className="grid max-w-reading gap-3 px-1 text-pretty text-muted-foreground">
        <p>
          I like the text animations in{" "}
          <Link href="https://github.com/yokaiqq/numeric-text">NumericText</Link>,{" "}
          <Link href="https://github.com/raphaelsalaja/calligraph">Calligraph</Link>, and{" "}
          <Link href="https://github.com/lochie/torph">Torph</Link>. Gust is my take on that kind of
          motion.
        </p>
        <p>
          Gust keeps matching text at both ends and brings in the changed characters with a small
          spring. I kept the stagger short and made the animation interruptible, since a counter
          might change again before the previous update finishes.
        </p>
      </div>
      <div className="mt-6 flex h-11 max-w-reading items-center gap-3 rounded-2xl bg-card ps-4 pe-1">
        <code className="min-w-0 flex-1 truncate font-mono text-sm text-control-foreground">
          <span aria-hidden="true" className="me-2 text-muted-foreground select-none">
            $
          </span>
          {INSTALL_COMMAND}
        </code>
        <CopyButton
          iconOnly
          className="bg-transparent"
          label="Copy command"
          value={INSTALL_COMMAND}
        />
      </div>
    </WorkSection>
  );
}
