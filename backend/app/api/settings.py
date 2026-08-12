import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models import User
from app.services.settings_engine import generate_settings_intelligence_report

router = APIRouter()

def _simulate_user_preferences(user: User) -> dict[str, Any]:
    """
    Simulates a UserPreferences table load.
    """
    return {
        "full_name": user.full_name or "Unknown User",
        "email": user.email,
        "role": "Physician (Cardiology)",
        "language": "English",
        "mfa_enabled": True, # Simulate compliant setup
        "password_age_days": 42,
        "theme": "Dark Mode"
    }

def _simulate_active_sessions() -> list[dict[str, Any]]:
    """
    Simulates querying a DeviceSessions table.
    We inject one stale session to trigger the AI Security Recommendation.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    stale_date = now - datetime.timedelta(days=21) # 21 days ago (trigger)
    recent_date = now - datetime.timedelta(minutes=5)
    
    return [
        {"device_name": "iPhone 15 Pro", "last_active": recent_date},
        {"device_name": "iPad Pro (Home)", "last_active": stale_date}
    ]

@router.get("/{user_id}/configuration", response_model=dict[str, Any])
async def get_settings_configuration(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates the comprehensive 18-point Settings and Configuration report.
    Evaluates system-wide security, HIPAA compliance, and AI personalization.
    """
    if current_user.id != user_id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Administrator authorization required."
        )

    user_data = _simulate_user_preferences(current_user)
    sessions = _simulate_active_sessions()

    try:
        report = generate_settings_intelligence_report(user_data, sessions)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate settings report: {e!s}"
        )
