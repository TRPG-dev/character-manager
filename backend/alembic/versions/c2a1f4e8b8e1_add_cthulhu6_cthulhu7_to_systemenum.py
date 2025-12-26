"""Add cthulhu6/cthulhu7 to systemenum

Revision ID: c2a1f4e8b8e1
Revises: 97ab83c0f0a4
Create Date: 2025-12-21

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c2a1f4e8b8e1"
down_revision: Union[str, Sequence[str], None] = "97ab83c0f0a4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # PostgreSQL enum: add values (idempotent)
    # Note: ALTER TYPE ... ADD VALUE must be committed before the new enum value can be used
    
    from sqlalchemy import text
    
    connection = op.get_bind()
    
    # Check if enum type exists
    result = connection.execute(text("SELECT 1 FROM pg_type WHERE typname = 'systemenum'")).fetchone()
    if not result:
        raise Exception('enum type systemenum does not exist')

    # Add cthulhu6 enum value (idempotent)
    cthulhu6_exists = connection.execute(
        text("""
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'cthulhu6' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'systemenum')
        """)
    ).fetchone()
    
    if not cthulhu6_exists:
        op.execute("ALTER TYPE systemenum ADD VALUE 'cthulhu6'")
        # Commit the transaction so the new enum value can be used
        if hasattr(connection, 'commit'):
            connection.commit()
        elif hasattr(connection, 'connection') and hasattr(connection.connection, 'commit'):
            connection.connection.commit()
    
    # Add cthulhu7 enum value (idempotent)
    cthulhu7_exists = connection.execute(
        text("""
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'cthulhu7' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'systemenum')
        """)
    ).fetchone()
    
    if not cthulhu7_exists:
        op.execute("ALTER TYPE systemenum ADD VALUE 'cthulhu7'")
        # Commit the transaction so the new enum value can be used
        if hasattr(connection, 'commit'):
            connection.commit()
        elif hasattr(connection, 'connection') and hasattr(connection.connection, 'commit'):
            connection.connection.commit()

    # Migrate existing legacy records to cthulhu6 (only if 'cthulhu' value exists)
    # NOTE: This must be done AFTER the enum values are committed
    cthulhu_exists = connection.execute(
        text("""
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'cthulhu' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'systemenum')
        """)
    ).fetchone()
    
    if cthulhu_exists:
        record_count = connection.execute(
            text("SELECT COUNT(*) FROM characters WHERE system = 'cthulhu'::systemenum")
        ).scalar()
        
        if record_count and record_count > 0:
            op.execute(
                "UPDATE characters SET system = 'cthulhu6'::systemenum WHERE system = 'cthulhu'::systemenum"
            )


def downgrade() -> None:
    """Downgrade schema."""
    # NOTE: PostgreSQL does not support dropping enum values safely.
    # Keep as no-op to avoid destructive operations.
    pass

