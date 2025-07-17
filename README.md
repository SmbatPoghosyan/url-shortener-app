# URL Shortener App

A full-stack URL shortener application with a modern React frontend and robust Node.js backend API.

## 🚀 Project Overview

This application provides a complete URL shortening service with analytics, user management, and modern web technologies. The project is containerized with Docker for easy deployment and development.

## 📁 Project Structure

```
url-shortener-app/
├── frontend/              # React frontend application
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── Dockerfile        # Frontend container configuration
│   └── package.json      # Frontend dependencies
├── backend/              # Node.js/Express backend API
│   ├── src/              # Source code
│   ├── Dockerfile        # Backend container configuration
│   └── package.json      # Backend dependencies
├── docker-compose.yml    # Docker services configuration
├── .env.example         # Environment variables template
├── Makefile            # Build automation
└── Readme.md           # This file
```

## 🏗️ Applications Description

### Frontend Application

- **Technology**: React.js with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Build Tool**: Create React App with CRACO for custom configuration
- **Testing**: React Testing Library with Jest
- **Routing**: React Router DOM
- **Port**: 3200 (when running with Docker)
- **Features**:
  - URL shortening interface
  - Analytics dashboard
  - User authentication
  - Link management
  - Responsive design

### Backend Application

- **Technology**: Node.js with NestJS framework
- **Database**: PostgreSQL 15 Alpine with TypeORM
- **Authentication**: JWT-based authentication
- **Security**: Passport.js with JWT strategy, bcrypt for password hashing
- **Validation**: Class-validator and class-transformer
- **Rate Limiting**: @nestjs/throttler
- **Port**: 3000 (API server)
- **Features**:
  - RESTful API endpoints
  - URL shortening logic
  - User management
  - Analytics tracking
  - Rate limiting
  - Health checks

## 🔧 Configuration Requirements

### Environment Variables

Before running the application, you need to configure the environment variables:

1. **Copy the environment template**:

   ```bash
   cp .env.example .env
   ```
2. **Configure the following variables**:

   - `POSTGRES_USER`: Database username (default: url-shortener)
   - `POSTGRES_PASSWORD`: Database password (default: url-shortener1)
   - `POSTGRES_DB`: Database name (default: url_shortener)
   - `JWT_SECRET`: Secret key for JWT authentication (default: supersecret)
   - `REACT_APP_API_URL`: Frontend API URL (default: http://localhost:3000)
   - `PORT`: Backend server port (default: 3000)
   - `DB_HOST`: Database host (default: db for Docker, localhost for manual setup)
   - `DB_PORT`: Database port (default: 5432)

### Database Configuration

The application uses PostgreSQL as the primary database. The Docker configuration includes:

- **Database**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Health checks**: Automatic database health monitoring
- **Persistent storage**: Data persists in Docker volumes

## 🐳 Docker Setup & Running

### Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

### Running with Docker

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd url-shortener-app
   ```
2. **Configure environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env file with your configurations
   ```
3. **Build and start all services**:

   ```bash
   docker-compose up --build
   ```
4. **Run in detached mode** (background):

   ```bash
   docker-compose up -d --build
   ```
5. **Stop all services**:

   ```bash
   docker-compose down
   ```
6. **View logs**:

   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f db
   ```

### Docker Services

The application consists of three main services:

1. **Database (db)**:

   - PostgreSQL 15 Alpine
   - Port: 5432
   - Health checks enabled
   - Data persistence with volumes
2. **Backend (backend)**:

   - NestJS API server with TypeORM
   - Port: 3000
   - Depends on database health
   - Auto-restart enabled
   - Health check endpoint: /health
3. **Frontend (frontend)**:

   - React application with TypeScript
   - Port: 3200
   - Depends on backend health
   - Built with Create React App + CRACO
   - Served through Nginx in Docker

## 🛠️ Development Setup (Without Docker)

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v13 or higher)

### Manual Setup

1. **Install root dependencies**:

   ```bash
   npm install
   ```
2. **Set up database**:

   ```bash
   # Install PostgreSQL and create database
   createdb url_shortener
   ```
3. **Install and run backend**:

   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
4. **Install and run frontend**:

   ```bash
   cd frontend
   npm install
   npm start
   ```
5. **Run both with single command**:

   ```bash
   npm run dev
   ```

## 🎯 Available Scripts

### Root Level Scripts

- `npm run dev` - Run both frontend and backend in development mode
- `npm run build` - Build both applications
- `npm run install:all` - Install dependencies for all packages
- `npm run clean` - Clean all node_modules

### Make Commands

- `make setup` - Initial project setup
- `make dev` - Start development servers
- `make docker-up` - Start with Docker
- `make docker-down` - Stop Docker containers
- `make docker-build` - Build Docker images
- `make clean` - Clean dependencies

## 🌐 Application URLs

When running with Docker:

- **Frontend**: http://localhost:3200
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432

## 📊 Features

### Core Features

- ✅ URL shortening with custom aliases
- ✅ Click analytics and tracking
- ✅ User authentication and management
- ✅ Rate limiting and security

### Technical Features

- 🐳 Docker containerization with health checks
- 🔄 NestJS framework with TypeORM
- 📱 React with TypeScript
- 🎨 Tailwind CSS for modern UI
- 🔐 JWT authentication with Passport.js
- �️ Rate limiting and validation
- 📊 PostgreSQL database with TypeORM
- 🚀 Auto-restart capabilities
- 🧪 Testing with Jest and React Testing Library

## 🔍 Health Checks

The application includes comprehensive health checks:

- **Database**: PostgreSQL connection verification
- **Backend**: API endpoint health check
- **Frontend**: Nginx server status

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 3200, and 5432 are available
2. **Database connection**: Check PostgreSQL is running and accessible
3. **Environment variables**: Verify all required variables are set
4. **Docker issues**: Try `docker-compose down -v` to reset volumes

### Logs and Debugging

```bash
# Check all service logs
docker-compose logs -f

# Check specific service
docker-compose logs -f backend

# Check database logs
docker-compose logs -f db

# Restart specific service
docker-compose restart backend
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the troubleshooting section
2. Review the logs using Docker commands
3. Create an issue in the repository
4. Check the configuration files

---

**Happy coding! 🚀**
