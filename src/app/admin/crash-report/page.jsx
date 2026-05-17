"use client";
export const dynamic = "force-dynamic";

import { useMemo } from "react";

import { CrashFilters } from "@/components/crash-report/CrashFilters";
import { CrashTable } from "@/components/crash-report/CrashTable";
import { adaptCrashForList } from "@/components/crash-report/crashListAdapter";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaginationComp } from "@/components/shared/PaginationComp";
import { StateView } from "@/components/shared/state-view";
import { H1 } from "@/components/typography";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useListQueryParams } from "@/hooks/use-list-query-params";
import { buildQuery } from "@/lib/utils";

const defaults = {
  environment: "all",
  severity: "all",
  userType: "all",
  page: 1,
  limit: "10",
};

const CrashReportsPage = () => {
  const { params, updateParams, resetParams } = useListQueryParams(defaults);

  const query = buildQuery({
    environment: params.environment,
    severity: params.severity,
    userType: params.userType,
    page: params.page,
    limit: params.limit,
  });

  const { data, isLoading, isFetching, error, refetch } = useApiQuery({
    url: `/crash-report/get?${query}`,
    queryKeys: [
      "crash-report",
      params.environment,
      params.severity,
      params.userType,
      params.page,
      params.limit,
    ],
  });

  const crashes = useMemo(
    () => (data?.data || []).map(adaptCrashForList),
    [data?.data]
  );

  const pageCount = data?.meta?.totalPages || 0;
  const total = data?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <H1>Crash Reports</H1>
        <p className="text-sm text-muted-foreground">
          Total Crashes: <span className="font-mono">{total}</span>
        </p>
      </header>

      <FilterBar>
        <CrashFilters
          filters={params}
          onChange={(updates) => updateParams(updates)}
          onReset={resetParams}
        />
      </FilterBar>

      {error ? (
        <StateView
          type="error"
          title="Unable to load crash reports"
          description={error.message}
          actionLabel="Retry"
          onAction={refetch}
        />
      ) : null}
      {isFetching && !isLoading ? (
        <p className="text-sm text-muted-foreground">Refreshing crash reports...</p>
      ) : null}

      <CrashTable crashes={crashes} isLoading={isLoading} />

      <PaginationComp
        page={params.page}
        pageCount={pageCount}
        setPage={(nextPage) => updateParams({ page: nextPage })}
        className="mb-5 mt-8"
      />
    </div>
  );
};

export default CrashReportsPage;
