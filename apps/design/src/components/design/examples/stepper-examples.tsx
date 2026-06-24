"use client";

import { useEffect, useState, type ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { useAutoPlay } from "@/components/ui/hooks/use-stepper-auto-play";
import {
  Stepper,
  StepperFill,
  StepperIndicator,
  StepperStep,
  StepperTrack,
} from "@/components/ui/stepper";

const stepperPreviewTitles: Record<string, string> = {
  "stepper-demo": "Stepper",
  "stepper-composed": "Stepper Composed",
  "stepper-vertical": "Stepper Vertical",
  "stepper-max-visible": "Stepper Max Visible",
  "stepper-autoplay": "Stepper Autoplay",
};

function StepperDemo() {
  const [step, setStep] = useState(1);

  return <Stepper count={5} value={step} onValueChange={setStep} />;
}

function StepperComposed() {
  const [step, setStep] = useState(2);

  return (
    <Stepper
      count={5}
      value={step}
      onValueChange={setStep}
      className="bg-card px-3 shadow-[var(--shadow-card)]"
    >
      <StepperTrack>
        {Array.from({ length: 5 }, (_, index) => (
          <StepperStep key={index} index={index}>
            <StepperIndicator className="bg-muted-foreground/20 group-data-[active=true]/stepper-step:bg-foreground">
              <StepperFill className="bg-background/50" />
            </StepperIndicator>
          </StepperStep>
        ))}
      </StepperTrack>
    </Stepper>
  );
}

function StepperVertical() {
  const [step, setStep] = useState(2);

  return <Stepper count={6} orientation="vertical" value={step} onValueChange={setStep} />;
}

function StepperMaxVisible() {
  const [step, setStep] = useState(5);

  return (
    <div className="grid justify-items-center gap-4">
      <Stepper count={10} maxVisible={5} value={step} onValueChange={setStep} />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setStep((current) => Math.min(current + 1, 9))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function StepperAutoplay() {
  const [step, setStep] = useState(0);
  const { fillDuration, filling, play, playing, toggle } = useAutoPlay({
    active: step,
    count: 5,
    loop: true,
    onStepChange: setStep,
    stepDuration: 2200,
  });

  useEffect(() => {
    play();
  }, [play]);

  return (
    <div className="grid justify-items-center gap-4">
      <Stepper
        active={step}
        count={5}
        fillDuration={fillDuration}
        filling={filling}
        onStepClick={setStep}
      />
      <Button type="button" variant="outline" size="sm" onClick={toggle}>
        {playing ? "Pause" : "Play"}
      </Button>
    </div>
  );
}

const stepperPreviews: Record<string, ComponentType> = {
  "stepper-demo": StepperDemo,
  "stepper-composed": StepperComposed,
  "stepper-vertical": StepperVertical,
  "stepper-max-visible": StepperMaxVisible,
  "stepper-autoplay": StepperAutoplay,
};

function renderStepperPreview(name: string) {
  const Preview = stepperPreviews[name];

  return Preview ? <Preview /> : null;
}

export { renderStepperPreview, stepperPreviewTitles };
