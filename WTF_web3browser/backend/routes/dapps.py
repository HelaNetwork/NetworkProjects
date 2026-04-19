from flask import Blueprint, jsonify
from models.dapp_model import Dapp

dapps_bp = Blueprint('dapps', __name__)

@dapps_bp.route('/', methods=['GET'])
def get_all_dapps():
    try:
        dapps = Dapp.query.all()
        # Fallback to hardcoded list if database is empty or fails
        if not dapps:
            return jsonify([]), 200
        return jsonify([d.to_dict() for d in dapps]), 200
    except Exception as e:
        print(f"Error fetching dApps: {e}")
        return jsonify([]), 200
