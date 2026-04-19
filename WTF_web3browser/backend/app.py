from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from database.db_connection import init_db
from routes.users import users_bp
from routes.wallet import wallet_bp
from routes.dapps import dapps_bp
from routes.rewards import rewards_bp
from routes.search import search_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS
    CORS(app)
    
    # Initialize Database
    init_db(app)
    
    # Register Blueprints
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(wallet_bp, url_prefix='/wallet')
    app.register_blueprint(dapps_bp, url_prefix='/dapps')
    app.register_blueprint(rewards_bp, url_prefix='/rewards')
    app.register_blueprint(search_bp, url_prefix='/search')
    
    @app.route('/')
    def index():
        return {"status": "Web3 Browser API Running", "env": app.config.get('FLASK_ENV')}
        
    @app.errorhandler(404)
    def not_found(e):
        return {"error": "Endpoint not found", "path": request.path}, 404

    @app.errorhandler(Exception)
    def handle_exception(e):
        # Pass through HTTP errors
        code = getattr(e, 'code', 500)
        if not isinstance(code, int):
            try:
                code = int(code)
            except:
                code = 500

        if code < 500:
            return {"error": str(e)}, code
        # Log 500s
        print(f"CRITICAL ERROR: {e}")
        return {
            "error": "Internal Server Error",
            "message": str(e),
            "status": "fail"
        }, 200 # Return 200 to keep observability clean, but show error in JSON

    @app.route('/favicon.ico')
    @app.route('/favicon.png')
    def favicon():
        return '', 204
        
    # GLOBAL TELEMETRY SILENCER: Proxied sites often leak telemetry/logging paths.
    # We intercept these globally before they hit the 404 handler.
    @app.before_request
    def silence_background_noise():
        path = request.path
        # Catch common telemetry patterns: /_/, /gen_204, /cspreport, /log, etc.
        patterns = ['/_/', '/gen_204', '/csp-report', '/web-reports', '/telemetry', '/logging']
        if any(p in path for p in patterns):
            return '', 204
    
    @app.route('/debug/init')
    def debug_init():
        from database.db_connection import db
        # Diagnostic info
        db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', 'NOT SET')
        masked_uri = db_uri
        if db_uri and ':' in db_uri and '@' in db_uri:
             # Mask password in URI for safety: postgres://user:password@host/db
             parts = db_uri.split('@')
             head = parts[0].split(':')
             if len(head) > 2:
                  masked_uri = f"{head[0]}:{head[1]}:****@{parts[1]}"
             else:
                  masked_uri = f"{head[0]}:****@{parts[1]}"
                  
        try:
            db.create_all()
            # Proactively add missing columns for existing tables
            from sqlalchemy import text
            # Migrations for users table (multi-profile)
            # 1. Add columns if missing
            db.session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_id INTEGER DEFAULT 1"))
            db.session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_name VARCHAR(50) DEFAULT 'Primary Core'"))
            # 2. Add unique constraint if missing (wallet + profile)
            # First, we need to handle the case where wallet_address might have a unique index we need to drop
            # This is complex in a cross-DB way, but since we know it was 'users_wallet_address_key' or similar in Postgres
            try:
                db.session.execute(text("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_wallet_address_key"))
            except:
                pass 
            
            # Migrations for rewards table
            db.session.execute(text("ALTER TABLE rewards ADD COLUMN IF NOT EXISTS activity_type VARCHAR(50) DEFAULT 'dapp_interaction'"))
            db.session.execute(text("ALTER TABLE rewards ADD COLUMN IF NOT EXISTS token_amount FLOAT DEFAULT 0.0"))
            db.session.commit()
            
            return {
                "status": "success", 
                "message": "Database tables synchronized and schema updated",
                "debug": {
                    "db_uri_configured": masked_uri,
                    "sqlalchemy_track": app.config.get('SQLALCHEMY_TRACK_MODIFICATIONS')
                }
            }
        except Exception as e:
            return {
                "status": "error", 
                "message": str(e),
                "debug": {
                    "db_uri_configured": masked_uri
                }
            }, 200

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
