import type * as React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const tablePreviewTitles: Record<string, string> = {
  "table-demo": "Table",
  "table-overflow": "Table Overflow",
};

function TableDemo() {
  return (
    <div className="w-full max-w-3xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Component</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-right">Last updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Button</TableCell>
            <TableCell>
              <Badge variant="success">Ready</Badge>
            </TableCell>
            <TableCell>Core UI</TableCell>
            <TableCell className="text-right">2 hours ago</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Input</TableCell>
            <TableCell>
              <Badge variant="information">Reviewing</Badge>
            </TableCell>
            <TableCell>Foundations</TableCell>
            <TableCell className="text-right">Yesterday</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tabs</TableCell>
            <TableCell>
              <Badge variant="warning">Draft</Badge>
            </TableCell>
            <TableCell>Navigation</TableCell>
            <TableCell className="text-right">May 14</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function TableOverflow() {
  return (
    <div className="w-full max-w-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fulfillment</TableHead>
            <TableHead>Region</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>#1084</TableCell>
            <TableCell>Manik Rana</TableCell>
            <TableCell>Ready</TableCell>
            <TableCell>Standard shipping</TableCell>
            <TableCell>North America</TableCell>
            <TableCell className="text-right">$128.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>#1085</TableCell>
            <TableCell>Priya Shah</TableCell>
            <TableCell>Picking</TableCell>
            <TableCell>Local courier handoff</TableCell>
            <TableCell>APAC</TableCell>
            <TableCell className="text-right">$94.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

const tablePreviews: Record<string, React.ComponentType> = {
  "table-demo": TableDemo,
  "table-overflow": TableOverflow,
};

function renderTablePreview(name: string) {
  const Preview = tablePreviews[name];

  return Preview ? <Preview /> : null;
}

export { renderTablePreview, tablePreviewTitles };
