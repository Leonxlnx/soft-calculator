import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { spring } from '../theme/motion';

interface IconButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    haptic?: Haptics.ImpactFeedbackStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IconButton({ children, onPress, haptic = Haptics.ImpactFeedbackStyle.Light }: IconButtonProps) {
    const { colorScheme, isDark } = useTheme();
    const pressed = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: 1 - pressed.value * 0.1 }],
    }));

    return (
        <AnimatedPressable
            onPressIn={() => {
                pressed.value = withSpring(1, spring.press);
            }}
            onPressOut={() => {
                pressed.value = withSpring(0, spring.release);
            }}
            onPress={() => {
                Haptics.impactAsync(haptic);
                onPress();
            }}
            style={[
                styles.container,
                { backgroundColor: colorScheme.surface, shadowColor: colorScheme.shadowDark },
                animatedStyle,
            ]}
        >
            <View
                pointerEvents="none"
                style={[
                    styles.innerHighlight,
                    {
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
                    },
                ]}
            />
            {children}
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
        shadowRadius: 6,
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
