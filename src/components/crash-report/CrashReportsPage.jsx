import useGetApiReq from "@/hooks/useGetApiReq";
import { CrashFilters } from "./CrashFilters";
import { adaptCrashForList } from "./crashListAdapter";
import { CrashTable } from "./CrashTable";
import { useEffect, useState } from "react";
import ReactPagination from "@/components/pagination/ReactPagination";

export function CrashReportsPage() {
  const [crashReports, setCrashReports] = useState([]);
  const [environment, setEnvironment] = useState("");
  const [severity, setSeverity] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [userType, setUserType] = useState("")

  const { res, fetchData, isLoading } = useGetApiReq();

  const getCrashReport = () => {
    fetchData(
      `/crash-report/get?environment=${environment}&severity=${severity}&userType=${userType}`
    );
  };

  useEffect(() => {
    getCrashReport();
  }, [environment, severity, page,userType]);

  useEffect(() => {
    if (res?.status === 200 || res?.status === 201) {
      const modifiedData = res?.data?.data?.map(adaptCrashForList);
      setCrashReports(modifiedData);
      setPageCount(res?.data?.meta?.totalPages);
    }
  }, [res]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Crash Reports</h1>
        <p className="text-sm text-muted-foreground">
          Total Crashes:{" "}
          <span className="font-mono">{res?.data?.meta?.total || 0}</span>
        </p>
      </header>

      <div className="rounded-xl border bg-white dark:bg-[#111722]">
        <CrashFilters
          environment={environment}
          setEnvironment={setEnvironment}
          severity={severity}
          setSeverity={setSeverity}
          userType={userType}
          setUserType={setUserType}
        />
        <CrashTable crashes={crashReports} isLoading={isLoading} />

        <ReactPagination setPage={setPage} totalPage={pageCount} />
      </div>
    </div>
  );
}
