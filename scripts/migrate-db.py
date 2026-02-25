#!/usr/bin/env python3
"""
Migration script: numerology10.db → numerology11.db
Merges 174 locale-suffixed tables into 38 unified tables with a `locale` column.
Fixes BIORITHMS→BIORHYTHMS typo. Normalizes locale codes to ISO 639-1.
"""

import sqlite3
import os
import sys
import json

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
OLD_DB = os.path.join(PROJECT_DIR, 'numerology10.db')
NEW_DB = os.path.join(PROJECT_DIR, 'numerology11.db')

# Locale mapping: old suffix → ISO 639-1
LOCALE_MAP = {
    'ENG': 'en',
    'RUS': 'ru',
    'ESP': 'es',
    'FR': 'fr',
    'DE': 'de',
    'IT': 'it',
    'PORT': 'pt',
}

SUFFIXES = ['_ENG', '_RUS', '_ESP', '_FR', '_DE', '_IT', '_PORT']

# Typo fixes for base table names
TYPO_FIXES = {
    'BIORITHMS': 'BIORHYTHMS',
    'BIORITHM_COMPATIBILITY': 'BIORHYTHM_COMPATIBILITY',
    'SECONDARY_BIORITHMS': 'SECONDARY_BIORHYTHMS',
}

# ─── NEW TABLE SCHEMAS ───────────────────────────────────────────────
# Each entry: new_table_name → (CREATE SQL, list of all columns including locale)
# The column order matters for INSERT mapping.

SCHEMAS = {
    # Pattern 1: number + description + optional rich columns
    'life_path_number': {
        'create': '''CREATE TABLE life_path_number (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            negative TEXT,
            profession TEXT,
            finances TEXT,
            relationships TEXT,
            health TEXT,
            love TEXT,
            man TEXT,
            women TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description', 'negative', 'profession',
                     'finances', 'relationships', 'health', 'love', 'man', 'women'],
    },
    'birthday_number': {
        'create': '''CREATE TABLE birthday_number (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            carear TEXT,
            love TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description', 'carear', 'love'],
    },
    'expression_number': {
        'create': '''CREATE TABLE expression_number (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            negative TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description', 'negative'],
    },
    'soul_urge_number': {
        'create': '''CREATE TABLE soul_urge_number (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            negative TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description', 'negative'],
    },
    'personality_number': {
        'create': '''CREATE TABLE personality_number (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            negative TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description', 'negative'],
    },
    'marriage_number': {
        'create': '''CREATE TABLE marriage_number (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            woman TEXT,
            man TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description', 'woman', 'man'],
    },
    'love_number': {
        'create': '''CREATE TABLE love_number (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            detailed_description TEXT,
            man TEXT,
            woman TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description', 'detailed_description', 'man', 'woman'],
    },
    'planet_number': {
        'create': '''CREATE TABLE planet_number (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            planet TEXT,
            description TEXT,
            detailed_description TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'planet', 'description', 'detailed_description'],
    },
    'personal_year': {
        'create': '''CREATE TABLE personal_year (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            detailed_description TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description', 'detailed_description'],
    },
    'personal_month': {
        'create': '''CREATE TABLE personal_month (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            detailed_description TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description', 'detailed_description'],
    },
    'personal_day': {
        'create': '''CREATE TABLE personal_day (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            detailed_description TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description', 'detailed_description'],
    },
    'name_number': {
        'create': '''CREATE TABLE name_number (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            person_characteristic TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description', 'person_characteristic'],
    },
    'love_compatibility': {
        'create': '''CREATE TABLE love_compatibility (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description'],
    },

    # Life path number compatibility (number1 + number2 composite key)
    'life_path_number_compat': {
        'create': '''CREATE TABLE life_path_number_compat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number1 INTEGER NOT NULL,
            number2 INTEGER NOT NULL,
            description TEXT,
            UNIQUE(locale, number1, number2)
        )''',
        'columns': ['locale', 'number1', 'number2', 'description'],
    },

    # Simple number+description tables (no extra columns)
    **{name: {
        'create': f'''CREATE TABLE {name} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description'],
    } for name in [
        'achievement_number', 'balance_number', 'birthday_code',
        'challenge_number', 'character_number', 'couple_number',
        'daily_lucky_number', 'desire_number', 'destiny_number',
        'intelligence_number', 'karmic_lesson',
        'lucky_gem', 'maturity_number', 'money_number',
        'potential_number', 'realization_number',
    ]},

    # Destiny graph: state + description
    'destiny_graph': {
        'create': '''CREATE TABLE destiny_graph (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            state TEXT NOT NULL,
            description TEXT,
            UNIQUE(locale, state)
        )''',
        'columns': ['locale', 'state', 'description'],
    },

    # Life graph: number + description
    'life_graph': {
        'create': '''CREATE TABLE life_graph (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            UNIQUE(locale, number)
        )''',
        'columns': ['locale', 'number', 'description'],
    },

    # Pattern 2: Biorhythm tables (type + level + description)
    **{name: {
        'create': f'''CREATE TABLE {name} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            type TEXT NOT NULL,
            level TEXT NOT NULL,
            description TEXT,
            UNIQUE(locale, type, level)
        )''',
        'columns': ['locale', 'type', 'level', 'description'],
    } for name in ['biorhythms', 'biorhythm_compatibility', 'secondary_biorhythms']},

    # Pattern 3: Psychomatrix tables
    'psychomatrix': {
        'create': '''CREATE TABLE psychomatrix (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            characteristic TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            UNIQUE(locale, characteristic, number)
        )''',
        'columns': ['locale', 'characteristic', 'number', 'description'],
    },
    'psychomatrix_compat': {
        'create': '''CREATE TABLE psychomatrix_compat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            category TEXT NOT NULL,
            strength TEXT NOT NULL,
            description TEXT,
            UNIQUE(locale, category, strength)
        )''',
        'columns': ['locale', 'category', 'strength', 'description'],
    },
    'psychomatrix_lines': {
        'create': '''CREATE TABLE psychomatrix_lines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locale TEXT NOT NULL,
            category TEXT NOT NULL,
            number INTEGER NOT NULL,
            description TEXT,
            UNIQUE(locale, category, number)
        )''',
        'columns': ['locale', 'category', 'number', 'description'],
    },

    # Metadata table (no locale)
    'table_description': {
        'create': '''CREATE TABLE table_description (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT NOT NULL,
            description TEXT
        )''',
        'columns': ['table_name', 'description'],
    },
}

# Mapping from OLD base table name (uppercase) → new table name (lowercase)
# This also handles the typo fixes
OLD_TO_NEW = {}
for new_name in SCHEMAS:
    upper = new_name.upper()
    OLD_TO_NEW[upper] = new_name
    # Also map old typo names
    for old_typo, new_fixed in TYPO_FIXES.items():
        if new_fixed == upper:
            OLD_TO_NEW[old_typo] = new_name

# Column name normalization (old column name → new column name)
COLUMN_RENAMES = {
    'detailedDescription': 'detailed_description',
    'detaildDescription': 'detailed_description',  # typo in PLANET_NUMBER_RUS
    'person_сharacteristic': 'person_characteristic',  # Cyrillic 'с' possible
    'num': 'number',  # LIFE_GRAPH_RUS uses 'num' instead of 'number'
}


def parse_table_name(table_name):
    """Parse 'BASE_NAME_LOCALE' into (base_name, locale_iso)."""
    for suffix in SUFFIXES:
        if table_name.endswith(suffix):
            base = table_name[:-len(suffix)]
            locale_iso = LOCALE_MAP[suffix[1:]]
            return base, locale_iso
    return table_name, None


def get_old_columns(old_conn, table_name):
    """Get column names for an old table."""
    cursor = old_conn.execute(f"PRAGMA table_info('{table_name}')")
    return [row[1] for row in cursor.fetchall()]


def normalize_column(col_name):
    """Normalize old column name to new schema column name."""
    return COLUMN_RENAMES.get(col_name, col_name)


def migrate():
    if os.path.exists(NEW_DB):
        os.remove(NEW_DB)
        print(f"Removed existing {NEW_DB}")

    old_conn = sqlite3.connect(OLD_DB)
    old_conn.row_factory = sqlite3.Row
    new_conn = sqlite3.connect(NEW_DB)

    # Step 1: Create all new tables
    print("\n=== STEP 1: Creating new tables ===")
    for table_name, schema in SCHEMAS.items():
        new_conn.execute(schema['create'])
        print(f"  Created: {table_name}")

    # Create indexes
    for table_name, schema in SCHEMAS.items():
        if table_name == 'table_description':
            continue
        cols = schema['columns']
        new_conn.execute(f"CREATE INDEX idx_{table_name}_locale ON {table_name}(locale)")
        if 'number' in cols:
            new_conn.execute(f"CREATE INDEX idx_{table_name}_locale_number ON {table_name}(locale, number)")
        elif 'number1' in cols:
            new_conn.execute(f"CREATE INDEX idx_{table_name}_locale_numbers ON {table_name}(locale, number1, number2)")

    new_conn.commit()
    print(f"  Created indexes for all tables")

    # Step 2: Get all old tables
    cursor = old_conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    old_tables = [r[0] for r in cursor.fetchall()]

    print(f"\n=== STEP 2: Migrating {len(old_tables)} tables ===")

    stats = {}  # new_table → {locale → row_count}
    errors = []
    total_rows = 0

    for old_table in old_tables:
        base_name, locale_iso = parse_table_name(old_table)

        # Handle TABLE_DESCRIPTION (no locale)
        if base_name == 'TABLE_DESCRIPTION' and locale_iso is None:
            rows = old_conn.execute(f"SELECT * FROM '{old_table}'").fetchall()
            old_cols = get_old_columns(old_conn, old_table)
            for row in rows:
                row_dict = dict(zip(old_cols, row))
                new_conn.execute(
                    "INSERT INTO table_description (table_name, description) VALUES (?, ?)",
                    (row_dict.get('table_name', ''), row_dict.get('description', ''))
                )
            total_rows += len(rows)
            print(f"  {old_table} → table_description: {len(rows)} rows")
            continue

        if locale_iso is None:
            print(f"  SKIPPED (no locale suffix): {old_table}")
            continue

        # Find the new table name
        new_table = OLD_TO_NEW.get(base_name)
        if new_table is None:
            errors.append(f"No mapping for base table: {base_name} (from {old_table})")
            print(f"  ERROR: No mapping for {base_name}")
            continue

        new_schema = SCHEMAS[new_table]
        new_cols = new_schema['columns']  # e.g. ['locale', 'number', 'description', ...]

        # Read old data
        old_cols = get_old_columns(old_conn, old_table)
        rows = old_conn.execute(f"SELECT * FROM '{old_table}'").fetchall()

        if not rows:
            print(f"  {old_table} → {new_table} [{locale_iso}]: 0 rows (empty)")
            continue

        # Map old columns to new columns
        inserted = 0
        for row in rows:
            row_dict = {}
            for i, col in enumerate(old_cols):
                normalized = normalize_column(col)
                row_dict[normalized] = row[i]

            # Build values for new columns
            values = []
            for new_col in new_cols:
                if new_col == 'locale':
                    values.append(locale_iso)
                elif new_col in row_dict:
                    val = row_dict[new_col]
                    # Normalize number column to integer where possible
                    if new_col == 'number' and isinstance(val, str):
                        try:
                            val = int(val)
                        except (ValueError, TypeError):
                            pass
                    values.append(val)
                else:
                    values.append(None)

            placeholders = ', '.join(['?'] * len(new_cols))
            col_list = ', '.join(new_cols)
            try:
                new_conn.execute(
                    f"INSERT INTO {new_table} ({col_list}) VALUES ({placeholders})",
                    values
                )
                inserted += 1
            except sqlite3.IntegrityError as e:
                # Duplicate key — skip
                errors.append(f"Duplicate in {new_table} [{locale_iso}]: {e}")

        total_rows += inserted

        # Track stats
        if new_table not in stats:
            stats[new_table] = {}
        stats[new_table][locale_iso] = inserted

        print(f"  {old_table} → {new_table} [{locale_iso}]: {inserted} rows")

    new_conn.commit()

    # Step 3: Validation
    print(f"\n=== STEP 3: Validation ===")
    print(f"Total rows migrated: {total_rows}")

    if errors:
        print(f"\nWarnings/Errors ({len(errors)}):")
        for e in errors:
            print(f"  - {e}")

    print(f"\n{'Table':<30} {'en':>4} {'ru':>4} {'es':>4} {'fr':>4} {'de':>4} {'it':>4} {'pt':>4} {'Total':>6}")
    print("-" * 80)

    all_locales = ['en', 'ru', 'es', 'fr', 'de', 'it', 'pt']
    for table_name in sorted(stats.keys()):
        locale_counts = stats[table_name]
        counts = [str(locale_counts.get(loc, 0)) for loc in all_locales]
        total = sum(locale_counts.values())
        print(f"  {table_name:<28} {counts[0]:>4} {counts[1]:>4} {counts[2]:>4} {counts[3]:>4} {counts[4]:>4} {counts[5]:>4} {counts[6]:>4} {total:>6}")

    # Coverage gaps
    print(f"\n=== COVERAGE GAPS (tables missing locales) ===")
    for table_name in sorted(stats.keys()):
        missing = [loc for loc in all_locales if loc not in stats[table_name]]
        if missing:
            print(f"  {table_name}: missing {', '.join(missing)}")

    old_conn.close()
    new_conn.close()

    print(f"\nMigration complete! New database: {NEW_DB}")
    db_size = os.path.getsize(NEW_DB) / 1024
    print(f"Database size: {db_size:.1f} KB")


if __name__ == '__main__':
    migrate()
