# Contributing to Storken

Thank you for your interest in contributing to Storken! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment for all contributors
- Follow the project's technical guidelines

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/storken.git
   cd storken
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run tests to ensure everything works**
   ```bash
   pnpm test
   ```

4. **Build the project**
   ```bash
   pnpm build
   ```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-plugin-system`
- `fix/memory-leak-in-cleanup`  
- `docs/update-readme-examples`
- `refactor/optimize-subscription-logic`

### Commit Messages

Follow conventional commit format:
- `feat: add persistence plugin`
- `fix: resolve memory leak in useStorken hook`
- `docs: update API documentation`
- `test: add integration tests for plugins`
- `refactor: optimize render performance`

### Code Style

- Use TypeScript for all new code
- Follow existing code conventions
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Prefer explicit types over `any`

```typescript
// ✅ Good
interface UserState {
  id: string
  name: string
  email: string
}

/**
 * Creates a user store with validation
 * @param initialUser - Initial user data
 * @returns Store hook and utilities
 */
export function createUserStore(initialUser: UserState | null) {
  // Implementation
}

// ❌ Avoid
export function createUserStore(user: any) {
  // Implementation
}
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Writing Tests

- Add tests for all new features
- Test edge cases and error conditions
- Use descriptive test names
- Follow the existing test patterns

```typescript
describe('useStorken hook', () => {
  it('should update state when setter is called', () => {
    // Test implementation
  })
  
  it('should handle async operations with loading states', async () => {
    // Test implementation
  })
  
  it('should cleanup subscriptions on unmount', () => {
    // Test implementation
  })
})
```

### Test Categories

1. **Unit Tests** - Individual functions and hooks
2. **Integration Tests** - Component interactions
3. **Performance Tests** - Bundle size and render performance
4. **Example Tests** - Verify all examples work correctly

## Pull Request Process

### Before Submitting

1. **Run the full test suite**
   ```bash
   pnpm test
   pnpm typecheck
   pnpm lint
   pnpm build
   ```

2. **Update documentation** if needed
3. **Add tests** for new features
4. **Update CHANGELOG.md** if applicable

### PR Template

When creating a pull request, include:

- **Description**: Clear explanation of changes
- **Type**: Feature, bug fix, docs, refactor, etc.
- **Testing**: How you tested the changes
- **Breaking Changes**: Any breaking changes (if applicable)
- **Screenshots**: For UI-related changes

### Example PR Description

```markdown
## Description
Add persistence plugin for automatic localStorage sync

## Changes
- Add `createPersistencePlugin` function
- Include debouncing for performance
- Add comprehensive tests
- Update documentation

## Testing
- Added unit tests for plugin functionality
- Tested with example applications
- Verified performance impact is minimal

## Breaking Changes
None
```

## Issue Guidelines

### Bug Reports

Include:
- **Environment**: Node.js version, React version, browser
- **Steps to reproduce**: Clear step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Code example**: Minimal reproduction case

### Feature Requests

Include:
- **Use case**: Why this feature is needed
- **Proposed solution**: How it should work
- **Alternatives**: Other solutions you've considered
- **Implementation ideas**: Technical approach (if any)

### Questions

- Check existing issues and documentation first
- Use descriptive titles
- Provide context about your use case
- Include relevant code examples

## Documentation

### Types of Documentation

1. **API Documentation** - JSDoc comments in code
2. **User Guides** - README, examples, guides
3. **Developer Documentation** - This contributing guide
4. **Plugin Documentation** - Plugin development guides

### Documentation Standards

- Write clear, concise explanations
- Include code examples for complex concepts
- Update documentation when changing APIs
- Use consistent terminology throughout

### Examples

When adding examples:
- Create complete, working examples
- Include README with setup instructions
- Test the example actually works
- Keep examples focused on single concepts

## Development Workflow

### Typical Workflow

1. **Create an issue** (for significant changes)
2. **Fork the repository**
3. **Create a feature branch**
4. **Make your changes**
5. **Add tests**
6. **Update documentation**
7. **Run the full test suite**
8. **Submit a pull request**
9. **Address review feedback**
10. **Celebrate when merged! 🎉**

### Getting Help

- **GitHub Issues**: For bugs, features, and questions
- **Discussions**: For general discussion and help
- **Email**: kerem@noras.tech for security issues

## Release Process

### Versioning

Storken follows semantic versioning (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, backwards compatible

### Release Checklist

1. Update version in package.json
2. Update CHANGELOG.md
3. Run full test suite
4. Build and verify bundle size
5. Create release PR
6. Merge and tag release
7. Publish to NPM
8. Create GitHub release

## Plugin Development

### Plugin Guidelines

- Follow the plugin API patterns
- Provide comprehensive examples
- Include TypeScript definitions
- Add tests for plugin functionality
- Document plugin options thoroughly

### Plugin Naming

- Use descriptive names: `storken-plugin-persistence`
- Include "storken-plugin-" prefix
- Use kebab-case

## Performance Considerations

- Keep bundle size minimal
- Avoid unnecessary re-renders
- Use React 18 features properly
- Test performance impact of changes
- Consider memory usage

## Questions?

Don't hesitate to ask questions! Whether through issues, discussions, or email, we're here to help you contribute successfully.

---

**Thank you for contributing to Storken!** 

Every contribution, no matter how small, helps make Storken better for the entire React community.