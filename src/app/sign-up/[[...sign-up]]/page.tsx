import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft, Terminal } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#030508]">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-violet-500/[0.03]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/[0.05] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.05] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      {/* Sign Up Form */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Terminal className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 blur-md opacity-40" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">Create your account</h1>
            <p className="text-gray-400">
              Start your free trial of Deep Terminal today
            </p>
          </div>
          
          <SignUp 
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-[#0a0d12]/80 border border-white/10 shadow-2xl backdrop-blur-xl',
                headerTitle: 'text-white',
                headerSubtitle: 'text-gray-400',
                socialButtonsBlockButton: 'bg-white/5 border-white/10 text-white hover:bg-white/10',
                socialButtonsBlockButtonText: 'text-white',
                dividerLine: 'bg-white/10',
                dividerText: 'text-gray-500',
                formFieldLabel: 'text-gray-300',
                formFieldInput: 'bg-white/5 border-white/10 text-white placeholder:text-gray-500',
                formButtonPrimary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white',
                footerActionLink: 'text-cyan-400 hover:text-cyan-300',
                identityPreviewText: 'text-white',
                identityPreviewEditButton: 'text-cyan-400',
                formFieldInputShowPasswordButton: 'text-gray-400 hover:text-white',
                alertText: 'text-gray-300',
                formFieldSuccessText: 'text-emerald-400',
                formFieldErrorText: 'text-red-400',
                footer: 'bg-[#0a0d12]/50 border-t border-white/5',
                footerActionText: 'text-gray-400',
                badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
              }
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/dashboard"
          />
          
          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
