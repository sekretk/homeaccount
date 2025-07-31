# HomeAccount Documentation

Welcome to the HomeAccount project documentation! This directory contains all technical documentation, guides, and architectural decisions.

## 📚 Documentation Index

### Core Documentation
| Document | Description | Size | Last Updated |
|----------|-------------|------|--------------|
| [GitHub Setup Guide](github-setup.md) | Guide for setting up the project on GitHub | 2.1 KB | 2025-01-23 |
| [Database Migrations](migrations.md) | Database migration system and usage | 3.4 KB | 2025-01-23 |
| [Database Seeds](seeds.md) | Migration-aligned seed system documentation | 8.2 KB | 2025-01-23 |

### Architecture Decision Records (ADRs)
For architectural decisions and their rationale, see the dedicated [ADR directory](adr/README.md).

**Recent ADRs:**
- [ADR-000: Shared Folder for Types and Utilities](adr/000-shared-folder-for-types-and-utilities.md)
- [ADR-001: Database Migration System](adr/001-database-migration-system.md)
- [ADR-002: Migration-Aligned Seed System](adr/002-migration-aligned-seed-system.md)

## 🚀 Quick Start

### Database Setup
1. **Migrations**: See [migrations.md](migrations.md) for database schema management
2. **Seeds**: See [seeds.md](seeds.md) for test data population
3. **GitHub Integration**: See [github-setup.md](github-setup.md) for repository setup

### Development Workflow
```bash
# Start with seed data for development
./docker-scripts.sh seeds-on
./docker-scripts.sh up

# Run migrations only (production)
./docker-scripts.sh up
```

## 📖 Documentation Standards

### File Organization
- **Core Documentation**: Technical guides and usage documentation
- **ADRs**: Architectural decisions in `adr/` directory
- **README Files**: Index files for easy navigation

### Writing Guidelines
- Use clear, concise language
- Include practical examples
- Keep documentation up-to-date with code changes
- Use consistent formatting and structure

## 🔗 External Resources

- [Project Repository](https://github.com/your-org/homeaccount)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)

---

**Note**: This documentation is maintained alongside the codebase. Please keep it updated when making changes to the system. 