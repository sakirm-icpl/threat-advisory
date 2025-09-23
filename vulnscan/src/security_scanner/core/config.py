from pathlib import Path
from dotenv import load_dotenv
load_dotenv(dotenv_path=str(Path(__file__).parent.parent.parent / ".env"))
"""Configuration management for the security scanner platform."""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from pydantic_settings import BaseSettings
from pydantic import Field, validator


class DatabaseConfig(BaseSettings):
    """Database configuration settings."""
    
    host: str = Field(default="localhost", env="DB_HOST")
    port: int = Field(default=5432, env="DB_PORT")
    name: str = Field(default="security_scanner", env="DB_NAME")
    user: str = Field(default="scanner", env="DB_USER")
    password: str = Field(default="", env="DB_PASSWORD")
    
    @property
    def url(self) -> str:
        """Get the database URL."""
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"


class RedisConfig(BaseSettings):
    """Redis configuration settings."""
    
    host: str = Field(default="localhost", env="REDIS_HOST")
    port: int = Field(default=6379, env="REDIS_PORT")
    db: int = Field(default=0, env="REDIS_DB")
    password: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    
    @property
    def url(self) -> str:
        """Get the Redis URL."""
        auth = f":{self.password}@" if self.password else ""
        return f"redis://{auth}{self.host}:{self.port}/{self.db}"


class SecurityConfig(BaseSettings):
    """Security configuration settings."""
    
    secret_key: str = Field(env="SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=30, env="JWT_EXPIRE_MINUTES")
    
    @validator("secret_key")
    def validate_secret_key(cls, v: str) -> str:
        """Validate that secret key is provided."""
        if not v:
            raise ValueError("SECRET_KEY must be provided")
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v


class ScanConfig(BaseSettings):
    """Scanning configuration settings."""
    
    nmap_path: str = Field(default="nmap", env="NMAP_PATH")
    max_concurrent_scans: int = Field(default=5, env="MAX_CONCURRENT_SCANS")
    default_timeout: int = Field(default=300, env="DEFAULT_TIMEOUT")
    max_hosts_per_scan: int = Field(default=1000, env="MAX_HOSTS_PER_SCAN")
    
    # CVE Data Sources
    nvd_api_key: Optional[str] = Field(default=None, env="NVD_API_KEY")
    vulners_api_key: Optional[str] = Field(default=None, env="VULNERS_API_KEY")
    
    # Rate limiting
    api_rate_limit: int = Field(default=100, env="API_RATE_LIMIT")  # requests per minute


class LoggingConfig(BaseSettings):
    """Logging configuration settings."""
    
    level: str = Field(default="INFO", env="LOG_LEVEL")
    format: str = Field(default="json", env="LOG_FORMAT")  # json or text
    file_path: Optional[str] = Field(default=None, env="LOG_FILE_PATH")
    max_file_size: int = Field(default=10485760, env="LOG_MAX_FILE_SIZE")  # 10MB
    backup_count: int = Field(default=5, env="LOG_BACKUP_COUNT")


class Settings(BaseSettings):
    """Main application settings."""
    
    # Application
    app_name: str = Field(default="Security Scanner Platform")
    debug: bool = Field(default=False, env="DEBUG")
    environment: str = Field(default="development", env="ENVIRONMENT")
    
    # API
    api_host: str = Field(default="0.0.0.0", env="API_HOST")
    api_port: int = Field(default=8000, env="API_PORT")
    api_workers: int = Field(default=1, env="API_WORKERS")
    
    # Component configs
    database: DatabaseConfig = DatabaseConfig()
    redis: RedisConfig = RedisConfig()
    security: SecurityConfig = SecurityConfig()
    scanning: ScanConfig = ScanConfig()
    logging: LoggingConfig = LoggingConfig()
    
    # Directories
    data_dir: Path = Field(default=Path("data"))
    reports_dir: Path = Field(default=Path("reports"))
    patterns_dir: Path = Field(default=Path("patterns"))
    
    class Config:
        # Always load .env from the project root
        env_file = str(Path(__file__).parent.parent.parent / ".env")
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        # Create directories if they don't exist
        self.data_dir.mkdir(exist_ok=True)
        self.reports_dir.mkdir(exist_ok=True)
        self.patterns_dir.mkdir(exist_ok=True)


# Global settings instance
settings = Settings()