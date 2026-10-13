import { parts, scene } from "@/components/mlm/forward-pass";
import { SceneDiagram } from "@/components/mlm/scene-diagram";

export function OutputHeadDiagram() {
  return <SceneDiagram source={scene} steps={parts.output} caption="Output head" />;
}
