import { parts, scene } from "./forward-pass";
import { SceneDiagram } from "./scene-diagram";

export function OutputHeadDiagram() {
  return <SceneDiagram source={scene} steps={parts.output} caption="Output head" />;
}
