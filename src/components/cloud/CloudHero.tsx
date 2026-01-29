export function CloudHero() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-gray-300">پلتفرم ابری نسل جدید</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            زیرساخت ابری
          </span>
          <br />
          <span className="text-white">برای کسب‌وکار شما</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
          با سرویس‌های ابری پیشرفته، مقیاس‌پذیر و امن، کسب‌وکار خود را با سرعت نور توسعه دهید.
          ذخیره‌سازی، پردازش و تحلیل داده در یک پلتفرم یکپارچه.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity text-lg w-full sm:w-auto">
            شروع رایگان
          </button>
          <button className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors text-lg w-full sm:w-auto">
            مشاهده دمو
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              99.9%
            </div>
            <div className="text-gray-400 text-sm">Uptime</div>
          </div>
          <div>
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              10M+
            </div>
            <div className="text-gray-400 text-sm">درخواست در روز</div>
          </div>
          <div>
            <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
              50ms
            </div>
            <div className="text-gray-400 text-sm">زمان پاسخ</div>
          </div>
          <div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <div className="text-gray-400 text-sm">پشتیبانی</div>
          </div>
        </div>

        {/* Visual Element */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl"></div>
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 h-32"></div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 h-32"></div>
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4 h-32"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
