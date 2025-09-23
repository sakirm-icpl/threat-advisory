"""Database configuration and connection management."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings
from .exceptions import DatabaseError
from .logging import get_logger

logger = get_logger(__name__)


class Base(DeclarativeBase):
    """Base class for all database models."""
    
    metadata = MetaData(
        naming_convention={
            "ix": "ix_%(column_0_label)s",
            "uq": "uq_%(table_name)s_%(column_0_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            "pk": "pk_%(table_name)s"
        }
    )


class DatabaseManager:
    """Manages database connections and sessions."""
    
    def __init__(self) -> None:
        self._engine = None
        self._async_engine = None
        self._session_factory = None
        self._async_session_factory = None
    
    def initialize(self) -> None:
        """Initialize database connections."""
        try:
            # Synchronous engine for migrations and admin tasks
            self._engine = create_engine(
                settings.database.url,
                echo=settings.debug,
                pool_pre_ping=True,
                pool_recycle=3600,
            )
            
            # Async engine for application use
            async_url = settings.database.url.replace("postgresql://", "postgresql+asyncpg://")
            self._async_engine = create_async_engine(
                async_url,
                echo=settings.debug,
                pool_pre_ping=True,
                pool_recycle=3600,
            )
            
            # Session factories
            self._session_factory = sessionmaker(
                bind=self._engine,
                expire_on_commit=False
            )
            
            self._async_session_factory = async_sessionmaker(
                bind=self._async_engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            logger.info("Database connections initialized")
            
        except Exception as e:
            logger.error("Failed to initialize database connections", error=str(e))
            raise DatabaseError(f"Database initialization failed: {e}")
    
    @property
    def engine(self):
        """Get the synchronous database engine."""
        if self._engine is None:
            raise DatabaseError("Database not initialized")
        return self._engine
    
    @property
    def async_engine(self):
        """Get the asynchronous database engine."""
        if self._async_engine is None:
            raise DatabaseError("Database not initialized")
        return self._async_engine
    
    def get_session(self):
        """Get a synchronous database session."""
        if self._session_factory is None:
            raise DatabaseError("Database not initialized")
        return self._session_factory()
    
    @asynccontextmanager
    async def get_async_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get an asynchronous database session."""
        if self._async_session_factory is None:
            raise DatabaseError("Database not initialized")
        
        async with self._async_session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    async def close(self) -> None:
        """Close database connections."""
        if self._async_engine:
            await self._async_engine.dispose()
        if self._engine:
            self._engine.dispose()
        
        logger.info("Database connections closed")


# Global database manager instance
db_manager = DatabaseManager()


# Dependency for FastAPI
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session in FastAPI endpoints."""
    async with db_manager.get_async_session() as session:
        yield session