import { Button } from "@manikrana/ui/components/ui/button";
import {
  Card as CardComponent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@manikrana/ui/components/ui/card";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Ellipsis } from "lucide-react";
import { Showcase } from "../showcase";

const meta = { title: "Primitives/Card", component: CardComponent } satisfies Meta<
  typeof CardComponent
>;
export default meta;
export const Card: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase title="Card" description="A raised surface with a header, content and footer.">
      <CardComponent className="max-w-sm" {...args}>
        <CardHeader>
          <CardTitle>Project settings</CardTitle>
          <CardDescription>Manage your project details.</CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="More options">
              <Ellipsis />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Keep related information and actions together.
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="ghost">Cancel</Button>
          <Button>Save</Button>
        </CardFooter>
      </CardComponent>
    </Showcase>
  ),
};
