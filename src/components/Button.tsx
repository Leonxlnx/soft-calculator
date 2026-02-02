import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { colors } from '../theme/colors';

interface ButtonProps {
    label: string;
    onPress: () => void;
    type?: 'number' | 'function' | 'operator';
    wide?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ label, onPress, type = 'number', wide = false }: ButtonProps) {
    const { colorScheme, isDark } = useTheme();
    const pressed = useSharedValue(0);

    const handlePressIn = () => {
        pressed.value = withSpring(1, { damping: 20, stiffness: 400 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handlePressOut = () => {
        pressed.value = withSpring(0, { damping: 15, stiffness: 300 });
    };

    const handlePress = () => {
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => {
        const scale = 1 - pressed.value * 0.06;
        const shadowRadius = 8 - pressed.value * 4;
        const elevation = 8 - pressed.value * 4;

        return {
            transform: [{ scale }],
            shadowRadius,
            elevation,
        };
    });

    const getBackgroundColor = () => {
        if (type === 'operator') {
            return colors.accent.orange;
        }
        if (type === 'function') {
            return colorScheme.functionButton;
        }
        return colorScheme.surface;
    };

    const getTextColor = () => {
        if (type === 'operator') {
            return colors.accent.orangeText;
        }
        if (type === 'function') {
            return colorScheme.functionButtonText;
        }
        return colorScheme.buttonText;
    };

    const getShadowColor = () => {
        if (type === 'operator') {
            return colors.accent.orangeDark;
        }
        return colorScheme.shadowDark;
    };

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={[
                styles.button,
                wide && styles.wideButton,
                {
                    backgroundColor: getBackgroundColor(),
                    shadowColor: getShadowColor(),
                },
                animatedStyle,
            ]}
        >
            {/* Inner highlight for depth */}
            <View
                style={[
                    styles.innerHighlight,
                    {
                        borderColor: isDark
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(255,255,255,0.6)',
                    },
                ]}
            />
            <Text
                style={[
                    styles.buttonText,
                    { color: getTextColor() },
                    type === 'function' && styles.functionText,
                ]}
            >
                {label}
            </Text>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 72,
        height: 72,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 6,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        overflow: 'hidden',
    },
    wideButton: {
        width: 156,
    },
    innerHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        borderWidth: 1,
        borderBottomColor: 'transparent',
        borderRightColor: 'transparent',
    },
    buttonText: {
        fontSize: 28,
        fontWeight: '500',
    },
    functionText: {
        fontSize: 24,
    },
});
