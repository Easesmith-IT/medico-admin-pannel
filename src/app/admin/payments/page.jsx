"use client";
export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DownloadIcon,
  EyeIcon,
  RotateCcwIcon,
  SearchIcon,
  WalletIcon,
} from "lucide-react";

import { FilterBar } from "@/components/shared/filter-bar";
import { PaginationComp } from "@/components/shared/PaginationComp";
import { StateView } from "@/components/shared/state-view";
import { H1 } from "@/components/typography";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useListQueryParams } from "@/hooks/use-list-query-params";
import { readCookie } from "@/lib/readCookie";
import { axiosInstance } from "@/lib/axiosInstance";
import { buildQuery, customId } from "@/lib/utils";

const defaults = {
  tab: "ledgers",
  page: 1,
  limit: "10",
  search: "",
  paymentStatus: "all",
  status: "all",
  fromDate: "",
  toDate: "",
  cityId: "",
};

const formatCurrency = (value = 0, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fullName = (item = {}) =>
  `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "-";

const PaymentPage = () => {
  const { params, updateParams, resetParams } = useListQueryParams(defaults);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [isSettlementUpdateOpen, setIsSettlementUpdateOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [isDisputeUpdateOpen, setIsDisputeUpdateOpen] = useState(false);

  const userInfo = readCookie("userInfo");
  const role = String(userInfo?.role || "").toLowerCase();
  const canMutate = role === "superadmin" || role === "subadmin";

  const ledgerQuery = useMemo(
    () =>
      buildQuery({
        page: params.page,
        limit: params.limit,
        search: params.search,
        fromDate: params.fromDate || undefined,
        toDate: params.toDate || undefined,
        cityId: params.cityId || undefined,
        paymentStatus:
          params.paymentStatus !== "all" ? params.paymentStatus : undefined,
      }),
    [
      params.page,
      params.limit,
      params.search,
      params.paymentStatus,
      params.fromDate,
      params.toDate,
      params.cityId,
    ]
  );

  const statusQuery = useMemo(
    () =>
      buildQuery({
        page: params.page,
        limit: params.limit,
        search: params.search,
        fromDate: params.fromDate || undefined,
        toDate: params.toDate || undefined,
        cityId: params.cityId || undefined,
        status: params.status !== "all" ? params.status : undefined,
      }),
    [
      params.page,
      params.limit,
      params.search,
      params.status,
      params.fromDate,
      params.toDate,
      params.cityId,
    ]
  );

  const summaryQuery = useApiQuery({
    url: "/admin/payments/summary",
    queryKeys: ["admin-payments-summary"],
  });

  const cityQuery = useApiQuery({
    url: "/city/getAllCities",
    queryKeys: ["payments-city-options"],
  });

  const ledgerResult = useApiQuery({
    url: `/admin/payments/ledgers?${ledgerQuery}`,
    queryKeys: ["admin-payments-ledgers", ledgerQuery],
    options: { enabled: params.tab === "ledgers" },
  });

  const transactionResult = useApiQuery({
    url: `/admin/payments/transactions?${statusQuery}`,
    queryKeys: ["admin-payments-transactions", statusQuery],
    options: { enabled: params.tab === "transactions" },
  });

  const refundResult = useApiQuery({
    url: `/admin/payments/refunds?${statusQuery}`,
    queryKeys: ["admin-payments-refunds", statusQuery],
    options: { enabled: params.tab === "refunds" },
  });

  const settlementResult = useApiQuery({
    url: `/admin/payments/settlements?${statusQuery}`,
    queryKeys: ["admin-payments-settlements", statusQuery],
    options: { enabled: params.tab === "settlements" },
  });

  const disputeResult = useApiQuery({
    url: `/admin/payments/disputes?${statusQuery}`,
    queryKeys: ["admin-payments-disputes", statusQuery],
    options: { enabled: params.tab === "disputes" },
  });

  const collectMutation = useApiMutation({
    url: selectedLedger
      ? `/admin/payments/treatments/${selectedLedger.treatmentId}/manual-collection`
      : "/admin/payments/treatments/none/manual-collection",
    method: "POST",
    invalidateKey: ["admin-payments-ledgers", "admin-payments-transactions"],
  });

  const refundMutation = useApiMutation({
    url: selectedLedger
      ? `/admin/payments/treatments/${selectedLedger.treatmentId}/refunds/manual`
      : "/admin/payments/treatments/none/refunds/manual",
    method: "POST",
    invalidateKey: ["admin-payments-ledgers", "admin-payments-refunds"],
  });

  const settlementCreateMutation = useApiMutation({
    url: "/admin/payments/settlements",
    method: "POST",
    invalidateKey: ["admin-payments-settlements", "admin-payments-summary"],
  });

  const settlementUpdateMutation = useApiMutation({
    url: selectedSettlement
      ? `/admin/payments/settlements/${selectedSettlement._id}/status`
      : "/admin/payments/settlements/none/status",
    method: "PATCH",
    invalidateKey: ["admin-payments-settlements", "admin-payments-summary"],
  });

  const disputeCreateMutation = useApiMutation({
    url: "/admin/payments/disputes",
    method: "POST",
    invalidateKey: ["admin-payments-disputes", "admin-payments-summary"],
  });

  const disputeUpdateMutation = useApiMutation({
    url: selectedDispute
      ? `/admin/payments/disputes/${selectedDispute._id}/status`
      : "/admin/payments/disputes/none/status",
    method: "PATCH",
    invalidateKey: ["admin-payments-disputes", "admin-payments-summary"],
  });

  const activeResult =
    params.tab === "ledgers"
      ? ledgerResult
      : params.tab === "transactions"
        ? transactionResult
        : params.tab === "refunds"
          ? refundResult
          : params.tab === "settlements"
            ? settlementResult
            : disputeResult;

  const rows = activeResult?.data?.data || [];
  const pageCount = activeResult?.data?.pagination?.totalPages || 1;
  const cities = cityQuery.data?.data || [];

  const exportData = async () => {
    const typeByTab = {
      ledgers: "ledgers",
      transactions: "transactions",
      refunds: "refunds",
      settlements: "settlements",
      disputes: "disputes",
    };
    const type = typeByTab[params.tab] || "ledgers";
    const query = buildQuery({
      type,
      search: params.search,
      fromDate: params.fromDate || undefined,
      toDate: params.toDate || undefined,
      cityId: params.cityId || undefined,
      paymentStatus:
        params.tab === "ledgers" && params.paymentStatus !== "all"
          ? params.paymentStatus
          : undefined,
      status:
        params.tab !== "ledgers" && params.status !== "all"
          ? params.status
          : undefined,
    });

    const response = await axiosInstance.get(`/admin/payments/export?${query}`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments-${type}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <WalletIcon className="size-8 text-[#2563EB]" />
          <H1>Payments</H1>
        </div>
        <Button variant="medico" onClick={exportData}>
          <DownloadIcon />
          Export
        </Button>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs text-[#64748B]">Total Bill</p>
          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(summaryQuery.data?.data?.ledger?.totalBillAmount || 0)}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs text-[#64748B]">Total Paid</p>
          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(summaryQuery.data?.data?.ledger?.totalPaid || 0)}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs text-[#64748B]">Total Refunded</p>
          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(summaryQuery.data?.data?.ledger?.totalRefunded || 0)}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs text-[#64748B]">Disputes Open</p>
          <p className="mt-1 text-lg font-semibold">
            {summaryQuery.data?.data?.dispute?.open || 0}
          </p>
        </div>
      </section>

      <Tabs
        value={params.tab}
        onValueChange={(value) =>
          updateParams({ tab: value, page: 1, status: "all", paymentStatus: "all" })
        }
      >
        <TabsList className="h-10 rounded-[14px] bg-white p-1">
          <TabsTrigger value="ledgers">Ledgers</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
        </TabsList>

        <FilterBar>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full min-w-56 grow md:max-w-md">
              <label className="mb-1 block text-sm font-medium">Search</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={params.search}
                  onChange={(event) =>
                    updateParams({ search: event.target.value, page: 1 })
                  }
                  className="bg-white pl-9"
                />
              </div>
            </div>

            {params.tab === "ledgers" ? (
              <div>
                <label className="mb-1 block text-sm font-medium">Payment Status</label>
                <Select
                  value={params.paymentStatus}
                  onValueChange={(value) =>
                    updateParams({ paymentStatus: value, page: 1 })
                  }
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="PartialRefund">PartialRefund</SelectItem>
                    <SelectItem value="Refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <Select
                  value={params.status}
                  onValueChange={(value) => updateParams({ status: value, page: 1 })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Processed">Processed</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="UnderReview">UnderReview</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">Limit</label>
              <Select
                value={params.limit}
                onValueChange={(value) => updateParams({ limit: value, page: 1 })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={params.fromDate}
                onChange={(event) =>
                  updateParams({ fromDate: event.target.value, page: 1 })
                }
                className="w-40"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={params.toDate}
                onChange={(event) => updateParams({ toDate: event.target.value, page: 1 })}
                className="w-40"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">City</label>
              <Select
                value={params.cityId || "all"}
                onValueChange={(value) =>
                  updateParams({ cityId: value === "all" ? "" : value, page: 1 })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city._id} value={city._id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={resetParams}>
              <RotateCcwIcon />
              Reset
            </Button>
          </div>
        </FilterBar>

        <TabsContent value="ledgers" className="space-y-4">
          {ledgerResult.error ? (
            <StateView
              type="error"
              title="Unable to load payment ledgers"
              description={ledgerResult.error.message}
              actionLabel="Retry"
              onAction={ledgerResult.refetch}
            />
          ) : (
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bill</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Refunded</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell>
                        <Link
                          href={`/admin/payments/${row._id}`}
                          className="font-medium text-[#2563EB] hover:underline"
                        >
                          {customId(row._id, "PAY")}
                        </Link>
                      </TableCell>
                      <TableCell>{row.patient?.firstName || "-"}</TableCell>
                      <TableCell>{fullName(row.servicePartner)}</TableCell>
                      <TableCell>
                        <OperationalBadge status={row.paymentStatus || "-"} />
                      </TableCell>
                      <TableCell>{formatCurrency(row.totalBillAmount, row.currency)}</TableCell>
                      <TableCell>{formatCurrency(row.totalPaid, row.currency)}</TableCell>
                      <TableCell>{formatCurrency(row.totalRefunded, row.currency)}</TableCell>
                      <TableCell>{formatCurrency(row.remainingBalance, row.currency)}</TableCell>
                      <TableCell>{formatDateTime(row.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/payments/${row._id}`}>
                              <EyeIcon className="size-4" />
                            </Link>
                          </Button>
                          {canMutate ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedLedger(row);
                                  setIsCollectOpen(true);
                                }}
                              >
                                Collect
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedLedger(row);
                                  setIsRefundOpen(true);
                                }}
                              >
                                Refund
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!row.servicePartner?._id}
                                onClick={() => {
                                  setSelectedLedger(row);
                                  setIsSettlementOpen(true);
                                }}
                              >
                                Settlement
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedLedger(row);
                                  setIsDisputeOpen(true);
                                }}
                              >
                                Dispute
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!ledgerResult.isLoading && rows.length === 0 ? (
                <StateView
                  type="empty"
                  title="No payment ledgers found"
                  description="Try changing filters or search input."
                />
              ) : null}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions">
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Txn ID</TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.transactionId}>
                    <TableCell>{customId(String(row.transactionId), "TXN")}</TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/payments/${row.paymentId}`}
                        className="font-medium text-[#2563EB] hover:underline"
                      >
                        {customId(String(row.paymentId), "PAY")}
                      </Link>
                    </TableCell>
                    <TableCell>{row.method}</TableCell>
                    <TableCell>{row.stage}</TableCell>
                    <TableCell>
                      <OperationalBadge status={row.status} />
                    </TableCell>
                    <TableCell>{formatCurrency(row.amountPaid, row.currency)}</TableCell>
                    <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!transactionResult.isLoading && rows.length === 0 ? (
              <StateView type="empty" title="No transactions found" />
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="refunds">
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Refund ID</TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.refundId}>
                    <TableCell>{customId(String(row.refundId), "RFD")}</TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/payments/${row.paymentId}`}
                        className="font-medium text-[#2563EB] hover:underline"
                      >
                        {customId(String(row.paymentId), "PAY")}
                      </Link>
                    </TableCell>
                    <TableCell>{row.refundType}</TableCell>
                    <TableCell>{row.mode}</TableCell>
                    <TableCell>
                      <OperationalBadge status={row.status} />
                    </TableCell>
                    <TableCell>{formatCurrency(row.amount)}</TableCell>
                    <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!refundResult.isLoading && rows.length === 0 ? (
              <StateView type="empty" title="No refunds found" />
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="settlements">
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>{customId(row._id, "SET")}</TableCell>
                    <TableCell>{fullName(row.servicePartnerId)}</TableCell>
                    <TableCell>
                      <OperationalBadge status={row.status} />
                    </TableCell>
                    <TableCell>{formatCurrency(row.amountRequested)}</TableCell>
                    <TableCell>{formatCurrency(row.amountApproved)}</TableCell>
                    <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {canMutate ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSettlement(row);
                            setIsSettlementUpdateOpen(true);
                          }}
                        >
                          Update Status
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!settlementResult.isLoading && rows.length === 0 ? (
              <StateView type="empty" title="No settlements found" />
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="disputes">
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>{customId(row._id, "DSP")}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>
                      <OperationalBadge status={row.status} />
                    </TableCell>
                    <TableCell>{row.referenceType}</TableCell>
                    <TableCell>{formatDateTime(row.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {canMutate ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDispute(row);
                            setIsDisputeUpdateOpen(true);
                          }}
                        >
                          Update Status
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!disputeResult.isLoading && rows.length === 0 ? (
              <StateView type="empty" title="No disputes found" />
            ) : null}
          </div>
        </TabsContent>
      </Tabs>

      <PaginationComp
        page={params.page}
        pageCount={pageCount}
        setPage={(nextPage) => updateParams({ page: nextPage })}
        className="mb-5 mt-8"
      />

      <ManualCollectModal
        open={isCollectOpen}
        onClose={() => setIsCollectOpen(false)}
        onSubmit={async (values) => {
          await collectMutation.mutateAsync(values);
          setIsCollectOpen(false);
        }}
      />

      <ManualRefundModal
        open={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
        onSubmit={async (values) => {
          await refundMutation.mutateAsync(values);
          setIsRefundOpen(false);
        }}
      />

      <CreateSettlementModal
        open={isSettlementOpen}
        ledger={selectedLedger}
        onClose={() => setIsSettlementOpen(false)}
        onSubmit={async (values) => {
          await settlementCreateMutation.mutateAsync(values);
          setIsSettlementOpen(false);
        }}
      />

      <UpdateSettlementModal
        open={isSettlementUpdateOpen}
        settlement={selectedSettlement}
        onClose={() => setIsSettlementUpdateOpen(false)}
        onSubmit={async (values) => {
          await settlementUpdateMutation.mutateAsync(values);
          setIsSettlementUpdateOpen(false);
        }}
      />

      <CreateDisputeModal
        open={isDisputeOpen}
        ledger={selectedLedger}
        onClose={() => setIsDisputeOpen(false)}
        onSubmit={async (values) => {
          await disputeCreateMutation.mutateAsync(values);
          setIsDisputeOpen(false);
        }}
      />

      <UpdateDisputeModal
        open={isDisputeUpdateOpen}
        dispute={selectedDispute}
        onClose={() => setIsDisputeUpdateOpen(false)}
        onSubmit={async (values) => {
          await disputeUpdateMutation.mutateAsync(values);
          setIsDisputeUpdateOpen(false);
        }}
      />
    </div>
  );
};

const ManualCollectModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    amount: "",
    method: "Cash",
    stage: "Partial",
    note: "",
    referenceNumber: "",
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Manual Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
          />
          <Select
            value={form.method}
            onValueChange={(value) => setForm((prev) => ({ ...prev, method: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="Card">Card</SelectItem>
              <SelectItem value="BankTransfer">BankTransfer</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={form.stage}
            onValueChange={(value) => setForm((prev) => ({ ...prev, stage: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Advance">Advance</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="Final">Final</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Reference Number (optional)"
            value={form.referenceNumber}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, referenceNumber: event.target.value }))
            }
          />
          <Textarea
            placeholder="Note"
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="medico" onClick={() => onSubmit({ ...form, amount: Number(form.amount) })}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ManualRefundModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    amount: "",
    reason: "",
    mode: "UPI",
    refundType: "Partial",
    note: "",
    referenceTransactionId: null,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Manual Refund</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
          />
          <Select
            value={form.mode}
            onValueChange={(value) => setForm((prev) => ({ ...prev, mode: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="BankTransfer">BankTransfer</SelectItem>
              <SelectItem value="Adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={form.refundType}
            onValueChange={(value) => setForm((prev) => ({ ...prev, refundType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="Full">Full</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Reason"
            value={form.reason}
            onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
          />
          <Textarea
            placeholder="Note"
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="medico" onClick={() => onSubmit({ ...form, amount: Number(form.amount) })}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CreateSettlementModal = ({ open, onClose, onSubmit, ledger }) => {
  const [form, setForm] = useState({
    amountRequested: "",
    notes: "",
  });

  const payload = {
    paymentId: ledger?._id,
    treatmentId: ledger?.treatmentId,
    servicePartnerId: ledger?.servicePartner?._id,
    amountRequested: Number(form.amountRequested),
    notes: form.notes,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Settlement</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            type="number"
            placeholder="Amount Requested"
            value={form.amountRequested}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, amountRequested: event.target.value }))
            }
          />
          <Textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="medico" onClick={() => onSubmit(payload)}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UpdateSettlementModal = ({ open, onClose, onSubmit, settlement }) => {
  const [form, setForm] = useState({
    status: "Approved",
    amountApproved: "",
    payoutReference: "",
    notes: "",
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Settlement Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select
            value={form.status}
            onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Amount Approved (for Approved)"
            value={form.amountApproved}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, amountApproved: event.target.value }))
            }
          />
          <Input
            placeholder="Payout Reference (for Paid)"
            value={form.payoutReference}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, payoutReference: event.target.value }))
            }
          />
          <Textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="medico"
            onClick={() =>
              onSubmit({
                status: form.status,
                amountApproved: Number(form.amountApproved || 0),
                payoutReference: form.payoutReference,
                notes: form.notes,
                settlementId: settlement?._id,
              })
            }
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CreateDisputeModal = ({ open, onClose, onSubmit, ledger }) => {
  const [form, setForm] = useState({
    referenceType: "ledger",
    category: "General",
    description: "",
    evidenceUrls: "",
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Dispute</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select
            value={form.referenceType}
            onValueChange={(value) => setForm((prev) => ({ ...prev, referenceType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ledger">ledger</SelectItem>
              <SelectItem value="transaction">transaction</SelectItem>
              <SelectItem value="refund">refund</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Category"
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
          />
          <Textarea
            placeholder="Description"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
          <Textarea
            placeholder="Evidence URLs (comma-separated)"
            value={form.evidenceUrls}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, evidenceUrls: event.target.value }))
            }
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="medico"
            onClick={() =>
              onSubmit({
                paymentId: ledger?._id,
                treatmentId: ledger?.treatmentId,
                referenceType: form.referenceType,
                category: form.category,
                description: form.description,
                evidenceUrls: form.evidenceUrls
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UpdateDisputeModal = ({ open, onClose, onSubmit, dispute }) => {
  const [form, setForm] = useState({
    status: "UnderReview",
    resolution: "",
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Dispute Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select
            value={form.status}
            onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UnderReview">UnderReview</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Resolution"
            value={form.resolution}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, resolution: event.target.value }))
            }
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="medico"
            onClick={() =>
              onSubmit({
                status: form.status,
                resolution: form.resolution,
                disputeId: dispute?._id,
              })
            }
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentPage;
