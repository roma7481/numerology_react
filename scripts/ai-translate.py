#!/usr/bin/env python3
"""
AI Translation script for numerology database content.
Uses OpenAI GPT API (via requests) to translate numerology content between languages.

Usage:
    python3 ai-translate.py                    # Translate all pending files
    python3 ai-translate.py --dry-run          # Show what would be translated
    python3 ai-translate.py --file FILE.json   # Translate a specific file
"""

import os
import sys
import json
import time
import argparse
import requests

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TRANSLATIONS_DIR = os.path.join(SCRIPT_DIR, 'translations')

LOCALE_NAMES = {
    'en': 'English', 'ru': 'Russian', 'es': 'Spanish',
    'fr': 'French', 'de': 'German', 'it': 'Italian', 'pt': 'Portuguese',
}

OPENAI_URL = "https://api.openai.com/v1/chat/completions"


def call_openai(api_key, system_prompt, user_prompt):
    """Call OpenAI API using requests."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 16384,
        "response_format": {"type": "json_object"},
    }
    resp = requests.post(OPENAI_URL, headers=headers, json=payload, timeout=120)
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"]


def translate_batch(api_key, rows, text_columns, key_columns, source_lang, target_lang, table_name):
    """Translate a batch of rows using OpenAI API."""
    items_to_translate = []
    for i, row in enumerate(rows):
        item = {'_index': i}
        for col in key_columns:
            item[col] = row.get(col)
        for col in text_columns:
            val = row.get(col)
            if val and isinstance(val, str) and len(val.strip()) > 0:
                item[col] = val
        items_to_translate.append(item)

    system_prompt = f"""You are a professional translator specializing in numerology, astrology, and spiritual content.
Translate the following numerology database entries from {source_lang} to {target_lang}.

RULES:
1. Maintain the mystical/spiritual tone
2. Keep numerology terms accurate
3. Preserve paragraph structure
4. Do NOT translate number values
5. Return ONLY a JSON object with a "data" key containing an array
6. Keep _index and key column values unchanged
7. If a text field is null or empty, keep it null"""

    user_prompt = f"""Translate these {table_name} entries from {source_lang} to {target_lang}.
Return JSON: {{"data": [...]}} with text fields translated.
Key columns (don't translate): {json.dumps(key_columns)}
Text columns (translate): {json.dumps(text_columns)}

Input:
{json.dumps(items_to_translate, ensure_ascii=False)}"""

    try:
        result_text = call_openai(api_key, system_prompt, user_prompt)
        parsed = json.loads(result_text)

        if isinstance(parsed, dict):
            for key, val in parsed.items():
                if isinstance(val, list):
                    return val
            return None

        if isinstance(parsed, list):
            return parsed

        return None

    except requests.exceptions.Timeout:
        print(f"    TIMEOUT", flush=True)
        return None
    except json.JSONDecodeError as e:
        print(f"    JSON parse error: {e}", flush=True)
        return None
    except Exception as e:
        print(f"    API error: {e}", flush=True)
        return None


def translate_file(api_key, filepath):
    """Translate a single JSON file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    table = data['table']
    target_locale = data['target_locale']
    source_lang = data['source_language']
    target_lang = data['target_language']
    key_columns = data['key_columns']
    text_columns = data['text_columns']
    rows = data['rows']

    print(f"  {table}: {source_lang} → {target_lang} ({len(rows)} rows)", flush=True)

    BATCH_SIZE = 3
    all_translated = []

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (len(rows) + BATCH_SIZE - 1) // BATCH_SIZE

        print(f"    Batch {batch_num}/{total_batches}...", end="", flush=True)

        translated = translate_batch(
            api_key, batch, text_columns, key_columns,
            source_lang, target_lang, table
        )

        if translated is None:
            print(f" FAILED (using source)", flush=True)
            for row in batch:
                fallback = row.copy()
                fallback['locale'] = target_locale
                all_translated.append(fallback)
        else:
            print(f" OK", flush=True)
            for j, trans_item in enumerate(translated):
                if j >= len(batch):
                    break
                original_row = batch[j].copy()
                original_row['locale'] = target_locale
                for col in text_columns:
                    if col in trans_item and trans_item[col]:
                        original_row[col] = trans_item[col]
                all_translated.append(original_row)

        if i + BATCH_SIZE < len(rows):
            time.sleep(0.3)

    data['rows'] = all_translated
    data['translated'] = True

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return len(all_translated)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--file', type=str)
    args = parser.parse_args()

    manifest_path = os.path.join(TRANSLATIONS_DIR, '_manifest.json')
    if not os.path.exists(manifest_path):
        print("No manifest. Run translate-missing.py export first.")
        sys.exit(1)

    with open(manifest_path, 'r') as f:
        manifest = json.load(f)

    files_to_translate = []
    for key, info in sorted(manifest.items()):
        filepath = os.path.join(TRANSLATIONS_DIR, info['file'])
        if not os.path.exists(filepath):
            continue
        with open(filepath, 'r') as f:
            data = json.load(f)
        if data.get('translated'):
            continue
        if args.file and info['file'] != args.file:
            continue
        files_to_translate.append((key, info, filepath))

    if not files_to_translate:
        print("All files already translated!")
        return

    total_rows = sum(info['row_count'] for _, info, _ in files_to_translate)
    print(f"Files: {len(files_to_translate)}, Rows: {total_rows}", flush=True)

    if args.dry_run:
        for key, info, fp in files_to_translate:
            print(f"  {info['file']}: {info['row_count']} rows, {info['source']}→{info['target']}")
        return

    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        print("Set OPENAI_API_KEY env var")
        sys.exit(1)

    print(f"\n=== Translating {len(files_to_translate)} files ===\n", flush=True)

    total = 0
    for i, (key, info, filepath) in enumerate(files_to_translate):
        print(f"[{i+1}/{len(files_to_translate)}] {info['file']}", flush=True)
        count = translate_file(api_key, filepath)
        total += count
        time.sleep(0.5)

    print(f"\n=== Done! {total} rows translated ===", flush=True)
    print(f"Next: python3 translate-missing.py import", flush=True)


if __name__ == '__main__':
    main()
