"""Remove cthulhu from systemenum

Revision ID: remove_cthulhu_from_systemenum
Revises: c2a1f4e8b8e1
Create Date: 2025-12-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "remove_cthulhu_from_systemenum"
down_revision: Union[str, Sequence[str], None] = "c2a1f4e8b8e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # PostgreSQL does not support dropping enum values directly.
    # We need to create a new enum type without 'cthulhu', migrate the data, and replace the old type.
    
    # Step 1: Create new enum type without 'cthulhu'
    op.execute("""
        DO $$
        BEGIN
            CREATE TYPE systemenum_new AS ENUM ('cthulhu6', 'cthulhu7', 'shinobigami', 'sw25', 'satasupe');
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
    """)
    
    # Step 2: Ensure all existing 'cthulhu' records are migrated to 'cthulhu6'
    # (This should have been done in the previous migration, but we do it again for safety)
    op.execute("UPDATE characters SET system = 'cthulhu6' WHERE system = 'cthulhu'")
    
    # Step 3: Alter the characters table to use the new enum type
    op.execute("""
        ALTER TABLE characters 
        ALTER COLUMN system TYPE systemenum_new 
        USING system::text::systemenum_new;
    """)
    
    # Step 4: Drop the old enum type
    op.execute("DROP TYPE systemenum")
    
    # Step 5: Rename the new enum type to the original name
    op.execute("ALTER TYPE systemenum_new RENAME TO systemenum")


def downgrade() -> None:
    """Downgrade schema."""
    # Re-create the old enum type with 'cthulhu'
    op.execute("""
        DO $$
        BEGIN
            CREATE TYPE systemenum_old AS ENUM ('cthulhu', 'cthulhu6', 'cthulhu7', 'shinobigami', 'sw25', 'satasupe');
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
    """)
    
    # Convert cthulhu6 records back to cthulhu (this is a best-effort approach)
    op.execute("""
        ALTER TABLE characters 
        ALTER COLUMN system TYPE systemenum_old 
        USING CASE 
            WHEN system::text = 'cthulhu6' THEN 'cthulhu'::systemenum_old
            ELSE system::text::systemenum_old
        END;
    """)
    
    # Drop the new enum type
    op.execute("DROP TYPE systemenum")
    
    # Rename the old enum type back
    op.execute("ALTER TYPE systemenum_old RENAME TO systemenum")

