'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { verifyReportsPin, type ReportsAuthState } from './auth-actions';

const initialState: ReportsAuthState = { status: 'idle' };

export default function ReportsPinForm({ isZh }: { isZh: boolean }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(verifyReportsPin, initialState);

  // Cookie is set by the action; refresh re-renders the gate layout server-side.
  useEffect(() => {
    if (state.status === 'ok') router.refresh();
  }, [state.status, router]);

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <div className="rounded-xl border border-metal-200 p-8 text-center">
        <LockClosedIcon className="mx-auto mb-4 h-10 w-10 text-steel-400" aria-hidden="true" />
        <h1 className="mb-2 text-xl font-bold text-steel-900">
          {isZh ? '內部報告區' : 'Internal Reports'}
        </h1>
        <p className="mb-6 text-sm text-metal-600">
          {isZh
            ? '此區為內部市場分析，需要存取碼。'
            : 'This section contains internal market analysis and requires an access code.'}
        </p>
        <form action={formAction} className="space-y-3">
          <input
            type="password"
            name="pin"
            required
            maxLength={100}
            autoComplete="off"
            placeholder={isZh ? '存取碼' : 'Access code'}
            aria-label={isZh ? '存取碼' : 'Access code'}
            className="w-full rounded-lg border border-metal-300 px-3 py-2 text-center text-base focus:border-steel-500 focus:ring-1 focus:ring-steel-500 outline-none"
          />
          {state.status === 'wrong' && (
            <p role="alert" className="text-sm text-brass-500">
              {isZh ? '存取碼錯誤。' : 'Incorrect access code.'}
            </p>
          )}
          {state.status === 'unconfigured' && (
            <p role="alert" className="text-sm text-brass-500">
              {isZh ? '存取尚未設定，請聯繫管理員。' : 'Access not configured. Contact the administrator.'}
            </p>
          )}
          {state.status === 'rate_limited' && (
            <p role="alert" className="text-sm text-brass-500">
              {isZh ? '嘗試次數過多，請一分鐘後再試。' : 'Too many attempts. Try again in a minute.'}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-steel-600 px-6 py-2.5 font-semibold text-white hover:bg-steel-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? '…' : isZh ? '進入' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
