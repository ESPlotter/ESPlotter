import numpy as np
import json
import os

# Crear el vector de tiempo
time = np.arange(0.001, 10.001, 0.001)

# Calcular V y F
V = 0.98 + 0.05 * np.sin(2 * np.pi * 1 * time + 0.5)
F = 50 + 2 * np.sin(2 * np.pi * 2 * time + 0.5)

# Construcción del nuevo formato JSON
json_structure = {
    "schemaVersion": 1,
    "metadata": {
        "timestamp": "05/10/2025 11:34:01",
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
            "values": V.tolist()
        },
        {
            "id": "F",
            "label": "Frequency",
            "unit": "Hz",
            "values": F.tolist()
        }
    ]
}

# Guardar en un archivo JSON
nombre_json = "test2.json"
os.makedirs("fixtures", exist_ok=True)

with open(os.path.join("fixtures", nombre_json), "w") as f:
    json.dump(json_structure, f, indent=4)

print(f"Archivo {nombre_json} creado con éxito")
