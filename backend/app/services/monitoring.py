from flask import Blueprint, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

monitoring_bp = Blueprint("monitoring", __name__)

@monitoring_bp.route("/metrics")
def metrics():
    return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST) 