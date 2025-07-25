# ADR-000: Shared Folder for DTOs and Utilities

## Status
**ACCEPTED** - 2025-07-24

## Context

We are building a full-stack TypeScript application with a React frontend and NestJS backend. We need to share data structures (DTOs) and utility functions between the two applications to ensure type safety and avoid code duplication.

### Problem
- Frontend and backend need to use identical TypeScript interfaces for API communication
- Utility functions for data formatting should be reusable across both applications
- We want to maintain type safety without complex tooling or build processes
- Changes to shared types should be immediately available to both applications

### Alternative Approaches Considered

1. **Separate NPM Packages**: Publish shared code as npm packages
2. **Copy-Paste Approach**: Duplicate types in both projects
3. **Monorepo Tools**: Use Lerna, Nx, or Rush for package management
4. **Git Submodules**: Share code via git submodules
5. **Shared Folder with TypeScript Includes**: Direct file sharing via TypeScript configuration

## Decision

We will use a **shared folder approach** with TypeScript `include` configuration to share DTOs and utilities between frontend and backend applications.

### Implementation

```
homeaccount/
├── shared/
│   ├── dto.ts        # Shared DTOs/interfaces
│   └── utils.ts      # Shared utility functions (future)
├── backend/
│   └── tsconfig.json # includes: ["src/**/*", "../shared/**/*"]
└── frontend/
    └── tsconfig.json # includes: ["src", "../shared"]
```

### Usage Examples

**Shared DTO Definition (`shared/dto.ts`):**
```typescript
export interface CurrentDataDto {
  currentTime: string;
  message: string;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
}
```

**Backend Usage (`backend/src/app.controller.ts`):**
```typescript
import { CurrentDataDto } from '../../shared/dto';

@Get('/current-data')
getCurrentData(): CurrentDataDto {
  return {
    currentTime: new Date().toISOString(),
    message: 'Hello from backend!'
  };
}
```

**Frontend Usage (`frontend/src/App.tsx`):**
```typescript
import { CurrentDataDto } from '../../shared/dto';

const response = await axios.get<CurrentDataDto>('/api/current-data');
const data: CurrentDataDto = response.data;
```

**TypeScript Configuration:**

Backend `tsconfig.json`:
```json
{
  "compilerOptions": { /* ... */ },
  "include": ["src/**/*", "../shared/**/*"]
}
```

Frontend `tsconfig.json`:
```json
{
  "compilerOptions": { /* ... */ },
  "include": ["src", "../shared"]
}
```

## Consequences

### ✅ Benefits

1. **Simplicity**: No complex tooling or build processes required
2. **Type Safety**: Full TypeScript support across both applications
3. **Real-time Changes**: Modifications to shared code are immediately available
4. **Developer Experience**: Excellent IntelliSense and auto-completion
5. **No Dependencies**: No additional npm packages or external tools
6. **Fast Compilation**: TypeScript treats shared files as part of each project
7. **Testing**: Shared types can be tested in both applications
8. **Refactoring**: IDE refactoring works across shared boundaries

### ❌ Drawbacks

1. **Tight Coupling**: Backend and frontend must be in the same repository
2. **Scalability Concerns**: May not scale well with many shared modules
3. **Build Coordination**: Both apps need to be aware of shared folder structure
4. **Versioning**: No independent versioning of shared code
5. **Deployment Complexity**: Shared code changes affect both applications
6. **Team Boundaries**: Harder to enforce API contracts between teams
7. **Circular Dependencies**: Risk of creating dependency cycles
8. **Tool Limitations**: Some tools may not understand this structure

### 🔄 Migration Path

If this approach becomes insufficient, we can migrate to:

1. **Npm Workspaces**: Keep monorepo but add package boundaries
2. **Dedicated Packages**: Extract shared code to separate npm packages
3. **Monorepo Tools**: Adopt Nx or Lerna for better dependency management

### 📋 Guidelines for Usage

1. **Keep Shared Code Simple**: Only DTOs and pure utility functions
2. **Avoid Business Logic**: No complex logic in shared folder
3. **Documentation**: Document all shared interfaces thoroughly
4. **Breaking Changes**: Coordinate changes that affect both applications
5. **Testing**: Test shared code in both application contexts
6. **File Organization**: Use clear naming and folder structure

### 📊 Success Metrics

- ✅ Zero type mismatches between frontend and backend
- ✅ Reduced development time for API changes
- ✅ Improved developer experience with type safety
- ✅ No runtime errors due to interface mismatches

## Related Decisions

- Future ADR: Database schema and ORM choice
- Future ADR: API versioning strategy
- Future ADR: Frontend state management approach

## References

- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Monorepo Architecture Patterns](https://monorepo.tools/)
- [ADR Template](https://github.com/joelparkerhenderson/architecture-decision-record)

---

**Decision made by**: Development Team  
**Date**: 2025-07-24
**Review date**: 2025-10-24 (3 months) 