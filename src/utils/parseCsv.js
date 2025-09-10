const splitCsvLine = (line, delimiter = ",") => {
    const out = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === delimiter && !inQuotes) {
            out.push(cur);
            cur = "";
        } else {
            cur += ch;
        }
    }
    out.push(cur);
    return out;
};

const normalizeCell = (val) => {
    if (val == null) return "";
    let s = String(val).trim();
    if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
    return s.trim();
};

const parseNumberLoose = (val) => {
    if (val == null) return NaN;
    const cleaned = String(val).replace(/[^0-9.\-]/g, "");
    if (!cleaned) return NaN;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
};

const parseUsersFromCsv = (text) => {
    const lines = text
        .replace(/^\uFEFF/, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n");

    // Detect delimiter by sampling first non-empty lines
    const tryDelims = [",", ";", "\t"];
    const candidates = lines.filter((l) => l && l.trim()).slice(0, 10);
    let delimiter = ",";
    let bestScore = -1;
    for (const d of tryDelims) {
        const score = candidates.reduce(
            (acc, l) => acc + (l.includes(d) ? 1 : 0),
            0
        );
        if (score > bestScore) {
            bestScore = score;
            delimiter = d;
        }
    }

    // Find start index: prefer the line after a "Participating Users" marker, else first line with delimiter
    const sectionIdx = lines.findIndex((raw) => {
        if (!raw) return false;
        const s = String(raw).trim();
        const unq = s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s;
        return /participating users/i.test(unq);
    });

    let headerIdx = -1;
    if (sectionIdx !== -1) {
        for (let i = sectionIdx + 1; i < lines.length; i++) {
            const raw = lines[i];
            if (!raw || !raw.trim()) continue;
            if (raw.includes(delimiter)) {
                headerIdx = i;
                break;
            }
        }
    }
    if (headerIdx === -1) {
        headerIdx = lines.findIndex(
            (raw) => raw && raw.trim() && raw.includes(delimiter)
        );
    }
    if (headerIdx === -1) {
        // No delimiter found anywhere; treat each non-empty line as a single-column row
        const users = lines
            .filter((l) => l && l.trim())
            .map((l) => ({
                email: l.trim(), // best effort
                calories: 0,
            }));
        return { users, skipped: [] };
    }

    // Helper to normalize header keys for matching
    const normKey = (s) =>
        String(s || "")
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[_-]+/g, "");

    // Treat first non-empty row as header if it looks like text; else use positional mapping
    const headerColsRaw = splitCsvLine(lines[headerIdx], delimiter).map(
        normalizeCell
    );
    const headerNorm = headerColsRaw.map(normKey);

    // Map indices using common synonyms; fallback to positional 0/1/2
    const emailKeys = ["email", "useremail", "e-mail"]; // normalized keys
    const calKeys = [
        "totalcaloriesburned",
        "calories",
        "kcal",
        "caloriesburned",
        "verifiedcalories",
        "submittedcalories",
        "totalcalories",
    ];
    const durKeys = [
        "totalduration",
        "duration",
        "minutes",
        "activityduration",
        "timespent",
    ];

    const findIdx = (keys, fallback) => {
        const idx = keys.map((k) => headerNorm.indexOf(k)).find((i) => i >= 0);
        return idx >= 0 ? idx : fallback;
    };

    const idxEmail = findIdx(emailKeys, 0);
    const idxCalories = findIdx(calKeys, 1);
    const idxDuration = findIdx(durKeys, 2);

    const users = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
        const raw = lines[i];
        if (!raw || !raw.trim()) continue;
        if (!raw.includes(delimiter)) continue;

        const cols = splitCsvLine(raw, delimiter).map(normalizeCell);

        const emailRaw = cols[idxEmail] ?? "";
        const caloriesRaw = cols[idxCalories] ?? "";
        const durationRaw = cols[idxDuration];

        let calories = parseNumberLoose(caloriesRaw);
        if (!Number.isFinite(calories)) calories = 0;

        let duration;
        const d = parseNumberLoose(durationRaw);
        if (Number.isFinite(d)) duration = d; // optional

        users.push({
            email: emailRaw,
            calories, // normalize to API expected key
            ...(duration !== undefined ? { duration } : {}),
        });
    }

    // If no data rows after header, but header had content, still return empty users (API accepts empty array)
    return { users, skipped: [] };
};
export default parseUsersFromCsv;
