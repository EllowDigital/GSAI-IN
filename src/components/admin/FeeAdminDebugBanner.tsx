
import React from "react";

export function FeeAdminDebugBanner({ adminDebug }: { adminDebug?: {
  adminEmail?: string | null;
  isAdminInTable?: boolean | null;
  canSubmitFeeEdits?: boolean;
}; }) {
  if (!adminDebug) return null;
  const cannotSubmitReason =
    !adminDebug.canSubmitFeeEdits
      ? "You are not authorized to add/edit fees. Check your admin_users table and logged-in email."
      : "";
  return (
    <div className="mb-2 px-2 py-1 rounded bg-gray-50 border text-xs text-gray-700">
      <div>
        <b>Debug Info:</b>{" "}
        <span>Email:</span> <span className="font-mono">{adminDebug.adminEmail || "N/A"}</span>
        {" | "}
        <span>In admin_users:</span> <span className="font-bold">{adminDebug.isAdminInTable ? "✅" : "❌"}</span>
        {" | "}
        <span>Can submit fees:</span> <span className="font-bold">{adminDebug.canSubmitFeeEdits ? "✅" : "❌"}</span>
      </div>
      {!adminDebug.canSubmitFeeEdits && (
        <div className="text-red-600 mt-1">{cannotSubmitReason}</div>
      )}
    </div>
  );
}
