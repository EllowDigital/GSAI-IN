
import React from "react";

type Props = {
  adminEmail: string | null;
  isAdminInTable: boolean | null;
  canSubmitFeeEdits: () => boolean;
  rlsError: string | null;
  checkingAdminEntry: boolean;
};

export default function FeesAdminInfoBar({
  adminEmail,
  isAdminInTable,
  canSubmitFeeEdits,
  rlsError,
  checkingAdminEntry,
}: Props) {
  return (
    <div className="mb-2 text-xs text-gray-400 flex flex-wrap items-center gap-2">
      <span>
        Session email: <b>{adminEmail || "none"}</b>
      </span>
      <span>
        In admin_users? <b>{isAdminInTable === null ? "..." : isAdminInTable ? "✅" : "❌"}</b>
      </span>
      <span>
        canSubmitFeeEdits: <b>{canSubmitFeeEdits() ? "✅" : "❌"}</b>
      </span>
      {rlsError && <span className="text-red-700 ml-2">RLS Error: {rlsError}</span>}
      <button
        onClick={() => {
          console.log("[DEBUG] adminEmail", adminEmail);
          console.log("[DEBUG] isAdminInTable", isAdminInTable);
          console.log("[DEBUG] canSubmitFeeEdits", canSubmitFeeEdits());
          alert("Debug info printed to console.");
        }}
        className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 ml-2"
        type="button"
      >
        Print Admin Info to Console
      </button>
    </div>
  );
}
