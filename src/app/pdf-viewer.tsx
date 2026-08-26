/**
 * PDF Viewer — native in-app viewing, download, and print for assessment reports.
 *
 * Replaces the old `Linking.openURL` behaviour (which just kicked the PDF out to
 * the system browser). This screen downloads the report once, renders it inline,
 * and exposes a Download action (saves/shares the actual file) and a Print
 * action (native OS print dialog) from a header bar — both functioning for real,
 * not placeholders.
 *
 * Navigated to via `router.push({ pathname: '/pdf-viewer', params: { url, title } })`
 * from ReportViewerButton. Registered as a modal screen in the root Stack.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { File, Paths } from 'expo-file-system';
import { StorageAccessFramework, readAsStringAsync, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { GlassHeader } from '@/components/ui/GlassHeader';

export default function PdfViewerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { url, title } = useLocalSearchParams<{ url: string; title?: string }>();

  const [localFile, setLocalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'download' | 'print' | 'share' | null>(null);

  const displayTitle = title || 'Clinical Report';

  const fetchPdf = useCallback(async () => {
    if (!url) {
      setError('No report URL was provided.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (Platform.OS === 'web') {
        setLocalFile({ uri: url } as any);
      } else {
        const dest = new File(Paths.cache, `report-${Date.now()}.pdf`);
        const downloaded = await File.downloadFileAsync(url, dest, { idempotent: true });
        setLocalFile(downloaded);
      }
    } catch (e) {
      setError('Unable to load the PDF report. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchPdf();
  }, [fetchPdf]);

  async function handleDownload() {
    if (!localFile) return;
    setBusy('download');
    try {
      if (Platform.OS === 'web') {
        window.open(localFile.uri, '_blank');
      } else if (Platform.OS === 'android') {
        const safeName = String(displayTitle).replace(/[^a-z0-9\-_]+/gi, '_') + '.pdf';
        
        let savedUri = await SecureStore.getItemAsync('downloads_dir_uri');
        let hasPermission = false;
        
        if (savedUri) {
          hasPermission = true;
        }

        if (!savedUri || !hasPermission) {
          const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            savedUri = permissions.directoryUri;
            await SecureStore.setItemAsync('downloads_dir_uri', savedUri);
            hasPermission = true;
          } else {
            Alert.alert('Permission Denied', 'Storage permission is required to download files.');
            setBusy(null);
            return;
          }
        }

        if (savedUri && hasPermission) {
          try {
            const newFileUri = await StorageAccessFramework.createFileAsync(
              savedUri!, 
              safeName, 
              'application/pdf'
            );
            const base64Data = await readAsStringAsync(localFile.uri, { 
              encoding: EncodingType.Base64 
            });
            await writeAsStringAsync(newFileUri, base64Data, { 
              encoding: EncodingType.Base64 
            });
            
            Alert.alert('Saved', `Report successfully downloaded as ${safeName}`);
          } catch (e) {
            console.log('SAF download failed:', e);
            await SecureStore.deleteItemAsync('downloads_dir_uri');
            Alert.alert('Download failed', 'Unable to save the report. Please try again.');
          }
        }
      } else {
        await Sharing.shareAsync(localFile.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save report',
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (e) {
      console.log('Download error:', e);
      Alert.alert('Download failed', 'Unable to save the report.');
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    if (!localFile) return;
    setBusy('share');
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(localFile.uri);
        Alert.alert('Copied', 'Report link copied to clipboard.');
      } else {
        await Sharing.shareAsync(localFile.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share or Save Report',
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (e) {
      Alert.alert('Share failed', 'Unable to share the report. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  async function handlePrint() {
    if (!localFile) return;
    setBusy('print');
    try {
      await Print.printAsync({ uri: localFile.uri });
    } catch (e) {
      Alert.alert('Print failed', 'Unable to print the report. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  const webSource =
    Platform.OS === 'android'
      ? { uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(String(url))}` }
      : localFile
        ? { uri: localFile.uri }
        : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xs, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          hitSlop={12}
          accessibilityLabel="Close report viewer"
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[TypographyScale.body, styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {displayTitle}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handlePrint}
            style={styles.headerBtn}
            disabled={!localFile || !!busy}
            hitSlop={12}
            accessibilityLabel="Print report"
          >
            {busy === 'print' ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Ionicons
                name="print-outline"
                size={22}
                color={!localFile ? colors.textTertiary : colors.primaryLight}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDownload}
            style={styles.headerBtn}
            disabled={!localFile || !!busy}
            hitSlop={12}
            accessibilityLabel="Download report"
          >
            {busy === 'download' ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Ionicons
                name="download-outline"
                size={22}
                color={!localFile ? colors.textTertiary : colors.primaryLight}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerBtn}
            disabled={!localFile || !!busy}
            hitSlop={12}
            accessibilityLabel="Share report"
          >
            {busy === 'share' ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Ionicons
                name="share-outline"
                size={22}
                color={!localFile ? colors.textTertiary : colors.primaryLight}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[TypographyScale.body, styles.statusText, { color: colors.textSecondary }]}>Loading report…</Text>
        </View>
      )}

      {!loading && error && (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
          <Text style={[TypographyScale.body, styles.statusText, { color: colors.danger }]}>{error}</Text>
          <TouchableOpacity
            onPress={fetchPdf}
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            accessibilityLabel="Retry loading report"
          >
            <Text style={[TypographyScale.button, styles.retryLabel, { color: colors.textOnPrimary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && webSource && (
        Platform.OS === 'web' ? (
          <iframe
            src={webSource.uri}
            style={{ width: '100%', height: '100%', border: 'none', backgroundColor: colors.surface }}
            title="PDF Report"
          />
        ) : (
          <WebView
            source={webSource}
            style={[styles.webview, { backgroundColor: colors.surface }]}
            originWhitelist={['*']}
            startInLoadingState
            renderLoading={() => (
              <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator color={colors.primary} size="large" />
              </View>
            )}
            onError={() => setError('Unable to display the PDF report.')}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: Spacing.xs, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  webview: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  statusText: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  retryBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  retryLabel: {},
});
