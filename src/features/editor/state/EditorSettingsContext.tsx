import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  defaultEditorSettings,
  editorSettingsEqual,
  type EditorSettings,
} from "@/features/editor/lib/editorSettings";
import {
  readPersistedEditorSettings,
  writePersistedEditorSettings,
} from "@/features/editor/lib/editorSettingsStorage";

export type { EditorSettings } from "@/features/editor/lib/editorSettings";

interface StorageContextType {
  storageValue: EditorSettings;
  updateStorageValue: (patch: Partial<EditorSettings>) => void;
  previewStorageValue: (patch: Partial<EditorSettings>) => void;
  commitStorageValue: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  applySettings: (settings: EditorSettings) => void;
  canUndo: boolean;
  canRedo: boolean;
  isDefault: boolean;
}

interface HistoryState {
  past: EditorSettings[];
  present: EditorSettings;
  future: EditorSettings[];
  pendingBase: EditorSettings | null;
}

type HistoryAction =
  | { type: "update"; patch: Partial<EditorSettings> }
  | { type: "preview"; patch: Partial<EditorSettings> }
  | { type: "commit" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset" }
  | { type: "apply"; settings: EditorSettings };

const HISTORY_LIMIT = 50;

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const appendHistory = (history: EditorSettings[], value: EditorSettings) =>
  [...history, value].slice(-HISTORY_LIMIT);

const historyReducer = (
  state: HistoryState,
  action: HistoryAction,
): HistoryState => {
  switch (action.type) {
    case "update": {
      const nextValue = { ...state.present, ...action.patch };
      if (editorSettingsEqual(nextValue, state.present)) return state;
      return {
        past: appendHistory(state.past, state.pendingBase ?? state.present),
        present: nextValue,
        future: [],
        pendingBase: null,
      };
    }
    case "preview":
      return {
        ...state,
        present: { ...state.present, ...action.patch },
        pendingBase: state.pendingBase ?? state.present,
      };
    case "commit":
      if (!state.pendingBase) return state;
      return editorSettingsEqual(state.pendingBase, state.present)
        ? { ...state, pendingBase: null }
        : {
            ...state,
            past: appendHistory(state.past, state.pendingBase),
            future: [],
            pendingBase: null,
          };
    case "undo": {
      if (state.pendingBase) {
        return { ...state, present: state.pendingBase, pendingBase: null };
      }
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
        pendingBase: null,
      };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return {
        past: appendHistory(state.past, state.present),
        present: next,
        future: state.future.slice(1),
        pendingBase: null,
      };
    }
    case "reset":
      if (editorSettingsEqual(state.present, defaultEditorSettings))
        return state;
      return {
        past: appendHistory(state.past, state.pendingBase ?? state.present),
        present: defaultEditorSettings,
        future: [],
        pendingBase: null,
      };
    case "apply":
      return editorSettingsEqual(state.present, action.settings)
        ? state
        : {
            past: appendHistory(state.past, state.present),
            present: action.settings,
            future: [],
            pendingBase: null,
          };
  }
};

const getInitialStorageValue = (): HistoryState => {
  const { settings } = readPersistedEditorSettings();
  return {
    past: [],
    present: settings,
    future: [],
    pendingBase: null,
  };
};

export function StorageProvider({ children }: { children: ReactNode }) {
  const [history, dispatch] = useReducer(
    historyReducer,
    undefined,
    getInitialStorageValue,
  );

  const updateStorageValue = useCallback(
    (patch: Partial<EditorSettings>) => dispatch({ type: "update", patch }),
    [],
  );
  const previewStorageValue = useCallback(
    (patch: Partial<EditorSettings>) => dispatch({ type: "preview", patch }),
    [],
  );
  const commitStorageValue = useCallback(
    () => dispatch({ type: "commit" }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const applySettings = useCallback(
    (settings: EditorSettings) => dispatch({ type: "apply", settings }),
    [],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      writePersistedEditorSettings(history.present);
    }, 150);
    return () => window.clearTimeout(timeoutId);
  }, [history.present]);

  const contextValue = useMemo(
    () => ({
      storageValue: history.present,
      updateStorageValue,
      previewStorageValue,
      commitStorageValue,
      undo,
      redo,
      reset,
      applySettings,
      canUndo: Boolean(history.pendingBase || history.past.length),
      canRedo: Boolean(history.future.length),
      isDefault: editorSettingsEqual(history.present, defaultEditorSettings),
    }),
    [
      history,
      updateStorageValue,
      previewStorageValue,
      commitStorageValue,
      undo,
      redo,
      reset,
      applySettings,
    ],
  );

  return (
    <StorageContext.Provider value={contextValue}>
      {children}
    </StorageContext.Provider>
  );
}

export const useStorage = (): StorageContextType => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};
