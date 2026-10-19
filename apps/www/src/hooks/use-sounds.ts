import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { navigationSound, play, wake, type Sound } from "@/lib/sounds";

export function useSounds() {
  const router = useRouter();
  useEffect(
    () =>
      router.subscribe("onBeforeNavigate", ({ fromLocation, toLocation }) => {
        if (!fromLocation) return;
        const sound = navigationSound(fromLocation.pathname, toLocation.pathname);
        if (sound) play(sound);
      }),
    [router],
  );

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const tagged = event.target.closest<HTMLElement>("[data-sound]");
      if (tagged) return play(tagged.dataset.sound as Sound);
      if (event.target.closest('[data-slot="stage"] [role="toolbar"] button')) play("tap");
    };
    window.addEventListener("click", onClick, true);
    const gestures = ["pointerdown", "pointerup", "touchend", "keydown"] as const;
    for (const gesture of gestures) window.addEventListener(gesture, wake, true);
    return () => {
      window.removeEventListener("click", onClick, true);
      for (const gesture of gestures) window.removeEventListener(gesture, wake, true);
    };
  }, []);
}
