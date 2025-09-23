# Security Scanner Platform Makefile

.PHONY: help install install-dev test test-cov lint format type-check clean build run-api run-cli

# Default target
help:
	@echo "Available targets:"
	@echo "  install      - Install production dependencies"
	@echo "  install-dev  - Install development dependencies"
	@echo "  test         - Run tests"
	@echo "  test-cov     - Run tests with coverage"
	@echo "  lint         - Run linting (flake8)"
	@echo "  format       - Format code (black, isort)"
	@echo "  type-check   - Run type checking (mypy)"
	@echo "  clean        - Clean build artifacts"
	@echo "  build        - Build package"
	@echo "  run-api      - Run API server"
	@echo "  run-cli      - Run CLI help"

# Installation
install:
	pip install -e .

install-dev:
	pip install -e ".[dev,test]"
	pre-commit install

# Testing
test:
	pytest

test-cov:
	pytest --cov=security_scanner --cov-report=html --cov-report=term

# Code quality
lint:
	flake8 src tests

format:
	black src tests
	isort src tests

type-check:
	mypy src

# Cleanup
clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	rm -rf .pytest_cache/
	rm -rf .coverage
	rm -rf htmlcov/
	find . -type d -name __pycache__ -delete
	find . -type f -name "*.pyc" -delete

# Build
build: clean
	python -m build

# Run
run-api:
	python -m security_scanner.cli.main server start-api

run-cli:
	python -m security_scanner.cli.main --help

# Development database setup (requires Docker)
db-start:
	docker run -d --name security-scanner-db \
		-e POSTGRES_DB=security_scanner \
		-e POSTGRES_USER=scanner \
		-e POSTGRES_PASSWORD=scanner123 \
		-p 5432:5432 \
		postgres:15

db-stop:
	docker stop security-scanner-db
	docker rm security-scanner-db

# Redis setup (requires Docker)
redis-start:
	docker run -d --name security-scanner-redis \
		-p 6379:6379 \
		redis:7-alpine

redis-stop:
	docker stop security-scanner-redis
	docker rm security-scanner-redis

# Full development environment
dev-start: db-start redis-start
	@echo "Development environment started"
	@echo "Database: postgresql://scanner:scanner123@localhost:5432/security_scanner"
	@echo "Redis: redis://localhost:6379/0"

dev-stop: db-stop redis-stop
	@echo "Development environment stopped"