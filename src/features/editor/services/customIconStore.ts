import type { CustomIconValue } from "@/features/editor/lib/iconTypes";
import {
  sanitizeSvgIcon,
  type SanitizedSvgIcon,
} from "@/features/editor/lib/sanitizeSvg";

const DATABASE_NAME = "icon-maker-assets";
const STORE_NAME = "custom-icons";

export interface CustomIconAsset extends SanitizedSvgIcon {
  id: CustomIconValue;
  name: string;
}

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async <T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
) => {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const store = database
        .transaction(STORE_NAME, mode)
        .objectStore(STORE_NAME);
      const request = operation(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
};

export async function saveCustomIcon(file: File): Promise<CustomIconAsset> {
  if (file.type && file.type !== "image/svg+xml") {
    throw new Error("Choose an SVG file");
  }

  const asset: CustomIconAsset = {
    id: `custom:${crypto.randomUUID()}` as CustomIconValue,
    name: file.name.replace(/\.svg$/i, "") || "Custom SVG",
    ...sanitizeSvgIcon(await file.text()),
  };
  await withStore("readwrite", (store) => store.put(asset));
  return asset;
}

export const getCustomIcon = (id: CustomIconValue) =>
  withStore<CustomIconAsset | undefined>("readonly", (store) => store.get(id));

export const deleteCustomIcon = (id: CustomIconValue) =>
  withStore("readwrite", (store) => store.delete(id));
