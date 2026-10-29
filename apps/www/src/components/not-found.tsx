import { Link as RouterLink } from "@tanstack/react-router";
import { Link } from "@manikrana/ui/components/ui/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto grid w-[calc(100%-40px)] max-w-reading gap-18 pt-14 min-[641px]:gap-20 min-[641px]:pt-24"
    >
      <section aria-labelledby="not-found-title">
        <h1 id="not-found-title" className="mb-3 text-base leading-5.5 font-semibold">
          Page not found
        </h1>
        <p className="text-pretty text-muted-foreground">
          This page doesn't exist.{" "}
          <Link
            render={<RouterLink to="/" />}
            className="font-[450] motion-safe:duration-200 motion-reduce:transition-none"
          >
            Go home
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
