export function CloudPricing() {
  const plans = [
    {
      name: 'استارتر',
      price: '0',
      period: 'رایگان',
      description: 'برای شروع و تست پروژه‌های کوچک',
      features: [
        '10 GB ذخیره‌سازی',
        '100 GB ترافیک',
        '1 پروژه',
        'پشتیبانی ایمیلی',
        'SSL رایگان',
        'مستندات کامل'
      ],
      highlighted: false,
      buttonText: 'شروع رایگان',
      buttonStyle: 'light'
    },
    {
      name: 'حرفه‌ای',
      price: '49',
      period: 'ماهیانه',
      description: 'برای تیم‌ها و پروژه‌های در حال رشد',
      features: [
        '500 GB ذخیره‌سازی',
        '2 TB ترافیک',
        'پروژه نامحدود',
        'پشتیبانی 24/7',
        'SSL رایگان',
        'CDN جهانی',
        'پشتیبان‌گیری خودکار',
        'تیم 10 نفره'
      ],
      highlighted: true,
      buttonText: 'شروع کنید',
      buttonStyle: 'primary'
    },
    {
      name: 'سازمانی',
      price: '199',
      period: 'ماهیانه',
      description: 'برای سازمان‌های بزرگ',
      features: [
        'ذخیره‌سازی نامحدود',
        'ترافیک نامحدود',
        'پروژه نامحدود',
        'پشتیبانی اختصاصی',
        'SSL رایگان',
        'CDN جهانی',
        'پشتیبان‌گیری خودکار',
        'تیم نامحدود',
        'SLA 99.99%',
        'مشاوره فنی'
      ],
      highlighted: false,
      buttonText: 'تماس با فروش',
      buttonStyle: 'light'
    }
  ]

  return (
    <section id="pricing" className="py-32 px-4 bg-gradient-to-b from-[#09090B] to-black">
      <div className="container mx-auto max-w-7xl">
        {/* Header - Apple Style */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-semibold mb-4 tracking-tight text-white">
            قیمت‌گذاری
          </h2>
          <p className="text-2xl md:text-3xl text-gray-400 font-light">
            پلن مناسب برای هر کسب‌وکاری
          </p>
        </div>

        {/* Pricing Cards - Apple Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-white text-black'
                  : 'bg-zinc-900/50 text-white backdrop-blur-xl'
              }`}
            >
              <div className="p-10">
                {/* Plan Name */}
                <h3 className={`text-2xl font-semibold mb-2 ${plan.highlighted ? 'text-black' : 'text-white'}`}>
                  {plan.name}
                </h3>
                
                {/* Description */}
                <p className={`text-base mb-6 ${plan.highlighted ? 'text-gray-700' : 'text-gray-400'}`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline">
                    {plan.price === '0' ? (
                      <span className={`text-5xl font-semibold ${plan.highlighted ? 'text-black' : 'text-white'}`}>
                        رایگان
                      </span>
                    ) : (
                      <>
                        <span className={`text-5xl font-semibold ${plan.highlighted ? 'text-black' : 'text-white'}`}>
                          {plan.price}
                        </span>
                        <span className={`text-xl font-medium mr-1 ${plan.highlighted ? 'text-gray-700' : 'text-gray-400'}`}>
                          تومان
                        </span>
                      </>
                    )}
                  </div>
                  <div className={`text-sm mt-1 ${plan.highlighted ? 'text-gray-600' : 'text-gray-500'}`}>
                    {plan.price !== '0' && plan.period}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3.5 rounded-xl font-medium text-base mb-8 transition-all duration-200 ${
                    plan.buttonStyle === 'primary'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : plan.highlighted
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.buttonText}
                </button>

                {/* Divider */}
                <div className={`h-px mb-6 ${plan.highlighted ? 'bg-gray-200' : 'bg-white/10'}`}></div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        className={`w-5 h-5 ml-3 mt-0.5 flex-shrink-0 ${
                          plan.highlighted ? 'text-blue-600' : 'text-blue-400'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className={`text-base leading-relaxed ${
                        plan.highlighted ? 'text-gray-800' : 'text-gray-300'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-16">
          <p className="text-gray-400 text-lg">
            نیاز به پلن سفارشی دارید؟{' '}
            <a href="#contact" className="text-blue-400 hover:text-blue-300 transition-colors hover:underline">
              با تیم فروش تماس بگیرید
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
