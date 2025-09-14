# Performance Optimization and Caching

## iOS Performance Optimization

### Image Loading and Caching
```swift
// Custom image caching solution
class ImageCacheManager {
    static let shared = ImageCacheManager()
    
    private let cache = NSCache<NSString, UIImage>()
    private let fileManager = FileManager.default
    private let cacheDirectory: URL
    
    private init() {
        cache.countLimit = 100 // Limit to 100 images in memory
        cache.totalCostLimit = 50 * 1024 * 1024 // 50MB memory limit
        
        let cacheDir = fileManager.urls(for: .cachesDirectory, in: .userDomainMask).first!
        cacheDirectory = cacheDir.appendingPathComponent("ImageCache")
        
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
    }
    
    func loadImage(from url: URL) async throws -> UIImage {
        let cacheKey = url.absoluteString as NSString
        
        // Check memory cache first
        if let cachedImage = cache.object(forKey: cacheKey) {
            return cachedImage
        }
        
        // Check disk cache
        let diskCacheURL = cacheDirectory.appendingPathComponent(cacheKey.hash.description)
        if let diskData = try? Data(contentsOf: diskCacheURL),
           let diskImage = UIImage(data: diskData) {
            cache.setObject(diskImage, forKey: cacheKey)
            return diskImage
        }
        
        // Download image
        let (data, _) = try await URLSession.shared.data(from: url)
        guard let image = UIImage(data: data) else {
            throw ImageCacheError.invalidImageData
        }
        
        // Cache in memory and disk
        cache.setObject(image, forKey: cacheKey)
        try? data.write(to: diskCacheURL)
        
        return image
    }
}
```

### Data Caching Strategy
```swift
// Core Data stack for offline capabilities
class CoreDataManager {
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "SafeTrade")
        container.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Core Data error: \(error)")
            }
        }
        return container
    }()
    
    var context: NSManagedObjectContext {
        return persistentContainer.viewContext
    }
    
    func save() {
        if context.hasChanges {
            try? context.save()
        }
    }
    
    // Cache community trends data
    func cacheTrendsData(_ trends: [TrendData]) {
        // Clear old cached data
        let fetchRequest: NSFetchRequest<CachedTrendData> = CachedTrendData.fetchRequest()
        let oldTrends = try? context.fetch(fetchRequest)
        oldTrends?.forEach { context.delete($0) }
        
        // Save new trends data
        trends.forEach { trend in
            let cachedTrend = CachedTrendData(context: context)
            cachedTrend.attackType = trend.attackType.rawValue
            cachedTrend.count = Int32(trend.count)
            cachedTrend.percentage = trend.percentage
            cachedTrend.timePeriod = trend.timePeriod
            cachedTrend.cachedAt = Date()
        }
        
        save()
    }
    
    func getCachedTrends() -> [TrendData] {
        let fetchRequest: NSFetchRequest<CachedTrendData> = CachedTrendData.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "cachedAt > %@", Date().addingTimeInterval(-3600)) // 1 hour cache
        
        guard let cachedTrends = try? context.fetch(fetchRequest) else {
            return []
        }
        
        return cachedTrends.compactMap { cached in
            guard let attackType = AttackType(rawValue: cached.attackType ?? "") else { return nil }
            return TrendData(
                attackType: attackType,
                count: Int(cached.count),
                percentage: cached.percentage,
                timePeriod: cached.timePeriod ?? ""
            )
        }
    }
}
```

## Next.js Performance Optimization

### React Query Caching Configuration
```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
})

// Prefetch critical data
export function prefetchDashboardData() {
  queryClient.prefetchQuery(['dashboard-metrics'], fetchDashboardMetrics)
  queryClient.prefetchQuery(['recent-reports'], () => fetchReports({ limit: 10 }))
}
```

### Image Optimization and Lazy Loading
```typescript
// components/shared/OptimizedImage.tsx
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export function OptimizedImage({ src, alt, width, height, className }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      {error ? (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded">
          <span className="text-gray-500 text-sm">Error al cargar imagen</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setError(true)
          }}
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      )}
    </div>
  )
}
```

### Bundle Optimization
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'api.safetrade.com'],
    formats: ['image/webp', 'image/avif'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer for production builds
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      )
    }
    
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    }
    
    return config
  },
  // Enable compression
  compress: true,
  // Optimize runtime
  swcMinify: true,
}

module.exports = nextConfig
```
