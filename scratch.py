import sys
import re

file_path = r"c:\Users\thimi\clinical-rss\clinical-rss-api\app\main.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_dict = """    return {
        "image_finding": lesion_desc if lesion_desc else "No image provided",
        "symptom_match": top_disease if top_disease else "No symptoms matched",
        "vitals_pattern": f"{len(vital_flags)} flag(s) ({vit_class} risk)" if vital_flags is not None else "No vitals provided",
        "consistency_note": unified
    }"""

content = re.sub(
    r'    return \{\s*"image_finding": None,\s*"symptom_match": None,\s*"vitals_pattern": None,\s*"consistency_note": unified\s*\}',
    new_dict,
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched!")
