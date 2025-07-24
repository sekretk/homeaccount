# 🏠 HomeAccount - Full-Stack Application

A modern full-stack home accounting application built with **React**, **NestJS**, and **TypeScript** using a simple shared folder approach for type safety across frontend and backend.

## 🏗️ Current State

This is a **working prototype** demonstrating:
- ✅ **Shared TypeScript types** between frontend and backend
- ✅ **NestJS backend** with REST API endpoint
- ✅ **React frontend** with loading states and error handling
- ✅ **Complete test suite** (unit + E2E tests)
- ✅ **Type-safe communication** using shared DTOs

## 📁 Project Structure

```
homeaccount/
├── shared/
│   └── dto.ts                     # Shared TypeScript interfaces
├── backend/                       # NestJS API Server
│   ├── package.json              
│   ├── tsconfig.json              # Includes "../shared/**/*"
│   ├── jest.config.js             # Jest unit test config
│   ├── src/
│   │   ├── main.ts               # Server bootstrap (port 3001)
│   │   ├── app.module.ts         # NestJS module
│   │   ├── app.controller.ts     # API endpoints
│   │   └── app.controller.spec.ts # Unit tests
│   └── test/
│       ├── jest-e2e.json         # E2E test config
│       └── app.e2e-spec.ts       # E2E tests
└── frontend/                      # React Web App
    ├── package.json              
    ├── tsconfig.json              # Includes "../shared" 
    ├── vite.config.ts             # Vite config (port 3000)
    ├── index.html                
    └── src/
        ├── main.tsx              # React entry point
        └── App.tsx               # Main app component
```

## 🚀 Tech Stack

### Backend (NestJS)
- **Framework**: NestJS with Express
- **Language**: TypeScript
- **Testing**: Jest (unit + E2E tests)
- **Port**: 3001
- **Docker**: Multi-stage build with Alpine Linux

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Port**: 3000
- **Docker**: Nginx-served static build

### Shared Code
- **Types**: Shared TypeScript interfaces in `/shared/dto.ts`
- **Integration**: Both apps include shared folder in `tsconfig.json`

### Docker Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose with health checks
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

#### Option 3: Test Backend Only
```bash
cd backend
npm run dev

# Test the API directly
curl http://localhost:3001/current-data
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
  "currentTime": "2024-01-15T10:30:45.123Z",
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

## 📚 Documentation

For detailed technical documentation and architectural decisions:

- **[📁 Documentation Directory](./docs/README.md)** - Complete documentation index
- **[🏗️ Architecture Decisions](./docs/adr/README.md)** - ADRs documenting key decisions
- **[📋 ADR-000: Shared Folder Approach](./docs/adr/000-shared-folder-for-types-and-utilities.md)** - Why we chose shared folder for types

## 📄 License

This project is available under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎉 Status: Working prototype with shared TypeScript types and full-stack communication!** 