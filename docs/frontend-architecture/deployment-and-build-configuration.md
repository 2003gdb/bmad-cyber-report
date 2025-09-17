# Deployment and Build Configuration

## iOS Deployment Configuration

### Build Settings
```swift
// Config.xcconfig for different environments
// Development.xcconfig
API_BASE_URL = http:/$()/localhost:3000
ENABLE_LOGGING = YES
BUILD_CONFIGURATION = DEBUG

// Production.xcconfig  
API_BASE_URL = https:/$()/api.safetrade.com
ENABLE_LOGGING = NO
BUILD_CONFIGURATION = RELEASE
```

### Environment-Specific Configuration
```swift
// ConfigurationManager.swift
import Foundation

enum Environment {
    case development
    case production
    
    static var current: Environment {
        #if DEBUG
        return .development
        #else
        return .production
        #endif
    }
}

struct Configuration {
    static var apiBaseURL: String {
        guard let path = Bundle.main.path(forResource: "Config", ofType: "plist"),
              let config = NSDictionary(contentsOfFile: path),
              let url = config["API_BASE_URL"] as? String else {
            fatalError("Config.plist not found or API_BASE_URL not configured")
        }
        return url
    }
    
    static var isLoggingEnabled: Bool {
        guard let path = Bundle.main.path(forResource: "Config", ofType: "plist"),
              let config = NSDictionary(contentsOfFile: path),
              let enabled = config["ENABLE_LOGGING"] as? Bool else {
            return false
        }
        return enabled
    }
}
```

## Next.js Build Configuration

### Production Build Setup
```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment-specific settings
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV,
  },
  
  // Image optimization
  images: {
    domains: ['localhost', 'api.safetrade.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http://localhost:3000 https://api.safetrade.com;",
          },
        ],
      },
    ]
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analysis in production
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      )
    }
    
    return config
  },
}

// Add Sentry configuration for error tracking in production
const sentryWebpackPluginOptions = {
  silent: true,
  org: 'safetrade',
  project: 'admin-portal',
}

module.exports = process.env.NODE_ENV === 'production' 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig
```

### Environment Configuration
```bash
# .env.local.example
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3001

# Production environment
NEXT_PUBLIC_API_URL=https://api.safetrade.com
NEXT_PUBLIC_APP_ENV=production
NEXTAUTH_SECRET=production-secret
NEXTAUTH_URL=https://admin.safetrade.com
```
