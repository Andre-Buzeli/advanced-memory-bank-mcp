# Contributing to Advanced Memory Bank MCP

Thank you for your interest in contributing to the Advanced Memory Bank MCP! This document provides guidelines for contributing to the project.

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/advanced-memory-bank-mcp.git`
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Run tests: `npm test`

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Optional (for database features)
- PostgreSQL 14+ with pgvector extension
- Docker (for easy database setup)

### Installation

```bash
# Clone the repository
git clone https://github.com/Andre-Buzeli/advanced-memory-bank-mcp.git
cd advanced-memory-bank-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run start
```

### Docker Development Environment

```bash
# Start PostgreSQL with pgvector
docker-compose up -d

# Initialize database
npm run db:init

# Run migrations
npm run db:migrate
```

## 📋 Project Structure

```
src/
├── main/           # Entry points and server setup
├── core/           # Core memory management logic
├── database/       # Database integration (optional)
└── types/          # TypeScript type definitions

config/             # Configuration files
memory-banks/       # Memory storage (ignored by git)
templates/          # Memory templates
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 📝 Code Style

- Use TypeScript for all new code
- Follow existing code style and patterns
- Add JSDoc comments for public APIs
- Use meaningful variable and function names
- Keep functions small and focused

## 🔍 Pull Request Process

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes and add tests
3. Ensure all tests pass: `npm test`
4. Build the project: `npm run build`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Pull Request Guidelines

- Provide a clear description of the changes
- Link any related issues
- Include tests for new functionality
- Update documentation as needed
- Ensure backward compatibility when possible

## 🐛 Bug Reports

When reporting bugs, please include:

- Version of Advanced Memory Bank MCP
- Node.js version
- Operating system
- Steps to reproduce the issue
- Expected vs actual behavior
- Any error messages or logs

## 💡 Feature Requests

For feature requests, please:

- Check existing issues first
- Provide a clear use case
- Explain the expected behavior
- Consider backward compatibility
- Be open to discussion about implementation

## 📚 Documentation

- Keep README.md up to date
- Update CHANGELOG.md for notable changes
- Add JSDoc comments for new APIs
- Update configuration examples when needed

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the Golden Rule

## 🏷️ Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes and improvements

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙋‍♂️ Getting Help

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Check existing issues and documentation first

Thank you for contributing! 🎉