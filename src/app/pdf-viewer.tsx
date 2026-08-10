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
import { File, Directory, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function PdfViewerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { url, title } = useLocalSearchParams<{ url: string; title?: string }>();

  const [localFile, setLocalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'download' | 'print' | null>(null);

  const displayTitle = title || 'Clinical Report';

  // Download the PDF once to local cache — the local copy is what powers
  // the iOS in-app viewer, the print action, and the "download" action.
  const fetchPdf = useCallback(async () => {
    if (!url) {
      setError('No report URL was provided.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dest = new File(Paths.cache, `report-${Date.now()}.pdf`);
      const downloaded = await File.downloadFileAsync(url, dest, { idempotent: true });
      setLocalFile(downloaded);
    } catch (e) {
      setError('Unable to load the PDF report. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchPdf();
  }, [fetchPdf]);

  // Download: on Android, let the user pick a real folder (e.g. Downloads) via
  // the directory picker so the file actually lands on the device the way a
  // "download" is expected to. On iOS, there is no public Downloads folder —
  // the share sheet's "Save to Files" is the native equivalent, so we route
  // through Sharing there (and as an Android fallback if the picker is denied).
  async function handleDownload() {
    if (!localFile) return;
    setBusy('download');
    try {
      if (Platform.OS === 'android') {
        try {
          const dir = await Directory.pickDirectoryAsync();
          const safeName = String(displayTitle).replace(/[^a-z0-9\-_]+/gi, '_') + '.pdf';
          const destFile = new File(dir, safeName);
          await localFile.copy(destFile, { overwrite: true });
          Alert.alert('Saved', 'The report was saved to the selected folder.');
        } catch {
          // User cancelled the picker or SAF was denied — fall back to share sheet.
          await Sharing.shareAsync(localFile.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save report',
          });
        }
      } else {
        await Sharing.shareAsync(localFile.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save report',
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (e) {
      Alert.alert('Download failed', 'Unable to save the report. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  // Print: expo-print can print directly from an existing PDF file URI —
  // no HTML conversion needed — and opens the native OS print dialog
  // (AirPrint on iOS, the system print service on Android).
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

  // In-app rendering: iOS's WKWebView renders local PDF files natively.
  // Android's WebView does not reliably render local file:// PDFs across
  // OS versions, so on Android we render the remote URL through Google's
  // Docs Viewer, which is the standard, dependency-free way to get inline
  // PDF rendering inside a plain WebView on Android.
  const webSource =
    Platform.OS === 'android'
      ? { uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(String(url))}` }
      : localFile
        ? { uri: localFile.uri }
        : null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xs }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={12}>
          <Ionicons name="close" size={24} color={Colors.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayTitle}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handlePrint}
            style={styles.headerBtn}
            disabled={!localFile || !!busy}
            hitSlop={12}
          >
            {busy === 'print' ? (
              <ActivityIndicator color={Colors.surface} size="small" />
            ) : (
              <Ionicons
                name="print-outline"
                size={22}
                color={!localFile ? Colors.border : Colors.surface}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDownload}
            style={styles.headerBtn}
            disabled={!localFile || !!busy}
            hitSlop={12}
          >
            {busy === 'download' ? (
              <ActivityIndicator color={Colors.surface} size="small" />
            ) : (
              <Ionicons
                name="download-outline"
                size={22}
                color={!localFile ? Colors.border : Colors.surface}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.statusText}>Loading report…</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={32} color={Colors.riskHigh} />
          <Text style={styles.statusText}>{error}</Text>
          <TouchableOpacity onPress={fetchPdf} style={styles.retryBtn}>
            <Text style={styles.retryLabel}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && webSource && (
        <WebView
          source={webSource}
          style={styles.webview}
          originWhitelist={['*']}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.centered}>
              <ActivityIndicator color={Colors.primary} size="large" />
            </View>
          )}
          onError={() => setError('Unable to display the PDF report.')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.textPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.primary,
  },
  headerBtn: { padding: Spacing.xs, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: {
    flex: 1,
    marginHorizontal: Spacing.sm,
    color: Colors.surface,
    fontFamily: Typography.semiBold,
    fontSize: 16,
    textAlign: 'center',
  },
  webview: { flex: 1, backgroundColor: Colors.surface },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  statusText: {
    fontFamily: Typography.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  retryBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryLabel: { color: Colors.surface, fontFamily: Typography.semiBold },
});
