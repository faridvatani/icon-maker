import { useEffect } from "react";
import { useStorage } from "@/context/StorageContext";
import Icon from "@/components/ui/Icon";

export const LogoPreview = () => {
  const { storageValue, setStorageValue } = useStorage();

  useEffect(() => {
    const value = JSON.parse(localStorage.getItem("value") || "{}");
    setStorageValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageValue]);

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div
        id="logo-preview"
        className="h-full w-full max-w-[550px] max-h-[550px] flex items-center justify-center"
        style={{
          borderRadius: storageValue?.bgRounded,
          padding: storageValue?.bgPadding,
          background: storageValue?.bgColor,
        }}
      >
        <Icon
          name={storageValue?.icon as string}
          color={storageValue?.iconColor as string}
          size={storageValue?.iconSize as number}
          rotate={storageValue?.iconRotate as number}
        />
      </div>
    </div>
  );
};
