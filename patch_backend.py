import os

main_py_path = r"c:\Users\thimi\clinical-rss\clinical-rss-api\app\main.py"
with open(main_py_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update run_vitals_model
target_vitals = """def run_vitals_model(vitals_dict):
    feature_values = []"""

replacement_vitals = """def run_vitals_model(vitals_dict):
    if not vitals_dict or not any(vitals_dict.get(k) is not None for k in FINAL_FEATURE_COLS):
        return None, None, []
    feature_values = []"""

if target_vitals in content:
    content = content.replace(target_vitals, replacement_vitals, 1)
    print("Patched run_vitals_model in main.py")
else:
    print("target_vitals already patched or not found")

# 2. Update apply_safety_floor
target_floor = """def apply_safety_floor(fused_class, fused_probs, vit_class, vital_flags):
    # If vitals indicate high risk (3+ flags), safety floor activates
    if vit_class == "High" and fused_class != "High":
        fused_class = "High"
        import numpy as np
        fused_probs = np.array([0.1, 0.2, 0.7])  # Override probs to high
        return fused_class, fused_probs, True
    return fused_class, fused_probs, False"""

replacement_floor = """def apply_safety_floor(fused_class, fused_probs, vit_class, vital_flags):
    # Safety floor activates ONLY if vitals indicate high risk AND there are critical or >= 3 flags
    critical_flags = [f for f in (vital_flags or []) if f.get("severity") == "CRITICAL"]
    if vit_class == "High" and (len(critical_flags) > 0 or len(vital_flags or []) >= 3) and fused_class != "High":
        fused_class = "High"
        import numpy as np
        fused_probs = np.array([0.1, 0.2, 0.7])  # Override probs to high
        return fused_class, fused_probs, True
    return fused_class, fused_probs, False"""

if target_floor in content:
    content = content.replace(target_floor, replacement_floor, 1)
    print("Patched apply_safety_floor in main.py")
else:
    print("target_floor already patched or not found")

with open(main_py_path, "w", encoding="utf-8") as f:
    f.write(content)

# 3. Update assessments.py
assessments_py_path = r"c:\Users\thimi\clinical-rss\clinical-rss-api\app\routers\assessments.py"
with open(assessments_py_path, "r", encoding="utf-8") as f:
    ass_content = f.read()

target_ass_vitals = """    per_modality["vitals"] = {
        "risk": vit_class, 
        "flags": len(vital_flags), 
        "flagged_vitals": vital_flags
    }"""

replacement_ass_vitals = """    if vit_probs is not None:
        per_modality["vitals"] = {
            "risk": vit_class, 
            "flags": len(vital_flags or []), 
            "flagged_vitals": vital_flags or []
        }
    else:
        per_modality["vitals"] = None"""

if target_ass_vitals in ass_content:
    ass_content = ass_content.replace(target_ass_vitals, replacement_ass_vitals, 1)
    print("Patched per_modality vitals in assessments.py")
else:
    print("target_ass_vitals already patched or not found")

with open(assessments_py_path, "w", encoding="utf-8") as f:
    f.write(ass_content)

print("All backend patches successfully applied!")
