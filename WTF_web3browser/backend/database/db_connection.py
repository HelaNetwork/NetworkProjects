from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    try:
        db.init_app(app)
        # On Vercel, we want to avoid potentially long blocking operations
        # like create_all() if possible, especially on every cold start.
        # We'll only run it if it's explicitly needed or on a first-run basis.
        with app.app_context():
            # Minimal startup logic
            pass
    except Exception as e:
        print(f"Non-critical DB Init Error: {e}")
