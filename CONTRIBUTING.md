# Contributing to Node-EmDB

Thank you for your interest in contributing to Node-EmDB! This document provides guidelines and information for contributors to help ensure high-quality contributions.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please be respectful, inclusive, and constructive in all interactions.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** >= 12.0.0
- **npm** >= 6.0.0
- **Git** for version control
- A code editor with TypeScript support (VS Code recommended)

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Node-EmDB.git
   cd Node-EmDB
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up pre-commit hooks**
   ```bash
   npm run prepare
   ```

4. **Verify setup**
   ```bash
   npm run build
   npm test
   npm run test:coverage
   ```

## Project Structure

```
Node-EmDB/
├── src/                          # Source TypeScript files
│   ├── adapters/                 # Storage adapters
│   │   ├── __tests__/           # Adapter tests
│   │   ├── Adapter.ts           # Base adapter class
│   │   ├── JSON-Adapter.ts      # JSON storage adapter
│   │   ├── CompressedJSON-Adapter.ts
│   │   ├── File-Adapter.ts      # File-based storage
│   │   └── CompressedFile-Adapter.ts
│   ├── __tests__/               # Main tests
│   ├── benchmark/               # Performance benchmarks
│   ├── EmDB.ts                  # Main EmDB class
│   └── types.ts                 # TypeScript type definitions
├── lib/                         # Utility libraries
│   ├── __tests__/               # Library tests
│   ├── ProcessCleanupEmitter.ts # Process cleanup handling
│   └── Timer.ts                 # Performance timing utility
├── dist/                        # Compiled JavaScript (generated)
├── coverage/                    # Test coverage reports (generated)
├── .husky/                      # Git hooks
├── .eslintrc.js                 # ESLint configuration
├── jest.config.js               # Jest test configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Project configuration
```

## Coding Standards

### TypeScript Guidelines

1. **Strict TypeScript**: We use strict TypeScript settings. All code must be properly typed.

2. **Type Definitions**: Always define explicit types for:
   - Function parameters and return types
   - Class properties
   - Interface definitions
   - Generic type parameters

3. **Naming Conventions**:
   - Use `camelCase` for variables and functions
   - Use `PascalCase` for classes and interfaces
   - Use `UPPER_SNAKE_CASE` for constants
   - Use descriptive names that clearly indicate purpose

4. **Code Style**:
   ```typescript
   // ✅ Good
   interface DatabaseOptions {
     readonly adapter: AdapterConstructor;
     readonly verbose: boolean;
   }

   class Database {
     private readonly options: DatabaseOptions;
     
     constructor(options: DatabaseOptions) {
       this.options = options;
     }
   }

   // ❌ Bad
   interface opts {
     adapter: any;
     verbose: boolean;
   }
   ```

### ESLint Rules

We enforce strict ESLint rules. Run linting before committing:

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

Key rules:
- No `any` types (use proper typing)
- No unused variables or parameters
- Explicit return types for functions
- Consistent code formatting

### File Organization

1. **One class per file**: Each class should be in its own file
2. **Test files**: Place tests in `__tests__` directories
3. **Exports**: Use named exports for better tree-shaking
4. **Imports**: Use absolute imports when possible

## Testing Guidelines

### Test Coverage Requirements

We maintain **100% test coverage** across all metrics:
- **Lines**: 100%
- **Functions**: 100%
- **Branches**: 100%
- **Statements**: 100%

### Writing Tests

1. **Test Structure**: Use the AAA pattern (Arrange, Act, Assert)
2. **Test Naming**: Use descriptive test names that explain the scenario
3. **Test Organization**: Group related tests using `describe` blocks

```typescript
describe('EmDB', () => {
  describe('Basic Operations', () => {
    it('should store and retrieve string values', () => {
      // Arrange
      const db = new EmDB('./test.db');
      const key = 'test-key';
      const value = 'test-value';
      
      // Act
      db.put(key, value);
      const result = db.get(key);
      
      // Assert
      expect(result).toBe(value);
    });
  });
});
```

### Test Categories

1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test component interactions
3. **Edge Cases**: Test error conditions and boundary values
4. **Performance Tests**: Use the benchmark suite for performance validation

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=EmDB.test.ts
```

## Pull Request Process

### Before Submitting

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards

3. **Write comprehensive tests** for new functionality

4. **Update documentation** if needed

5. **Run all checks**:
   ```bash
   npm run build
   npm run lint
   npm run test:coverage
   ```

6. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Commit Message Format

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(adapters): add new Redis adapter
fix(em-db): handle null values correctly
docs(readme): update installation instructions
test(em-db): add tests for error handling
```

### Pull Request Checklist

- [ ] Code follows TypeScript best practices
- [ ] All tests pass with 100% coverage
- [ ] ESLint passes without errors
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] Branch is up to date with master
- [ ] PR description clearly explains changes

### Review Process

1. **Automated Checks**: All PRs must pass automated checks
2. **Code Review**: At least one maintainer must approve
3. **Testing**: All new code must have comprehensive tests
4. **Documentation**: Update docs for any API changes

## Issue Guidelines

### Bug Reports

When reporting bugs, include:

1. **Environment**: Node.js version, OS, package version
2. **Steps to Reproduce**: Clear, minimal steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Error Messages**: Full error messages and stack traces
6. **Code Sample**: Minimal code that reproduces the issue

### Feature Requests

For feature requests, include:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other solutions considered
4. **Additional Context**: Any other relevant information

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `question`: Further information is requested

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality in a backwards compatible manner
- **PATCH**: Backwards compatible bug fixes

### Release Steps

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with new features/fixes
3. **Create release PR** with version bump
4. **Merge PR** after review
5. **Create GitHub release** with release notes
6. **Publish to npm** (automated via CI/CD)

## Development Workflow

### Daily Development

1. **Start with latest master**:
   ```bash
   git checkout master
   git pull origin master
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make changes and test**:
   ```bash
   npm run build
   npm test
   npm run test:coverage
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature
   ```

### Debugging

1. **Use TypeScript compiler** for type checking:
   ```bash
   npx tsc --noEmit
   ```

2. **Use Jest debugging**:
   ```bash
   npm test -- --detectOpenHandles --forceExit
   ```

3. **Use Node.js debugging**:
   ```bash
   node --inspect-brk dist/your-file.js
   ```

## Performance Considerations

### Benchmarking

Always benchmark performance-critical changes:

```bash
npm run benchmark
```

### Memory Usage

Monitor memory usage during development:
- Use `process.memoryUsage()` for memory tracking
- Avoid memory leaks in long-running processes
- Test with large datasets

### Optimization Guidelines

1. **Minimize allocations** in hot paths
2. **Use efficient data structures**
3. **Avoid unnecessary object creation**
4. **Profile before optimizing**

## Getting Help

### Resources

- **Documentation**: Check README.md and inline code comments
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for help in PR comments

### Contact

- **Maintainer**: Ankit Kuwadekar
- **Repository**: https://github.com/serendipious/Node-EmDB
- **Issues**: https://github.com/serendipious/Node-EmDB/issues

## Recognition

Contributors will be recognized in:
- **CONTRIBUTORS.md** file
- **Release notes** for significant contributions
- **GitHub contributors** page

Thank you for contributing to Node-EmDB! 🚀
