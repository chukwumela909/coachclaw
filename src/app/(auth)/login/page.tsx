import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-8">
      <div className="mb-8 text-center">
        <h1 className="heading-sm text-[#242424] mb-2 tracking-tight">Welcome back</h1>
        <p className="text-[14px] font-light text-[#898989]">Enter your details to sign in.</p>
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
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[14px] font-medium text-[#242424] block">Password</label>
            <Link href="/forgot-password" className="text-[12px] font-medium text-[#0099ff] hover:underline">Forgot?</Link>
          </div>
          <input 
            type="password" 
            placeholder="••••••••"
            className="w-full bg-white shadow-[var(--shadow-level-1)] border-[1px] border-[#222a3514] rounded-[8px] px-3 py-2 text-[14px] font-light text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-shadow placeholder-[#898989]"
          />
        </div>
        
        <Link 
          href="/dashboard"
          className="w-full bg-[#242424] text-white px-4 py-[10px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)] relative overflow-hidden group mt-6 block text-center"
        >
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          Sign In
        </Link>
      </form>

      <div className="mt-6 text-center text-[14px]">
        <span className="text-[#898989]">Don't have an account? </span>
        <Link href="/signup" className="text-[#242424] font-medium hover:underline decoration-[#0099ff] underline-offset-4">
          Sign up
        </Link>
      </div>
    </div>
  );
}
