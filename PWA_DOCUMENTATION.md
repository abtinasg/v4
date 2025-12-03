# PWA Setup Documentation

## ✨ Progressive Web App (PWA) Features

This application is now a fully functional Progressive Web App with the following features:

### 📱 Mobile-First Experience

- **Installable**: Users can install the app on their devices (iOS, Android, Desktop)
- **Offline Support**: Basic functionality works without internet connection
- **Fast Loading**: Cached assets for instant loading
- **App-Like Experience**: Full-screen mode, no browser UI
- **Push Notifications**: Ready for market alerts (requires backend setup)

### 🎯 Key Features

1. **Service Worker** (`/public/sw.js`)
   - Caches static assets
   - Offline fallback page
   - Network-first strategy for API calls
   - Background sync ready

2. **Web App Manifest** (`/public/manifest.json`)
   - App metadata (name, description, theme)
   - Icon configurations (multiple sizes)
   - Display mode: standalone
   - Shortcuts to key pages

3. **Mobile-Optimized UI**
   - Responsive design for all screen sizes
   - "Full Data" button on mobile (links to desktop version)
   - Touch-friendly interactions
   - Optimized spacing and typography

4. **PWA Icons** (`/public/icons/`)
   - Generated from source logo
   - Multiple sizes: 32x32 to 512x512
   - Apple touch icon for iOS
   - Maskable icons for Android

## 🚀 Installation Guide

### For Users:

#### iOS (iPhone/iPad):
1. Open the website in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right

#### Android:
1. Open the website in Chrome
2. Tap the three-dot menu
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install"

#### Desktop (Chrome/Edge):
1. Open the website
2. Look for the install icon in the address bar
3. Click "Install"

### Testing Installation:

Visit your site and check:
- Chrome DevTools > Application > Manifest
- Chrome DevTools > Application > Service Workers
- Lighthouse audit (PWA category)

## 📂 File Structure

```
public/
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── offline.html           # Offline fallback page
├── icons/                 # PWA icons
│   ├── icon-32x32.png
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   └── apple-touch-icon.png
├── screenshots/           # App screenshots (for stores)
└── splash/                # Splash screens for iOS

src/
├── app/
│   └── layout.tsx         # Service worker registration
└── components/
    └── mobile/
        └── full-data-button.tsx  # Mobile "Full Data" button

scripts/
└── generate-icons.js      # Icon generation script
```

## 🔧 Development

### Regenerate Icons:

If you update the logo, regenerate icons:

```bash
node scripts/generate-icons.js
```

### Test Service Worker Locally:

Service workers require HTTPS or localhost. To test:

```bash
npm run dev
# Open http://localhost:3000
# Check DevTools > Application > Service Workers
```

### Update Service Worker:

After making changes to `sw.js`:

1. Increment `CACHE_NAME` version
2. Clear browser cache
3. Refresh the page
4. The new SW will install and activate

## 🎨 Customization

### Change Theme Color:

Edit `manifest.json`:

```json
{
  "theme_color": "#06b6d4",
  "background_color": "#000000"
}
```

### Modify Cached Pages:

Edit `sw.js`:

```javascript
const urlsToCache = [
  '/',
  '/dashboard',
  '/dashboard/watchlist',
  '/dashboard/news',
  // Add more pages
];
```

### Add App Shortcuts:

Edit `manifest.json` > `shortcuts`:

```json
{
  "shortcuts": [
    {
      "name": "New Feature",
      "url": "/feature",
      "icons": [...]
    }
  ]
}
```

## ✅ PWA Checklist

- [x] manifest.json configured
- [x] Service worker registered
- [x] Icons (all sizes) generated
- [x] Offline fallback page
- [x] HTTPS enabled (required for production)
- [x] Meta tags for mobile
- [x] Theme color configured
- [x] Apple touch icons
- [x] Mobile-optimized UI
- [x] "Full Data" button for mobile users
- [ ] Push notifications (optional, requires backend)
- [ ] Background sync (optional)
- [ ] App screenshots for stores (optional)

## 📊 Performance

### Lighthouse Scores Target:

- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
- **PWA: 100** ✅

## 🐛 Troubleshooting

### Service Worker Not Registering:

1. Check HTTPS/localhost
2. Clear browser cache
3. Check DevTools > Console for errors
4. Verify `sw.js` is accessible at `/sw.js`

### Icons Not Showing:

1. Verify files exist in `/public/icons/`
2. Check manifest.json icon paths
3. Clear cache and hard refresh
4. Run `node scripts/generate-icons.js`

### App Not Installable:

1. Check manifest.json is valid (use validator)
2. Ensure HTTPS in production
3. Verify service worker is active
4. Check icon sizes are correct

## 🌐 Browser Support

- ✅ Chrome 40+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Edge 17+
- ✅ Opera 27+
- ✅ Samsung Internet 4+

## 📱 Mobile Considerations

### "Full Data" Button:

- Only shows on mobile devices (< 1024px)
- Links to desktop version with `?mode=desktop` query
- Fixed position (bottom-right corner)
- Does not interfere with UI

### Responsive Breakpoints:

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔐 Security

- Service worker only works over HTTPS
- Same-origin policy enforced
- No sensitive data cached
- API requests always fresh (not cached)

## 📈 Analytics

Track PWA metrics:

```javascript
// In your analytics
if (window.matchMedia('(display-mode: standalone)').matches) {
  // User installed the PWA
  analytics.track('pwa_installed');
}
```

## 🎯 Next Steps

1. **Add Push Notifications**: Implement web push for price alerts
2. **Background Sync**: Sync watchlist when connection restored
3. **App Store**: Consider publishing to Microsoft Store, Google Play
4. **Advanced Caching**: Implement more sophisticated caching strategies
5. **Offline Functionality**: Expand offline capabilities

## 📚 Resources

- [PWA Builder](https://www.pwabuilder.com/)
- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox (Advanced SW)](https://developers.google.com/web/tools/workbox)

---

**Made with ❤️ for Deep Terminal**
