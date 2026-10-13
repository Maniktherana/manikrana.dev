import { parts, scene } from "@/components/mlm/forward-pass";
import { SceneDiagram } from "@/components/mlm/scene-diagram";

export function AttentionDiagram() {
  return <SceneDiagram source={scene} steps={parts.attention} caption="Attention block" />;
}
