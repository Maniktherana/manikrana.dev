import { useMatch } from "@tanstack/react-router";
import { goalShiftRecovery, hockey, memoryUsage, trainingLoss } from "@/components/footer-charts";
import { LineChart } from "@/components/line-chart";

const postCharts: Record<string, typeof hockey> = {
  agentchangebench: goalShiftRecovery,
  "llm-from-scratch": trainingLoss,
  prometheus: memoryUsage,
};

export default function Footer() {
  const id = useMatch({ from: "/library/$id", shouldThrow: false })?.params.id;
  const lines = (id && postCharts[id]) || hockey;
  return (
    <footer aria-hidden="true" className="pt-16 min-[641px]:pt-26">
      <LineChart
        key={lines === hockey ? "site" : id}
        lines={lines}
        className="pointer-events-none block h-56 w-full select-none min-[641px]:h-72"
      />
    </footer>
  );
}
