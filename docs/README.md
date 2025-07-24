# 📚 HomeAccount Documentation

Welcome to the HomeAccount project documentation. This directory contains technical documentation, architectural decisions, and development guides.

## 📁 Documentation Structure

```
docs/
├── README.md                    # This file - documentation overview
└── adr/                        # Architecture Decision Records
    ├── README.md               # ADR index and guidelines
    └── 000-shared-folder-for-types-and-utilities.md
```

## 🏗️ Architecture Decision Records (ADRs)

ADRs document important architectural decisions made during the project development:

- **[ADR Index](./adr/README.md)** - Complete list of architectural decisions
- **[ADR-000: Shared Folder Approach](./adr/000-shared-folder-for-types-and-utilities.md)** - Decision to use shared folder for DTOs and utilities

## 📖 Quick Links

### 🚀 Getting Started
- **[Main README](../README.md)** - Project overview and setup instructions
- **[Shared Types](../shared/dto.ts)** - Current shared interfaces and DTOs

### 🧪 Development
- **Backend Tests**: Run `cd backend && npm test`
- **E2E Tests**: Run `cd backend && npm run test:e2e`
- **Frontend Dev**: Run `cd frontend && npm run dev`

### 🔗 API Documentation
- **Backend Server**: http://localhost:3001
- **Frontend App**: http://localhost:3000
- **API Endpoint**: `GET /current-data`

## 📝 Documentation Guidelines

When adding new documentation:

1. **Keep it current** - Update docs when making changes
2. **Use clear examples** - Include code samples where helpful
3. **Link related content** - Cross-reference relevant sections
4. **Follow structure** - Use consistent formatting and organization

### 📋 Document Types

- **ADRs**: For architectural decisions (use `docs/adr/`)
- **API Docs**: For endpoint documentation (consider adding `docs/api/`)
- **Development Guides**: For development processes (consider adding `docs/guides/`)
- **Deployment**: For deployment instructions (consider adding `docs/deployment/`)

## 🔄 Future Documentation

As the project grows, consider adding:

- **API Reference** - Detailed endpoint documentation
- **Development Guide** - Local development setup and workflows
- **Deployment Guide** - Production deployment instructions
- **Contributing Guide** - Guidelines for contributors
- **Troubleshooting** - Common issues and solutions

## 📞 Need Help?

- Check the **[main README](../README.md)** for setup instructions
- Review **[ADRs](./adr/README.md)** for architectural context
- Look at code examples in the source files
- Check test files for usage examples

---

**Last updated**: 2024-01-15 