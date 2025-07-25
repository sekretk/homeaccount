# ADR-001: Database Migration System

**Status:** Accepted  
**Date:** 2025-07-24  
**Authors:** Development Team  

## Context

The HomeAccount application needs a database schema evolution mechanism to:
- Apply database changes consistently across environments
- Track migration history and current state
- Support both automated and manual migration execution
- Provide visibility into database migration status

## Decision

We will implement a **SQL-based migration system** with:

1. **Sequential SQL files** in `database/migrations/` directory
2. **Migration tracking table** to prevent duplicate execution
3. **Automatic execution** on backend startup (configurable)
4. **Manual CLI tools** for development workflow
5. **API endpoints** for migration status monitoring

## Rationale

### Why SQL-based migrations?
- **Full Control**: Direct SQL gives complete control over schema changes
- **Transparency**: Clear, readable migration files
- **No Abstraction**: No ORM layer to learn or debug
- **Database Features**: Access to all PostgreSQL-specific features

### Why integrated vs external tools?
- **Simplicity**: No additional tooling dependencies
- **Team Size**: Lightweight solution appropriate for small team
- **Control**: Custom implementation fits our specific needs

## Alternatives Considered

1. **ORM Migrations** (TypeORM, Prisma) - Rejected due to abstraction complexity
2. **External Tools** (Flyway, Liquibase) - Rejected due to additional dependencies
3. **Manual Schema Management** - Rejected due to consistency issues

## Consequences

### Positive
- Simple, predictable migration execution
- Full SQL control and PostgreSQL feature access
- Integrated status reporting via API
- Zero-dependency solution

### Negative
- Manual rollback process (no automatic rollback)
- Requires SQL knowledge for complex schema changes
- Manual coordination needed for migration numbering

## Implementation

See `docs/migrations.md` for detailed implementation and usage documentation.