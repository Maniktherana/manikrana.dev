import { useEffect, useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ErrorMessage,
  ErrorShake as ErrorShakeComponent,
} from "@manikrana/ui/components/motion/error-shake";
import { Button } from "@manikrana/ui/components/ui/button";
import { Input } from "@manikrana/ui/components/ui/input";
import { Section, Showcase } from "../showcase";

function Example() {
  const id = useId();
  const [attempt, setAttempt] = useState(0);
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    if (!invalid) return;
    const timeout = window.setTimeout(() => setInvalid(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [invalid, attempt]);

  return (
    <form
      className="flex max-w-sm flex-col gap-3"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const valid = event.currentTarget.checkValidity();
        setInvalid(!valid);
        if (!valid) setAttempt((attempt) => attempt + 1);
      }}
    >
      <label htmlFor={id} className="text-sm font-medium">
        Email
      </label>
      <ErrorShakeComponent shakeKey={attempt}>
        <Input
          id={id}
          type="email"
          required
          placeholder="you@example.com"
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onChange={() => {
            setInvalid(false);
          }}
        />
      </ErrorShakeComponent>
      <div className="min-h-5">
        <ErrorMessage id={`${id}-error`} show={invalid}>
          Please enter a valid email.
        </ErrorMessage>
      </div>
      <Button type="submit" className="w-fit">
        Save email
      </Button>
    </form>
  );
}
const meta = { title: "Motion/ErrorShake", component: Example } satisfies Meta<typeof Example>;
export default meta;
export const ErrorShake: StoryObj<typeof meta> = {
  render: () => (
    <Showcase
      title="ErrorShake"
      description="Each invalid submission restarts a 280ms shake. The error fades back after three seconds; reduced motion keeps the message without the shake."
    >
      <Section title="Playground">
        <Example />
      </Section>
    </Showcase>
  ),
};
