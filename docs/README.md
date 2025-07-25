# 📚 HomeAccount Documentation Index

Welcome to the HomeAccount project documentation. This directory contains technical documentation, setup guides, and development resources.

## 📖 Documentation Files

### 🏗️ Core Setup & Configuration
| Document | Description | Size | Last Updated |
|----------|-------------|------|--------------|
| **[Project README](../README.md)** | Main project overview, setup instructions, and API documentation | Comprehensive | 2025-07-24 |
| **[GitHub Setup Guide](./github-setup.md)** | Branch protection, PR validation, and CI/CD pipeline setup | 6.5KB | 2025-07-24 |

### 🗄️ Database & Development  
| Document | Description | Size | Last Updated |
|----------|-------------|------|--------------|
| **[Database Migrations Guide](./migrations.md)** | Complete database migration system documentation and usage | 15KB | 2025-07-24 |

## 🚀 Quick Start Links

### 🛠️ Development Setup
- **[Main Setup Instructions](../README.md#-getting-started)** - Complete installation and running guide
- **[Docker Setup](../README.md#option-1-docker-recommended-for-production)** - Containerized development environment
- **[Development Mode](../README.md#option-2-development-mode)** - Local development with hot reload

### 🧪 Testing & Quality
- **[CI/CD Pipeline](../README.md#-cicd-pipeline)** - GitHub Actions workflows and build process
- **[Test Coverage](../README.md#-test-coverage)** - Unit tests, E2E tests, and coverage reports
- **Backend Tests**: `cd backend && npm test`
- **E2E Tests**: `cd backend && npm run test:e2e`

### 📡 API & Integration
- **[API Documentation](../README.md#-api-documentation)** - Current endpoints and response formats
- **[Shared Types](../shared/dto.ts)** - TypeScript interfaces shared between frontend and backend
- **[Migration DTOs](../shared/migration.dto.ts)** - Database migration specific types
- **Live Endpoints**: 
  - Backend API: `http://localhost:3001` (direct)
  - Frontend Proxy: `http://localhost:3000/api` (proxied)

## 🔧 Development Resources

### 📋 Code Quality & Standards
- **[Shared Types Integration](../README.md#-how-shared-types-work)** - How frontend and backend share TypeScript types
- **[Docker Infrastructure](../README.md#docker-infrastructure)** - Containerization strategy and configuration
- **[Branch Protection Setup](./github-setup.md)** - Required PR checks and merge policies

### 🗄️ Database Management
- **[Migration System Overview](./migrations.md#-migration-system-overview)** - How database migrations work
- **[Migration Commands](./migrations.md#-cli-commands)** - Available migration management commands  
- **[Migration Development](./migrations.md#-creating-new-migrations)** - How to create and test new migrations
- **[API Integration](./migrations.md#-api-integration)** - Migration status endpoints

## 📁 Documentation Files Structure

```
docs/
├── README.md                           # This index file
├── github-setup.md                     # GitHub repository setup guide  
├── migrations.md                       # Database migration system docs
└── adr/                               # Architecture Decision Records (separate)
    └── README.md                      # ADR index and guidelines
```

## 🏛️ Architecture Decisions

For architectural decisions and design rationale, see the separate **[ADR Directory](./adr/README.md)** which maintains its own index and guidelines.

## 🎯 Documentation Guidelines

When contributing to documentation:

### ✅ Best Practices
1. **Keep current** - Update docs when making code changes
2. **Include examples** - Add code samples and usage examples  
3. **Cross-reference** - Link to related documentation sections
4. **Use consistent formatting** - Follow existing markdown patterns
5. **Update this index** - Add new documents to the appropriate section

### 📝 Document Types & Organization
- **`/docs/`** - Technical guides, setup instructions, and system documentation
- **`/docs/adr/`** - Architecture Decision Records (maintains separate index)
- **Main README** - Project overview, getting started, and high-level documentation
- **Code comments** - Inline documentation for complex logic

### 🔄 Maintenance
- **Review quarterly** - Check for outdated information and broken links
- **Update on major changes** - API changes, deployment updates, new features
- **Version consistency** - Ensure version numbers and dates are current

## 🆘 Getting Help

### 📖 Information Sources
1. **[Main README](../README.md)** - Start here for project overview and setup
2. **[Migration Guide](./migrations.md)** - Database and migration questions
3. **[GitHub Setup](./github-setup.md)** - Repository and CI/CD configuration
4. **[ADR Directory](./adr/README.md)** - Architectural decisions and context
5. **Source code** - Check test files and inline comments for usage examples

### 🔍 Common Questions
- **Setup issues**: See [Getting Started](../README.md#-getting-started)
- **API endpoints**: Check [API Documentation](../README.md#-api-documentation)  
- **Database problems**: Review [Migration Guide](./migrations.md)
- **Type errors**: Examine [Shared Types](../README.md#-how-shared-types-work)
- **CI/CD failures**: Consult [GitHub Setup Guide](./github-setup.md)
- **Architecture decisions**: Browse [ADR Directory](./adr/README.md)

---

**📅 Last updated**: 2025-07-24  
**📊 Documentation files**: 3 guides + 1 main README  
**🏛️ Architecture decisions**: Managed separately in [ADR directory](./adr/README.md) 