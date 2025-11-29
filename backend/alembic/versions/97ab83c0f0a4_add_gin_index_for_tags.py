"""Add GIN index for tags

Revision ID: 97ab83c0f0a4
Revises: 8dc78102406d
Create Date: 2025-11-29 02:43:19.947541

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '97ab83c0f0a4'
down_revision: Union[str, Sequence[str], None] = '8dc78102406d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_index('ix_characters_tags', 'characters', ['tags'], unique=False, postgresql_using='gin')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_characters_tags', table_name='characters')
