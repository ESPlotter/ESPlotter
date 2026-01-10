
import numpy as np
import json
import os

def create_json_sample():
    """Create 2 JSON files with sample time series data for voltage and frequency."""
    # Create time vector
    time = np.arange(0.001, 10.001, 0.001)

    # Create dummy V and F values
    V_test1 = 0.98 + 0.05 * np.sin(2 * np.pi * 1 * time + 0.0)
    V_test2 = 0.98 + 0.10 * np.sin(2 * np.pi * 1 * time + 2.0)
    F_test1 = 50 + 2 * np.sin(2 * np.pi * 2 * time + 0.5)
    F_test2 = 50 + 3 * np.sin(2 * np.pi * 2 * time + 0.5)

    # Build json format
    json_structure_1 = {
        "schemaVersion": 1,
        "metadata": {
            "timestamp": "07/01/2026 21:30:01",
            "SCR": 4.5
        },
        "x": {
            "id": "time",
            "label": "Time",
            "unit": "s",
            "values": time.tolist()
        },
        "series": [
            {
                "id": "V",
                "label": "Voltage",
                "unit": "V",
                "values": V_test1.tolist()
            },
            {
                "id": "F",
                "label": "Frequency",
                "unit": "Hz",
                "values": F_test1.tolist()
            }
        ]
    }

    json_structure_2 = {
        "schemaVersion": 1,
        "metadata": {
            "timestamp": "07/01/2026 21:34:01",
            "SCR": 3.2
        },
        "x": {
            "id": "time",
            "label": "Time",
            "unit": "s",
            "values": time.tolist()
        },
        "series": [
            {
                "id": "V",
                "label": "Voltage",
                "unit": "V",
                "values": V_test2.tolist()
            },
            {
                "id": "F",
                "label": "Frequency",
                "unit": "Hz",
                "values": F_test2.tolist()
            }
        ]
    }

    # Save in a JSON file
    name_json = ["test2.json", "test3.json"]
    os.makedirs("fixtures", exist_ok=True)
    for name, json_structure in zip(name_json, [json_structure_2, json_structure_1]):
        with open(os.path.join("fixtures", name), "w") as f:
            json.dump(json_structure, f, indent=4)
        print(f"File {name} successfully created in 'fixtures' folder.")


def create_txt_sample():
    """Create a TXT file with sample time series data: Time, Voltage, Active Power, Reactive Power."""
    # Create time vector
    time = np.arange(0.001, 10.001, 0.001)
    
    # Create data values
    voltage = 0.98 + 0.10 * np.sin(2 * np.pi * 1 * time + 2.0)
    active_power = 10 - 10 * time * np.sin(2 * np.pi * time* 0.5 + 0.0)
    reactive_power = -10 + 10 * time * np.sin(2 * np.pi * time * 0.5 + 0.0)
    
    # Create the output directory if it doesn't exist
    os.makedirs("fixtures", exist_ok=True)
    
    # Write to TXT file
    with open(os.path.join("fixtures", "test1.txt"), "w") as f:
        # Write header
        f.write("Time, Voltage, Active Power, Reactive Power\n")
        
        # Write data rows
        for t, v, ap, rp in zip(time, voltage, active_power, reactive_power):
            f.write(f"{t:.3f}, {v:.5f}, {ap:.5f}, {rp:.5f}\n")
    
    print("File test1.txt successfully created in 'fixtures' folder.")


if __name__ == "__main__":
    create_json_sample()
    create_txt_sample()