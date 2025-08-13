import React from 'react';

type Props = {
  isAdminInTable: boolean | null;
  canSubmitFeeEdits: () => boolean;
  rlsError: string | null;
  checkingAdminEntry: boolean;
};

export default function FeesAdminInfoBar({
  isAdminInTable,
  canSubmitFeeEdits,
  rlsError,
  checkingAdminEntry,
}: Props) {
  return (
    <div className="mb-2 text-xs text-gray-400 flex flex-wrap items-center gap-2">
      <span>
        In admin_users?{' '}
        <b>{isAdminInTable === null ? '...' : isAdminInTable ? '✅' : '❌'}</b>
      </span>
      <span>
        canSubmitFeeEdits: <b>{canSubmitFeeEdits() ? '✅' : '❌'}</b>
      </span>
      {rlsError && (
        <span className="text-red-700 ml-2">RLS Error: {rlsError}</span>
      )}
    </div>
  );
}
