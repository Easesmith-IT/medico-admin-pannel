"use client";
export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RotateCcwIcon, SearchIcon } from "lucide-react";

import DataNotFound from "@/components/shared/DataNotFound";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaginationComp } from "@/components/shared/PaginationComp";
import { StateView } from "@/components/shared/state-view";
import { ListPageHeader } from "@/components/layout/ListPageHeader";
import { OperationalBadge } from "@/components/ui/OperationalBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useListQueryParams } from "@/hooks/use-list-query-params";
import { normalizeRole } from "@/lib/rbac";
import { readCookie } from "@/lib/readCookie";
import { buildQuery, customId } from "@/lib/utils";

const defaults = {
  status: "all",
  serviceId: "all",
  patientId: "all",
  servicePartnerId: "all",
  cityId: "all",
  search: "",
  validFrom: "",
  validTo: "",
  page: 1,
  limit: "10",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TreatmentsPage = () => {
  const { params, updateParams, resetParams } = useListQueryParams(defaults);
  const [activeDialog, setActiveDialog] = useState({
    type: null,
    treatment: null,
  });
  const [form, setForm] = useState({
    reason: "",
    validTill: "",
  });

  const userInfo = readCookie("userInfo");
  const role = normalizeRole(userInfo?.role);
  const canMutate = role === "superadmin" || role === "subadmin";

  const query = useMemo(
    () =>
      buildQuery({
        status: params.status,
        serviceId: params.serviceId,
        patientId: params.patientId,
        servicePartnerId: params.servicePartnerId,
        cityId: params.cityId,
        search: params.search,
        validFrom: params.validFrom || undefined,
        validTo: params.validTo || undefined,
        page: params.page,
        limit: params.limit,
      }),
    [
      params.status,
      params.serviceId,
      params.patientId,
      params.servicePartnerId,
      params.cityId,
      params.search,
      params.validFrom,
      params.validTo,
      params.page,
      params.limit,
    ]
  );

  const treatmentResult = useApiQuery({
    url: `/admin/treatments?${query}`,
    queryKeys: ["admin-treatments", query],
  });

  const serviceQuery = useApiQuery({
    url: "/admin/services/names",
    queryKeys: ["service-admin-treatments"],
  });

  const patientQuery = useApiQuery({
    url: "/admin/patients/names",
    queryKeys: ["patient-admin-treatments"],
  });

  const providerQuery = useApiQuery({
    url: "/admin/service-providers/names",
    queryKeys: ["provider-admin-treatments"],
  });

  const cityQuery = useApiQuery({
    url: "/city/getAllCities",
    queryKeys: ["city-admin-treatments"],
  });

  const treatmentId = activeDialog.treatment?._id;

  const statusMutation = useApiMutation({
    url: treatmentId
      ? `/admin/treatments/${treatmentId}/status`
      : "/admin/treatments/none/status",
    method: "PATCH",
    invalidateKey: ["admin-treatments"],
  });

  const completeMutation = useApiMutation({
    url: treatmentId
      ? `/admin/treatments/${treatmentId}/complete`
      : "/admin/treatments/none/complete",
    method: "POST",
    invalidateKey: ["admin-treatments"],
  });

  const rows = treatmentResult.data?.data || [];
  const pageCount = treatmentResult.data?.totalPages || 1;

  const isMutating = statusMutation.isPending || completeMutation.isPending;

  const openDialog = (type, treatment) => {
    setActiveDialog({ type, treatment });
    setForm({ reason: "", validTill: "" });
  };

  const closeDialog = () => {
    if (isMutating) return;
    setActiveDialog({ type: null, treatment: null });
    setForm({ reason: "", validTill: "" });
  };

  const submitAction = async () => {
    if (!activeDialog.type || !activeDialog.treatment?._id) return;

    if (activeDialog.type === "activate") {
      await statusMutation.mutateAsync({
        targetStatus: "Active",
        validTill: form.validTill,
        reason: form.reason || undefined,
      });
      closeDialog();
      return;
    }

    if (activeDialog.type === "expire") {
      await statusMutation.mutateAsync({
        targetStatus: "Expired",
        reason: form.reason,
      });
      closeDialog();
      return;
    }

    if (activeDialog.type === "complete") {
      await completeMutation.mutateAsync({
        note: form.reason || undefined,
      });
      closeDialog();
    }
  };

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Treatments"
        description="Browse, monitor and manage treatment lifecycle with strict action controls."
      />

      <FilterBar>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full min-w-56 grow md:max-w-md">
            <label className="mb-1 block text-sm font-medium">Search</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search treatment, patient, service..."
                value={params.search}
                onChange={(event) =>
                  updateParams({ search: event.target.value, page: 1 })
                }
                className="bg-white pl-9"
              />
            </div>
          </div>

          <Button variant="outline" onClick={resetParams}>
            <RotateCcwIcon />
            Reset
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <Select
              value={params.status}
              onValueChange={(value) => updateParams({ status: value, page: 1 })}
            >
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="InProgress">InProgress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FilterSelect
            label="Service"
            value={params.serviceId}
            onChange={(value) => updateParams({ serviceId: value, page: 1 })}
            disabled={serviceQuery.isLoading}
            options={(serviceQuery.data?.data || []).map((item) => ({
              value: item._id,
              label: item.name,
            }))}
          />

          <FilterSelect
            label="Patient"
            value={params.patientId}
            onChange={(value) => updateParams({ patientId: value, page: 1 })}
            disabled={patientQuery.isLoading}
            options={(patientQuery.data?.data || []).map((item) => ({
              value: item._id,
              label:
                `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "-",
            }))}
          />

          <FilterSelect
            label="Provider"
            value={params.servicePartnerId}
            onChange={(value) =>
              updateParams({ servicePartnerId: value, page: 1 })
            }
            disabled={providerQuery.isLoading}
            options={(providerQuery.data?.data || []).map((item) => ({
              value: item._id,
              label:
                `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "-",
            }))}
          />

          <FilterSelect
            label="City"
            value={params.cityId}
            onChange={(value) => updateParams({ cityId: value, page: 1 })}
            disabled={cityQuery.isLoading}
            options={(cityQuery.data?.data || []).map((item) => ({
              value: item._id,
              label: item.name,
            }))}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">Limit</label>
            <Select
              value={params.limit}
              onValueChange={(value) => updateParams({ limit: value, page: 1 })}
            >
              <SelectTrigger><SelectValue placeholder="10" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Valid From</label>
            <Input
              type="date"
              value={params.validFrom}
              onChange={(event) =>
                updateParams({ validFrom: event.target.value, page: 1 })
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Valid To</label>
            <Input
              type="date"
              value={params.validTo}
              onChange={(event) =>
                updateParams({ validTo: event.target.value, page: 1 })
              }
            />
          </div>
        </div>
      </FilterBar>
      {serviceQuery.error || patientQuery.error || providerQuery.error || cityQuery.error ? (
        <div className="space-y-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serviceQuery.error ? (
            <p>
              Unable to load service filter options.{" "}
              <button type="button" className="underline" onClick={serviceQuery.refetch}>
                Retry
              </button>
            </p>
          ) : null}
          {patientQuery.error ? (
            <p>
              Unable to load patient filter options.{" "}
              <button type="button" className="underline" onClick={patientQuery.refetch}>
                Retry
              </button>
            </p>
          ) : null}
          {providerQuery.error ? (
            <p>
              Unable to load provider filter options.{" "}
              <button type="button" className="underline" onClick={providerQuery.refetch}>
                Retry
              </button>
            </p>
          ) : null}
          {cityQuery.error ? (
            <p>
              Unable to load city filter options.{" "}
              <button type="button" className="underline" onClick={cityQuery.refetch}>
                Retry
              </button>
            </p>
          ) : null}
        </div>
      ) : null}

      {treatmentResult.error ? (
        <StateView
          type="error"
          title="Unable to load treatments"
          description={treatmentResult.error.message}
          actionLabel="Retry"
          onAction={treatmentResult.refetch}
        />
      ) : null}
      {treatmentResult.isFetching && !treatmentResult.isLoading ? (
        <p className="text-sm text-muted-foreground">Refreshing treatments...</p>
      ) : null}

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Treatment</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Current Booking</TableHead>
              <TableHead>Valid Till</TableHead>
              <TableHead>Payment / Invoice</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const patientName = `${row?.patient?.firstName || ""} ${
                row?.patient?.lastName || ""
              }`.trim();
              const providerName = `${row?.provider?.firstName || ""} ${
                row?.provider?.lastName || ""
              }`.trim();
              const bookingId = row?.currentBooking?._id;
              const allowed = row?.allowedActions || [];

              return (
                <TableRow key={row._id}>
                  <TableCell>
                    <Link
                      href={`/admin/treatments/${row._id}`}
                      className="font-medium text-[#2563EB] hover:underline"
                    >
                      {customId(String(row._id), "TRT")}
                    </Link>
                    <p className="text-xs text-[#64748b]">{formatDate(row.createdAt)}</p>
                  </TableCell>
                  <TableCell>
                    <p>{patientName || "-"}</p>
                    <p className="text-xs text-[#64748b]">{row?.patient?.phone || "-"}</p>
                  </TableCell>
                  <TableCell>{row?.service?.name || "-"}</TableCell>
                  <TableCell>{providerName || "-"}</TableCell>
                  <TableCell>
                    <OperationalBadge status={row.status} />
                  </TableCell>
                  <TableCell>
                    <p>
                      {row?.sessions?.completed || 0}/{row?.sessions?.total || 0}
                    </p>
                    <p className="text-xs text-[#64748b]">
                      {row?.progressPercentage || 0}% complete
                    </p>
                  </TableCell>
                  <TableCell>
                    {bookingId ? (
                      <Link
                        href={`/admin/appointments/${bookingId}`}
                        className="text-[#2563EB] hover:underline"
                      >
                        {customId(String(bookingId), "BKG")}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{formatDate(row.validTill)}</TableCell>
                  <TableCell>
                    <p className="text-sm">{row?.payment?.paymentStatus || "-"}</p>
                    <p className="text-xs text-[#64748b]">
                      {row?.invoice?.invoiceNumber || "No invoice"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/treatments/${row._id}`}>View</Link>
                      </Button>

                      {canMutate && allowed.includes("activate") ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog("activate", row)}
                        >
                          Activate
                        </Button>
                      ) : null}

                      {canMutate && allowed.includes("expire") ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog("expire", row)}
                        >
                          Expire
                        </Button>
                      ) : null}

                      {canMutate && allowed.includes("complete") ? (
                        <Button
                          size="sm"
                          variant="medico"
                          onClick={() => openDialog("complete", row)}
                        >
                          Complete
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {treatmentResult.isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: 10 }).map((__, colIndex) => (
                      <TableCell key={`cell-${index}-${colIndex}`}>
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>

        {!treatmentResult.isLoading && rows.length === 0 ? (
          <DataNotFound name="Treatments" actionLabel={null} />
        ) : null}
      </div>

      <PaginationComp
        page={params.page}
        pageCount={pageCount}
        setPage={(nextPage) => updateParams({ page: nextPage })}
        className="mb-5 mt-8"
      />

      <Dialog open={Boolean(activeDialog.type)} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeDialog.type === "activate"
                ? "Activate Treatment"
                : activeDialog.type === "expire"
                ? "Expire Treatment"
                : "Complete Treatment"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {activeDialog.type === "activate" ? (
              <>
                <Input
                  type="date"
                  value={form.validTill}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, validTill: event.target.value }))
                  }
                />
                <Textarea
                  placeholder="Reason (optional)"
                  value={form.reason}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, reason: event.target.value }))
                  }
                />
              </>
            ) : null}

            {activeDialog.type === "expire" ? (
              <Textarea
                placeholder="Reason (required)"
                value={form.reason}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, reason: event.target.value }))
                }
              />
            ) : null}

            {activeDialog.type === "complete" ? (
              <>
                <p className="text-sm text-[#64748b]">
                  This will perform final treatment completion and trigger invoice generation through admin flow.
                </p>
                <Textarea
                  placeholder="Note (optional)"
                  value={form.reason}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, reason: event.target.value }))
                  }
                />
              </>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isMutating}>
              Cancel
            </Button>
            <Button onClick={submitAction} disabled={isMutating}>
              {isMutating ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FilterSelect = ({ label, value, onChange, options = [], disabled = false }) => (
  <div>
    <label className="mb-1 block text-sm font-medium">{label}</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger disabled={disabled}>
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {options.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default TreatmentsPage;
