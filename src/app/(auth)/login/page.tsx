import Link from 'next/link';
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-8">
      <div className="mb-8 text-center">
        <h1 className="heading-sm text-[#242424] mb-2 tracking-tight">Welcome back</h1>
        <p className="text-[14px] font-light text-[#898989]">Sign in to access your personalized study space.</p>
      </div>
      
      <div className="space-y-4">
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button 
            className="w-full flex items-center justify-center gap-3 bg-white border-[1px] border-[#222a3514] text-[#242424] px-4 py-[10px] text-[14px] font-semibold rounded-[8px] hover:bg-gray-50 transition-colors shadow-[var(--shadow-level-1)] relative overflow-hidden group mt-6"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Continue with Google
          </button>
        </form>
      </div>

      <div className="mt-6 text-center text-[14px]">
        <span className="text-[#898989]">New to CoachClaw? </span>
        <Link href="/signup" className="text-[#242424] font-medium hover:underline decoration-[#0099ff] underline-offset-4">
          Create an account
        </Link>
      </div>
    </div>
  );
}
