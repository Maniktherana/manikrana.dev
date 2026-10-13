import { GsocMark } from "@/components/icons/gsoc-mark";
import { PrometheusMark } from "@/components/icons/prometheus-mark";
import { TurbomlMark } from "@/components/icons/turboml-mark";

/** The marks content and links can name. */
export const marks = { turboml: TurbomlMark, prometheus: PrometheusMark, gsoc: GsocMark };
export type MarkName = keyof typeof marks;
