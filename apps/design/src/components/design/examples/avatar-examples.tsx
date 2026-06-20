import type * as React from "react";
import { UserIcon } from "lucide-react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";

const avatarPreviewTitles: Record<string, string> = {
  "avatar-demo": "Avatar",
  "avatar-image": "Avatar Image",
  "avatar-border": "Avatar Border",
  "avatar-size": "Avatar Size",
  "avatar-radius": "Avatar Radius",
  "avatar-badge": "Avatar Badge",
  "avatar-group": "Avatar Group",
};

function AvatarDemo() {
  return (
    <Avatar>
      <AvatarFallback>MR</AvatarFallback>
    </Avatar>
  );
}

function AvatarImageDemo() {
  return (
    <Avatar>
      <AvatarImage src="https://github.com/manik.png" alt="Manik Rana" />
      <AvatarFallback>MR</AvatarFallback>
    </Avatar>
  );
}

function AvatarBorder() {
  return (
    <div className="flex items-center gap-3">
      <Avatar variant="border">
        <AvatarImage src="https://github.com/manik.png" alt="Manik Rana" />
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
      <Avatar variant="default">
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
    </div>
  );
}

function AvatarSize() {
  return (
    <div className="flex items-center gap-3">
      <Avatar size="2xs">
        <AvatarFallback>M</AvatarFallback>
      </Avatar>
      <Avatar size="xs">
        <AvatarFallback>M</AvatarFallback>
      </Avatar>
      <Avatar size="sm">
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
      <Avatar size="xl">
        <AvatarFallback>
          <UserIcon aria-hidden="true" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

function AvatarRadius() {
  return (
    <div className="flex items-center gap-3">
      <Avatar radius="full">
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
      <Avatar radius="rounded">
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
    </div>
  );
}

function AvatarBadgeDemo() {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>MR</AvatarFallback>
        <AvatarBadge />
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>UI</AvatarFallback>
        <AvatarBadge />
      </Avatar>
    </div>
  );
}

function AvatarGroupDemo() {
  return (
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>UI</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>DS</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+4</AvatarGroupCount>
    </AvatarGroup>
  );
}

const avatarPreviews: Record<string, React.ComponentType> = {
  "avatar-demo": AvatarDemo,
  "avatar-image": AvatarImageDemo,
  "avatar-border": AvatarBorder,
  "avatar-size": AvatarSize,
  "avatar-radius": AvatarRadius,
  "avatar-badge": AvatarBadgeDemo,
  "avatar-group": AvatarGroupDemo,
};

function renderAvatarPreview(name: string) {
  const Preview = avatarPreviews[name];

  return Preview ? <Preview /> : null;
}

export { avatarPreviewTitles, renderAvatarPreview };
