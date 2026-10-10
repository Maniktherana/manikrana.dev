import type { ReactNode } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { KeyIcon, ShieldCheckIcon, TrashIcon } from "@/components/icons";
import {
  FamilyDrawer,
  FamilyDrawerButton,
  FamilyDrawerClose,
  FamilyDrawerContent,
  FamilyDrawerDescription,
  FamilyDrawerFooter,
  FamilyDrawerHeader,
  FamilyDrawerItem,
  FamilyDrawerPage,
  FamilyDrawerPages,
  FamilyDrawerTitle,
  FamilyDrawerTrigger,
  useFamilyDrawer,
  type FamilyDrawerProps,
} from "@/work/family-drawer/family-drawer";

export type WalletPage = "default" | "key" | "phrase" | "remove";

const SECRETS = {
  key: {
    title: "Private Key",
    description:
      "Your Private Key is the key used to back up your wallet. Keep it secret and secure at all times.",
    icon: <KeyIcon className="size-5" />,
    iconClassName: "bg-[#8b5cf6]/15 text-[#a78bfa]",
    warnings: [
      "Keep your private key safe",
      "Don't share it with anyone else",
      "If you lose it, we can't recover it",
    ],
  },
  phrase: {
    title: "Secret Recovery Phrase",
    description:
      "Your Secret Recovery Phrase is the key used to back up your wallet. Keep it secret at all times.",
    icon: <ShieldCheckIcon className="size-5" />,
    iconClassName: "bg-[#4dafff]/15 text-[#63bcff]",
    warnings: [
      "Keep your Secret Phrase safe",
      "Don't share it with anyone else",
      "If you lose it, we can't recover it",
    ],
  },
};

const DESTRUCTIVE_ITEM = "bg-[#ff3f40]/12 text-[#ff6b6c] hover:bg-[#ff3f40]/18";

// Destructive repeats its fill on hover to override the base button's hover.
const BUTTON_TONES = {
  destructive: "bg-[#ff3f40] text-white hover:bg-[#ff3f40]",
  blue: "bg-[#4dafff] text-[#062032] hover:bg-[#69bdff]",
};

function OptionsPage() {
  const { setPage } = useFamilyDrawer();

  return (
    <>
      <FamilyDrawerHeader className="mb-3 flex h-16 items-center border-b border-border pl-2">
        <FamilyDrawerTitle>Options</FamilyDrawerTitle>
      </FamilyDrawerHeader>
      <div className="flex flex-col gap-2">
        <FamilyDrawerItem onClick={() => setPage("key")}>
          <KeyIcon />
          View Private Key
        </FamilyDrawerItem>
        <FamilyDrawerItem onClick={() => setPage("phrase")}>
          <ShieldCheckIcon />
          View Recovery Phrase
        </FamilyDrawerItem>
        <FamilyDrawerItem className={DESTRUCTIVE_ITEM} onClick={() => setPage("remove")}>
          <TrashIcon />
          Remove Wallet
        </FamilyDrawerItem>
      </div>
    </>
  );
}

function NoticeHeader({
  description,
  icon,
  iconClassName,
  title,
}: {
  description: string;
  icon: ReactNode;
  iconClassName: string;
  title: string;
}) {
  return (
    <FamilyDrawerHeader className="mt-4">
      <div className={cn("flex size-10 items-center justify-center rounded-full", iconClassName)}>
        {icon}
      </div>
      <FamilyDrawerTitle className="mt-2 text-xl leading-snug">{title}</FamilyDrawerTitle>
      <FamilyDrawerDescription>{description}</FamilyDrawerDescription>
    </FamilyDrawerHeader>
  );
}

function SecretPage({ secret }: { secret: keyof typeof SECRETS }) {
  const { setPage } = useFamilyDrawer();
  const back = () => setPage("default");
  const { warnings, ...header } = SECRETS[secret];

  return (
    <div>
      <div className="px-2">
        <NoticeHeader {...header} />
        <ul className="mt-5 flex flex-col gap-3 border-t border-border pt-5">
          {warnings.map((warning) => (
            <li
              className="flex items-center gap-2 text-sm leading-snug font-semibold text-muted-foreground"
              key={warning}
            >
              <span className="flex size-5 items-center justify-center rounded-full border border-muted-foreground/25">
                <ShieldCheckIcon className="size-3" />
              </span>
              {warning}
            </li>
          ))}
        </ul>
      </div>
      <FamilyDrawerFooter>
        <FamilyDrawerButton onClick={back}>Cancel</FamilyDrawerButton>
        <FamilyDrawerButton className={BUTTON_TONES.blue} onClick={back}>
          <ShieldCheckIcon />
          Reveal
        </FamilyDrawerButton>
      </FamilyDrawerFooter>
    </div>
  );
}

function RemovePage() {
  const { setPage } = useFamilyDrawer();
  const back = () => setPage("default");

  return (
    <div className="px-2">
      <NoticeHeader
        description="You haven't backed up your wallet yet. If you remove it, you could lose access forever. We suggest tapping and backing up your wallet first with a valid recovery method."
        icon={<TrashIcon className="size-5" />}
        iconClassName="bg-[#ff3f40]/15 text-[#ff3f40]"
        title="Are you sure?"
      />
      <FamilyDrawerFooter>
        <FamilyDrawerButton onClick={back}>Cancel</FamilyDrawerButton>
        <FamilyDrawerButton className={BUTTON_TONES.destructive} onClick={back}>
          Continue
        </FamilyDrawerButton>
      </FamilyDrawerFooter>
    </div>
  );
}

export function WalletDrawer({
  open,
  page,
  onOpenChange,
  onPageChange,
}: Pick<FamilyDrawerProps, "open" | "page" | "onOpenChange" | "onPageChange">) {
  return (
    <FamilyDrawer
      defaultPage="default"
      onOpenChange={onOpenChange}
      onPageChange={onPageChange}
      open={open}
      page={page}
    >
      <FamilyDrawerTrigger>Wallet options</FamilyDrawerTrigger>
      <FamilyDrawerContent>
        <FamilyDrawerClose aria-label="Close drawer" />
        <FamilyDrawerPages>
          <FamilyDrawerPage value="default">
            <OptionsPage />
          </FamilyDrawerPage>
          <FamilyDrawerPage value="key">
            <SecretPage secret="key" />
          </FamilyDrawerPage>
          <FamilyDrawerPage value="phrase">
            <SecretPage secret="phrase" />
          </FamilyDrawerPage>
          <FamilyDrawerPage value="remove">
            <RemovePage />
          </FamilyDrawerPage>
        </FamilyDrawerPages>
      </FamilyDrawerContent>
    </FamilyDrawer>
  );
}
