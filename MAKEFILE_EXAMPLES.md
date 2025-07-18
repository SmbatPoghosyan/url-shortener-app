# Makefile Usage Examples

This file provides practical examples of how to use the Makefile for common development tasks.

## 🚀 Common Development Workflows

### Starting Development
```bash
# Quick start everything
make quick-start

# Start development servers separately
make dev-backend    # Terminal 1
make dev-frontend   # Terminal 2

# Start with Docker
make docker-up
```

### Testing Workflows
```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage

# Watch mode for TDD
make test-watch

# Run only backend tests
make test-backend
```

### Building & Production
```bash
# Build everything
make build

# Production setup
make prod-setup

# Start production servers
make prod-start
```

### Docker Workflows
```bash
# Full Docker workflow
make docker-build
make docker-up
make docker-logs

# Reset Docker environment
make docker-down
make docker-clean
make docker-build
make docker-up
```

### Database Management
```bash
# Start only database
make db-up

# Reset database
make db-reset

# View database logs
make db-logs
```

### Code Quality
```bash
# Lint and format code
make lint
make format

# Clean and reinstall
make clean-all
make install
```

### Health Checks
```bash
# Check if ports are available
make check-ports

# Check application health
make health
```

## 📋 Troubleshooting Commands

### When Things Go Wrong
```bash
# Clean slate restart
make clean-all
make install
make dev

# Docker clean restart
make docker-clean
make docker-build
make docker-up

# Check what's using ports
make check-ports
lsof -i :3000
lsof -i :3001
lsof -i :5432
```

### Debugging
```bash
# View all logs
make docker-logs

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## 🔧 Customization

The Makefile variables can be customized at the top of the file:
- `BACKEND_DIR` - Backend directory path
- `FRONTEND_DIR` - Frontend directory path
- `DOCKER_COMPOSE` - Docker compose command

## 📖 Getting Help

```bash
# See all available commands
make help

# View this file
cat MAKEFILE_EXAMPLES.md
```
