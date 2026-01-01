import json
import os
import sys
from pathlib import Path
from typing import Any

def main() -> None:
    dyn_path = os.environ.get("DYNTOOLS_PATH")
    dyntools_path = Path(dyn_path)
    sys.path.insert(0, str(dyntools_path))
    import dyntools  # type: ignore

    out_file_path = Path(sys.argv[1]).resolve()
    outfile = dyntools.CHNF(str(out_file_path), outvrsn=0)
    short_title, chid_dict, chandata_dict = outfile.get_data()

    parsed_out_file = {
        "shortTitle": short_title,
        "chid": chid_dict,
        "data": chandata_dict,
    }

    print(json.dumps(parsed_out_file, default=str))
    sys.stdout.flush()
    sys.exit(0)

if __name__ == "__main__":
    main()
