import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


def split_label_and_unit(raw_label: str) -> tuple[str, str]:
    trimmed = raw_label.strip()
    match = re.match(r"^(.*)\(([^)]+)\)$", trimmed)
    if match:
        label = match.group(1).strip() or trimmed
        unit = match.group(2).strip()
        return label, unit

    return trimmed, ""


def resolve_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def main() -> None:
    dyn_path = os.environ.get("DYNTOOLS_PATH")
    dyntools_path = Path(dyn_path)
    sys.path.insert(0, str(dyntools_path))
    import dyntools  # type: ignore

    out_file_path = Path(sys.argv[1]).resolve()
    cache_dir = Path(sys.argv[2]).resolve()
    series_dir = cache_dir / "series"
    cache_dir.mkdir(parents=True, exist_ok=True)
    series_dir.mkdir(parents=True, exist_ok=True)

    outfile = dyntools.CHNF(str(out_file_path), outvrsn=0)
    short_title, chid_dict, chandata_dict = outfile.get_data()

    mapped_channels: list[dict[str, object]] = []
    for key, values in chandata_dict.items():
        raw_label = str(chid_dict.get(key) or key)
        label, unit = split_label_and_unit(raw_label)
        normalized_label = raw_label.strip()
        is_time = (
            label.lower() == "time"
            or normalized_label.lower() == "time"
            or str(key).lower() == "time"
        )
        mapped_channels.append(
            {
                "key": str(key),
                "label": label,
                "unit": unit,
                "values": values,
                "is_time": is_time,
            }
        )

    usable_channels = [c for c in mapped_channels if len(c["values"]) > 0]
    if not usable_channels:
        raise ValueError("DynTools output has no usable channels.")

    target_length = min(len(c["values"]) for c in usable_channels)
    time_channel = next((c for c in usable_channels if c["is_time"]), usable_channels[0])

    x_label = time_channel["label"] or "time"
    x_unit = time_channel["unit"] or "s"
    x_values = list(time_channel["values"][:target_length])

    preview = {
        "path": str(out_file_path),
        "content": {
            "schemaVersion": 1,
            "metadata": {
                "timestamp": resolve_timestamp(),
                "SCR": 0,
                "shortTitle": short_title,
            },
            "x": {
                "id": "time",
                "label": x_label,
                "unit": x_unit,
            },
            "series": [],
        },
    }

    for channel in usable_channels:
        if channel is time_channel:
            continue
        channel_id = channel["key"]
        preview["content"]["series"].append(
            {
                "id": channel_id,
                "label": channel["label"] or channel_id,
                "unit": channel["unit"],
            }
        )

        channel_values = list(channel["values"][:target_length])
        channel_path = series_dir / f"{channel_id}.json"
        channel_path.write_text(json.dumps(channel_values, ensure_ascii=True))

    (cache_dir / "x.json").write_text(json.dumps(x_values, ensure_ascii=True))
    (cache_dir / "preview.json").write_text(json.dumps(preview, ensure_ascii=True))

    output = json.dumps({"preview": preview}, ensure_ascii=True)
    print(output)
    sys.stdout.flush()
    sys.exit(0)


if __name__ == "__main__":
    main()
