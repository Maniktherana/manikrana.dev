import { parts, scene } from "@/components/mlm/forward-pass";
import { SceneDiagram } from "@/components/mlm/scene-diagram";

export function InputEmbeddingDiagram() {
  return <SceneDiagram source={scene} steps={parts.embedding} caption="Input embedding" />;
}
