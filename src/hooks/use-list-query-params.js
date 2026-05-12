"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const parseValue = (rawValue, defaultValue) => {
  if (rawValue === null) {
    return defaultValue;
  }

  if (typeof defaultValue === "number") {
    const parsed = Number(rawValue);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }

  if (typeof defaultValue === "boolean") {
    return rawValue === "true";
  }

  return rawValue;
};

const isEffectivelyEmpty = (value) =>
  value === undefined || value === null || value === "";

export const useListQueryParams = (defaults) => {
  const pathname = usePathname();
  const router = useRouter();

  const [params, setParams] = useState(defaults);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const nextParams = {};

    Object.entries(defaults).forEach(([key, defaultValue]) => {
      nextParams[key] = parseValue(searchParams.get(key), defaultValue);
    });

    setParams(nextParams);
  }, [defaults, pathname]);

  const updateParams = (updates) => {
    if (typeof window === "undefined") {
      return;
    }

    const nextState = { ...params, ...updates };
    setParams(nextState);

    const nextSearchParams = new URLSearchParams(window.location.search);

    Object.entries(updates).forEach(([key, value]) => {
      const defaultValue = defaults[key];
      const normalizedValue =
        typeof defaultValue === "number" ? Number(value) : value;
      const isDefault = normalizedValue === defaultValue;

      if (isDefault || isEffectivelyEmpty(value)) {
        nextSearchParams.delete(key);
        return;
      }

      nextSearchParams.set(key, String(value));
    });

    const queryString = nextSearchParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const resetParams = () => {
    setParams(defaults);
    router.replace(pathname, { scroll: false });
  };

  return {
    params,
    updateParams,
    resetParams,
  };
};
