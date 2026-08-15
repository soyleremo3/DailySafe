import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/Button';
import { Screen } from '../../../components/Screen';
import { OnboardingStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.hero}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.accent]}
          style={[styles.badge, { borderRadius: theme.radius.full }]}
        >
          <Ionicons name="shield-checkmark" size={36} color={theme.colors.onPrimary} />
        </LinearGradient>
        <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold as any }]}>
          DailySafe
        </Text>
        <Text style={[styles.tagline, { color: theme.colors.textMuted, fontSize: theme.fontSize.lg }]}>
          Know exactly how much you can safely spend today.
        </Text>
      </View>

      <View style={styles.points}>
        <Point icon="flash-outline" text="A daily number you can trust, in seconds" />
        <Point icon="lock-closed-outline" text="Everything stays on your device — no accounts, no cloud" />
        <Point icon="calculator-outline" text="Bills, goals and big purchases automatically factored in" />
      </View>

      <View style={styles.footer}>
        <Button label="Get started" onPress={() => navigation.navigate('Currency')} />
      </View>
    </Screen>
  );
}

function Point({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.point}>
      <View style={[styles.pointIcon, { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.full }]}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text style={[styles.pointText, { color: theme.colors.text, fontSize: theme.fontSize.md }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 48, marginBottom: 32 },
  badge: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { marginBottom: 8 },
  tagline: { textAlign: 'center', lineHeight: 24, paddingHorizontal: 12 },
  points: { flex: 1, gap: 20 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  pointIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  pointText: { flex: 1 },
  footer: { marginBottom: 8 },
});
