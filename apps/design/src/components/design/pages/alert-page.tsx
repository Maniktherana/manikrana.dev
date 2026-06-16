import { ComponentDemoBand, ComponentPageShell } from "./component-page-shell";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type AlertStatus = React.ComponentProps<typeof Alert>["status"];

const alerts: Array<{
  description: string;
  status: AlertStatus;
  title: string;
}> = [
  {
    status: "neutral",
    title: "Tip",
    description:
      "You can always install the storefront at a later point. Medusa is a headless backend, so it operates without a storefront by default.",
  },
  {
    status: "information",
    title: 'The inbound items comes with the discount: "50%_OFF_PRODUCTS"',
    description:
      "Have this in mind when proceed with your exchange and add the items you're sending out.",
  },
  {
    status: "success",
    title: "Do's",
    description:
      "Use data models when you want to store data related to your customization in the database.",
  },
  {
    status: "warning",
    title: "Warning",
    description:
      "If you have multiple storage plugins configured, the last plugin declared in the medusa-config.js file will be used.",
  },
  {
    status: "error",
    title: "Don't's",
    description:
      "Don't use data models if you want to store simple key-value pairs related to a Medusa data model. Instead, use the metadata field that models have.",
  },
];

function AlertExample({
  description,
  status,
  title,
  withActions = true,
}: {
  description: string;
  status: AlertStatus;
  title: string;
  withActions?: boolean;
}) {
  return (
    <Alert status={status} className="max-w-[640px]">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      {withActions ? (
        <AlertAction>
          <Button variant="link" className="text-foreground" type="button">
            Upgrade
          </Button>
          <Button variant="link" className="text-foreground" type="button">
            Close
          </Button>
        </AlertAction>
      ) : null}
    </Alert>
  );
}

function AlertPage() {
  return (
    <ComponentPageShell title="Alert">
      <ComponentDemoBand label="STATUS" className="mt-8 flex max-w-[700px] flex-col gap-8">
        {alerts.map((alert) => (
          <AlertExample key={alert.status} {...alert} />
        ))}
      </ComponentDemoBand>

      <ComponentDemoBand label="WITHOUT ACTIONS" className="mt-8 flex max-w-[700px] flex-col gap-8">
        <AlertExample {...alerts[1]} withActions={false} />
        <AlertExample {...alerts[3]} withActions={false} />
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { AlertPage };
