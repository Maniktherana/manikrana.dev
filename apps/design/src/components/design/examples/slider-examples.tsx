"use client";

import * as React from "react";

import { Slider } from "@/components/ui/slider";

const sliderPreviewTitles: Record<string, string> = {
  slider: "Slider",
  "slider-discrete": "Slider Discrete",
  "slider-dodge": "Slider Text Dodge",
  "slider-edit": "Slider Editable Value",
  "slider-disabled": "Slider Disabled",
};

function SliderDemo() {
  const [value, setValue] = React.useState([42]);

  return (
    <div className="grid w-[min(360px,100%)] gap-3">
      <Slider
        label="Opacity"
        max={100}
        min={0}
        onValueChange={setValue}
        step={1}
        unit="%"
        value={value}
      />
    </div>
  );
}

function SliderDiscrete() {
  const [columns, setColumns] = React.useState([6]);

  return (
    <div className="grid w-[min(360px,100%)] gap-3">
      <Slider
        formatValue={(value) => `${value} cols`}
        label="Columns"
        max={12}
        min={2}
        onValueChange={setColumns}
        step={2}
        value={columns}
      />
    </div>
  );
}

function SliderTextDodge() {
  const [soft, setSoft] = React.useState([0.08]);
  const [sharp, setSharp] = React.useState([94]);

  return (
    <div className="grid w-[min(380px,100%)] gap-3">
      <Slider
        formatValue={(value) => value.toFixed(2)}
        label="Noise floor"
        max={1}
        min={0}
        onValueChange={setSoft}
        step={0.01}
        value={soft}
      />
      <Slider
        label="Response"
        max={100}
        min={0}
        onValueChange={setSharp}
        step={1}
        unit="%"
        value={sharp}
      />
    </div>
  );
}

function SliderEditableValue() {
  const [duration, setDuration] = React.useState([320]);

  return (
    <div className="grid w-[min(360px,100%)] gap-3">
      <Slider
        formatValue={(value) => `${Math.round(value)} ms`}
        label="Duration"
        max={1200}
        min={80}
        onValueChange={setDuration}
        step={20}
        value={duration}
      />
    </div>
  );
}

function SliderDisabled() {
  return (
    <div className="grid w-[min(360px,100%)] gap-3">
      <Slider defaultValue={[24]} disabled label="Blur" max={40} min={0} step={1} unit="px" />
      <Slider defaultValue={[72]} disabled label="Saturation" max={100} min={0} step={1} unit="%" />
    </div>
  );
}

const sliderPreviews: Record<string, React.ComponentType> = {
  slider: SliderDemo,
  "slider-discrete": SliderDiscrete,
  "slider-dodge": SliderTextDodge,
  "slider-edit": SliderEditableValue,
  "slider-disabled": SliderDisabled,
};

function renderSliderPreview(name: string) {
  const Preview = sliderPreviews[name];

  return Preview ? <Preview /> : null;
}

export { renderSliderPreview, sliderPreviewTitles };
