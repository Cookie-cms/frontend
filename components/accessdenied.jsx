import { Lock } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-zinc-800 shadow-xl rounded-xl p-8 flex flex-col items-center max-w-md bg-zinc-950">
        <div className="flex items-center justify-center mb-4">
          <Lock className="h-10 w-10 text-zinc-600" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-zinc-400 mb-6 text-center">
          You do not have permission to view this page.
          <br />
          Please contact an administrator if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}
