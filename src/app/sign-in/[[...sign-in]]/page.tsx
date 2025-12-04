import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft, Terminal } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#04060A]">
      {/* Premium Background - Subtle navy/charcoal gradient with soft vignette */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f18] via-[#04060A] to-[#04060A]" />
        
        {/* Soft radial glow behind center - not overpowering */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#00C9E4]/[0.02] rounded-full blur-[150px]" />
        
        {/* Subtle vignette edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#04060A_70%)]" />
        
        {/* Very subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      {/* Minimal Header - Back Link */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-6 pt-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white/70 transition-colors duration-200 font-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to home</span>
        </Link>
      </div>

      {/* Main Content - Centered with generous vertical spacing */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[400px]">
          
          {/* Logo with subtle glow */}
          <div className="flex justify-center mb-10">
            <div className="relative">
              {/* Soft ambient glow behind logo */}
              <div className="absolute inset-0 w-14 h-14 bg-[#00C9E4]/20 rounded-2xl blur-xl" />
              <img src="/logo.jpeg" alt="Deepin" className="relative w-14 h-14 rounded-2xl object-cover shadow-[0_8px_32px_rgba(0,201,228,0.15)]" />
            </div>
          </div>

          {/* Welcome Text - Clean hierarchy */}
          <div className="text-center mb-10">
            <h1 className="text-[32px] font-semibold text-white tracking-tight mb-3 leading-tight">
              Welcome back
            </h1>
            <p className="text-[15px] text-white/40 font-light leading-relaxed">
              Sign in to your Deepin account
            </p>
          </div>
          
          {/* Clerk SignIn with Premium Styling */}
          <SignIn 
            appearance={{
              elements: {
                // Root container
                rootBox: 'mx-auto w-full',
                
                // Premium glass card with luxury feel
                card: [
                  'bg-white/[0.02] backdrop-blur-md',
                  'border border-white/[0.06]',
                  'shadow-[0_4px_24px_rgba(0,0,0,0.25),0_12px_48px_rgba(0,0,0,0.15)]',
                  'rounded-2xl',
                  'p-8',
                ].join(' '),
                
                // Header styling
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                
                // Social buttons - soft, minimal
                socialButtonsBlockButton: [
                  'bg-white/[0.03] hover:bg-white/[0.06]',
                  'border border-white/[0.08] hover:border-white/[0.12]',
                  'text-white/90 font-normal',
                  'rounded-xl py-3',
                  'transition-all duration-200',
                  'shadow-none hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]',
                ].join(' '),
                socialButtonsBlockButtonText: 'text-white/90 font-normal text-[14px]',
                socialButtonsBlockButtonArrow: 'text-white/40',
                socialButtonsProviderIcon: 'w-5 h-5',
                
                // Divider - soft fade
                dividerLine: 'bg-white/[0.06]',
                dividerText: 'text-white/30 text-[13px] font-light px-4',
                dividerRow: 'my-6',
                
                // Form fields - clean, minimal
                formFieldLabel: 'text-white/50 text-[13px] font-light mb-2',
                formFieldInput: [
                  'bg-white/[0.03] hover:bg-white/[0.04]',
                  'border border-white/[0.08] focus:border-[#00C9E4]/40',
                  'text-white placeholder:text-white/25',
                  'rounded-xl py-3 px-4',
                  'text-[14px] font-normal',
                  'transition-all duration-200',
                  'focus:ring-0 focus:shadow-[0_0_0_3px_rgba(0,201,228,0.08)]',
                ].join(' '),
                formFieldRow: 'mb-4',
                formFieldHintText: 'text-white/30 text-[12px] font-light mt-1.5',
                
                // Primary button - premium gradient
                formButtonPrimary: [
                  'bg-[#00C9E4] hover:bg-[#00C9E4]/90',
                  'text-[#04060A] font-semibold',
                  'rounded-xl py-3.5',
                  'text-[14px]',
                  'transition-all duration-200',
                  'shadow-[0_4px_16px_rgba(0,201,228,0.2)]',
                  'hover:shadow-[0_6px_24px_rgba(0,201,228,0.3)]',
                  'mt-2',
                ].join(' '),
                
                // Footer links
                footerActionLink: 'text-[#00C9E4]/80 hover:text-[#00C9E4] font-medium text-[13px] transition-colors',
                
                // Identity preview
                identityPreviewText: 'text-white/90 text-[14px]',
                identityPreviewEditButton: 'text-[#00C9E4]/70 hover:text-[#00C9E4] text-[13px]',
                identityPreview: 'bg-white/[0.02] border border-white/[0.06] rounded-xl p-4',
                
                // Password visibility toggle
                formFieldInputShowPasswordButton: 'text-white/30 hover:text-white/50',
                
                // Alerts and messages
                alertText: 'text-white/70 text-[13px]',
                alert: 'bg-white/[0.03] border border-white/[0.08] rounded-xl',
                formFieldSuccessText: 'text-emerald-400/80 text-[13px]',
                formFieldErrorText: 'text-rose-400/80 text-[13px]',
                
                // Footer
                footer: 'hidden',
                footerActionText: 'text-white/30',
                
                // Misc
                badge: 'bg-[#00C9E4]/10 text-[#00C9E4]/80 border border-[#00C9E4]/20 rounded-lg text-[12px]',
                logoBox: 'hidden',
                logoImage: 'hidden',
                
                // OTP input styling
                otpCodeFieldInput: [
                  'bg-white/[0.03] border border-white/[0.08]',
                  'text-white text-center font-medium',
                  'rounded-xl',
                  'focus:border-[#00C9E4]/40 focus:ring-0',
                ].join(' '),
                
                // Internal card styling
                main: 'gap-6',
                form: 'gap-4',
              },
              layout: {
                socialButtonsPlacement: 'top',
                showOptionalFields: false,
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/dashboard"
          />
          
          {/* Sign Up Link - Clean, minimal */}
          <div className="text-center mt-8 pt-6 border-t border-white/[0.04]">
            <p className="text-[14px] text-white/35 font-light">
              Don't have an account?{' '}
              <Link 
                href="/sign-up" 
                className="text-[#00C9E4]/80 hover:text-[#00C9E4] font-medium transition-colors duration-200"
              >
                Sign up free
              </Link>
            </p>
          </div>
          
          {/* Subtle Legal Footer */}
          <div className="text-center mt-8">
            <p className="text-[11px] text-white/20 font-light leading-relaxed">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-white/30 hover:text-white/50 transition-colors">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-white/30 hover:text-white/50 transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
