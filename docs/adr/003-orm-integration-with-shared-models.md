# ADR-003: ORM Integration with Shared Models

**Status:** Proposed  
**Date:** 2025-01-23  
**Authors:** Development Team  

## Context

The HomeAccount application currently uses raw SQL queries through a custom database service for all database operations. While this approach provides full control and transparency (as documented in ADR-001), it presents several challenges as the application grows:

### Current Pain Points
- **Manual Query Writing**: Every database operation requires hand-written SQL
- **Type Safety**: No compile-time guarantees between database schema and TypeScript types
- **Relationship Management**: Complex joins and relationships require verbose SQL
- **Code Duplication**: Similar queries repeated across different services
- **Model Inconsistency**: Database schema and application models can drift apart
- **Development Velocity**: Slower feature development due to manual SQL management

### Business Requirements
- **Shared Models**: Frontend and backend need consistent data structures
- **Type Safety**: Prevent runtime errors from schema/code mismatches
- **Developer Experience**: Reduce boilerplate and improve productivity
- **Maintainability**: Easier to evolve database schema and queries

## Decision

We will integrate **TypeORM** as our primary ORM solution with the following approach:

### 1. ORM Selection: TypeORM
- **Primary Choice**: TypeORM for its excellent NestJS integration
- **TypeScript-First**: Native TypeScript support with decorators
- **Migration Support**: Can work alongside our existing migration system
- **Entity Models**: Database-first approach preserving our current schema

### 2. Shared Model Strategy
- **Entity Location**: Define entities in `/shared` directory for cross-platform use
- **Export Structure**: Separate entity exports for backend vs frontend consumption
- **Type Generation**: Generate TypeScript interfaces from entities
- **Validation**: Shared DTOs with class-validator for consistent validation

### 3. Migration Strategy
- **Hybrid Approach**: Keep existing SQL migrations for schema changes
- **Entity Sync**: Use TypeORM entities as documentation/validation of schema
- **Gradual Migration**: Phase out raw SQL queries service by service
- **Backwards Compatibility**: Maintain database service for complex queries when needed

### 4. Implementation Architecture
```
shared/
├── entities/           # TypeORM entities (shared models)
├── dto/               # Data transfer objects  
├── interfaces/        # TypeScript interfaces
└── types/            # Common type definitions

backend/
├── repositories/      # TypeORM repositories
├── services/         # Business logic services
└── entities/         # Backend-specific entity configurations

frontend/
├── types/            # Generated from shared entities
└── api/              # API client with typed responses
```

## Rationale

### Why TypeORM?
1. **NestJS Integration**: First-class support with `@nestjs/typeorm`
2. **Decorator Approach**: Familiar pattern for NestJS developers  
3. **Active Record & Data Mapper**: Flexible patterns for different use cases
4. **Migration Support**: Can coexist with our current migration system
5. **Relationship Handling**: Built-in support for complex relationships
6. **Query Builder**: Escape hatch for complex queries when needed

### Why Shared Models?
1. **Type Consistency**: Single source of truth for data structures
2. **DRY Principle**: Avoid duplicating model definitions
3. **API Contracts**: Ensure frontend/backend agreement on data shapes
4. **Refactoring Safety**: Changes propagate across entire application

## Alternatives Considered

### 1. Prisma
**Pros**: Excellent TypeScript support, modern API, great tooling  
**Cons**: Schema-first approach conflicts with our migration strategy, less mature NestJS integration

### 2. Sequelize  
**Pros**: Mature, well-documented, good TypeScript support  
**Cons**: Less idiomatic for TypeScript, verbose configuration, older architecture

### 3. MikroORM
**Pros**: TypeScript-first, excellent performance, unit of work pattern  
**Cons**: Smaller community, less NestJS integration, steeper learning curve

### 4. Keep Raw SQL
**Pros**: Full control, no abstraction, familiar approach  
**Cons**: High maintenance burden, no type safety, slow development velocity

## Consequences

### Positive
- **Type Safety**: Compile-time validation of database operations
- **Developer Productivity**: Less boilerplate code for CRUD operations  
- **Shared Models**: Consistent data structures across frontend/backend
- **Relationship Management**: Easier handling of complex entity relationships
- **Query Optimization**: Built-in query optimization and caching
- **IDE Support**: Better autocomplete and refactoring capabilities

### Negative
- **Learning Curve**: Team needs to learn TypeORM concepts and patterns
- **Abstraction Layer**: Some loss of direct SQL control
- **Migration Complexity**: Need to coordinate between SQL migrations and ORM entities
- **Bundle Size**: Additional dependency for frontend shared models
- **Performance Overhead**: ORM abstraction may impact performance for complex queries

### Migration Risks
- **Data Integrity**: Risk during transition from raw SQL to ORM
- **Query Performance**: Some complex queries may be slower through ORM
- **Backwards Compatibility**: Need to maintain raw SQL service during transition

## Implementation Plan

### Phase 1: Foundation (Week 1-2)
1. Install and configure TypeORM with NestJS
2. Create shared entity structure in `/shared/entities`
3. Define first entity (test_data table) as proof of concept
4. Set up repository pattern in backend

### Phase 2: Core Entities (Week 3-4)  
1. Convert existing database tables to TypeORM entities
2. Implement repositories for primary entities
3. Create shared DTOs and validation rules
4. Update API endpoints to use repositories

### Phase 3: Frontend Integration (Week 5-6)
1. Generate TypeScript types from entities for frontend
2. Update frontend API calls to use typed interfaces  
3. Implement client-side validation with shared DTOs
4. Test cross-platform model consistency

### Phase 4: Migration & Cleanup (Week 7-8)
1. Gradually replace raw SQL queries with repository calls
2. Keep database service for complex reporting queries
3. Update documentation and examples
4. Performance testing and optimization

## Success Metrics

- **Type Safety**: Zero runtime type errors related to database operations
- **Development Speed**: 30% reduction in time to implement new CRUD features
- **Code Quality**: Reduced code duplication across services
- **Model Consistency**: 100% consistency between frontend/backend models
- **Developer Satisfaction**: Improved developer experience survey scores

## Related Documentation

- [ADR-001: Database Migration System](001-database-migration-system.md) - Foundation migration approach
- [ADR-000: Shared Folder for Types and Utilities](000-shared-folder-for-types-and-utilities.md) - Shared code strategy

---

**Next Steps**: Review and approval required before implementation begins.