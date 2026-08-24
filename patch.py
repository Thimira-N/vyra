import re

main_path = r'..\clinical-rss-api\app\main.py'
with open(main_path, 'r', encoding='utf-8') as f:
    main_code = f.read()

# Replace build_differential_summary
new_func = '''def build_differential_summary(img_class=None, lesion_desc=None,
                                txt_class=None, top_disease=None,
                                vit_class=None, vital_flags=None):
    unified = "Unknown condition"
    if img_class == "High":
        unified = lesion_desc if lesion_desc else "High-risk skin lesion"
    elif vit_class == "High":
        unified = "Systemic instability (critical vitals)"
    elif txt_class == "High" or top_disease not in (None, "Unspecified condition"):
        unified = top_disease
    elif img_class == "Medium":
        unified = lesion_desc if lesion_desc else "Moderate-risk skin lesion"
    else:
        unified = top_disease if top_disease else "Non-specific symptoms"

    return {
        "image_finding": None,
        "symptom_match": None,
        "vitals_pattern": None,
        "consistency_note": unified
    }'''

main_code = re.sub(r'def build_differential_summary\(.*?\):.*?return summary\n', new_func + '\n', main_code, flags=re.DOTALL)

with open(main_path, 'w', encoding='utf-8') as f:
    f.write(main_code)

assessments_path = r'..\clinical-rss-api\app\routers\assessments.py'
with open(assessments_path, 'r', encoding='utf-8') as f:
    ass_code = f.read()

if 'apply_safety_floor' not in ass_code:
    ass_code = ass_code.replace('run_fusion,', 'run_fusion,\n        apply_safety_floor,')
    ass_code = ass_code.replace('fused_probs, fused_class, method = run_fusion(img_probs, txt_probs, vit_probs)',
'''fused_probs, fused_class, method = run_fusion(img_probs, txt_probs, vit_probs)
        fused_class, fused_probs, overridden = apply_safety_floor(fused_class, fused_probs, vit_class, vital_flags)
        if overridden:
            method += " + vitals safety floor"''')

with open(assessments_path, 'w', encoding='utf-8') as f:
    f.write(ass_code)

print("Backend updated.")
