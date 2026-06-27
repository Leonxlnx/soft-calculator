import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import { History, Volume2, VolumeX } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSounds } from '../theme/SoundContext';
import { Button } from '../components/Button';
import { Display } from '../components/Display';
import { ThemeToggle } from '../components/ThemeToggle';
import { IconButton } from '../components/IconButton';
import { HistoryPanel } from '../components/HistoryPanel';
import { useCalculator } from '../hooks/useCalculator';
import { timing } from '../theme/motion';

export function Calculator() {
    const { colorScheme, isDark } = useTheme();
    const { enabled: soundOn, toggleEnabled: toggleSound } = useSounds();
    const calculator = useCalculator();
    const [historyOpen, setHistoryOpen] = useState(false);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        backgroundColor: withTiming(colorScheme.background, timing.theme),
    }));

    return (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colorScheme.background}
            />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemeToggle />
                    <View style={styles.headerRight}>
                        <IconButton onPress={toggleSound}>
                            {soundOn ? (
                                <Volume2 size={22} color={colorScheme.textSecondary} strokeWidth={1.5} />
                            ) : (
                                <VolumeX size={22} color={colorScheme.textSecondary} strokeWidth={1.5} />
                            )}
                        </IconButton>
                        <View style={styles.headerGap} />
                        <IconButton onPress={() => setHistoryOpen(true)}>
                            <History size={22} color={colorScheme.textSecondary} strokeWidth={1.5} />
                        </IconButton>
                    </View>
                </View>

                {/* Display */}
                <Display
                    value={calculator.display}
                    expression={calculator.expression}
                    isError={calculator.isError}
                />

                {/* Button Grid */}
                <View style={styles.buttonContainer}>
                    {/* Row 1: C, ⌫, %, ÷ */}
                    <View style={styles.row}>
                        <Button label="C" onPress={calculator.clear} type="function" />
                        <Button label="⌫" onPress={calculator.backspace} type="function" />
                        <Button label="%" onPress={calculator.percentage} type="function" />
                        <Button
                            label="÷"
                            onPress={() => calculator.performOperation('÷')}
                            type="operator"
                            active={calculator.operator === '÷'}
                        />
                    </View>

                    {/* Row 2: 7, 8, 9, × */}
                    <View style={styles.row}>
                        <Button label="7" onPress={() => calculator.inputDigit('7')} />
                        <Button label="8" onPress={() => calculator.inputDigit('8')} />
                        <Button label="9" onPress={() => calculator.inputDigit('9')} />
                        <Button
                            label="×"
                            onPress={() => calculator.performOperation('×')}
                            type="operator"
                            active={calculator.operator === '×'}
                        />
                    </View>

                    {/* Row 3: 4, 5, 6, − */}
                    <View style={styles.row}>
                        <Button label="4" onPress={() => calculator.inputDigit('4')} />
                        <Button label="5" onPress={() => calculator.inputDigit('5')} />
                        <Button label="6" onPress={() => calculator.inputDigit('6')} />
                        <Button
                            label="−"
                            onPress={() => calculator.performOperation('-')}
                            type="operator"
                            active={calculator.operator === '-'}
                        />
                    </View>

                    {/* Row 4: 1, 2, 3, + */}
                    <View style={styles.row}>
                        <Button label="1" onPress={() => calculator.inputDigit('1')} />
                        <Button label="2" onPress={() => calculator.inputDigit('2')} />
                        <Button label="3" onPress={() => calculator.inputDigit('3')} />
                        <Button
                            label="+"
                            onPress={() => calculator.performOperation('+')}
                            type="operator"
                            active={calculator.operator === '+'}
                        />
                    </View>

                    {/* Row 5: +/-, 0, ., = */}
                    <View style={styles.row}>
                        <Button label="+/-" onPress={calculator.toggleSign} type="function" />
                        <Button label="0" onPress={() => calculator.inputDigit('0')} />
                        <Button label="." onPress={calculator.inputDecimal} />
                        <Button label="=" onPress={calculator.equals} type="operator" />
                    </View>
                </View>
            </SafeAreaView>

            <HistoryPanel
                visible={historyOpen}
                history={calculator.history}
                onClose={() => setHistoryOpen(false)}
                onClear={calculator.clearHistory}
                onRecall={calculator.recallHistory}
            />
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerGap: {
        width: 12,
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
