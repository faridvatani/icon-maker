import { useEffect, useState } from "react";
import type { CustomIconValue } from "@/features/editor/lib/iconTypes";
import {
  getCustomIcon,
  type CustomIconAsset,
} from "@/features/editor/services/customIconStore";

export function useCustomIcon(id: CustomIconValue | null) {
  const [asset, setAsset] = useState<CustomIconAsset>();

  useEffect(() => {
    let isCurrent = true;
    void (id ? getCustomIcon(id) : Promise.resolve(undefined))
      .then((result) => {
        if (isCurrent) setAsset(result);
      })
      .catch(() => {
        if (isCurrent) setAsset(undefined);
      });
    return () => {
      isCurrent = false;
    };
  }, [id]);

  return asset;
}
