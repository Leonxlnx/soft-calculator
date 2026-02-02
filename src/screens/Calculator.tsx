import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import { Display } from '../components/Display';
import { ThemeToggle } from '../components/ThemeToggle';
import { useCalculator } from '../hooks/useCalculator';

export function Calculator() {
    const { colorScheme, isDark } = useTheme();
    const calculator = useCalculator();

    const animatedContainerStyle = useAnimatedStyle(() => ({
        backgroundColor: withTiming(colorScheme.background, {
            duration: 300,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
    }));

    return (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colorScheme.background}
            />
            <SafeAreaView style={styles.safeArea}>
                {/* Header with Theme Toggle */}
                <View style={styles.header}>
                    <ThemeToggle />
                </View>

                {/* Display */}
                <Display value={calculator.display} expression={calculator.expression} />

                {/* Button Grid */}
                <View style={styles.buttonContainer}>
                    {/* Row 1: C, +/-, %, ÷ */}
                    <View style={styles.row}>
                        <Button label="C" onPress={calculator.clear} type="function" />
                        <Button label="+/-" onPress={calculator.toggleSign} type="function" />
                        <Button label="%" onPress={calculator.percentage} type="function" />
                        <Button label="÷" onPress={() => calculator.performOperation('÷')} type="operator" />
                    </View>

                    {/* Row 2: 7, 8, 9, × */}
                    <View style={styles.row}>
                        <Button label="7" onPress={() => calculator.inputDigit('7')} />
                        <Button label="8" onPress={() => calculator.inputDigit('8')} />
                        <Button label="9" onPress={() => calculator.inputDigit('9')} />
                        <Button label="×" onPress={() => calculator.performOperation('×')} type="operator" />
                    </View>

                    {/* Row 3: 4, 5, 6, − */}
                    <View style={styles.row}>
                        <Button label="4" onPress={() => calculator.inputDigit('4')} />
                        <Button label="5" onPress={() => calculator.inputDigit('5')} />
                        <Button label="6" onPress={() => calculator.inputDigit('6')} />
                        <Button label="−" onPress={() => calculator.performOperation('-')} type="operator" />
                    </View>

                    {/* Row 4: 1, 2, 3, + */}
                    <View style={styles.row}>
                        <Button label="1" onPress={() => calculator.inputDigit('1')} />
                        <Button label="2" onPress={() => calculator.inputDigit('2')} />
                        <Button label="3" onPress={() => calculator.inputDigit('3')} />
                        <Button label="+" onPress={() => calculator.performOperation('+')} type="operator" />
                    </View>

                    {/* Row 5: 0 (wide), ., = */}
                    <View style={styles.row}>
                        <Button label="0" onPress={() => calculator.inputDigit('0')} wide />
                        <Button label="." onPress={calculator.inputDecimal} />
                        <Button label="=" onPress={calculator.equals} type="operator" />
                    </View>
                </View>
            </SafeAreaView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        alignItems: 'flex-start',
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 10,
        paddingBottom: 24,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 2,
    },
});
