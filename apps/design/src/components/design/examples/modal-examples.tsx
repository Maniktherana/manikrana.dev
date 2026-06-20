import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function ModalDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>Open modal</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete something</DialogTitle>
          <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-[13px] leading-[1.6] text-muted-foreground">
            Please type <span className="font-medium text-foreground">delete</span> to confirm.
          </p>
          <Input placeholder="Confirmation text" />
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ModalConfirmative() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>Publish changes</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish changes</DialogTitle>
          <DialogDescription>Review this update before it goes live.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button>Publish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const modalPreviews = {
  modal: ModalDemo,
  "modal-demo": ModalDemo,
  "modal-confirmative": ModalConfirmative,
};

const modalPreviewTitles: Record<string, string> = {
  modal: "Modal Demo",
  "modal-demo": "Modal Demo",
  "modal-confirmative": "Modal Confirmative",
};

function renderModalPreview(name: string) {
  const Preview = modalPreviews[name as keyof typeof modalPreviews];

  return Preview ? <Preview /> : null;
}

export { modalPreviewTitles, renderModalPreview };
