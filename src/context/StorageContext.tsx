import React, { createContext, useContext, useState } from "react";

type StorageValue = Record<string, string | number | undefined>;

interface StorageContextType {
  storageValue: StorageValue;
  setStorageValue: (value: StorageValue) => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const defaultValues = {
  icon: "FaceSlightlySmiling",
  iconColor: "#09203f",
  iconSize: 280,
  iconRotate: 0,
  bgColor: "#E2E2E2",
  bgRounded: 30,
  bgPadding: 10,
};

const migrateStoredValues = (storedValue: StorageValue): StorageValue => {
  const background = storedValue.bgColor;

  if (
    typeof background === "string" &&
    background.includes("images.unsplash.com")
  ) {
    return {
      ...storedValue,
      bgColor: `url("${import.meta.env.BASE_URL}backgrounds/aurora.svg")`,
    };
  }

  return storedValue;
};

const getInitialStorageValue = (): StorageValue => {
  try {
    const storedValue = JSON.parse(localStorage.getItem("value") || "{}");
    return { ...defaultValues, ...migrateStoredValues(storedValue) };
  } catch {
    return defaultValues;
  }
};

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [storageValue, setStorageValue] = useState<StorageValue>(
    getInitialStorageValue,
  );

  const updateStorageValue = (value: StorageValue) => {
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
