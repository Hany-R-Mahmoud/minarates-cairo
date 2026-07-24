#!/usr/bin/env python3
from __future__ import annotations

import copy
import hashlib
import json
import re
import shutil
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[2]
RESEARCH = ROOT / "docs" / "research"
OUT = RESEARCH / "merged-research_output"

CHAT = RESEARCH / "chatgpt-research_output"
QWEN = RESEARCH / "qwen-research_output"
GEMINI = RESEARCH / "gemini-research_output"
V4 = ROOT / "minarets_of_cairo_content_package_v4"
MEDIA_V2 = ROOT / "minarets_of_cairo_media_package_v2"

TODAY = date.today().isoformat()
PROVENANCE = {
    "chatgpt": "ChatGPT research package",
    "qwen": "Qwen research package",
    "gemini": "Gemini research package",
    "baseline_v4": "Content package v4 baseline",
    "media_v2": "Media package v2 baseline",
}

SLUG_ALIASES = {"aqunsqur-blue-mosque": "aqsunqur-blue-mosque"}
PLACEHOLDER_PATTERNS = (
    "يتطلب النص العربي الكامل",
    "مراجعة محرر متخصص",
    "requires official or field verification",
    "unknown — requires",
    "unknown - requires",
    "unknown—requires",
    "unknown -",
)
URL_RE = re.compile(r"^https?://\S+$", re.I)


def read_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def canonical_slug(slug: str | None) -> str | None:
    if not slug:
        return slug
    return SLUG_ALIASES.get(slug, slug)


def stable_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def fingerprint(value: Any) -> str:
    return hashlib.sha256(stable_json(value).encode("utf-8")).hexdigest()[:16]


def nonempty(value: Any) -> bool:
    return value is not None and value != "" and value != [] and value != {}


def is_url(value: Any) -> bool:
    return isinstance(value, str) and bool(URL_RE.match(value.strip()))


def is_arabic_placeholder(value: Any) -> bool:
    if not isinstance(value, str) or not value.strip():
        return True
    lowered = value.lower()
    if any(pattern.lower() in lowered for pattern in PLACEHOLDER_PATTERNS):
        return True
    words = re.findall(r"[A-Za-z]{4,}", value)
    return len(words) >= 3 and not re.search(r"[\u0600-\u06ff]", value)


def first_list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def unique_values(values: Iterable[Any]) -> list[Any]:
    result: list[Any] = []
    seen: set[str] = set()
    for value in values:
        if not nonempty(value):
            continue
        key = stable_json(value)
        if key not in seen:
            seen.add(key)
            result.append(copy.deepcopy(value))
    return result


def load_research_package(directory: Path, name: str) -> dict[str, Any]:
    places = read_json(directory / "all_places.json")
    claims = read_json(directory / "claims.json")
    photos = read_json(directory / "photos.json")
    unresolved = read_json(directory / "unresolved.json")
    sources = read_json(directory / "sources.json")
    markdown: dict[str, str] = {}
    for path in sorted((directory / "places").glob("*.md")):
        markdown[canonical_slug(path.stem) or path.stem] = path.read_text(encoding="utf-8")
    return {
        "name": name,
        "directory": str(directory),
        "places": places,
        "claims": claims,
        "photos": photos,
        "unresolved": unresolved,
        "sources": sources,
        "markdown": markdown,
    }


def source_list(value: Any) -> list[dict[str, Any]]:
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        return first_list(value.get("sources"))
    return []


def add_source(
    source_variants: dict[str, list[dict[str, Any]]],
    raw: dict[str, Any],
    provenance: str,
    conflicts: list[dict[str, Any]],
) -> None:
    source_id = raw.get("sourceId")
    if not source_id:
        return
    variant = copy.deepcopy(raw)
    variant["provenance"] = provenance
    variant["provenanceGroup"] = "chatgpt+qwen" if provenance in {"chatgpt", "qwen"} else provenance
    source_variants[source_id].append(variant)


def merge_sources(
    source_variants: dict[str, list[dict[str, Any]]],
    conflicts: list[dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}
    for source_id in sorted(source_variants):
        variants = source_variants[source_id]
        fields: dict[str, list[tuple[str, Any]]] = defaultdict(list)
        for variant in variants:
            for key, value in variant.items():
                if key not in {"provenance", "provenanceGroup"} and nonempty(value):
                    fields[key].append((variant["provenance"], value))
        record: dict[str, Any] = {"sourceId": source_id}
        for key, values in fields.items():
            record[key] = copy.deepcopy(values[0][1])
            alternatives = unique_values(value for _, value in values[1:])
            if alternatives:
                record.setdefault("alternateValues", {})[key] = [copy.deepcopy(values[0][1]), *alternatives]
                conflicts.append(
                    {
                        "conflictId": f"source:{source_id}:{key}",
                        "kind": "source-field",
                        "field": key,
                        "sourceId": source_id,
                        "values": [
                            {"provenance": provenance, "value": copy.deepcopy(value)}
                            for provenance, value in values
                        ],
                        "resolution": "all variants retained; first non-empty value is canonical",
                    }
                )
        record["provenance"] = sorted({v["provenance"] for v in variants})
        record["provenanceGroup"] = "chatgpt+qwen" if {"chatgpt", "qwen"}.issubset(set(record["provenance"])) else record["provenance"][0]
        if not is_url(record.get("url")):
            record["sourceStatus"] = "missing-or-invalid-url"
        merged[source_id] = record
    return merged


def normalize_claim(raw: dict[str, Any], provenance: str, slug_hint: str | None = None) -> dict[str, Any]:
    slug = canonical_slug(raw.get("placeSlug") or raw.get("slug") or slug_hint)
    source_ids = raw.get("sourceIds") or []
    claim = {
        "claimId": raw.get("claimId") or f"claim-{fingerprint(raw)}",
        "placeSlug": slug,
        "storySlug": raw.get("storySlug"),
        "claimType": raw.get("claimType") or "unspecified",
        "textEn": raw.get("textEn") or raw.get("claimTextEn") or "",
        "textAr": raw.get("textAr") or raw.get("claimTextAr") or "",
        "confidence": raw.get("confidence") or raw.get("certainty") or "unknown",
        "sourceIds": list(source_ids),
        "provenance": provenance,
        "provenanceGroup": "chatgpt+qwen" if provenance in {"chatgpt", "qwen"} else provenance,
    }
    return claim


def claim_acceptance(claim: dict[str, Any], sources: dict[str, dict[str, Any]]) -> tuple[bool, list[str]]:
    reasons: list[str] = []
    if not claim["placeSlug"]:
        reasons.append("missing-place-slug")
    if not claim["textEn"].strip():
        reasons.append("missing-English-text")
    if is_arabic_placeholder(claim["textAr"]):
        reasons.append("Arabic placeholder or incomplete Arabic text")
    if not claim["sourceIds"]:
        reasons.append("no-source-links")
    missing = [source_id for source_id in claim["sourceIds"] if source_id not in sources]
    if missing:
        reasons.append(f"unresolved-source-links:{','.join(missing)}")
    empty_urls = [source_id for source_id in claim["sourceIds"] if source_id in sources and not is_url(sources[source_id].get("url"))]
    if empty_urls:
        reasons.append(f"source-without-url:{','.join(empty_urls)}")
    return not reasons, reasons


def normalize_photo(raw: dict[str, Any], provenance: str, slug: str | None = None) -> dict[str, Any]:
    photo = copy.deepcopy(raw)
    photo["placeSlug"] = canonical_slug(photo.get("placeSlug") or slug)
    photo["sourcePage"] = photo.get("sourcePage") or photo.get("sourcePageUrl")
    photo["sourceUrl"] = photo.get("sourceUrl") or photo.get("directImageUrl")
    photo["licenseUrl"] = photo.get("licenseUrl") or ""
    photo["creator"] = photo.get("creator") or ""
    photo["license"] = photo.get("license") or ""
    photo["attribution"] = photo.get("attribution") or ""
    photo["provenance"] = provenance
    photo["provenanceGroup"] = "chatgpt+qwen" if provenance in {"chatgpt", "qwen"} else provenance
    return photo


def photo_acceptance(photo: dict[str, Any]) -> tuple[bool, list[str]]:
    reasons: list[str] = []
    for key in ("sourcePage", "creator", "license", "licenseUrl", "attribution"):
        if not nonempty(photo.get(key)):
            reasons.append(f"missing-{key}")
    if nonempty(photo.get("sourcePage")) and not is_url(photo["sourcePage"]):
        reasons.append("invalid-source-page-url")
    if nonempty(photo.get("licenseUrl")) and not is_url(photo["licenseUrl"]):
        reasons.append("invalid-license-url")
    if str(photo.get("creator", "")).strip().lower() == "wikimedia contributor":
        reasons.append("generic-creator-not-accepted")
    if str(photo.get("license", "")).strip().lower() in {"unknown", "", "unspecified"}:
        reasons.append("license-not-exact")
    return not reasons, reasons


def accepted_photo(photo: dict[str, Any], baseline_package: str) -> dict[str, Any]:
    value = copy.deepcopy(photo)
    value["rightsEvidence"] = {
        "sourcePage": value["sourcePage"],
        "sourceUrl": value.get("sourceUrl"),
        "creator": value["creator"],
        "license": value["license"],
        "licenseUrl": value["licenseUrl"],
        "attribution": value["attribution"],
        "verifiedBy": baseline_package,
        "evidenceStatus": "complete",
    }
    value["acceptanceStatus"] = "accepted-baseline-media"
    return value


def package_unresolved(package: dict[str, Any]) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for raw in package["unresolved"] if isinstance(package["unresolved"], list) else []:
        if "items" in raw:
            slug = canonical_slug(raw.get("slug"))
            items = first_list(raw.get("items"))
        else:
            slug = canonical_slug(raw.get("slug"))
            items = [raw.get("issue", "unresolved item")]
        records.append(
            {
                "recordId": f"{package['name']}:unresolved:{slug or fingerprint(raw)}",
                "slug": slug,
                "kind": "research-unresolved",
                "status": "manual-review",
                "items": items,
                "provenance": package["name"],
            }
        )
    return records


def markdown_unresolved(path: Path, package_name: str) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    items = []
    for line in path.read_text(encoding="utf-8").splitlines():
        match = re.match(r"\s*-\s+(.*)$", line)
        if match and match.group(1).strip():
            items.append(match.group(1).strip())
    if not items:
        return []
    return [
        {
            "recordId": f"{package_name}:unresolved-document",
            "slug": None,
            "kind": "package-unresolved-document",
            "status": "manual-review",
            "items": items,
            "provenance": package_name,
            "sourceFile": str(path.relative_to(ROOT)),
        }
    ]


def value_variants(records: list[tuple[str, Any]], field: str) -> list[dict[str, Any]]:
    variants: list[dict[str, Any]] = []
    seen: set[str] = set()
    for provenance, record in records:
        if field not in record or not nonempty(record[field]):
            continue
        value = record[field]
        key = stable_json(value)
        if key in seen:
            continue
        seen.add(key)
        variants.append({"provenance": provenance, "value": copy.deepcopy(value)})
    return variants


def preferred_field(field: str, records: list[tuple[str, dict[str, Any]]], baseline: dict[str, Any] | None) -> Any:
    if baseline and field in baseline and nonempty(baseline[field]):
        return copy.deepcopy(baseline[field])
    values = value_variants(records, field)
    if not values:
        return None
    if field in {"historicalSummary", "architectureSummary", "stories"}:
        for item in values:
            if item["provenance"] == "gemini":
                return item["value"]
    return values[0]["value"]


def merge_place(
    slug: str,
    package_records: list[tuple[str, dict[str, Any]]],
    markdown: dict[str, dict[str, str]],
    baseline_place: dict[str, Any] | None,
    baseline_story: dict[str, Any] | None,
    baseline_candidate: dict[str, Any] | None,
    media_by_slug: dict[str, list[dict[str, Any]]],
    media_research_note: str | None,
    conflicts: list[dict[str, Any]],
    unresolved: list[dict[str, Any]],
) -> dict[str, Any]:
    all_fields = sorted({key for _, record in package_records for key in record})
    merged: dict[str, Any] = {
        "schemaVersion": 1,
        "slug": slug,
        "status": package_records[0][1].get("status"),
        "slugAliases": sorted({raw.get("slug") for _, raw in package_records if raw.get("slug") and raw.get("slug") != slug}),
    }
    if merged["slugAliases"]:
        conflicts.append(
            {
                "conflictId": f"place:{slug}:slug",
                "kind": "slug-normalization",
                "slug": slug,
                "values": [{"provenance": provenance, "value": record.get("slug")} for provenance, record in package_records],
                "resolution": f"canonical baseline slug is {slug}; input aliases retained",
            }
        )

    field_merges: dict[str, Any] = {}
    baseline_for_field = baseline_place or {}
    for field in all_fields:
        if field in {"slug", "status", "claims", "sources", "photos", "unresolved"}:
            continue
        variants = value_variants(package_records, field)
        baseline_value = baseline_for_field.get(field)
        canonical = preferred_field(field, package_records, baseline_for_field)
        if field in {"nameAr", "historicalSummary", "architectureSummary"} and isinstance(canonical, dict):
            canonical = copy.deepcopy(canonical)
            if is_arabic_placeholder(canonical.get("ar")):
                good = next((item["value"] for item in variants if isinstance(item["value"], dict) and not is_arabic_placeholder(item["value"].get("ar"))), None)
                canonical["ar"] = good.get("ar") if isinstance(good, dict) else None
        elif field.endswith("Ar") and is_arabic_placeholder(canonical):
            good = next((item["value"] for item in variants if not is_arabic_placeholder(item["value"])), None)
            canonical = good
        if nonempty(canonical):
            merged[field] = canonical
        field_merges[field] = {
            "canonical": copy.deepcopy(canonical),
            "variants": variants,
            "baselineValue": copy.deepcopy(baseline_value) if nonempty(baseline_value) else None,
            "conflict": len({stable_json(item["value"]) for item in variants}) > 1,
        }
        if len({stable_json(item["value"]) for item in variants}) > 1:
            conflicts.append(
                {
                    "conflictId": f"place:{slug}:{field}",
                    "kind": "place-field",
                    "slug": slug,
                    "field": field,
                    "values": variants,
                    "baselineValue": copy.deepcopy(baseline_value) if nonempty(baseline_value) else None,
                    "resolution": "canonical value selected conservatively; all variants retained in fieldMerges and researchVariants",
                }
            )

    for field in ("alternativeNames", "relatedSlugs", "historicalPeriods", "architecturalElements"):
        values = []
        for _, record in package_records:
            values.extend(first_list(record.get(field)))
        if values:
            merged[field] = unique_values(values)

    visitor_variants = value_variants(package_records, "visitorInformation")
    visitor = None
    for provenance, record in package_records:
        if provenance in {"chatgpt", "qwen"} and nonempty(record.get("visitorInformation")):
            visitor = copy.deepcopy(record["visitorInformation"])
            break
    if visitor is None and baseline_place:
        visitor = {key: baseline_place[key] for key in ("openingHours", "ticketPrice", "photographyAllowed", "ticketed") if key in baseline_place}
    if visitor:
        merged["visitorInformation"] = visitor
    for item in visitor_variants:
        if item["provenance"] == "gemini" and isinstance(item["value"], dict):
            non_unknown = {key: value for key, value in item["value"].items() if nonempty(value) and "unknown" not in str(value).lower()}
            if non_unknown:
                unresolved.append(
                    {
                        "recordId": f"{slug}:visitor-current-official-check",
                        "slug": slug,
                        "kind": "current-visitor-data",
                        "status": "manual-review",
                        "items": ["Gemini supplied current-looking visitor fields without current official support.", non_unknown],
                        "provenance": "gemini",
                        "requiredEvidence": "current official notice or field verification",
                    }
                )

    accepted_media = [copy.deepcopy(asset) for asset in media_by_slug.get(slug, [])]
    if accepted_media:
        merged["photos"] = accepted_media
    elif "photos" not in merged:
        merged["photos"] = []

    merged["fieldMerges"] = field_merges
    merged["researchVariants"] = {
        "chatgptQwen": copy.deepcopy(next((record for provenance, record in package_records if provenance == "chatgpt"), package_records[0][1])),
        "gemini": copy.deepcopy(next((record for provenance, record in package_records if provenance == "gemini"), {})),
        "duplicateAgreement": True,
        "markdown": copy.deepcopy(markdown.get(slug, {})),
    }
    merged["baseline"] = {
        "contentPackageV4Place": copy.deepcopy(baseline_place),
        "contentPackageV4Story": copy.deepcopy(baseline_story),
        "contentPackageV4Candidate": copy.deepcopy(baseline_candidate),
        "mediaPackageV2Assets": copy.deepcopy(media_by_slug.get(slug, [])),
        "mediaPackageV2ResearchNote": media_research_note,
    }
    source_ids: list[str] = []
    source_details: list[dict[str, Any]] = []
    for _, record in package_records:
        for source in first_list(record.get("sources")):
            if isinstance(source, str):
                source_ids.append(source)
            elif isinstance(source, dict):
                if source.get("sourceId"):
                    source_ids.append(source["sourceId"])
                source_details.append(source)
    if baseline_place:
        source_ids.extend(first_list(baseline_place.get("sourceIds")))
    if baseline_story:
        source_ids.extend(first_list(baseline_story.get("sourceIds")))
    merged["sources"] = unique_values(source_ids)
    merged["sourceDetails"] = unique_values(source_details)
    merged["unresolved"] = unique_values(
        item
        for _, record in package_records
        for item in first_list(record.get("unresolved"))
    )
    if baseline_story:
        merged["stories"] = unique_values([*first_list(merged.get("stories")), baseline_story])
    if baseline_place:
        merged["baselineAcceptedContent"] = {
            "sourceIds": baseline_place.get("sourceIds", []),
            "claimIds": baseline_place.get("claimIds", []),
            "bilingual": True,
        }
    if baseline_candidate:
        merged["baselineCandidateStatus"] = baseline_candidate.get("verificationStatus")
    return merged


def markdown_place(place: dict[str, Any], accepted_claims: list[dict[str, Any]], place_conflicts: list[dict[str, Any]], place_unresolved: list[dict[str, Any]]) -> str:
    def dump(value: Any) -> str:
        return json.dumps(value, ensure_ascii=False, indent=2)

    lines = [f"# {place.get('nameEn') or place['slug']}", "", f"- Slug: `{place['slug']}`", f"- Status: **{place.get('status', 'UNKNOWN')}**"]
    if place.get("nameAr"):
        lines.append(f"- Arabic: {place['nameAr']}")
    for field, label in (("district", "District"), ("placeType", "Type"), ("historicalPeriods", "Historical periods"), ("architecturalElements", "Architectural elements")):
        if nonempty(place.get(field)):
            lines.extend([f"- {label}: {place[field]}"])
    for field, heading in (("historicalSummary", "Historical summary"), ("architectureSummary", "Architecture summary")):
        value = place.get(field)
        if isinstance(value, dict):
            lines.extend(["", f"## {heading}", "", value.get("en") or "", "", value.get("ar") or "[Arabic text unresolved]"])
    if place.get("visitorInformation"):
        lines.extend(["", "## Visitor information", "", dump(place["visitorInformation"])])
    if accepted_claims:
        lines.extend(["", "## Accepted source-linked claims", ""])
        for claim in accepted_claims:
            lines.extend([f"### {claim['claimType']} — {claim['claimId']}", "", claim["textEn"], "", claim["textAr"], "", f"Sources: {', '.join(claim['sourceIds'])}", ""])
    if place.get("stories"):
        lines.extend(["", "## Preserved stories", "", dump(place["stories"])])
    baseline_story = place.get("baseline", {}).get("contentPackageV4Story")
    if baseline_story:
        lines.extend(["", "## Baseline v4 story", "", dump(baseline_story)])
    if place.get("photos"):
        lines.extend(["", "## Accepted baseline photos", ""])
        for photo in place["photos"]:
            lines.append(f"- {photo.get('attribution')} — source page: {photo.get('sourcePage')} — license: {photo.get('licenseUrl')}")
    media_note = place.get("baseline", {}).get("mediaPackageV2ResearchNote")
    if media_note:
        lines.extend(["", "## Preserved media research note", "", media_note.rstrip()])
    if place_conflicts:
        lines.extend(["", "## Conflicts retained", "", dump(place_conflicts)])
    if place_unresolved:
        lines.extend(["", "## Manual review / unresolved", "", dump(place_unresolved)])
    for group, text in place.get("researchVariants", {}).get("markdown", {}).items():
        lines.extend(["", f"## Preserved {group} research note", "", text.rstrip()])
    return "\n".join(lines).rstrip() + "\n"


def validate(
    places: list[dict[str, Any]],
    accepted_claims: list[dict[str, Any]],
    photos: list[dict[str, Any]],
    conflicts: list[dict[str, Any]],
    unresolved: list[dict[str, Any]],
    sources: dict[str, dict[str, Any]],
    json_files: list[Path],
    markdown_files: list[Path],
) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    status_counts = Counter(place.get("status") for place in places)
    slugs = [place.get("slug") for place in places]
    checks = {
        "placeCount": len(places),
        "uniqueSlugs": len(set(slugs)) == len(slugs),
        "statusCounts": dict(status_counts),
        "jsonPlaceFiles": len(json_files),
        "markdownPlaceFiles": len(markdown_files),
        "acceptedClaimCount": len(accepted_claims),
        "acceptedPhotoCount": len(photos),
        "sourceCount": len(sources),
        "conflictCount": len(conflicts),
        "unresolvedRecordCount": len(unresolved),
    }
    if len(places) != 123:
        errors.append(f"expected 123 places, got {len(places)}")
    if len(set(slugs)) != 123:
        errors.append("place slugs are not unique")
    expected_status = {"PUBLISHED_MEDIA": 41, "PROPOSED_V4": 10, "CANDIDATE": 72}
    if dict(status_counts) != expected_status:
        errors.append(f"status counts differ: {dict(status_counts)}")
    if len(json_files) != 123 or len(markdown_files) != 123:
        errors.append(f"expected 123 JSON and 123 Markdown place files, got {len(json_files)} and {len(markdown_files)}")
    if not conflicts:
        errors.append("conflicts.json is empty; variants were likely dropped")
    if not unresolved:
        errors.append("unresolved.json is empty; unresolved items were likely dropped")
    for claim in accepted_claims:
        if not claim.get("sourceIds"):
            errors.append(f"accepted claim has no source links: {claim.get('claimId')}")
        for source_id in claim["sourceIds"]:
            if source_id not in sources or not is_url(sources[source_id].get("url")):
                errors.append(f"accepted claim has invalid source link: {claim.get('claimId')} -> {source_id}")
        if is_arabic_placeholder(claim.get("textAr")):
            errors.append(f"accepted claim has Arabic placeholder: {claim.get('claimId')}")
    required_photo_keys = ("sourcePage", "creator", "license", "licenseUrl", "attribution", "rightsEvidence")
    for photo in photos:
        for key in required_photo_keys:
            if not nonempty(photo.get(key)):
                errors.append(f"accepted photo missing {key}: {photo.get('assetId') or photo.get('title')}")
        if str(photo.get("creator", "")).strip().lower() == "wikimedia contributor":
            errors.append(f"generic photo creator accepted: {photo.get('assetId') or photo.get('title')}")
    accepted_arabic_fields = []
    for place in places:
        for key in ("nameAr", "historicalSummary", "architectureSummary"):
            value = place.get(key)
            value = value.get("ar") if isinstance(value, dict) else value
            if value and is_arabic_placeholder(value):
                accepted_arabic_fields.append(f"{place['slug']}.{key}")
    if accepted_arabic_fields:
        errors.append("accepted Arabic placeholders: " + ", ".join(accepted_arabic_fields[:10]))
    return {"result": "PASS" if not errors else "FAIL", "errors": errors, "warnings": warnings, "checks": checks}


def main() -> int:
    packages = [
        load_research_package(CHAT, "chatgpt"),
        load_research_package(QWEN, "qwen"),
        load_research_package(GEMINI, "gemini"),
    ]
    package_by_name = {package["name"]: package for package in packages}
    place_groups: dict[str, list[tuple[str, dict[str, Any]]]] = defaultdict(list)
    markdown_by_slug: dict[str, dict[str, str]] = defaultdict(dict)
    all_input_slugs: dict[str, set[str]] = defaultdict(set)
    claim_slug_by_id: dict[str, str] = {}
    photo_slug_by_key: dict[str, str] = {}
    for package in packages:
        if len(package["places"]) != 123:
            raise RuntimeError(f"{package['name']} does not contain exactly 123 places")
        for raw in package["places"]:
            slug = canonical_slug(raw.get("slug"))
            if not slug:
                raise RuntimeError(f"{package['name']} has a place without slug")
            place_groups[slug].append((package["name"], copy.deepcopy(raw)))
            all_input_slugs[slug].add(raw.get("slug", slug))
            for claim in first_list(raw.get("claims")):
                if claim.get("claimId"):
                    claim_slug_by_id[claim["claimId"]] = slug
            for photo in first_list(raw.get("photos")):
                for key in (photo.get("sourcePageUrl"), photo.get("directImageUrl"), photo.get("sourcePage"), photo.get("title")):
                    if key:
                        photo_slug_by_key[key] = slug
        for slug, text in package["markdown"].items():
            markdown_by_slug[slug][package["name"]] = text

    baseline_places = {
        canonical_slug(path.stem): read_json(path)
        for path in sorted((V4 / "published-places").glob("*.json"))
    }
    baseline_stories = {}
    for path in sorted((V4 / "stories").glob("*.json")):
        story = read_json(path)
        baseline_stories[canonical_slug(story.get("relatedPlaceSlug") or path.stem.replace("story-", ""))] = story
    baseline_candidates = {}
    for path in sorted((V4 / "candidates").glob("*.json")):
        candidate = read_json(path)
        baseline_candidates[canonical_slug(candidate.get("candidateSlug") or path.stem)] = candidate
    media_research_notes = {
        canonical_slug(path.stem): path.read_text(encoding="utf-8")
        for path in sorted((MEDIA_V2 / "research").glob("*.md"))
    }

    media_by_slug: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for package_name, manifest_path in (("media_v2", MEDIA_V2 / "media-manifest.json"), ("baseline_v4", V4 / "media-manifest.json")):
        manifest = read_json(manifest_path)
        assets = manifest.get("assets", []) if isinstance(manifest, dict) else []
        for raw in assets:
            photo = normalize_photo(raw, package_name, raw.get("placeSlug"))
            ok, reasons = photo_acceptance(photo)
            if not ok:
                raise RuntimeError(f"baseline media failed rights validation: {photo.get('assetId')} {reasons}")
            media_by_slug[canonical_slug(photo.get("placeSlug"))].append(accepted_photo(photo, package_name))

    source_variants: dict[str, list[dict[str, Any]]] = defaultdict(list)
    conflicts: list[dict[str, Any]] = []
    for package in packages:
        for source in source_list(package["sources"]):
            add_source(source_variants, source, package["name"], conflicts)
    baseline_source_file = read_json(V4 / "sources.json")
    for source in source_list(baseline_source_file):
        add_source(source_variants, source, "baseline_v4", conflicts)

    sources = merge_sources(source_variants, conflicts)

    for slug, assets in media_by_slug.items():
        for photo in assets:
            source_id = f"photo:{photo.get('assetId')}:source-page"
            source_variants[source_id].append(
                {
                    "sourceId": source_id,
                    "title": photo.get("sourceTitle") or photo.get("title") or photo.get("assetId"),
                    "url": photo.get("sourcePage"),
                    "sourceType": "photo-source-page",
                    "publisher": "Wikimedia Commons",
                    "provenance": photo.get("provenance"),
                    "provenanceGroup": photo.get("provenanceGroup"),
                }
            )
            photo["rightsEvidence"]["sourceId"] = source_id
    sources = merge_sources(source_variants, conflicts)

    all_claim_variants: list[dict[str, Any]] = []
    for package in packages:
        for raw in package["claims"]:
            all_claim_variants.append(normalize_claim(raw, package["name"], raw.get("placeSlug") or claim_slug_by_id.get(raw.get("claimId"))))
    baseline_claims = read_json(V4 / "claims.json")
    for raw in first_list(baseline_claims.get("claims")):
        all_claim_variants.append(normalize_claim(raw, "baseline_v4", raw.get("placeSlug")))

    claim_groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for claim in all_claim_variants:
        key = stable_json({k: claim[k] for k in ("placeSlug", "storySlug", "claimType", "textEn", "textAr", "sourceIds")})
        claim_groups[key].append(claim)
    accepted_claims: list[dict[str, Any]] = []
    alternate_claims: list[dict[str, Any]] = []
    claim_type_groups: dict[tuple[str | None, str, str | None], list[dict[str, Any]]] = defaultdict(list)
    for claim in all_claim_variants:
        claim_type_groups[(claim.get("placeSlug"), claim.get("claimType", "unspecified"), claim.get("storySlug"))].append(claim)
    for (slug, claim_type, story_slug), variants in claim_type_groups.items():
        text_keys = {stable_json((variant.get("textEn"), variant.get("textAr"))) for variant in variants}
        if len(text_keys) > 1:
            conflicts.append(
                {
                    "conflictId": f"claim-type:{slug}:{claim_type}:{story_slug or 'place'}",
                    "kind": "claim-type-variant",
                    "slug": slug,
                    "field": claim_type,
                    "values": [
                        {
                            "provenance": variant.get("provenance"),
                            "claimId": variant.get("claimId"),
                            "textEn": variant.get("textEn"),
                            "textAr": variant.get("textAr"),
                            "sourceIds": variant.get("sourceIds"),
                        }
                        for variant in variants
                    ],
                    "resolution": "all distinct claim texts retained; acceptance still requires bilingual source-linked evidence",
                }
            )
    for variants in claim_groups.values():
        claim = copy.deepcopy(variants[0])
        claim["provenance"] = sorted({variant["provenance"] for variant in variants})
        claim["provenanceGroup"] = "chatgpt+qwen" if {"chatgpt", "qwen"}.intersection(claim["provenance"]) else claim["provenance"][0]
        ok, reasons = claim_acceptance(claim, sources)
        if ok:
            claim["acceptanceStatus"] = "accepted-source-linked"
            accepted_claims.append(claim)
        else:
            claim["acceptanceStatus"] = "alternate-unresolved"
            claim["reasons"] = reasons
            alternate_claims.append(claim)
        if len({stable_json({k: variant[k] for k in ("textEn", "textAr", "sourceIds")}) for variant in variants}) > 1:
            conflicts.append(
                {
                    "conflictId": f"claim:{claim['placeSlug']}:{claim['claimType']}:{fingerprint(variants)}",
                    "kind": "claim-variant",
                    "slug": claim["placeSlug"],
                    "field": "claim",
                    "values": [
                        {"provenance": variant["provenance"], "claimId": variant["claimId"], "textEn": variant["textEn"], "textAr": variant["textAr"], "sourceIds": variant["sourceIds"]}
                        for variant in variants
                    ],
                    "resolution": "accepted only if bilingual and source-linked; other variants remain alternate-unresolved",
                }
            )

    rejected_photos: list[dict[str, Any]] = []
    for package in packages:
        for raw in package["photos"]:
            slug_hint = raw.get("placeSlug")
            if not slug_hint:
                slug_hint = next((photo_slug_by_key[key] for key in (raw.get("sourcePageUrl"), raw.get("directImageUrl"), raw.get("sourcePage"), raw.get("title")) if key in photo_slug_by_key), None)
            photo = normalize_photo(raw, package["name"], slug_hint)
            ok, reasons = photo_acceptance(photo)
            if ok:
                photo["acceptanceStatus"] = "alternate-unresolved"
                photo["reasons"] = ["research photo not baseline-approved"]
            else:
                photo["acceptanceStatus"] = "alternate-unresolved"
                photo["reasons"] = reasons
            rejected_photos.append(photo)
            conflicts.append(
                {
                    "conflictId": f"photo:{photo.get('placeSlug')}:{fingerprint(photo)}",
                    "kind": "photo-rights",
                    "slug": photo.get("placeSlug"),
                    "values": [photo],
                    "resolution": "not accepted; exact creator/license/rights evidence is required",
                }
            )

    unresolved: list[dict[str, Any]] = []
    for package in packages:
        unresolved.extend(package_unresolved(package))
        unresolved.extend(markdown_unresolved(Path(package["directory"]) / "unresolved.md", package["name"]))
    unresolved.extend(markdown_unresolved(V4 / "unresolved.md", "baseline_v4"))
    unresolved.extend(markdown_unresolved(MEDIA_V2 / "unresolved.md", "media_v2"))
    for claim in alternate_claims:
        unresolved.append(
            {
                "recordId": f"claim:{claim['claimId']}:manual-review",
                "slug": claim.get("placeSlug"),
                "kind": "claim-alternate",
                "status": "manual-review",
                "items": claim.get("reasons", []) + [claim.get("textEn")],
                "provenance": claim.get("provenance"),
            }
        )
    for photo in rejected_photos:
        unresolved.append(
            {
                "recordId": f"photo:{photo.get('placeSlug')}:{fingerprint(photo)}:manual-review",
                "slug": photo.get("placeSlug"),
                "kind": "photo-rights-alternate",
                "status": "manual-review",
                "items": photo.get("reasons", []),
                "provenance": photo.get("provenance"),
            }
        )

    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "places").mkdir(parents=True, exist_ok=True)

    places: list[dict[str, Any]] = []
    place_claim_map: dict[str, list[dict[str, Any]]] = defaultdict(list)
    place_alternate_claim_map: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for claim in accepted_claims:
        place_claim_map[claim.get("placeSlug")].append(claim)
    for claim in alternate_claims:
        place_alternate_claim_map[claim.get("placeSlug")].append(claim)
    for slug in sorted(place_groups):
        place = merge_place(
            slug,
            place_groups[slug],
            markdown_by_slug,
            baseline_places.get(slug),
            baseline_stories.get(slug),
            baseline_candidates.get(slug),
            media_by_slug,
            media_research_notes.get(slug),
            conflicts,
            unresolved,
        )
        place["acceptedClaims"] = place_claim_map.get(slug, [])
        place["alternateClaims"] = place_alternate_claim_map.get(slug, [])
        places.append(place)
        place_conflicts = [item for item in conflicts if item.get("slug") == slug]
        place_unresolved = [item for item in unresolved if item.get("slug") == slug]
        (OUT / "places" / f"{slug}.json").write_text(json.dumps(place, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (OUT / "places" / f"{slug}.md").write_text(markdown_place(place, place_claim_map.get(slug, []), place_conflicts, place_unresolved), encoding="utf-8")

    write_json(OUT / "all_places.json", places)
    write_json(OUT / "claims.json", {
        "schemaVersion": 1,
        "accepted": sorted(accepted_claims, key=lambda item: (item.get("placeSlug") or "", item.get("claimId") or "")),
        "alternate": sorted(alternate_claims, key=lambda item: (item.get("placeSlug") or "", item.get("claimId") or "")),
    })
    write_json(OUT / "sources.json", {"schemaVersion": 1, "sources": [sources[key] for key in sorted(sources)]})
    write_json(OUT / "photos.json", {
        "schemaVersion": 1,
        "accepted": [photo for slug in sorted(media_by_slug) for photo in media_by_slug[slug]],
        "alternate": rejected_photos,
        "researchNotes": {slug: media_research_notes[slug] for slug in sorted(media_research_notes)},
    })
    write_json(OUT / "conflicts.json", {"schemaVersion": 1, "conflicts": conflicts})
    write_json(OUT / "unresolved.json", {"schemaVersion": 1, "records": unresolved})

    json_files = sorted((OUT / "places").glob("*.json"))
    markdown_files = sorted((OUT / "places").glob("*.md"))
    validation = validate(places, accepted_claims, [photo for assets in media_by_slug.values() for photo in assets], conflicts, unresolved, sources, json_files, markdown_files)
    critical_conflicts = [
        item
        for item in conflicts
        if item.get("kind") in {"slug-normalization", "claim-type-variant", "photo-rights", "source-field"}
    ]
    critical_conflicts.sort(key=lambda item: {"slug-normalization": 0, "claim-type-variant": 1, "photo-rights": 2, "source-field": 3}.get(item.get("kind"), 9))
    report = {
        "schemaVersion": 1,
        "generatedAt": TODAY,
        "inputs": {
            "researchPackages": [str(package["directory"]) for package in packages],
            "contentBaseline": str(V4),
            "mediaBaseline": str(MEDIA_V2),
        },
        "counts": {
            "places": len(places),
            "jsonPlaceFiles": len(json_files),
            "markdownPlaceFiles": len(markdown_files),
            "statusCounts": dict(Counter(place.get("status") for place in places)),
            "acceptedClaims": len(accepted_claims),
            "alternateClaims": len(alternate_claims),
            "acceptedPhotos": sum(len(assets) for assets in media_by_slug.values()),
            "mediaResearchNotes": len(media_research_notes),
            "alternatePhotos": len(rejected_photos),
            "sources": len(sources),
            "conflicts": len(conflicts),
            "conflictKinds": dict(Counter(item.get("kind") for item in conflicts)),
            "unresolvedRecords": len(unresolved),
            "unresolvedKinds": dict(Counter(item.get("kind") for item in unresolved)),
        },
        "provenancePolicy": {
            "chatgptQwen": "one provenance group when duplicated",
            "unsupportedClaims": "alternate-unresolved",
            "currentVisitorData": "requires current official support; Gemini non-unknown values not accepted",
            "photoAcceptance": "baseline only with source page, creator, exact license, license URL, attribution, and rights evidence",
            "arabicPlaceholders": "never accepted",
        },
        "criticalConflicts": [
            {"conflictId": item["conflictId"], "kind": item["kind"], "slug": item.get("slug"), "field": item.get("field"), "resolution": item.get("resolution")}
            for item in critical_conflicts[:100]
        ],
        "manualReviewRecords": [record["recordId"] for record in unresolved if record.get("status") == "manual-review"],
        "validation": validation,
    }
    write_json(OUT / "merge-report.json", report)
    write_json(OUT / "validation-report.json", validation)
    print(json.dumps({"result": validation["result"], "counts": report["counts"], "errors": validation["errors"]}, ensure_ascii=False, indent=2))
    return 0 if validation["result"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
