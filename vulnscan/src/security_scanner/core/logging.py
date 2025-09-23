"""Logging configuration and utilities."""

import logging
import logging.handlers
import sys
from pathlib import Path
from typing import Any, Dict, Optional

import structlog
from structlog.typing import FilteringBoundLogger

from .config import settings


def configure_logging() -> FilteringBoundLogger:
    """Configure structured logging for the application."""
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.logging.level.upper()),
    )
    
    # Configure structlog
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
    ]
    
    if settings.logging.format == "json":
        processors.extend([
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer()
        ])
    else:
        processors.extend([
            structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S"),
            structlog.dev.ConsoleRenderer()
        ])
    
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, settings.logging.level.upper())
        ),
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )
    
    # Set up file logging if configured
    if settings.logging.file_path:
        setup_file_logging()
    
    return structlog.get_logger()


def setup_file_logging() -> None:
    """Set up file-based logging with rotation."""
    if not settings.logging.file_path:
        return
    
    log_file = Path(settings.logging.file_path)
    log_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Create rotating file handler
    file_handler = logging.handlers.RotatingFileHandler(
        filename=log_file,
        maxBytes=settings.logging.max_file_size,
        backupCount=settings.logging.backup_count,
        encoding="utf-8"
    )
    
    # Set formatter based on format preference
    if settings.logging.format == "json":
        formatter = logging.Formatter('%(message)s')
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    file_handler.setFormatter(formatter)
    
    # Add handler to root logger
    root_logger = logging.getLogger()
    root_logger.addHandler(file_handler)


def get_logger(name: Optional[str] = None) -> FilteringBoundLogger:
    """Get a logger instance with optional name."""
    if name:
        return structlog.get_logger(name)
    return structlog.get_logger()


def log_function_call(func_name: str, **kwargs: Any) -> None:
    """Log a function call with parameters."""
    logger = get_logger()
    logger.debug("Function called", function=func_name, parameters=kwargs)


def log_error(error: Exception, context: Optional[Dict[str, Any]] = None) -> None:
    """Log an error with optional context."""
    logger = get_logger()
    log_data = {
        "error_type": type(error).__name__,
        "error_message": str(error),
    }
    if context:
        log_data.update(context)
    
    logger.error("Error occurred", **log_data, exc_info=True)