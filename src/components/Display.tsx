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

interface DisplayProps {
    value: string;
    expression: string;
}

export function Display({ value, expression }: DisplayProps) {
    const { colorScheme } = useTheme();
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Animate on value change
        scale.value = withSequence(
            withTiming(1.02, { duration: 50 }),
            withSpring(1, { damping: 15, stiffness: 200 })
        );
        opacity.value = withSequence(
            withTiming(0.8, { duration: 30 }),
            withTiming(1, { duration: 100 })
        );
    }, [value]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    // Dynamic font size based on value length
    const getFontSize = () => {
        const len = value.replace(/,/g, '').length;
        if (len > 10) return 40;
        if (len > 8) return 48;
        if (len > 6) return 56;
        return 64;
    };

    return (
        <View style={styles.container}>
            <Text
                style={[
                    styles.expression,
                    { color: colorScheme.textSecondary },
                ]}
                numberOfLines={1}
            >
                {expression}
            </Text>
            <Animated.Text
                style={[
                    styles.value,
                    { color: colorScheme.text, fontSize: getFontSize() },
                    animatedStyle,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
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
