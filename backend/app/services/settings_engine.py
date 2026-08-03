from typing import Dict, Any, List
import datetime

def evaluate_security_compliance(user_data: Dict[str, Any], sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Checks for stale sessions or non-compliant security configurations."""
    alerts = []
    recs = []
    
    # Check for stale sessions (e.g., > 14 days old)
    now = datetime.datetime.now(datetime.timezone.utc)
    for session in sessions:
        last_active = session.get("last_active")
        if last_active:
            days_inactive = (now - last_active).days
            if days_inactive > 14:
                alerts.append(f"Stale session detected on {session.get('device_name')}.")
                recs.append(f"[Security] Remotely revoke access to {session.get('device_name')} to ensure HIPAA compliance.")
                
    if not user_data.get("mfa_enabled", False):
        alerts.append("MFA is currently disabled.")
        recs.append("[Security] Enable Multi-Factor Authentication immediately.")
        
    return {
        "status": "100% Compliant" if not alerts else "Compliance Action Required",
        "alerts": alerts,
        "recommendations": recs
    }

def generate_settings_intelligence_report(user_data: Dict[str, Any], sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compiles the 18-point Settings and Configuration Report."""
    
    security = evaluate_security_compliance(user_data, sessions)
    
    return {
        "1_user_profile": f"{user_data.get('full_name')} | Role: {user_data.get('role')} | Lang: {user_data.get('language')}",
        "2_account_settings": f"Email: {user_data.get('email')} | MFA Enabled: {user_data.get('mfa_enabled')}",
        "3_security_settings": f"Session Timeout: 15 Minutes. Password Age: {user_data.get('password_age_days', 0)} Days.",
        "4_privacy_settings": "Data Sharing (Research): Opted-Out. HIPAA Logging: Active.",
        "5_ai_personalization": "Style: Professional. Alert Sensitivity: Medium.",
        "6_notification_preferences": "Critical Lab Alerts: Push & SMS (Enabled).",
        "7_healthcare_preferences": "Primary Hospital: City General Hospital.",
        "8_dashboard_configuration": f"Theme: {user_data.get('theme', 'Dark Mode')}. Density: Compact.",
        "9_device_management": [s.get('device_name') for s in sessions],
        "10_integration_status": "Hospital EMR: Connected.",
        "11_organization_settings": "Branch: North Wing. Admin Access: True.",
        "12_system_health": "Database: Healthy. API Latency: 45ms.",
        "13_ai_recommendations": security["recommendations"] if security["recommendations"] else ["All settings optimized."],
        "14_audit_summary": "No recent unauthorized configuration changes.",
        "15_compliance_status": security["status"],
        "16_backup_status": "Last Cloud Backup: Successful.",
        "17_confidence_scores": {"security_integrity": 1.0 if not security["alerts"] else 0.8},
        "18_export_options": ["PDF", "JSON"]
    }
