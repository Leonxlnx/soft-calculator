import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { Sun, Moon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ThemeToggle() {
    const { toggleTheme, isDark, colorScheme } = useTheme();
    const pressed = useSharedValue(0);
    const rotation = useSharedValue(isDark ? 0 : 1);

    const handlePressIn = () => {
        pressed.value = withSpring(1, { damping: 20, stiffness: 400 });
    };

    const handlePressOut = () => {
        pressed.value = withSpring(0, { damping: 15, stiffness: 300 });
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        rotation.value = withSpring(isDark ? 1 : 0, { damping: 12, stiffness: 100 });
        toggleTheme();
    };

    const animatedButtonStyle = useAnimatedStyle(() => {
        const scale = 1 - pressed.value * 0.1;
        return {
            transform: [{ scale }],
        };
    });

    const animatedIconStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            rotation.value,
            [0, 1],
            [0, 180],
            Extrapolate.CLAMP
        );
        return {
            transform: [{ rotate: `${rotate}deg` }],
        };
    });

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={[
                styles.container,
                {
                    backgroundColor: colorScheme.surface,
                    shadowColor: colorScheme.shadowDark,
                },
                animatedButtonStyle,
            ]}
        >
            <View style={[styles.innerHighlight, {
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
            }]} />
            <Animated.View style={animatedIconStyle}>
                {isDark ? (
                    <Moon size={22} color={colorScheme.textSecondary} strokeWidth={1.5} />
                ) : (
                    <Sun size={22} color={colorScheme.textSecondary} strokeWidth={1.5} />
                )}
            </Animated.View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.25,
        elevation: 4,
        overflow: 'hidden',
    },
    innerHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 14,
        borderWidth: 1,
        borderBottomColor: 'transparent',
        borderRightColor: 'transparent',
    },
});
