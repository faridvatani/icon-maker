import React, { createContext, useContext, useState, useEffect } from "react";

interface StorageContextType {
  storageValue: { [key: string]: string | number | undefined };
  setStorageValue: (value: {
    [key: string]: string | number | undefined;
  }) => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const defaultValues = {
  icon: "Smile",
  iconColor: "#09203f",
  iconSize: 280,
  iconRotate: 0,
  bgColor: "#E2E2E2",
  bgRounded: 30,
  bgPadding: 10,
};

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [storageValue, setStorageValue] = useState<{
    [key: string]: string | number | undefined;
  }>(defaultValues);

  useEffect(() => {
    const storedValue = JSON.parse(localStorage.getItem("value") || "{}");
    setStorageValue((prev) => ({ ...prev, ...storedValue }));
  }, []);

  const updateStorageValue = (value: {
    [key: string]: string | number | undefined;
  }) => {
    setStorageValue(value);
    localStorage.setItem("value", JSON.stringify(value));
  };

  return (
    <StorageContext.Provider
      value={{ storageValue, setStorageValue: updateStorageValue }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = (): StorageContextType => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};
