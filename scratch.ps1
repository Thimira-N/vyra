$filePath = "c:\Users\thimi\clinical-rss\clinical-rss-api\app\main.py"
$content = Get-Content $filePath -Raw
$target = @"
    return {
        "image_finding": None,
        "symptom_match": None,
        "vitals_pattern": None,
        "consistency_note": unified
    }
"@

$replacement = @"
    return {
        "image_finding": lesion_desc if lesion_desc else "No image provided",
        "symptom_match": top_disease if top_disease else "No symptoms matched",
        "vitals_pattern": f"{len(vital_flags)} flag(s) ({vit_class} risk)" if vital_flags is not None else "No vitals provided",
        "consistency_note": unified
    }
"@

$newContent = $content.Replace($target, $replacement)
Set-Content -Path $filePath -Value $newContent -NoNewline
