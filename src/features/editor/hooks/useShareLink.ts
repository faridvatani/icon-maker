import { useCallback, useEffect, useRef, useState } from "react";
import { createShareUrl } from "@/features/editor/lib/share";
import { useStorage } from "@/features/editor/state/EditorSettingsContext";

export type ShareLinkState = "idle" | "success" | "error";

const SHARE_FEEDBACK_DURATION = 2_000;

export function useShareLink() {
  const { storageValue } = useStorage();
  const [shareState, setShareState] = useState<ShareLinkState>("idle");
  const timeoutRef = useRef<number | undefined>(undefined);

  const copyShareLink = useCallback(async () => {
    const url = createShareUrl(storageValue, window.location);
    if (!url) return;

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    try {
      await navigator.clipboard.writeText(url);
      setShareState("success");
    } catch {
      setShareState("error");
    }
    timeoutRef.current = window.setTimeout(
      () => setShareState("idle"),
      SHARE_FEEDBACK_DURATION,
    );
  }, [storageValue]);

  useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  return { copyShareLink, shareState };
}
