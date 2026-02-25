# Plan: Category Data Flow — Pulling DB Data for Each Category

## Context

The app has 5 category cards (Life Path, Soul Urge, Expression, Destiny, Psychomatrix) that are currently UI-only with no tap handlers. The `NumbersCalculator` has 50+ methods ready, and `numerology11.db` has 38 unified tables with 7 locales. This plan maps every category to its calculator methods + DB tables, and defines the data flow from tap → calculation → DB lookup → display.

---

## Architecture Overview

```
CategoryGrid (tap) → Navigation → CategoryDetailScreen
                                      ↓
                              NumbersCalculator.calcXxx(context)
                                      ↓
                              dbService.getByNumber(table, locale, number)
                                      ↓
                              Render reading (description, sections)
```

**Context object** (built from store):
```typescript
const context = {
    language: store.language,       // 'en', 'ru', 'es', etc.
    dateOfBirth: store.dateOfBirth, // DD/MM/YYYY
    firstName: store.firstName,
    lastName: store.lastName,
    fatherName: store.fatherName,
    partnerDateOfBirth: store.partnerDateOfBirth,
    weddingDay: store.weddingDay,
};
```

---

## Category 1: LIFE PATH

**Main number**: `NumbersCalculator.calcLifeNumberMethod1(context)` → single digit (1-9, 11, 22)

### DB tables & calculator methods:

| Sub-reading | Calculator Method | DB Table | DB Columns |
|---|---|---|---|
| **Life Path Reading** | `calcLifeNumberMethod1(context)` | `life_path_number` | description, negative, profession, finances, relationships, health, love, man, women |
| **Birthday Number** | `calcBirthdayNumber(context)` | `birthday_number` | description, carear, love |
| **Birthday Code** | `calcBirthdayCode(context)` | `birthday_code` | description |
| **Maturity Number** | `calcMaturityNumber(context)` | `maturity_number` | description |
| **Challenge Number 1** | `calcChallengeNumber1(context)` | `challenge_number` | description |
| **Challenge Number 2** | `calcChallengeNumber2(context)` | `challenge_number` | description |
| **Challenge Number 3** | `calcChallengeNumber3(context)` | `challenge_number` | description |
| **Challenge Number 4** | `calcChallengeNumber4(context)` | `challenge_number` | description |
| **Achievement Number 1** | `calcAchievmentNumber1(context)` | `achievement_number` | description |
| **Achievement Number 2** | `calcAchievmentNumber2(context)` | `achievement_number` | description |
| **Achievement Number 3** | `calcAchievmentNumber3(context)` | `achievement_number` | description |
| **Achievement Number 4** | `calcAchievmentNumber4(context)` | `achievement_number` | description |
| **Life Path Compatibility** | `calcLifeNumberMethod1(context)` + partner | `life_path_number_compat` | description (keyed by number1, number2) |
| **Life Graph** | per digit (0-9) from date | `life_graph` | description |

### DB query examples:
```typescript
// Main reading
const num = NumbersCalculator.calcLifeNumberMethod1(context);
const reading = await dbService.getByNumber('life_path_number', locale, num);
// reading.description, reading.negative, reading.profession, etc.

// Compatibility (if partner DOB set)
const myNum = NumbersCalculator.calcLifeNumberMethod1(context);
const partnerNum = NumbersCalculator.calcLifeNumberPartner(context);
const compat = await dbService.getLifePathCompat(locale, myNum, partnerNum);
```

---

## Category 2: SOUL URGE

**Main number**: `NumbersCalculator.calcSoulNumberLetters(context)` → from vowels in name

### DB tables & calculator methods:

| Sub-reading | Calculator Method | DB Table | DB Columns |
|---|---|---|---|
| **Soul Urge Reading** | `calcSoulNumberLetters(context)` | `soul_urge_number` | description, negative |
| **Soul Number (birth)** | `calcSoulNumber(context)` | — (same table or display raw) | — |
| **Desire Number** | `calcDesireNumber(context)` | `desire_number` | description |
| **Love Number** | `calcPartnerLoveNumber(day, month)` | `love_number` | description, detailed_description, man, woman |
| **Love Compatibility** | `calcLoveCompatibilityNum(d, m, y, ctx)` | `love_compatibility` | description |
| **Couple Number** | `calcCoupleNumber(context)` | `couple_number` | description |
| **Marriage Number** | `calcMarriageNumber(context)` | `marriage_number` | description, woman, man |

### DB query examples:
```typescript
const soulNum = NumbersCalculator.calcSoulNumberLetters(context);
const reading = await dbService.getByNumber('soul_urge_number', locale, soulNum);

const desireNum = NumbersCalculator.calcDesireNumber(context);
const desire = await dbService.getByNumber('desire_number', locale, desireNum);
```

---

## Category 3: EXPRESSION

**Main number**: `NumbersCalculator.calcExpressionNumber(context)` → from full name

### DB tables & calculator methods:

| Sub-reading | Calculator Method | DB Table | DB Columns |
|---|---|---|---|
| **Expression Reading** | `calcExpressionNumber(context)` | `expression_number` | description, negative |
| **Personality Number** | `calcPersonalityNumber(context)` | `personality_number` | description, negative |
| **Name Number** | `calcNameNumber(context)` | `name_number` | description, person_characteristic |
| **Character Number** | `calcCharacterNumber(context)` | `character_number` | description |
| **Intelligence Number** | `calcIntelligenceNumber(context)` | `intelligence_number` | description |
| **Balance Number** | `calcBalanceNumber(context)` | `balance_number` | description |
| **Money Number** | `calcMoneyNumber(context)` | `money_number` | description |
| **Lucky Gem** | `calcLuckyGem(context)` | `lucky_gem` | description |

### DB query examples:
```typescript
const exprNum = NumbersCalculator.calcExpressionNumber(context);
const reading = await dbService.getByNumber('expression_number', locale, exprNum);

const personalityNum = NumbersCalculator.calcPersonalityNumber(context);
const personality = await dbService.getByNumber('personality_number', locale, personalityNum);
```

---

## Category 4: DESTINY

**Main number**: `NumbersCalculator.calcDestinyNumber(context)` → consonants + vowels sum

### DB tables & calculator methods:

| Sub-reading | Calculator Method | DB Table | DB Columns |
|---|---|---|---|
| **Destiny Reading** | `calcDestinyNumber(context)` | `destiny_number` | description |
| **Realization Number** | `calcRealizationNumber(context)` | `realization_number` | description |
| **Potential Number** | `calcPotencialNumber(context)` | `potential_number` | description |
| **Karmic Lesson** | `calcKarmaNumber(context)` → array | `karmic_lesson` | description |
| **Planet Number** | (from birth day) | `planet_number` | planet, description, detailed_description |
| **Destiny Graph** | per state | `destiny_graph` | description (keyed by state) |
| **Personal Year** | `calcPersonalYear(context)` | `personal_year` | description, detailed_description |
| **Personal Month** | `calcPersonalMonth(context)` | `personal_month` | description, detailed_description |
| **Personal Day** | `calcPersonalDay(context)` | `personal_day` | description, detailed_description |

### Notes on Karmic Lesson:
`calcKarmaNumber(context)` returns a 10-element array (index 0-9) showing frequency of each digit in the name. Numbers with frequency 0 are the "missing" karmic lessons. Look up each missing number in `karmic_lesson` table.

### DB query examples:
```typescript
const destNum = NumbersCalculator.calcDestinyNumber(context);
const reading = await dbService.getByNumber('destiny_number', locale, destNum);

// Karmic lessons (numbers missing from name)
const karma = NumbersCalculator.calcKarmaNumber(context); // [0,2,0,1,3,0,1,0,2,1]
for (let i = 1; i <= 9; i++) {
    if (karma[i] === 0) {
        const lesson = await dbService.getByNumber('karmic_lesson', locale, i);
        // lesson.description — this is a missing number/lesson
    }
}
```

---

## Category 5: PSYCHOMATRIX

**Main data**: `NumbersCalculator.calcPythagorosSquare(context, dob)` → 9-element array

### DB tables & calculator methods:

| Sub-reading | Calculator Method | DB Table | DB Columns |
|---|---|---|---|
| **Psychomatrix Grid** | `calcPythagorosSquare(context, dob)` | `psychomatrix` | characteristic, number, description |
| **Psychomatrix Lines** | derived from grid | `psychomatrix_lines` | category, number, description |
| **Psychomatrix Compatibility** | compare two grids | `psychomatrix_compat` | category, strength, description |

### How the Psychomatrix works:

The 3×3 Pythagorean Square maps to characteristics:

| Position | Characteristic | Grid Index |
|---|---|---|
| 1 (top-left) | personality | 0 |
| 2 (top-mid) | energy | 1 |
| 3 (top-right) | interest | 2 |
| 4 (mid-left) | health | 3 |
| 5 (mid-mid) | logic | 4 |
| 6 (mid-right) | labor | 5 |
| 7 (bot-left) | luck | 6 |
| 8 (bot-mid) | duty | 7 |
| 9 (bot-right) | memory | 8 |

Lines (rows/cols/diags) have meanings:
- Row 1 (1-2-3): Self-esteem
- Row 2 (4-5-6): Domestic
- Row 3 (7-8-9): Stability
- Col 1 (1-4-7): Purpose
- Col 2 (2-5-8): Family
- Col 3 (3-6-9): Habits
- Diag 1 (1-5-9): Spirituality
- Diag 2 (3-5-7): Sensuality/Temperament

### DB query examples:
```typescript
const dob = context.dateOfBirth;
const square = NumbersCalculator.calcPythagorosSquare(context, dob);
// square = [count_of_1s, count_of_2s, ..., count_of_9s]

// Get interpretation for each cell
const characteristics = ['personality','energy','interest','health','logic','labor','luck','duty','memory'];
for (let i = 0; i < 9; i++) {
    const count = square[i]; // how many of digit (i+1) appear
    const reading = await dbService.getPsychomatrix(locale, characteristics[i], count);
    // reading = description for this characteristic at this count
}

// Lines
const lineCategories = ['self-esteem','domestic','stability','purpose','family','habits','spirituality','temperament'];
// Calculate line values by summing counts in each row/col/diag
// Then look up: await dbService.getPsychomatrixLine(locale, category, lineValue);

// Compatibility (if partner)
// Compare grids, then look up:
// await dbService.getPsychomatrixCompat(locale, category, strength);
// strength = 'strong', 'medium', 'weak' etc.
```

---

## Biorhythms (shown on Home, not a category)

Already partially displayed in `BiorhythmChart.tsx`. DB tables for interpretations:

| Data | Calculator Method | DB Table | Key |
|---|---|---|---|
| **Daily biorhythm** | `calcDailyBioRhytm(d, m, y)` → [phys, emo, intel] | `biorhythms` | type + level |
| **Secondary biorhythm** | `calcDailyBioRhytmAdditional(d, m, y)` | `secondary_biorhythms` | type + level |
| **Biorhythm compat** | `calcCompBioRhytm(mine, theirs)` | `biorhythm_compatibility` | type + level |

Level mapping from percentage: `max` (80-100%), `high` (50-80%), `medium` (20-50%), `low` (-20 to 20%), `min` (-100 to -20%)

### DB query example:
```typescript
const [phys, emo, intel] = NumbersCalculator.calcDailyBioRhytm(day, month, year);
// Convert percentage to level string
const toLevel = (pct: number) => {
    if (pct >= 80) return 'max';
    if (pct >= 50) return 'high';
    if (pct >= 20) return 'medium';
    if (pct >= -20) return 'low';
    return 'min';
};
const physReading = await dbService.getBiorhythm(locale, 'physical', toLevel(phys));
```

---

## Daily Number (shown on Home, not a category)

| Data | Calculator Method | DB Table |
|---|---|---|
| **Daily Lucky Number** | `calcLuckyDailyNumber(context)` | `daily_lucky_number` |

```typescript
const dailyNum = NumbersCalculator.calcLuckyDailyNumber(context);
const reading = await dbService.getDailyLuckyNumber(locale, dailyNum);
```

---

## Complete Table-to-Category Mapping

| DB Table | Category | Used By |
|---|---|---|
| `life_path_number` | Life Path | Main reading |
| `life_path_number_compat` | Life Path | Partner compatibility |
| `life_graph` | Life Path | Life graph periods |
| `birthday_number` | Life Path | Birth day reading |
| `birthday_code` | Life Path | Birth day code |
| `maturity_number` | Life Path | Maturity reading |
| `challenge_number` | Life Path | 4 challenge periods |
| `achievement_number` | Life Path | 4 achievement periods |
| `soul_urge_number` | Soul Urge | Main reading |
| `desire_number` | Soul Urge | Desire reading |
| `love_number` | Soul Urge | Love number |
| `love_compatibility` | Soul Urge | Love compatibility |
| `couple_number` | Soul Urge | Couple compatibility |
| `marriage_number` | Soul Urge | Marriage number |
| `expression_number` | Expression | Main reading |
| `personality_number` | Expression | Personality reading |
| `name_number` | Expression | Name analysis |
| `character_number` | Expression | Character reading |
| `intelligence_number` | Expression | Intelligence reading |
| `balance_number` | Expression | Balance reading |
| `money_number` | Expression | Financial reading |
| `lucky_gem` | Expression | Lucky gemstone |
| `destiny_number` | Destiny | Main reading |
| `realization_number` | Destiny | Realization reading |
| `potential_number` | Destiny | Potential reading |
| `karmic_lesson` | Destiny | Missing number lessons |
| `planet_number` | Destiny | Ruling planet |
| `destiny_graph` | Destiny | Destiny graph states |
| `personal_year` | Destiny | Yearly forecast |
| `personal_month` | Destiny | Monthly forecast |
| `personal_day` | Destiny | Daily forecast |
| `psychomatrix` | Psychomatrix | 9-cell grid interpretations |
| `psychomatrix_lines` | Psychomatrix | Row/col/diag meanings |
| `psychomatrix_compat` | Psychomatrix | Partner grid comparison |
| `biorhythms` | Home (Biorhythm) | Daily bio interpretation |
| `secondary_biorhythms` | Home (Biorhythm) | Additional rhythms |
| `biorhythm_compatibility` | Home (Biorhythm) | Partner bio compat |
| `daily_lucky_number` | Home (Hero) | Daily number reading |

---

## Files to Create/Modify

### New files:
- `src/screens/LifePathScreen.tsx` — Life Path detail with sub-sections
- `src/screens/SoulUrgeScreen.tsx` — Soul Urge detail with love/compatibility
- `src/screens/ExpressionScreen.tsx` — Expression detail with personality/money/gem
- `src/screens/DestinyScreen.tsx` — Destiny detail with karmic/personal forecasts
- `src/screens/PsychomatrixScreen.tsx` — Psychomatrix 3×3 grid with lines
- `src/navigation/CategoryStackNavigator.tsx` — Stack navigator for category detail screens

### Modified files:
- `src/components/CategoryGrid.tsx` — Add `onPress` navigation handlers
- `src/navigation/AppNavigator.tsx` — Nest stack navigator inside Dashboard tab
- `src/services/DatabaseService.ts` — Already updated, may need minor additions

### Data flow per screen:
1. Screen receives `categoryId` via navigation params
2. Reads `language`, profile data from `useStore()`
3. Builds `context` object
4. Calls `NumbersCalculator.calcXxx(context)` for each sub-reading
5. Calls `dbService.getByNumber(table, locale, number)` for each result
6. Renders sections with descriptions from DB
