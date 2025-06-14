
import React from "react";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={
        status === "Published"
          ? "bg-green-500 text-white"
          : "bg-gray-300 text-gray-700"
      }
    >
      {status}
    </Badge>
  );
}
