import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Tabs as TabsComponent,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@manikrana/ui/components/ui/tabs";
import { Section, Showcase } from "../showcase";

function Example({ vertical = false }: { vertical?: boolean }) {
  return (
    <TabsComponent defaultValue="plan" orientation={vertical ? "vertical" : "horizontal"}>
      <TabsList aria-label={vertical ? "Vertical workflow" : "Workflow"}>
        <TabsTrigger value="plan">Plan</TabsTrigger>
        <TabsTrigger value="debug">Debug</TabsTrigger>
        <TabsTrigger value="ask">Ask a question</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Deploy
        </TabsTrigger>
      </TabsList>
      <TabsContent value="plan" className="p-3 text-sm text-muted-foreground">
        Make a plan before starting.
      </TabsContent>
      <TabsContent value="debug" className="p-3 text-sm text-muted-foreground">
        Inspect the problem and trace its cause.
      </TabsContent>
      <TabsContent value="ask" className="p-3 text-sm text-muted-foreground">
        Ask a question about the project.
      </TabsContent>
    </TabsComponent>
  );
}
const meta = { title: "Primitives/Tabs", component: TabsComponent } satisfies Meta<
  typeof TabsComponent
>;
export default meta;
export const Tabs: StoryObj<typeof meta> = {
  render: () => (
    <Showcase
      title="Tabs"
      description="A measured pill follows the selected tab over 250ms. Base UI handles keyboard navigation and panel semantics."
    >
      <Section title="Playground">
        <Example />
      </Section>
      <Section title="Vertical">
        <Example vertical />
      </Section>
    </Showcase>
  ),
};
