import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "reference_ranges.json")) as f:
    reference_ranges = json.load(f)

with open(os.path.join(BASE_DIR, "explanations.json")) as f:
    explanations = json.load(f)


def analyze_parameter(param, value, sex="general"):
    if param not in reference_ranges:
        return None

    ref = reference_ranges[param]

    if sex in ref:
        min_val = ref[sex]["min"]
        max_val = ref[sex]["max"]
    else:
        min_val = ref["general"]["min"]
        max_val = ref["general"]["max"]

    if value < min_val:
        return f"{param}_low"
    elif value > max_val:
        return f"{param}_high"
    else:
        return None

def analyze_bilan(data: dict):
    anomalies = []

    sex = data.get("sex", "general")

    for param, value in data.items():
        if param == "sex":
            continue

        result = analyze_parameter(param, value, sex)

        if result:
            anomalies.append(result)

    return anomalies

if __name__ == "__main__":
    test_data = {
        "sex": "female",
        "hemoglobin": 10.5,
        "glucose_fasting": 130,
        "crp": 15
    }

    result = analyze_bilan(test_data)
    print("Anomalies détectées :", result)