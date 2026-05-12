import { RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CrashFilters({ filters, onChange, onReset }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Environment</label>
        <Select
          value={filters.environment}
          onValueChange={(value) => onChange({ environment: value, page: 1 })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Severity</label>
        <Select
          value={filters.severity}
          onValueChange={(value) => onChange({ severity: value, page: 1 })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">User Type</label>
        <Select
          value={filters.userType}
          onValueChange={(value) => onChange({ userType: value, page: 1 })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="User Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Patient">Patient</SelectItem>
            <SelectItem value="Doctor">Doctor</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Limit</label>
        <Select
          value={filters.limit}
          onValueChange={(value) => onChange({ limit: value, page: 1 })}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="30">30</SelectItem>
            <SelectItem value="40">40</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={onReset}>
        <RotateCcwIcon />
        Reset
      </Button>
    </div>
  );
}
