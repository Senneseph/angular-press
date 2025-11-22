# Angular Press

A modern WordPress alternative built entirely with **Angular 20** and **server-side TypeScript** (NestJS), replacing PHP with a fully TypeScript-based architecture.

## 🚀 Features

- **100% TypeScript** - Both frontend and backend
- **WordPress-Compatible Database** - Uses WordPress schema for easy migration
- **Modern Architecture** - Angular 19 with standalone components + NestJS backend
- **JWT Authentication** - Secure token-based authentication
- **NGXS State Management** - Predictable state container
- **RESTful API** - Clean, well-documented API endpoints
- **Docker Support** - Easy deployment with Docker Compose
- **100% Test Coverage Goal** - Comprehensive testing with Jasmine/Karma

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Development](#development)
- [Docker Deployment](#docker-deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)

## 🏃 Quick Start

### Option 1: Docker (Recommended)

```bash
# Start everything (MySQL + API + Frontend)
docker compose -f docker-compose.dev.yml up --build

# Access the application
# Frontend: http://localhost:4200
# API: http://localhost:3000
# MySQL: localhost:3306
```

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed Docker instructions.

### Option 2: Local Development

**Prerequisites:**
- Node.js 18+
- MySQL 8.0+
- npm or yarn

**1. Setup MySQL Database**
```bash
mysql -u root -p
CREATE DATABASE angular_press CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**2. Start the API**
```bash
cd angular-press-api
npm install
cp .env.example .env  # Update with your MySQL credentials
npm run start:dev
```

**3. Start the Frontend**
```bash
cd angular-press
npm install
npm start
```

**4. Access the Application**
- Frontend: http://localhost:4200
- API: http://localhost:3000/api

### Option 3: PowerShell Scripts (Windows)

```powershell
# With Docker
.\start-docker.ps1

# Without Docker (requires local MySQL)
.\start-local.ps1
```

## 🏗️ Architecture

### Frontend (Angular 19.2.0)
- **Framework**: Angular 19 with standalone components
- **State Management**: NGXS
- **Styling**: CSS with modern design
- **Routing**: Angular Router with lazy loading
- **HTTP**: HttpClient with interceptors

### Backend (NestJS)
- **Framework**: NestJS (TypeScript)
- **Database**: TypeORM with MySQL
- **Authentication**: JWT with Passport
- **Validation**: class-validator
- **API**: RESTful with versioning support

### Database
- **Engine**: MySQL 8.0
- **Schema**: WordPress-compatible tables
  - `wp_users` - User accounts
  - `wp_posts` - Posts and pages
  - `wp_terms` - Categories and tags
  - `wp_term_taxonomy` - Taxonomy relationships
  - `wp_term_relationships` - Post-term associations

## 💻 Development

### Project Structure

```
wp-angular-app/
├── angular-press/          # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # UI components
│   │   │   ├── core/           # Core services & models
│   │   │   ├── features/       # Feature modules
│   │   │   ├── services/       # Business logic services
│   │   │   └── store/          # NGXS state management
│   │   └── environments/       # Environment configs
│   ├── Dockerfile
│   └── package.json
│
├── angular-press-api/      # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── posts/          # Posts module
│   │   ├── entities/       # TypeORM entities
│   │   ├── app.module.ts   # Main application module
│   │   └── main.ts         # Application entry point
│   ├── scripts/            # Database scripts
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
└── README.md
```

### Running Tests

**Frontend Tests**
```bash
cd angular-press
npm test                    # Run tests
npm run test:coverage       # Run with coverage
```

**Backend Tests**
```bash
cd angular-press-api
npm test                    # Run tests
npm run test:cov            # Run with coverage
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## 🐳 Docker Deployment

### Development
```bash
docker compose -f docker-compose.dev.yml up --build
```

### Production
```bash
docker compose up --build -d
```

### Useful Commands
```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Clean everything
docker compose down -v
docker system prune -a
```

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for comprehensive Docker documentation.

## 📚 API Documentation

### Authentication

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john",
  "password": "password123"
}
```

**Get Current User**
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Posts

**List Posts**
```http
GET /api/posts?page=1&limit=10&status=published
```

**Get Post**
```http
GET /api/posts/:id
```

**Create Post**
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Post",
  "content": "<p>Content here</p>",
  "status": "published"
}
```

**Update Post**
```http
PATCH /api/posts/:id
Authorization: Bearer <token>
```

**Delete Post**
```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

See [angular-press-api/API_SETUP.md](angular-press-api/API_SETUP.md) for complete API documentation.

## 🧪 Testing

The project aims for 100% code coverage.

**Current Coverage:**
- Frontend: ~76% (working towards 100%)
- Backend: TBD

**Run All Tests:**
```bash
# Frontend
cd angular-press && npm test

# Backend
cd angular-press-api && npm test
```

## 🔧 Configuration

### Environment Variables

**API (.env)**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=angular_press
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
PORT=3000
CORS_ORIGIN=http://localhost:4200
```

**Frontend (environment.ts)**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## 📖 Additional Documentation

- [Build Specification](BuildSpec.md) - Detailed project requirements
- [Docker Setup Guide](DOCKER_SETUP.md) - Comprehensive Docker documentation
- [API Setup Guide](angular-press-api/API_SETUP.md) - Backend API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Angular](https://angular.io/)
- Backend powered by [NestJS](https://nestjs.com/)
- Inspired by [WordPress](https://wordpress.org/)

## 📞 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with details

---

**Built with ❤️ using TypeScript**

