import { LoadingState } from "@/components/ui/LoadingState";

const AdminLoading = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4">
        <LoadingState rows={1} />
      </div>
      <LoadingState rows={8} />
    </div>
  );
};

export default AdminLoading;
