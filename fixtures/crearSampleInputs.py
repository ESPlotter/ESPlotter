import numpy as np
import json
import os

# Crear el vector de tiempo
time = np.arange(0.001, 10.001, 0.001)  # Empieza en 0.001 para coincidir con el ejemplo

# Calcular V y F (puedes ajustar las fórmulas si necesitas otros valores)
V = 0.98 + 0.05 * np.sin(2 * np.pi * 1 * time+0.5)
F = 50 + 2 * np.sin(2 * np.pi * 2 * time+0.5)

# Construir la estructura de datos como en test3.json
data = {
    "channel": ["time", "V", "F"],
    "values": np.stack([time, V, F], axis=1).tolist()
}

metadata = {
    "timestamp": "05/10/2025 11:34:01",
    "SCR": 4.5
}

json_structure = {
    "data": data,
    "metadata": metadata
}

# Guardar en un archivo JSON
nombre_json = "test2.json"
with open(os.path.join("fixtures", nombre_json), "w") as f:
    json.dump(json_structure, f, indent=4)

print(f"Archivo {nombre_json} creado con éxito")