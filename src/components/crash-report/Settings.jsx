import AdminWrapper from "@/components/admin-wrapper/AdminWrapper";
import { ChevronLeft } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { CrashReportsPage } from "./CrashReportsPage";

const Settings = () => {
  return (
    <AdminWrapper>
      <div>
        {/* <Link
          to="/admin/settings"
          className="inline-flex gap-1 items-center mb-4"
        >
          <ChevronLeft />
          <h2 className="text-[#111928] text-xl font-semibold font-inter">
            Crash Reports
          </h2>
        </Link> */}
        <CrashReportsPage />
      </div>
    </AdminWrapper>
  );
};

export default Settings;
