from flask import Blueprint, request, jsonify
from orchestrator.pipeline import run_pipeline, run_customer_pipeline
from core.timeline import get_timeline
from database.db import (
    get_all_leads, get_lead_by_id, search_leads,
    get_all_customers, get_customer_by_id,
    get_agent_outputs, get_latest_agent_output,
    clear_pipeline_data
)

api = Blueprint("api", __name__)


# ── LEADS ──────────────────────────────────────────────────────────

@api.route("/leads", methods=["GET"])
def leads():
    return jsonify({"status": "success", "data": get_all_leads()})


@api.route("/leads/search", methods=["GET"])
def leads_search():
    keyword = request.args.get("q", "").strip()
    if not keyword:
        return jsonify({"status": "error", "message": "Missing ?q="}), 400
    results = search_leads(keyword)
    return jsonify({"status": "success", "count": len(results), "data": results})


@api.route("/leads/<lead_id>", methods=["GET"])
def lead_detail(lead_id):
    lead = get_lead_by_id(lead_id)
    if not lead:
        return jsonify({"status": "error", "message": "Lead not found"}), 404
    return jsonify({"status": "success", "data": lead})


# ── PROSPECT PIPELINE ──────────────────────────────────────────────

@api.route("/run", methods=["POST"])
def run():
    try:
        data = request.json
        if "lead_id" in data and "company" not in data:
            lead = get_lead_by_id(data["lead_id"])
            if not lead:
                return jsonify({"status": "error", "message": "Lead not found"}), 404
        else:
            lead = data

        result = run_pipeline(lead)
        return jsonify({"status": "success", "data": result})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ── CUSTOMERS ──────────────────────────────────────────────────────

@api.route("/customers", methods=["GET"])
def customers():
    return jsonify({"status": "success", "data": get_all_customers()})


@api.route("/customers/<cust_id>", methods=["GET"])
def customer_detail(cust_id):
    customer = get_customer_by_id(cust_id)
    if not customer:
        return jsonify({"status": "error", "message": "Customer not found"}), 404
    return jsonify({"status": "success", "data": customer})


# ── CUSTOMER HEALTH PIPELINE ───────────────────────────────────────

@api.route("/customers/<cust_id>/analyze", methods=["POST"])
def analyze_customer(cust_id):
    try:
        customer = get_customer_by_id(cust_id)
        if not customer:
            return jsonify({"status": "error", "message": "Customer not found"}), 404

        result = run_customer_pipeline(customer)
        return jsonify({"status": "success", "data": result})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ── TIMELINE ───────────────────────────────────────────────────────

@api.route("/timeline/<entity_id>", methods=["GET"])
def timeline(entity_id):
    return jsonify({"status": "success", "data": get_timeline(entity_id)})


# ── AGENT OUTPUTS ──────────────────────────────────────────────────

@api.route("/outputs/<lead_id>", methods=["GET"])
def agent_outputs(lead_id):
    return jsonify({"status": "success", "data": get_agent_outputs(lead_id)})


@api.route("/outputs/<lead_id>/<agent_name>", methods=["GET"])
def agent_output_detail(lead_id, agent_name):
    output = get_latest_agent_output(lead_id, agent_name)
    if not output:
        return jsonify({"status": "error", "message": "No output found"}), 404
    return jsonify({"status": "success", "data": output})


# ── UTILITY ────────────────────────────────────────────────────────

@api.route("/reset/<entity_id>", methods=["DELETE"])
def reset_entity(entity_id):
    clear_pipeline_data(entity_id)
    return jsonify({"status": "success", "message": f"Cleared {entity_id}"})