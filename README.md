# 🏠 HomeAccount - Full-Stack Application

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/homeaccount/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/homeaccount/actions/workflows/ci.yml)
[![Status Check](https://github.com/YOUR_USERNAME/homeaccount/actions/workflows/status.yml/badge.svg)](https://github.com/YOUR_USERNAME/homeaccount/actions/workflows/status.yml)
[![Docker](https://img.shields.io/badge/docker-supported-blue)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/typescript-shared%20types-blue)](https://www.typescriptlang.org/)

A modern full-stack home accounting application built with **React**, **NestJS**, and **TypeScript** using a simple shared folder approach for type safety across frontend and backend.

## 🏗️ Current State

This is a **working prototype** demonstrating:
- ✅ **Shared TypeScript types** between frontend and backend
- ✅ **NestJS backend** with REST API endpoint
- ✅ **React frontend** with loading states and error handling
- ✅ **Complete test suite** (unit + E2E tests)
- ✅ **Type-safe communication** using shared DTOs



## 🔗 API Routing Architecture

### Development Mode
- **Backend**: Runs on `http://localhost:3001`
- **Frontend**: Runs on `http://localhost:3000` with Vite dev server
- **API Proxy**: Vite proxies `/api/*` → `http://localhost:3001/*`
- **Frontend calls**: `/api/current-data` → Backend receives `/current-data`

### Docker Mode
- **Backend**: Internal container communication (no external port)
- **Frontend**: Runs on `http://localhost:3000` with Nginx
- **API Proxy**: Nginx proxies `/api/*` → `http://backend:3001/*`
- **External Access**: Only frontend port 3000 is exposed

## 🚀 Tech Stack

### Backend (NestJS)
- **Framework**: NestJS with Express
- **Language**: TypeScript
- **Database**: PostgreSQL 15 with auto-migrations on startup
- **Testing**: Jest (unit + E2E tests)
- **Port**: 3001
- **Docker**: Multi-stage build with Alpine Linux

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Port**: 3000
- **Docker**: Nginx-served static build

### Database (PostgreSQL)
- **Engine**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Auto-Migrations**: Runs on backend startup (configurable)
- **Data Persistence**: Docker volume with initialization scripts
- **Sample Data**: Pre-loaded test data for development
- **Management**: Built-in CLI tools and migration system

### Shared Code
- **Types**: Shared TypeScript interfaces in `/shared/dto.ts` and `/shared/migration.dto.ts`
- **DTOs**: CurrentDataDto, MigrationStatusDto, VersionResponseDto, and more
- **Integration**: Both apps include shared folder in `tsconfig.json`

### Docker Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose with health checks and service dependencies
- **Networking**: Custom bridge network for service communication
- **Security**: Non-root users, security headers, optimized images

## 🎯 Current Features

### 📡 **API Endpoint**
- `GET /current-data` - Returns current timestamp and message

### 🌐 **Frontend Features**
- Loading state with spinner
- Error handling for backend connectivity
- Displays data from backend using shared types
- Real-time API communication

### 🧪 **Testing**
- **Unit Tests**: Controller logic validation
- **E2E Tests**: Full HTTP endpoint testing
- **Type Safety**: Shared DTO validation in tests

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

The project includes comprehensive CI/CD pipelines that automatically:

#### 🚀 **Main CI Pipeline** (`.github/workflows/ci.yml`)
Triggers on: `push` to `main`/`develop`, `pull_request`

**Pipeline Stages:**
1. **✅ Validate Shared Types** - Ensures shared TypeScript compiles correctly
2. **🏗️ Backend Build & Test** - NestJS build, unit tests, E2E tests (Node 18 & 20)
3. **⚛️ Frontend Build & Test** - React build, type checking (Node 18 & 20)
4. **📦 Docker Build & Test** - Build and test Docker images
5. **🔗 Integration Tests** - Full-stack testing via docker-compose
6. **📊 Build Summary** - Comprehensive status report

#### ⚡ **PR Validation** (`.github/workflows/pr-check.yml`)
Triggers on: `pull_request` events (fast feedback for PRs)

**Fast Checks:**
- **🔍 Quick Validation** - Shared types, backend build/test, frontend build
- **🛡️ Security & Quality** - Basic secret scanning, project structure validation
- **🏷️ Auto Labeling** - Automatically labels PRs based on changed files

#### 🏥 **Status Check** (`.github/workflows/status.yml`)
Triggers: `schedule` (every 6 hours), `manual`

- Quick project structure validation
- Shared types compilation check
- Configuration files presence

### CI Features
- **Matrix builds** on Node.js 18 & 20
- **Docker validation** with health checks
- **Integration testing** with full stack
- **Artifact uploads** (coverage, build outputs, Docker images)
- **Dependency caching** for faster builds
- **Comprehensive logging** with failure diagnostics

### 🚀 Quick PR Setup

After pushing to GitHub, set up branch protection:

1. **Go to Settings → Branches**
2. **Add rule** for `main` branch
3. **Enable "Require status checks to pass before merging"**
4. **Select these required checks:**
   - `Quick Validation`
   - `Security & Quality`
5. **Enable "Require pull request before merging"**

📋 **For detailed setup**: See [GitHub Setup Guide](./docs/github-setup.md)

## 📦 Getting Started

### Prerequisites
- Node.js 16+ (recommended: Node 18+)
- npm 8+

### 🔧 Installation & Setup

**1. Install Backend Dependencies:**
```bash
cd backend
npm install
```

**2. Install Frontend Dependencies:**
```bash
cd frontend
npm install
```

### 🚀 Running the Application

#### Option 1: Docker (Recommended for Production)

**Prerequisites:**
- Docker and Docker Compose installed

**Quick Start:**
```bash
# Build and start all services
./docker-scripts.sh up

# Or manually with docker compose
docker compose up -d
```

**Docker Helper Commands:**
```bash
./docker-scripts.sh build       # Build all images
./docker-scripts.sh up          # Start services
./docker-scripts.sh down        # Stop services
./docker-scripts.sh logs        # View logs
./docker-scripts.sh status      # Check status
./docker-scripts.sh help        # Show all commands
```

**Database Management:**
```bash
./docker-scripts.sh db-start    # Start PostgreSQL database only
./docker-scripts.sh db-stop     # Stop database service
./docker-scripts.sh db-logs     # Show database logs
./docker-scripts.sh db-shell    # Connect to PostgreSQL shell
./docker-scripts.sh db-reset    # Reset database (deletes all data!)

# Or from backend directory:
cd backend
npm run db:start                 # Start database
npm run db:shell                 # Connect to database
npm run db:logs                  # View database logs
```

#### Option 2: Development Mode

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```
*Server will start on http://localhost:3001*

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```
*React app will start on http://localhost:3000*
*Vite proxy will forward `/api/*` requests to backend on localhost:3001*

#### Option 3: Test Backend Only
```bash
cd backend
npm run dev

# Test the API directly (choose one):
curl http://localhost:3001/current-data  # Direct backend
curl http://localhost:3000/api/current-data  # Via frontend proxy (if frontend is running)

# Check migration status and version
curl http://localhost:3001/version         # Version info
curl http://localhost:3001/migrations      # Detailed migration status
```

### 🧪 Running Tests

**Unit Tests:**
```bash
cd backend
npm test
```

**E2E Tests:**
```bash
cd backend
npm run test:e2e
```

## 🔗 API Documentation

### Endpoints

#### `GET /current-data`
Returns current server time and a message.

**Response:**
```json
{
  "currentTime": "2025-01-15T10:30:45.123Z",
  "message": "Hello from NestJS backend!"
}
```

**TypeScript Interface:**
```typescript
interface CurrentDataDto {
  currentTime: string;
  message: string;
}
```

## 🛠️ How Shared Types Work

Both applications include the shared folder in their TypeScript configuration:

**Backend (`backend/tsconfig.json`):**
```json
{
  "include": ["src/**/*", "../shared/**/*"]
}
```

**Frontend (`frontend/tsconfig.json`):**
```json
{
  "include": ["src", "../shared"]
}
```

This allows both apps to import and use the same types:

```typescript
// Backend
import { CurrentDataDto } from '../../shared/dto';

// Frontend  
import { CurrentDataDto } from '../../shared/dto';
```

## 📱 User Experience

1. **Visit http://localhost:3000**
2. **Loading State**: Shows "⏳ Loading data from backend..."
3. **Success**: Displays current time and message from backend
4. **Error Handling**: Shows helpful error if backend is down

## 🎯 Next Steps

This prototype provides the foundation for a full home accounting app. Potential next features:

- 🗄️ **Database Integration** (PostgreSQL with TypeORM)
- 🔐 **User Authentication** (JWT tokens)
- 💰 **Account Management** (checking, savings, credit accounts)
- 📊 **Transaction Tracking** (income, expenses, transfers)
- 📈 **Categories & Budgets** (spending analysis)
- 📱 **Responsive Design** (mobile-friendly UI)
- 🔒 **Input Validation** (class-validator DTOs)
- 📋 **API Documentation** (Swagger/OpenAPI)

## 🧪 Test Coverage

- ✅ **Controller Unit Tests**: 4 test scenarios
- ✅ **E2E Integration Tests**: 6 test scenarios  
- ✅ **DTO Structure Validation**
- ✅ **Timestamp Format Validation**
- ✅ **Error Handling Tests**

## 🤝 Development Workflow

1. **Shared Types**: Define interfaces in `/shared/dto.ts`
2. **Backend**: Use shared types in controllers and services
3. **Frontend**: Use same shared types for API calls
4. **Testing**: Test both apps with shared type validation
5. **Type Safety**: TypeScript ensures consistency across stack

### 🔄 CI/CD Integration

When you push code or create a pull request:

1. **✅ Shared Types** - Validated for compilation errors
2. **🏗️ Backend Pipeline** - Build, unit tests, E2E tests (Node 18 & 20)
3. **⚛️ Frontend Pipeline** - Build, type checking (Node 18 & 20)
4. **📦 Docker Testing** - Build and validate Docker images
5. **🔗 Integration Tests** - Full-stack testing with docker-compose
6. **📊 Status Report** - Comprehensive build summary

All checks must pass before merging to ensure code quality and compatibility.

## 📚 Documentation

For detailed technical documentation and architectural decisions:

- **[📁 Documentation Directory](./docs/README.md)** - Complete documentation index
- **[🔒 GitHub Setup Guide](./docs/github-setup.md)** - Branch protection and PR checks setup
- **[🏗️ Architecture Decisions](./docs/adr/README.md)** - ADRs documenting key decisions

## 📄 License

This project is available under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎉 Status: Working prototype with shared TypeScript types and full-stack communication!** 