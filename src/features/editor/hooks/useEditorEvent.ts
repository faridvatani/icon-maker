import { useEffect, useEffectEvent } from "react";
import type { EditorEventName } from "@/features/editor/lib/editorEvents";

/** Subscribes once while always invoking the latest event handler. */
export function useEditorEvent(
  eventName: EditorEventName,
  handler: (event: Event) => void,
) {
  const onEvent = useEffectEvent(handler);

  useEffect(() => {
    const listener = (event: Event) => onEvent(event);
    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }, [eventName]);
}
