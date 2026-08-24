import os, re

f1_path = r'c:\Users\thimi\clinical-rss\vyra\src\app\(staff)\new-assessment\result.tsx'
with open(f1_path, 'r', encoding='utf-8') as f:
    c1 = f.read()

c1 = re.sub(r'(import \{[\s\S]*?)(Alert,)([\s\S]*?\} from \'react-native\';)', r'\1\2\n  ActivityIndicator,\3', c1)

state_code = '''
  const [gradcamLoading, setGradcamLoading] = useState(true);
  const [gradcamError, setGradcamError] = useState(false);
'''
c1 = re.sub(r'(const reset = useAssessmentDraftStore\(\(s\) => s\.reset\);)', r'\1\n' + state_code, c1)

old_gradcam = r'''      {/* Grad-CAM overlay if available */}
      {result.gradcam_overlay_url && (
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Grad-CAM Visualization</Text>
          <Image
            source={{ uri: result.gradcam_overlay_url }}
            style={styles.gradcamImage}
            resizeMode="contain"
          />
        </View>
      )}'''

new_gradcam = r'''      {/* Grad-CAM overlay if available */}
      {result.gradcam_overlay_url && (
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Grad-CAM Visualization</Text>
          {gradcamLoading && !gradcamError && (
             <View style={[styles.gradcamImage, { justifyContent: 'center', alignItems: 'center' }]}>
               <ActivityIndicator color={Colors.primary} />
             </View>
          )}
          {gradcamError ? (
             <View style={[styles.gradcamImage, { justifyContent: 'center', alignItems: 'center' }]}>
               <Text style={styles.errorSubtitle}>Failed to load Grad-CAM overlay</Text>
             </View>
          ) : (
            <Image
              source={{ uri: result.gradcam_overlay_url }}
              style={[styles.gradcamImage, gradcamLoading && { display: 'none' }]}
              resizeMode="contain"
              onLoadStart={() => setGradcamLoading(true)}
              onLoadEnd={() => setGradcamLoading(false)}
              onError={() => setGradcamError(true)}
            />
          )}
        </View>
      )}'''

if old_gradcam in c1:
    c1 = c1.replace(old_gradcam, new_gradcam)
    print("Replaced in result.tsx")
else:
    print("Not found in result.tsx")

with open(f1_path, 'w', encoding='utf-8') as f:
    f.write(c1)

f2_path = r'c:\Users\thimi\clinical-rss\vyra\src\app\(reviewer)\case\[id].tsx'
with open(f2_path, 'r', encoding='utf-8') as f:
    c2 = f.read()

c2 = re.sub(r'(const \[isSubmitting, setIsSubmitting\] = useState\(false\);)', r'\1\n' + state_code, c2)

if old_gradcam in c2:
    c2 = c2.replace(old_gradcam, new_gradcam)
    print("Replaced in case/[id].tsx")
else:
    print("Not found in case/[id].tsx")

with open(f2_path, 'w', encoding='utf-8') as f:
    f.write(c2)

print('Success')
