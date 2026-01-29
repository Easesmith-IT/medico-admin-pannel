"use client";

import { CrashFilters } from "@/components/crash-report/CrashFilters";
import { adaptCrashForList } from "@/components/crash-report/crashListAdapter";
import { CrashTable } from "@/components/crash-report/CrashTable";
import { PaginationComp } from "@/components/shared/PaginationComp";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useEffect, useState } from "react";

const CrashReports = () => {
  const [environment, setEnvironment] = useState("");
  const [severity, setSeverity] = useState("");
  const [userType, setUserType] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  /* ===============================
     API QUERY (React Query)
  =============================== */
  const { data, isLoading } = useApiQuery({
    url: `/crash-report/get`,
    queryKeys: ["crash-reports", environment, severity, userType, page],
    config: {
      params: {
        environment,
        severity,
        userType,
        page,
      },
    },
    enabled: true,
  });

  console.log("crash data", data);
  

  /* ===============================
     DERIVED DATA
  =============================== */
  const crashReports = data?.data?.map(adaptCrashForList) || [];

  const totalPages = data?.meta?.totalPages || 0;
  const totalCrashes = data?.meta?.total || 0;

  /* ===============================
     RESET PAGE ON FILTER CHANGE
  =============================== */
  useEffect(() => {
    setPage(1);
  }, [environment, severity, userType]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Crash Reports</h1>
        <p className="text-sm text-muted-foreground">
          Total Crashes: <span className="font-mono">{totalCrashes}</span>
        </p>
      </header>

      <div className="space-y-6">
        <CrashFilters
          environment={environment}
          setEnvironment={setEnvironment}
          severity={severity}
          setSeverity={setSeverity}
          userType={userType}
          setUserType={setUserType}
        />

        <CrashTable crashes={crashReports} isLoading={isLoading} />

        <PaginationComp
          page={page}
          pageCount={pageCount}
          setPage={setPage}
          className="mt-8 mb-5"
        />
      </div>
    </div>
  );
};

export default CrashReports;
