import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStorage } from "@/features/editor/state/EditorSettingsContext";
import { useEditorEvent } from "@/features/editor/hooks/useEditorEvent";
import {
  editorEvent,
  getEditorEventFocusTarget,
} from "@/features/editor/lib/editorEvents";

export function ResetSettingsDialog() {
  const [open, setOpen] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const { reset } = useStorage();

  useEditorEvent(editorEvent.confirmReset, (event) => {
    returnFocusRef.current = getEditorEventFocusTarget(event);
    setOpen(true);
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          const target = returnFocusRef.current;
          returnFocusRef.current = null;
          if (!target?.isConnected) return;
          event.preventDefault();
          target.focus();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
          <AlertDialogDescription>
            This restores the editor defaults. You can undo the change
            afterwards.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            Reset settings
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
