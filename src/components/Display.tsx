import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
    withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { spring, timing } from '../theme/motion';

interface DisplayProps {
    value: string;
    expression: string;
    isError?: boolean;
}

export function Display({ value, expression, isError = false }: DisplayProps) {
    const { colorScheme } = useTheme();
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Value-change feel: brief sink + fade then a springy pop back, so digits
        // "land" with weight instead of snapping in.
        translateY.value = withSequence(
            withTiming(6, { duration: 40 }),
            withSpring(0, spring.pop)
        );
        scale.value = withSequence(
            withTiming(0.96, { duration: 40 }),
            withSpring(1, spring.pop)
        );
        opacity.value = withSequence(
            withTiming(0.55, { duration: 30 }),
            withTiming(1, timing.fast)
        );
    }, [value, scale, translateY, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { translateY: translateY.value }],
        opacity: opacity.value,
    }));

    // Font scales down as the number grows so long results stay on one line.
    const getFontSize = () => {
        const len = value.replace(/,/g, '').length;
        if (len > 11) return 38;
        if (len > 9) return 46;
        if (len > 7) return 54;
        if (len > 5) return 60;
        return 64;
    };

    return (
        <View style={styles.container}>
            <Text
                style={[styles.expression, { color: colorScheme.textSecondary }]}
                numberOfLines={1}
            >
                {expression}
            </Text>
            <Animated.Text
                style={[
                    styles.value,
                    {
                        color: isError ? '#FF453A' : colorScheme.text,
                        fontSize: getFontSize(),
                    },
                    animatedStyle,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
            >
                {value}
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        minHeight: 140,
    },
    expression: {
        fontSize: 18,
        marginBottom: 8,
        fontWeight: '400',
    },
    value: {
        fontWeight: '300',
        letterSpacing: -1,
    },
});
