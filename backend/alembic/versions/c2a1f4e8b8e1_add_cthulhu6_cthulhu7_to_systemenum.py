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
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type t WHERE t.typname = 'systemenum') THEN
                RAISE EXCEPTION 'enum type systemenum does not exist';
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            ALTER TYPE systemenum ADD VALUE 'cthulhu6';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            ALTER TYPE systemenum ADD VALUE 'cthulhu7';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )

    # migrate existing legacy records to cthulhu6
    op.execute("UPDATE characters SET system = 'cthulhu6' WHERE system = 'cthulhu'")


def downgrade() -> None:
    """Downgrade schema."""
    # NOTE: PostgreSQL does not support dropping enum values safely.
    # Keep as no-op to avoid destructive operations.
    pass

