import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-8">
      <div className="mb-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-6 group transition-colors"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to sign in
        </Link>
        <h1 className="heading-sm text-[#242424] mb-2 tracking-tight">Reset your password</h1>
        <p className="text-[14px] font-light text-[#898989] leading-[1.5]">
          Enter the email address associated with your account and we&#39;ll send you a link to reset your password.
        </p>
      </div>

      <form className="space-y-4">
        <div className="space-y-1">
          <label className="text-[14px] font-medium text-[#242424] block">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full bg-white shadow-[var(--shadow-level-1)] border-[1px] border-[#222a3514] rounded-[8px] px-3 py-2 text-[14px] font-light text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-shadow placeholder-[#898989]"
          />
        </div>

        <button
          type="button"
          className="w-full bg-[#242424] text-white px-4 py-[10px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)] relative overflow-hidden group mt-6"
        >
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          Send Reset Link
        </button>
      </form>

      <div className="mt-6 text-center text-[14px]">
        <span className="text-[#898989]">Remember your password? </span>
        <Link href="/login" className="text-[#242424] font-medium hover:underline decoration-[#0099ff] underline-offset-4">
          Sign in
        </Link>
      </div>
    </div>
  );
}
