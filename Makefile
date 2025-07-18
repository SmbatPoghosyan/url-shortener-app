# URL Shortener App - Build Automation Makefile
# This Makefile provides common development tasks for both frontend and backend

# Variables
BACKEND_DIR = backend
FRONTEND_DIR = frontend
DOCKER_COMPOSE = docker-compose

# Default target
.DEFAULT_GOAL := help

# Colors for output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

##@ Help
.PHONY: help
help: ## Display available commands
	@echo "$(GREEN)URL Shortener App - Build Automation$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation
.PHONY: install install-backend install-frontend
install: install-backend install-frontend ## Install all dependencies
	@echo "$(GREEN)All dependencies installed successfully!$(NC)"

install-backend: ## Install backend dependencies
	@echo "$(YELLOW)Installing backend dependencies...$(NC)"
	cd $(BACKEND_DIR) && npm install

install-frontend: ## Install frontend dependencies
	@echo "$(YELLOW)Installing frontend dependencies...$(NC)"
	cd $(FRONTEND_DIR) && npm install

##@ Development
.PHONY: dev dev-backend dev-frontend
dev: ## Start both backend and frontend in development mode
	@echo "$(YELLOW)Starting development servers...$(NC)"
	make -j2 dev-backend dev-frontend

dev-backend: ## Start backend development server
	@echo "$(YELLOW)Starting backend development server...$(NC)"
	cd $(BACKEND_DIR) && npm run start:dev

dev-frontend: ## Start frontend development server
	@echo "$(YELLOW)Starting frontend development server...$(NC)"
	cd $(FRONTEND_DIR) && npm run dev

##@ Testing
.PHONY: test test-backend test-frontend test-coverage test-watch
test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests
	@echo "$(YELLOW)Running backend tests...$(NC)"
	cd $(BACKEND_DIR) && npm test

test-frontend: ## Run frontend tests
	@echo "$(YELLOW)Running frontend tests...$(NC)"
	cd $(FRONTEND_DIR) && npm test

test-coverage: ## Run backend tests with coverage
	@echo "$(YELLOW)Running backend tests with coverage...$(NC)"
	cd $(BACKEND_DIR) && npm run test:cov

test-watch: ## Run backend tests in watch mode
	@echo "$(YELLOW)Running backend tests in watch mode...$(NC)"
	cd $(BACKEND_DIR) && npm run test:watch

##@ Building
.PHONY: build build-backend build-frontend
build: build-backend build-frontend ## Build both backend and frontend

build-backend: ## Build backend for production
	@echo "$(YELLOW)Building backend...$(NC)"
	cd $(BACKEND_DIR) && npm run build

build-frontend: ## Build frontend for production
	@echo "$(YELLOW)Building frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm run build

##@ Docker
.PHONY: docker-build docker-up docker-down docker-logs docker-clean
docker-build: ## Build Docker containers
	@echo "$(YELLOW)Building Docker containers...$(NC)"
	$(DOCKER_COMPOSE) build

docker-up: ## Start Docker containers
	@echo "$(YELLOW)Starting Docker containers...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)Containers started! Backend: http://localhost:3000, Frontend: http://localhost:3001$(NC)"

docker-down: ## Stop Docker containers
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	$(DOCKER_COMPOSE) down

docker-logs: ## View Docker container logs
	@echo "$(YELLOW)Viewing Docker container logs...$(NC)"
	$(DOCKER_COMPOSE) logs -f

docker-clean: ## Clean Docker containers and images
	@echo "$(YELLOW)Cleaning Docker containers and images...$(NC)"
	$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans

##@ Database
.PHONY: db-up db-down db-reset db-logs
db-up: ## Start database container only
	@echo "$(YELLOW)Starting database container...$(NC)"
	$(DOCKER_COMPOSE) up -d postgres

db-down: ## Stop database container
	@echo "$(YELLOW)Stopping database container...$(NC)"
	$(DOCKER_COMPOSE) stop postgres

db-reset: ## Reset database (remove volume and restart)
	@echo "$(YELLOW)Resetting database...$(NC)"
	$(DOCKER_COMPOSE) down -v postgres
	$(DOCKER_COMPOSE) up -d postgres

db-logs: ## View database logs
	@echo "$(YELLOW)Viewing database logs...$(NC)"
	$(DOCKER_COMPOSE) logs -f postgres

##@ Linting & Formatting
.PHONY: lint lint-backend lint-frontend format format-backend format-frontend
lint: lint-backend lint-frontend ## Run linting for both projects

lint-backend: ## Run backend linting
	@echo "$(YELLOW)Running backend linting...$(NC)"
	cd $(BACKEND_DIR) && npm run lint

lint-frontend: ## Run frontend linting
	@echo "$(YELLOW)Running frontend linting...$(NC)"
	cd $(FRONTEND_DIR) && npm run lint

format: format-backend format-frontend ## Format code for both projects

format-backend: ## Format backend code
	@echo "$(YELLOW)Formatting backend code...$(NC)"
	cd $(BACKEND_DIR) && npm run format

format-frontend: ## Format frontend code
	@echo "$(YELLOW)Formatting frontend code...$(NC)"
	cd $(FRONTEND_DIR) && npm run format

##@ Cleaning
.PHONY: clean clean-backend clean-frontend clean-all
clean: clean-backend clean-frontend ## Clean build artifacts

clean-backend: ## Clean backend build artifacts
	@echo "$(YELLOW)Cleaning backend...$(NC)"
	cd $(BACKEND_DIR) && rm -rf dist node_modules/.cache

clean-frontend: ## Clean frontend build artifacts
	@echo "$(YELLOW)Cleaning frontend...$(NC)"
	cd $(FRONTEND_DIR) && rm -rf dist build .next node_modules/.cache

clean-all: clean ## Clean everything including node_modules
	@echo "$(YELLOW)Cleaning all dependencies...$(NC)"
	rm -rf $(BACKEND_DIR)/node_modules $(FRONTEND_DIR)/node_modules
	rm -rf $(BACKEND_DIR)/dist $(FRONTEND_DIR)/dist $(FRONTEND_DIR)/build

##@ Production
.PHONY: prod-setup prod-start prod-stop
prod-setup: install build ## Setup for production (install + build)
	@echo "$(GREEN)Production setup complete!$(NC)"

prod-start: ## Start production servers
	@echo "$(YELLOW)Starting production servers...$(NC)"
	cd $(BACKEND_DIR) && npm run start:prod &
	cd $(FRONTEND_DIR) && npm run preview &
	@echo "$(GREEN)Production servers started!$(NC)"

prod-stop: ## Stop production servers
	@echo "$(YELLOW)Stopping production servers...$(NC)"
	pkill -f "npm run start:prod" || true
	pkill -f "npm run preview" || true

##@ Health Checks
.PHONY: health health-backend health-frontend
health: health-backend health-frontend ## Check health of all services

health-backend: ## Check backend health
	@echo "$(YELLOW)Checking backend health...$(NC)"
	@curl -f http://localhost:3000/health || echo "$(RED)Backend is not responding$(NC)"

health-frontend: ## Check frontend health
	@echo "$(YELLOW)Checking frontend health...$(NC)"
	@curl -f http://localhost:3001 || echo "$(RED)Frontend is not responding$(NC)"

##@ Quick Commands
.PHONY: quick-start quick-test quick-build
quick-start: install dev ## Quick start (install + dev)

quick-test: install test ## Quick test (install + test)

quick-build: install build ## Quick build (install + build)

##@ Utilities
.PHONY: logs-backend logs-frontend check-ports
logs-backend: ## View backend logs (if running)
	@echo "$(YELLOW)Backend logs:$(NC)"
	cd $(BACKEND_DIR) && npm run start:dev 2>&1 | tail -f

logs-frontend: ## View frontend logs (if running)
	@echo "$(YELLOW)Frontend logs:$(NC)"
	cd $(FRONTEND_DIR) && npm run dev 2>&1 | tail -f

check-ports: ## Check if required ports are available
	@echo "$(YELLOW)Checking required ports...$(NC)"
	@lsof -i :3000 && echo "$(RED)Port 3000 is in use$(NC)" || echo "$(GREEN)Port 3000 is available$(NC)"
	@lsof -i :3001 && echo "$(RED)Port 3001 is in use$(NC)" || echo "$(GREEN)Port 3001 is available$(NC)"
	@lsof -i :5432 && echo "$(RED)Port 5432 is in use$(NC)" || echo "$(GREEN)Port 5432 is available$(NC)"
