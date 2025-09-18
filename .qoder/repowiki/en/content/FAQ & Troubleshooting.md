# FAQ & Troubleshooting

<cite>
**Referenced Files in This Document**   
- [VimSystem.ts](file://src/systems/VimSystem.ts)
- [ASCIIAnimationSystem.ts](file://src/animation/ASCIIAnimationSystem.ts)
- [EffectSystem.ts](file://src/animation/EffectSystem.ts)
- [sw.js](file://public/sw.js)
- [device.ts](file://src/utils/device.ts)
- [constants.ts](file://src/utils/constants.ts)
</cite>

## Table of Contents
1. [Keyboard & Navigation Issues](#keyboard--navigation-issues)
2. [Animation & Performance Problems](#animation--performance-problems)
3. [Service Worker & Caching](#service-worker--caching)
4. [Mobile & Touch Conflicts](#mobile--touch-conflicts)
5. [Browser-Specific Limitations](#browser-specific-limitations)
6. [Debugging Tools & Techniques](#debugging-tools--techniques)
7. [Known Bugs & Planned Fixes](#known-bugs--planned-fixes)

## Keyboard & Navigation Issues

### Why aren't keyboard shortcuts working?
Keyboard shortcuts only function when the page is in "digital view" mode. The Vim navigation system checks for the `digital-view` class on the body element before processing key events. If you're in print mode or another view, shortcuts will be disabled.

Ensure your view mode is set correctly and that no other scripts are interfering with keyboard event propagation.

**Section sources**
- [VimSystem.ts](file://src/systems/VimSystem.ts#L16-L251)

### Why does focus loss prevent Vim navigation?
The Vim system relies on document-level keyboard event listeners. If focus shifts to an input field, iframe, or other interactive element, the document no longer receives key events. This is standard browser behavior.

To restore navigation:
1. Press `Escape` to ensure you're in normal mode
2. Click anywhere on the main content area to return focus
3. Verify the status indicator shows "NORMAL" mode

**Section sources**
- [VimSystem.ts](file://src/systems/VimSystem.ts#L16-L251)

### How do I use the 'gg' command to go to top?
The 'gg' command requires pressing the 'g' key twice within 500ms (defined by `VIM_KEYBINDINGS.TIMINGS.SEQUENCE_TIMEOUT`). The system tracks the last key pressed and its timestamp to differentiate between a single 'g' press and the 'gg' sequence.

If 'gg' isn't working:
- Press the keys more quickly
- Ensure you're in NORMAL mode
- Check for JavaScript errors in the console

**Section sources**
- [VimSystem.ts](file://src/systems/VimSystem.ts#L16-L251)

## Animation & Performance Problems

### How do I disable animations on slow devices?
The system automatically optimizes for device performance, but you can manually disable animations through several methods:

1. **Browser settings**: Enable "prefers-reduced-motion" in your OS accessibility settings
2. **Code modification**: Set `enableAnimations: false` in the configuration
3. **Manual override**: Use the browser's device toolbar to simulate low-performance devices

The system monitors memory usage and battery level, automatically pausing animations when resources are constrained.

**Section sources**
- [device.ts](file://src/utils/device.ts#L181-L241)
- [ASCIIAnimationSystem.ts](file://src/animation/ASCIIAnimationSystem.ts#L131-L151)

### Why are animations stuttering?
Animation stuttering typically occurs due to:
- High memory usage (monitored every 10 seconds on mobile)
- Low battery conditions (below 15% while not charging)
- Background tabs (animations pause when tab is hidden)
- CPU-intensive tasks running concurrently

The system uses `AnimationScheduler` to manage animation tasks efficiently, but resource constraints can still impact performance.

**Section sources**
- [ASCIIAnimationSystem.ts](file://src/animation/ASCIIAnimationSystem.ts#L131-L151)
- [device.ts](file://src/utils/device.ts#L274-L324)

### How can I improve animation performance?
Performance can be optimized by:

1. **Reducing particle count**: Modify the ASCII art to contain fewer characters
2. **Limiting effects complexity**: Use simpler effect strategies
3. **Adjusting frame rate**: The system targets 60fps but adapts to device capabilities
4. **Disabling non-essential features**: Turn off battery and memory monitoring if not needed

The `getStats()` method provides detailed performance metrics including particle count and active animation tasks.

**Section sources**
- [ParticleSystem.ts](file://src/animation/ParticleSystem.ts#L8-L166)
- [ASCIIAnimationSystem.ts](file://src/animation/ASCIIAnimationSystem.ts#L348-L368)

## Service Worker & Caching

### Why is the service worker not caching assets?
Service worker caching issues can stem from several causes:

1. **Registration failure**: Service workers require HTTPS or localhost
2. **Scope limitations**: The worker can only control pages within its scope
3. **Network conditions**: Failed network requests prevent caching
4. **Storage limits**: Browser storage quotas may be exceeded

The service worker uses different caching strategies:
- **Static assets**: Cache-first strategy
- **Pages**: Network-first strategy
- **API requests**: Stale-while-revalidate strategy

**Section sources**
- [sw.js](file://public/sw.js#L0-L435)

### How do I verify service worker registration?
Check service worker status using browser developer tools:

1. **Application tab**: View service worker registration and status
2. **Network tab**: Look for "(from ServiceWorker)" in response headers
3. **Console**: Check for service worker log messages
4. **Cache Storage**: Inspect cached assets in different cache buckets

The service worker logs key events like installation, activation, and fetch handling.

**Section sources**
- [sw.js](file://public/sw.js#L0-L435)

### How do I clear the service worker cache?
Cache can be cleared through:

1. **Browser developer tools**: Application tab → Storage → Clear site data
2. **Programmatic method**: Send 'CLEAR_CACHE' message to service worker
3. **Manual deletion**: Use browser settings to clear cached data

The `clearAllCaches()` function removes all cache storage used by the application.

**Section sources**
- [sw.js](file://public/sw.js#L393-L435)

## Mobile & Touch Conflicts

### How are mobile touch conflicts handled?
Mobile devices present unique challenges that are addressed through:

1. **Memory monitoring**: Animations pause when memory usage exceeds 80% of limit
2. **Battery optimization**: Animations pause when battery is low (<15%) and not charging
3. **Touch detection**: The system detects touch capability and adjusts behavior
4. **Responsive design**: Breakpoints adjust layout and functionality

The `mobileOptimizations` module handles device-specific adaptations.

**Section sources**
- [device.ts](file://src/utils/device.ts#L274-L324)
- [ASCIIAnimationSystem.ts](file://src/animation/ASCIIAnimationSystem.ts#L131-L151)

### Why do animations pause on mobile devices?
Animations automatically pause when:
- Memory pressure is detected (using `performance.memory` API)
- Battery level is critically low
- Device is in power-saving mode
- Tab is not active (visibility change)

Animations resume when conditions improve, such as when charging begins or memory pressure subsides.

**Section sources**
- [device.ts](file://src/utils/device.ts#L125-L179)
- [ASCIIAnimationSystem.ts](file://src/animation/ASCIIAnimationSystem.ts#L131-L151)

## Browser-Specific Limitations

### What are Safari's reduced motion defaults?
Safari respects the `prefers-reduced-motion` media query, which can be enabled in System Preferences → Accessibility. When active, this setting signals that users prefer minimal motion.

The application detects this preference through:
```javascript
window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

**Section sources**
- [device.ts](file://src/utils/device.ts#L125-L179)

### What Firefox battery API restrictions exist?
Firefox has disabled the Battery Status API due to privacy concerns. This means:
- Battery level and charging status cannot be detected
- Low battery optimizations are unavailable
- Charging state monitoring doesn't function

The system gracefully handles API unavailability with try/catch blocks and fallback behaviors.

**Section sources**
- [device.ts](file://src/utils/device.ts#L125-L179)

## Debugging Tools & Techniques

### How do I debug using browser developer tools?
Effective debugging strategies include:

**Event Listeners Check**
- Inspect event listeners on document and window objects
- Verify keyboard event listeners are properly attached
- Check for event listener conflicts

**Console Error Monitoring**
- Look for service worker registration errors
- Monitor memory and battery API availability
- Check canvas and context initialization

**Network Tab Analysis**
- Verify service worker interception of requests
- Check cache headers and response sources
- Monitor API endpoint requests and caching

**Performance Profiler**
- Record animation performance
- Identify long-running tasks
- Analyze memory usage patterns

**Section sources**
- [sw.js](file://public/sw.js#L0-L435)
- [VimSystem.ts](file://src/systems/VimSystem.ts#L16-L251)

### How do I check animation system status?
The `getStats()` method provides comprehensive system information:

```javascript
animationSystem.getStats()
```

Returns:
- Animation state (running/paused)
- Current time and mode
- Particle statistics
- Active animation tasks
- Memory usage metrics

This information is invaluable for diagnosing performance issues.

**Section sources**
- [ASCIIAnimationSystem.ts](file://src/animation/ASCIIAnimationSystem.ts#L348-L368)

## Known Bugs & Planned Fixes

### Current Limitations
- **Battery API**: Not available in Firefox and some mobile browsers
- **Memory API**: Limited to Chrome and some Chromium-based browsers
- **Service Worker Scope**: May not control all desired paths
- **Animation Synchronization**: Complex effects may desync on low-end devices

### Performance Tuning Tips
- **Reduce particle count**: Simplify ASCII art in `ASCII_ART.PORTFOLIO_NAME`
- **Disable effects**: Set `enableEffects: false` in mobile configuration
- **Manual control**: Use `pause()` and `resume()` methods to manage animation state
- **Memory monitoring**: Adjust the 80% threshold in `setupMemoryMonitoring`

**Section sources**
- [device.ts](file://src/utils/device.ts#L274-L324)
- [ASCIIAnimationSystem.ts](file://src/animation/ASCIIAnimationSystem.ts#L348-L368)