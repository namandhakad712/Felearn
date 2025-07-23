# Performance Optimization Guide

This document provides information about the performance optimizations implemented in the AI Storytelling Platform.

## Overview

The platform implements various performance optimization techniques to ensure fast loading times, smooth user interactions, and efficient resource usage.

## Implemented Optimizations

### 1. Code Splitting and Lazy Loading

- **Route-based code splitting**: Major pages are lazy-loaded using React.lazy()
- **Component-level lazy loading**: Heavy components are loaded on demand
- **Suspense boundaries**: Proper loading states for lazy-loaded components

```tsx
// Example of lazy loading
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

<Suspense fallback={<LoadingSpinner />}>
  <DashboardPage />
</Suspense>
```

### 2. Image Optimization

- **Lazy loading**: Images are loaded only when they enter the viewport
- **WebP support**: Automatic WebP format detection and usage
- **Placeholder images**: Smooth loading experience with placeholders
- **Optimized image URLs**: Automatic optimization for external image services

```tsx
// Example of optimized image usage
<OptimizedImage
  src="https://example.com/image.jpg"
  alt="Description"
  lazy={true}
  width={400}
  height={300}
/>
```

### 3. Caching Strategies

- **API response caching**: Intelligent caching of API responses
- **Function result caching**: Caching of expensive computations
- **Automatic cache cleanup**: Expired entries are automatically removed

```tsx
// Example of cached API call
const data = await cacheService.cachedFetch('/api/data', {}, 5 * 60 * 1000); // 5 minutes TTL
```

### 4. Performance Monitoring

- **Core Web Vitals tracking**: LCP, FID, and CLS monitoring
- **Custom performance metrics**: Application-specific performance measurements
- **Memory usage monitoring**: JavaScript heap size tracking
- **Resource timing**: Monitoring of slow-loading resources

### 5. Bundle Optimization

- **Tree shaking**: Elimination of unused code
- **Dynamic imports**: Loading code only when needed
- **Vendor chunk splitting**: Separate chunks for third-party libraries

## Performance Monitoring

### Admin Dashboard

The admin dashboard includes a performance monitoring section that displays:

- Core Web Vitals metrics
- Custom performance measurements
- Memory usage statistics
- Cache performance data

### Real-time Monitoring

The application automatically monitors performance and reports issues to Sentry when:

- LCP is greater than 2.5 seconds
- FID is greater than 100 milliseconds
- CLS is greater than 0.1
- Resources take longer than 1 second to load

## Best Practices

### 1. Component Optimization

```tsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Handler logic
}, [dependency]);
```

### 2. Image Best Practices

- Use appropriate image formats (WebP when supported)
- Implement lazy loading for images below the fold
- Provide proper alt text for accessibility
- Use responsive images for different screen sizes

### 3. API Optimization

- Implement caching for frequently accessed data
- Use pagination for large data sets
- Implement request debouncing for search functionality
- Use proper HTTP caching headers

### 4. Bundle Size Optimization

- Import only what you need from libraries
- Use dynamic imports for heavy features
- Analyze bundle size regularly
- Consider using lighter alternatives for heavy libraries

## Monitoring and Debugging

### Performance Hooks

Use the `usePerformance` hook to monitor custom operations:

```tsx
const { startMeasurement, measureAsync } = usePerformance();

// Measure a synchronous operation
const endMeasurement = startMeasurement('customOperation');
// ... perform operation
endMeasurement();

// Measure an asynchronous operation
const result = await measureAsync('apiCall', () => fetchData());
```

### Bundle Analysis

Run the bundle analyzer to identify optimization opportunities:

```bash
node analyze-bundle.js
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

### Performance Testing

- Use Lighthouse for performance audits
- Test on various devices and network conditions
- Monitor Core Web Vitals in production
- Set up performance budgets and alerts

## Configuration

### Cache Configuration

Configure cache settings in `src/services/cache.ts`:

```typescript
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
```

### Performance Monitoring Configuration

Configure performance monitoring in `src/services/performance.ts`:

```typescript
// Thresholds for performance alerts
const LCP_THRESHOLD = 2500; // 2.5 seconds
const FID_THRESHOLD = 100;  // 100 milliseconds
const CLS_THRESHOLD = 0.1;  // 0.1
```

## Troubleshooting

### Common Performance Issues

1. **Slow initial load**: Check bundle size and implement code splitting
2. **Poor LCP**: Optimize images and critical resources
3. **High FID**: Reduce JavaScript execution time
4. **Layout shifts**: Provide proper dimensions for dynamic content
5. **Memory leaks**: Clean up event listeners and subscriptions

### Debugging Tools

- Chrome DevTools Performance tab
- React DevTools Profiler
- Lighthouse performance audit
- Bundle analyzer
- Admin performance dashboard