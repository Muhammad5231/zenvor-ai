from datetime import datetime
import uuid
from sqlalchemy import create_engine, Column, String, Text, DateTime, Boolean, ForeignKey, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class SessionModel(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), default="New Chat")
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("MessageModel", back_populates="session", cascade="all, delete-orphan")

class MessageModel(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    thinking = Column(Text, nullable=True)
    sources = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionModel", back_populates="messages")

def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Auto-migrate SQLite schema for missing columns on existing databases
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE chat_sessions ADD COLUMN is_pinned BOOLEAN DEFAULT 0"))
            conn.commit()
            print("[Database] Added missing 'is_pinned' column to chat_sessions.")
        except Exception:
            pass  # Column already exists

        try:
            conn.execute(text("ALTER TABLE chat_messages ADD COLUMN thinking TEXT"))
            conn.commit()
            print("[Database] Added missing 'thinking' column to chat_messages.")
        except Exception:
            pass  # Column already exists

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()