import { parts, scene } from "./forward-pass";
import { SceneDiagram } from "./scene-diagram";

export function InputEmbeddingDiagram() {
  return <SceneDiagram source={scene} steps={parts.embedding} caption="Input embedding" />;
}
