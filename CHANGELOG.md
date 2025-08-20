# Changelog

All notable changes to Storken will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2024-12-20

### 🚀 Major Release - Complete TypeScript Rewrite

This is a major release with significant improvements and breaking changes. Storken v3.0 is completely rewritten in TypeScript with React 18 support and introduces industry-first features.

### ✨ Added

#### Core Features
- **Full TypeScript support** with complete type safety and IntelliSense
- **React 18 compatibility** using `useSyncExternalStore` for optimal performance
- **LLM-native development patterns** with predictable, AI-friendly APIs
- **Universal API pattern** (experimental) - same code works in Server Components, Client Components, and API Routes
- **Plugin system architecture** for extensible functionality
- **Getter/setter patterns** for async data fetching with automatic loading states
- **Zero dependencies** - pure React implementation

#### Performance Improvements
- **39% smaller bundle size** - now only 5KB minified + gzipped
- **Optimized rendering** with selective subscriptions
- **Memory efficient** with automatic cleanup and garbage collection
- **Tree-shakeable** - import only what you need

#### Developer Experience
- **Comprehensive TypeScript examples** covering all use cases
- **5 working example applications**:
  - Todo App with localStorage persistence
  - JWT Authentication with protected routes
  - Real-time Chat with optimistic updates
  - Next.js App Router with server-client patterns
  - Universal Pattern demonstration
- **Extensive documentation**:
  - Best Practices Guide
  - Plugin Development Guide  
  - Performance Optimization Guide
  - Migration Guide from v2

#### API Enhancements
- **Improved hook signature** with loading states and refresh functions
- **Plugin API** with event system and lifecycle management
- **Async getters** with automatic error handling and loading states
- **Async setters** with side effect support
- **Type-safe store creation** with generic support

### 🔄 Changed

#### Breaking Changes
- **Minimum React version** now 18.0.0 (was 16.8.0)
- **TypeScript first** - full migration from JavaScript
- **New hook signature**: `const [value, setValue, reset, loading, refresh, plugins] = useStorken(key)`
- **Store creation syntax** updated for better TypeScript support
- **Plugin system** replaces old extension mechanisms

#### Migration Path
```typescript
// v2 (JavaScript)
const [count, setCount] = useStorken('counter', 0)

// v3 (TypeScript)  
const [count, setCount] = useStorken<number>('counter', 0)
```

### 🛠️ Technical Improvements
- **Built with modern tooling**: tsup, vitest, TypeScript 5.0
- **React 18 concurrent features** support
- **Improved error handling** and debugging experience
- **Better tree-shaking** and module resolution
- **Enhanced bundle analysis** and size monitoring

### 📚 Documentation
- Complete rewrite of all documentation
- Added comprehensive examples for real-world usage
- Created developer guides for advanced usage patterns
- LLM-native development patterns documentation
- Performance optimization strategies

### 🧪 Testing
- **Complete test suite rewrite** with vitest
- **Integration tests** for all examples
- **Performance regression tests**
- **TypeScript compatibility tests**
- **React 18 concurrent features tests**

### ♻️ Removed
- **Legacy JavaScript code** - fully migrated to TypeScript
- **Old plugin system** - replaced with new architecture
- **React <18 compatibility** - focused on modern React
- **Deprecated APIs** from v1.x and v2.x

---

## [2.x.x] - Legacy Versions

### Note
Versions 2.x.x and earlier were JavaScript-based implementations. 
For historical changelog information, please refer to the git history or legacy documentation.

Key differences from v2 to v3:
- Complete TypeScript rewrite
- React 18 `useSyncExternalStore` adoption
- 39% bundle size reduction
- Plugin system introduction
- LLM-native development patterns
- Universal API pattern (experimental)

---

## Upgrade Guide

### From v2.x to v3.0

1. **Update React to 18+**
   ```bash
   npm install react@^18.0.0 react-dom@^18.0.0
   ```

2. **Install TypeScript** (if not already using)
   ```bash
   npm install --save-dev typescript @types/react @types/react-dom
   ```

3. **Update import syntax**
   ```typescript
   // Before
   import useStorken from 'storken'
   
   // After  
   import { create } from 'storken'
   const [useStorken] = create({ initialValues: {...} })
   ```

4. **Add type annotations**
   ```typescript
   // Before
   const [count, setCount] = useStorken('counter', 0)
   
   // After
   const [count, setCount] = useStorken<number>('counter')
   ```

5. **Update plugins** (if using custom extensions)
   - Migrate to new plugin API
   - See PLUGIN_DEVELOPMENT.md for details

### Breaking Changes Details

#### Hook Signature
- Added `loading` parameter for async operations
- Added `refresh` function for getter re-execution  
- Added `plugins` access for plugin methods

#### Store Creation
- New `create` function returns hook factory
- Better TypeScript integration
- Plugin system integration

#### TypeScript Migration
- All APIs now have full TypeScript support
- Generic parameters for type safety
- IntelliSense support for better DX

For detailed migration examples, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md).

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to Storken.

## License

MIT © [Kerem Noras](https://github.com/keremnoras)