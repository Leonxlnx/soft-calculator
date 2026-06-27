import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolate,
    interpolateColor,
    Extrapolation,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { useSounds, SoundKind } from '../theme/SoundContext';
import { colors } from '../theme/colors';
import { spring, timing } from '../theme/motion';

type ButtonType = 'number' | 'function' | 'operator';

interface ButtonProps {
    label: string;
    onPress: () => void;
    type?: ButtonType;
    wide?: boolean;
    active?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SOUND_FOR: Record<ButtonType, SoundKind> = {
    number: 'tap',
    function: 'function',
    operator: 'operator',
};

function ButtonComponent({ label, onPress, type = 'number', wide = false, active = false }: ButtonProps) {
    const { colorScheme, isDark } = useTheme();
    const { play } = useSounds();
    const pressed = useSharedValue(0);
    const ripple = useSharedValue(0);
    const activeProgress = useSharedValue(active ? 1 : 0);

    React.useEffect(() => {
        activeProgress.value = withSpring(active ? 1 : 0, spring.select);
    }, [active, activeProgress]);

    const isEquals = label === '=';

    const fireFeedback = () => {
        const sound: SoundKind = isEquals ? 'equals' : SOUND_FOR[type];
        play(sound);
        if (type === 'operator') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (type === 'function') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handlePressIn = () => {
        pressed.value = withSpring(1, spring.press);
        ripple.value = 0;
        ripple.value = withTiming(1, timing.ripple);
        runOnJS(fireFeedback)();
    };

    const handlePressOut = () => {
        pressed.value = withSpring(0, spring.release);
    };

    // Depth: scale down + sink along Y, with shadow/elevation collapsing on press.
    const animatedStyle = useAnimatedStyle(() => {
        const scale = 1 - pressed.value * 0.07;
        const translateY = pressed.value * 2;
        const shadowRadius = interpolate(pressed.value, [0, 1], [10, 3], Extrapolation.CLAMP);
        const shadowOpacity = interpolate(pressed.value, [0, 1], [0.32, 0.16], Extrapolation.CLAMP);
        const elevation = interpolate(pressed.value, [0, 1], [9, 3], Extrapolation.CLAMP);
        return {
            transform: [{ scale }, { translateY }],
            shadowRadius,
            shadowOpacity,
            elevation,
        };
    });

    // Background animates between resting and active (operator-selected) colors.
    const animatedBgStyle = useAnimatedStyle(() => {
        if (type !== 'operator') return {};
        const bg = interpolateColor(
            activeProgress.value,
            [0, 1],
            [colors.accent.orange, colors.accent.orangeActive]
        );
        return { backgroundColor: bg };
    });

    // Radial glow that expands and fades following the spring impulse envelope.
    const rippleStyle = useAnimatedStyle(() => {
        const scale = interpolate(ripple.value, [0, 1], [0.2, 2.4], Extrapolation.CLAMP);
        const opacity = interpolate(ripple.value, [0, 0.25, 1], [0, 0.5, 0], Extrapolation.CLAMP);
        return {
            opacity,
            transform: [{ scale }],
        };
    });

    const textStyle = useAnimatedStyle(() => {
        if (type !== 'operator') return {};
        const color = interpolateColor(
            activeProgress.value,
            [0, 1],
            [colors.accent.orangeText, colors.accent.orangeActiveText]
        );
        return { color };
    });

    const getBackgroundColor = () => {
        if (type === 'operator') return colors.accent.orange;
        if (type === 'function') return colorScheme.functionButton;
        return colorScheme.surface;
    };

    const getTextColor = () => {
        if (type === 'operator') return colors.accent.orangeText;
        if (type === 'function') return colorScheme.functionButtonText;
        return colorScheme.buttonText;
    };

    const getShadowColor = () =>
        type === 'operator' ? colors.accent.orangeDark : colorScheme.shadowDark;

    const rippleColor =
        type === 'operator' ? 'rgba(255,255,255,0.55)' : isDark
            ? 'rgba(255,255,255,0.16)'
            : 'rgba(255,255,255,0.85)';

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            android_disableSound
            style={[
                styles.button,
                wide && styles.wideButton,
                {
                    backgroundColor: getBackgroundColor(),
                    shadowColor: getShadowColor(),
                },
                animatedBgStyle,
                animatedStyle,
            ]}
        >
            {/* Expanding press glow */}
            <Animated.View
                pointerEvents="none"
                style={[styles.ripple, { backgroundColor: rippleColor }, rippleStyle]}
            />
            {/* Inner highlight for neumorphic depth */}
            <View
                pointerEvents="none"
                style={[
                    styles.innerHighlight,
                    {
                        borderColor: isDark
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(255,255,255,0.6)',
                    },
                ]}
            />
            <Animated.Text
                style={[
                    styles.buttonText,
                    { color: getTextColor() },
                    type === 'function' && styles.functionText,
                    textStyle,
                ]}
            >
                {label}
            </Animated.Text>
        </AnimatedPressable>
    );
}

export const Button = React.memo(ButtonComponent);

const styles = StyleSheet.create({
    button: {
        width: 72,
        height: 72,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 6,
        shadowOffset: { width: 4, height: 5 },
        shadowOpacity: 0.32,
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
    ripple: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
        alignSelf: 'center',
    },
    buttonText: {
        fontSize: 28,
        fontWeight: '500',
    },
    functionText: {
        fontSize: 24,
    },
});
