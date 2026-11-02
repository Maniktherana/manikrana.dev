import { parts, scene } from "./forward-pass";
import { SceneDiagram } from "./scene-diagram";

export function AttentionDiagram() {
  return <SceneDiagram source={scene} steps={parts.attention} caption="Attention block" />;
}
