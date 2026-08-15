import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { PRO_FEATURES } from '../../constants/entitlements';
import { useEntitlement } from '../../hooks/useEntitlement';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

export function PaywallScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { isPro, setDevProOverride } = useEntitlement();

  const handleMockPurchase = async () => {
    await setDevProOverride(true);
    Alert.alert('Pro unlocked (dev mode)', 'This is a mock entitlement for development — no payment was made.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <Screen scroll>
      <LinearGradient colors={[theme.colors.primary, theme.colors.accent]} style={[styles.badge, { borderRadius: theme.radius.full }]}>
        <Ionicons name="sparkles" size={32} color={theme.colors.onPrimary} />
      </LinearGradient>

      <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold as any, textAlign: 'center', marginBottom: 8 }}>
        DailySafe Pro
      </Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.md, textAlign: 'center', marginBottom: 24 }}>
        {route.params?.feature ? `Unlock ${route.params.feature} and more.` : 'Unlock the full DailySafe experience.'}
      </Text>

      <View style={styles.features}>
        {PRO_FEATURES.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, marginLeft: 10, flex: 1 }}>{feature}</Text>
          </View>
        ))}
      </View>

      {isPro ? (
        <View style={[styles.proBadge, { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md }]}>
          <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
          <Text style={{ color: theme.colors.text, marginLeft: 8 }}>You already have Pro (dev mode)</Text>
        </View>
      ) : (
        <>
          <Button label="Unlock Pro — dev mode" onPress={handleMockPurchase} />
          <Text style={{ color: theme.colors.textFaint, fontSize: theme.fontSize.xs, textAlign: 'center', marginTop: 10 }}>
            No billing is wired up yet — this flips a local development flag instead of charging you.
          </Text>
        </>
      )}

      <Button label="Not now" onPress={() => navigation.goBack()} variant="ghost" style={styles.close} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 16, marginBottom: 20 },
  features: { marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  proBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14 },
  close: { marginTop: 12 },
});
