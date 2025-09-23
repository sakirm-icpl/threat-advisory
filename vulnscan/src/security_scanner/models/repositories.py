"""Repository pattern implementations for data access."""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any, Generic, TypeVar
from uuid import UUID
from datetime import datetime

from sqlalchemy import select, update, delete, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from .database import (
    ScanModel, HostModel, PortModel, ServiceModel, 
    SoftwareModel, VulnerabilityModel, ScanErrorModel, ReportModel
)
from .enums import ScanType, ScanStatus, Severity, ScanSource
from ..core.exceptions import ResourceNotFoundError, DatabaseError

# Generic type for repository models
T = TypeVar('T')


class BaseRepository(Generic[T], ABC):
    """Base repository with common CRUD operations."""
    
    def __init__(self, session: AsyncSession, model_class: type[T]):
        self.session = session
        self.model_class = model_class
    
    async def create(self, **kwargs) -> T:
        """Create a new record."""
        try:
            instance = self.model_class(**kwargs)
            self.session.add(instance)
            await self.session.flush()
            await self.session.refresh(instance)
            return instance
        except Exception as e:
            raise DatabaseError(f"Failed to create {self.model_class.__name__}: {e}")
    
    async def get_by_id(self, id_value: Any) -> Optional[T]:
        """Get record by ID."""
        try:
            result = await self.session.execute(
                select(self.model_class).where(self.model_class.id == id_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            raise DatabaseError(f"Failed to get {self.model_class.__name__} by ID: {e}")
    
    async def get_all(self, limit: int = 100, offset: int = 0) -> List[T]:
        """Get all records with pagination."""
        try:
            result = await self.session.execute(
                select(self.model_class).limit(limit).offset(offset)
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get all {self.model_class.__name__}: {e}")
    
    async def update(self, id_value: Any, **kwargs) -> Optional[T]:
        """Update record by ID."""
        try:
            await self.session.execute(
                update(self.model_class)
                .where(self.model_class.id == id_value)
                .values(**kwargs)
            )
            return await self.get_by_id(id_value)
        except Exception as e:
            raise DatabaseError(f"Failed to update {self.model_class.__name__}: {e}")
    
    async def delete(self, id_value: Any) -> bool:
        """Delete record by ID."""
        try:
            result = await self.session.execute(
                delete(self.model_class).where(self.model_class.id == id_value)
            )
            return result.rowcount > 0
        except Exception as e:
            raise DatabaseError(f"Failed to delete {self.model_class.__name__}: {e}")
    
    async def count(self) -> int:
        """Count total records."""
        try:
            result = await self.session.execute(
                select(func.count(self.model_class.id))
            )
            return result.scalar() or 0
        except Exception as e:
            raise DatabaseError(f"Failed to count {self.model_class.__name__}: {e}")


class ScanRepository(BaseRepository[ScanModel]):
    """Repository for scan operations."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, ScanModel)
    
    async def get_with_hosts(self, scan_id: UUID) -> Optional[ScanModel]:
        """Get scan with all related hosts."""
        try:
            result = await self.session.execute(
                select(ScanModel)
                .options(
                    selectinload(ScanModel.hosts)
                    .selectinload(HostModel.ports),
                    selectinload(ScanModel.hosts)
                    .selectinload(HostModel.services),
                    selectinload(ScanModel.hosts)
                    .selectinload(HostModel.software)
                    .selectinload(SoftwareModel.vulnerabilities)
                )
                .where(ScanModel.id == scan_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            raise DatabaseError(f"Failed to get scan with hosts: {e}")
    
    async def get_by_status(self, status: ScanStatus, limit: int = 100) -> List[ScanModel]:
        """Get scans by status."""
        try:
            result = await self.session.execute(
                select(ScanModel)
                .where(ScanModel.status == status)
                .order_by(ScanModel.created_at.desc())
                .limit(limit)
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get scans by status: {e}")
    
    async def get_by_type(self, scan_type: ScanType, limit: int = 100) -> List[ScanModel]:
        """Get scans by type."""
        try:
            result = await self.session.execute(
                select(ScanModel)
                .where(ScanModel.scan_type == scan_type)
                .order_by(ScanModel.created_at.desc())
                .limit(limit)
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get scans by type: {e}")
    
    async def get_recent(self, days: int = 7, limit: int = 100) -> List[ScanModel]:
        """Get recent scans within specified days."""
        try:
            cutoff_date = datetime.utcnow() - datetime.timedelta(days=days)
            result = await self.session.execute(
                select(ScanModel)
                .where(ScanModel.created_at >= cutoff_date)
                .order_by(ScanModel.created_at.desc())
                .limit(limit)
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get recent scans: {e}")
    
    async def update_status(self, scan_id: UUID, status: ScanStatus) -> bool:
        """Update scan status."""
        try:
            update_data = {"status": status}
            if status == ScanStatus.RUNNING:
                update_data["started_at"] = datetime.utcnow()
            elif status in [ScanStatus.COMPLETED, ScanStatus.FAILED, ScanStatus.CANCELLED]:
                update_data["completed_at"] = datetime.utcnow()
            
            result = await self.session.execute(
                update(ScanModel)
                .where(ScanModel.id == scan_id)
                .values(**update_data)
            )
            return result.rowcount > 0
        except Exception as e:
            raise DatabaseError(f"Failed to update scan status: {e}")


class HostRepository(BaseRepository[HostModel]):
    """Repository for host operations."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, HostModel)
    
    async def get_by_ip(self, ip_address: str) -> List[HostModel]:
        """Get hosts by IP address across all scans."""
        try:
            result = await self.session.execute(
                select(HostModel)
                .where(HostModel.ip_address == ip_address)
                .order_by(HostModel.discovered_at.desc())
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get hosts by IP: {e}")
    
    async def get_by_scan(self, scan_id: UUID) -> List[HostModel]:
        """Get all hosts for a specific scan."""
        try:
            result = await self.session.execute(
                select(HostModel)
                .options(
                    selectinload(HostModel.ports),
                    selectinload(HostModel.services),
                    selectinload(HostModel.software)
                    .selectinload(SoftwareModel.vulnerabilities)
                )
                .where(HostModel.scan_id == scan_id)
                .order_by(HostModel.ip_address)
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get hosts by scan: {e}")
    
    async def get_with_vulnerabilities(self, scan_id: UUID) -> List[HostModel]:
        """Get hosts with vulnerabilities for a specific scan."""
        try:
            result = await self.session.execute(
                select(HostModel)
                .join(SoftwareModel)
                .join(SoftwareModel.vulnerabilities)
                .options(
                    selectinload(HostModel.software)
                    .selectinload(SoftwareModel.vulnerabilities)
                )
                .where(HostModel.scan_id == scan_id)
                .distinct()
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get hosts with vulnerabilities: {e}")
    
    async def search_by_hostname(self, hostname_pattern: str) -> List[HostModel]:
        """Search hosts by hostname pattern."""
        try:
            result = await self.session.execute(
                select(HostModel)
                .where(HostModel.hostname.ilike(f"%{hostname_pattern}%"))
                .order_by(HostModel.discovered_at.desc())
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to search hosts by hostname: {e}")


class SoftwareRepository(BaseRepository[SoftwareModel]):
    """Repository for software operations."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, SoftwareModel)
    
    async def get_by_vendor_product(self, vendor: str, product: str) -> List[SoftwareModel]:
        """Get software by vendor and product."""
        try:
            result = await self.session.execute(
                select(SoftwareModel)
                .where(
                    and_(
                        SoftwareModel.vendor == vendor,
                        SoftwareModel.product == product
                    )
                )
                .options(selectinload(SoftwareModel.vulnerabilities))
                .order_by(SoftwareModel.version)
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get software by vendor/product: {e}")
    
    async def get_with_vulnerabilities(self, severity: Optional[Severity] = None) -> List[SoftwareModel]:
        """Get software with vulnerabilities, optionally filtered by severity."""
        try:
            query = (
                select(SoftwareModel)
                .join(SoftwareModel.vulnerabilities)
                .options(selectinload(SoftwareModel.vulnerabilities))
                .distinct()
            )
            
            if severity:
                query = query.where(VulnerabilityModel.severity == severity)
            
            result = await self.session.execute(query)
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get software with vulnerabilities: {e}")
    
    async def get_by_cpe(self, cpe: str) -> List[SoftwareModel]:
        """Get software by CPE identifier."""
        try:
            result = await self.session.execute(
                select(SoftwareModel)
                .where(SoftwareModel.cpe == cpe)
                .options(selectinload(SoftwareModel.vulnerabilities))
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get software by CPE: {e}")
    
    async def get_vulnerability_stats(self) -> Dict[str, int]:
        """Get vulnerability statistics for all software."""
        try:
            result = await self.session.execute(
                select(
                    VulnerabilityModel.severity,
                    func.count(VulnerabilityModel.id).label("count")
                )
                .join(SoftwareModel.vulnerabilities)
                .group_by(VulnerabilityModel.severity)
            )
            
            stats = {severity.value: 0 for severity in Severity}
            for row in result:
                stats[row.severity] = row.count
            
            return stats
        except Exception as e:
            raise DatabaseError(f"Failed to get vulnerability stats: {e}")


class VulnerabilityRepository(BaseRepository[VulnerabilityModel]):
    """Repository for vulnerability operations."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, VulnerabilityModel)
    
    async def get_by_cve_id(self, cve_id: str) -> Optional[VulnerabilityModel]:
        """Get vulnerability by CVE ID."""
        try:
            result = await self.session.execute(
                select(VulnerabilityModel)
                .where(VulnerabilityModel.cve_id == cve_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            raise DatabaseError(f"Failed to get vulnerability by CVE ID: {e}")
    
    async def get_by_severity(self, severity: Severity, limit: int = 100) -> List[VulnerabilityModel]:
        """Get vulnerabilities by severity."""
        try:
            result = await self.session.execute(
                select(VulnerabilityModel)
                .where(VulnerabilityModel.severity == severity)
                .order_by(VulnerabilityModel.cvss_score.desc())
                .limit(limit)
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get vulnerabilities by severity: {e}")
    
    async def get_by_cvss_range(self, min_score: float, max_score: float) -> List[VulnerabilityModel]:
        """Get vulnerabilities by CVSS score range."""
        try:
            result = await self.session.execute(
                select(VulnerabilityModel)
                .where(
                    and_(
                        VulnerabilityModel.cvss_score >= min_score,
                        VulnerabilityModel.cvss_score <= max_score
                    )
                )
                .order_by(VulnerabilityModel.cvss_score.desc())
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get vulnerabilities by CVSS range: {e}")
    
    async def get_recent(self, days: int = 30) -> List[VulnerabilityModel]:
        """Get recently published vulnerabilities."""
        try:
            cutoff_date = datetime.utcnow() - datetime.timedelta(days=days)
            result = await self.session.execute(
                select(VulnerabilityModel)
                .where(VulnerabilityModel.published_date >= cutoff_date)
                .order_by(VulnerabilityModel.published_date.desc())
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get recent vulnerabilities: {e}")
    
    async def search_by_description(self, search_term: str) -> List[VulnerabilityModel]:
        """Search vulnerabilities by description."""
        try:
            result = await self.session.execute(
                select(VulnerabilityModel)
                .where(VulnerabilityModel.description.ilike(f"%{search_term}%"))
                .order_by(VulnerabilityModel.cvss_score.desc())
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to search vulnerabilities: {e}")
    
    async def upsert(self, cve_id: str, **kwargs) -> VulnerabilityModel:
        """Insert or update vulnerability by CVE ID."""
        try:
            existing = await self.get_by_cve_id(cve_id)
            if existing:
                for key, value in kwargs.items():
                    setattr(existing, key, value)
                existing.updated_at = datetime.utcnow()
                await self.session.flush()
                return existing
            else:
                return await self.create(cve_id=cve_id, **kwargs)
        except Exception as e:
            raise DatabaseError(f"Failed to upsert vulnerability: {e}")


class ReportRepository(BaseRepository[ReportModel]):
    """Repository for report operations."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, ReportModel)
    
    async def get_by_format(self, format: str) -> List[ReportModel]:
        """Get reports by format."""
        try:
            result = await self.session.execute(
                select(ReportModel)
                .where(ReportModel.format == format)
                .order_by(ReportModel.generated_at.desc())
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get reports by format: {e}")
    
    async def get_by_user(self, user: str) -> List[ReportModel]:
        """Get reports generated by specific user."""
        try:
            result = await self.session.execute(
                select(ReportModel)
                .where(ReportModel.generated_by == user)
                .order_by(ReportModel.generated_at.desc())
            )
            return list(result.scalars().all())
        except Exception as e:
            raise DatabaseError(f"Failed to get reports by user: {e}")
    
    async def cleanup_old_reports(self, days: int = 30) -> int:
        """Clean up reports older than specified days."""
        try:
            cutoff_date = datetime.utcnow() - datetime.timedelta(days=days)
            result = await self.session.execute(
                delete(ReportModel)
                .where(ReportModel.generated_at < cutoff_date)
            )
            return result.rowcount
        except Exception as e:
            raise DatabaseError(f"Failed to cleanup old reports: {e}")


class RepositoryManager:
    """Manager class for all repositories."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self._scan_repo = None
        self._host_repo = None
        self._software_repo = None
        self._vulnerability_repo = None
        self._report_repo = None
    
    @property
    def scans(self) -> ScanRepository:
        """Get scan repository."""
        if self._scan_repo is None:
            self._scan_repo = ScanRepository(self.session)
        return self._scan_repo
    
    @property
    def hosts(self) -> HostRepository:
        """Get host repository."""
        if self._host_repo is None:
            self._host_repo = HostRepository(self.session)
        return self._host_repo
    
    @property
    def software(self) -> SoftwareRepository:
        """Get software repository."""
        if self._software_repo is None:
            self._software_repo = SoftwareRepository(self.session)
        return self._software_repo
    
    @property
    def vulnerabilities(self) -> VulnerabilityRepository:
        """Get vulnerability repository."""
        if self._vulnerability_repo is None:
            self._vulnerability_repo = VulnerabilityRepository(self.session)
        return self._vulnerability_repo
    
    @property
    def reports(self) -> ReportRepository:
        """Get report repository."""
        if self._report_repo is None:
            self._report_repo = ReportRepository(self.session)
        return self._report_repo