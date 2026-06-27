import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSpring,
    interpolate,
    Extrapolation,
    runOnJS,
} from 'react-native-reanimated';
import { Trash2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { spring, timing } from '../theme/motion';
import type { HistoryEntry } from '../hooks/useCalculator';

interface HistoryPanelProps {
    visible: boolean;
    history: HistoryEntry[];
    onClose: () => void;
    onClear: () => void;
    onRecall: (entry: HistoryEntry) => void;
}

export function HistoryPanel({ visible, history, onClose, onClear, onRecall }: HistoryPanelProps) {
    const { colorScheme, isDark } = useTheme();
    const progress = useSharedValue(0);
    const [mounted, setMounted] = React.useState(visible);

    useEffect(() => {
        if (visible) {
            setMounted(true);
            progress.value = withSpring(1, spring.sheet);
        } else {
            progress.value = withTiming(0, timing.fast, (finished) => {
                if (finished) runOnJS(setMounted)(false);
            });
        }
    }, [visible, progress]);

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    }));

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(progress.value, [0, 1], [60, 0], Extrapolation.CLAMP) },
        ],
        opacity: progress.value,
    }));

    if (!mounted) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.sheet,
                    { backgroundColor: colorScheme.surface, shadowColor: colorScheme.shadowDark },
                    sheetStyle,
                ]}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colorScheme.text }]}>History</Text>
                    <View style={styles.headerActions}>
                        <Pressable
                            hitSlop={10}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
                                onClear();
                            }}
                            style={styles.iconBtn}
                        >
                            <Trash2 size={20} color={colorScheme.textSecondary} strokeWidth={1.75} />
                        </Pressable>
                        <Pressable hitSlop={10} onPress={onClose} style={styles.iconBtn}>
                            <X size={22} color={colorScheme.textSecondary} strokeWidth={1.75} />
                        </Pressable>
                    </View>
                </View>

                {history.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={[styles.emptyText, { color: colorScheme.textSecondary }]}>
                            No calculations yet
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {history.map((entry) => (
                            <Pressable
                                key={entry.id}
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    onRecall(entry);
                                    onClose();
                                }}
                                style={({ pressed }) => [
                                    styles.row,
                                    {
                                        borderBottomColor: isDark
                                            ? 'rgba(255,255,255,0.06)'
                                            : 'rgba(0,0,0,0.06)',
                                        opacity: pressed ? 0.6 : 1,
                                    },
                                ]}
                            >
                                <Text
                                    style={[styles.rowExpr, { color: colorScheme.textSecondary }]}
                                    numberOfLines={1}
                                >
                                    {entry.expression}
                                </Text>
                                <Text
                                    style={[styles.rowResult, { color: colorScheme.text }]}
                                    numberOfLines={1}
                                >
                                    {entry.result}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 12,
        maxHeight: '64%',
        borderRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 12,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        padding: 8,
        marginLeft: 4,
    },
    empty: {
        paddingVertical: 36,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
    list: {
        flexGrow: 0,
    },
    listContent: {
        paddingBottom: 8,
    },
    row: {
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    rowExpr: {
        fontSize: 15,
        marginBottom: 4,
    },
    rowResult: {
        fontSize: 24,
        fontWeight: '500',
        textAlign: 'right',
    },
});
