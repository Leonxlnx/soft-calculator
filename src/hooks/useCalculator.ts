import { useState, useCallback } from 'react';

export function useCalculator() {
    const [display, setDisplay] = useState('0');
    const [expression, setExpression] = useState('');
    const [isNewNumber, setIsNewNumber] = useState(true);
    const [operator, setOperator] = useState<string | null>(null);
    const [previousValue, setPreviousValue] = useState<number | null>(null);

    const formatNumber = (num: number): string => {
        if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-6 && num !== 0)) {
            return num.toExponential(4);
        }
        const formatted = num.toLocaleString('en-US', {
            maximumFractionDigits: 8,
        });
        return formatted;
    };

    const clear = useCallback(() => {
        setDisplay('0');
        setExpression('');
        setIsNewNumber(true);
        setOperator(null);
        setPreviousValue(null);
    }, []);

    const inputDigit = useCallback((digit: string) => {
        if (isNewNumber) {
            setDisplay(digit);
            setIsNewNumber(false);
        } else {
            if (display.replace(/,/g, '').length >= 12) return;
            setDisplay((prev) => {
                const raw = prev.replace(/,/g, '') + digit;
                const num = parseFloat(raw);
                if (raw.includes('.')) {
                    const parts = raw.split('.');
                    return parseFloat(parts[0]).toLocaleString('en-US') + '.' + parts[1];
                }
                return num.toLocaleString('en-US');
            });
        }
    }, [display, isNewNumber]);

    const inputDecimal = useCallback(() => {
        if (isNewNumber) {
            setDisplay('0.');
            setIsNewNumber(false);
        } else if (!display.includes('.')) {
            setDisplay((prev) => prev + '.');
        }
    }, [display, isNewNumber]);

    const toggleSign = useCallback(() => {
        setDisplay((prev) => {
            const num = parseFloat(prev.replace(/,/g, ''));
            return formatNumber(num * -1);
        });
    }, []);

    const percentage = useCallback(() => {
        setDisplay((prev) => {
            const num = parseFloat(prev.replace(/,/g, ''));
            return formatNumber(num / 100);
        });
    }, []);

    const calculate = (left: number, op: string, right: number): number => {
        switch (op) {
            case '+': return left + right;
            case '-': return left - right;
            case '×': return left * right;
            case '÷': return right !== 0 ? left / right : 0;
            default: return right;
        }
    };

    const performOperation = useCallback((nextOperator: string) => {
        const currentValue = parseFloat(display.replace(/,/g, ''));

        if (previousValue === null) {
            setPreviousValue(currentValue);
            setExpression(`${formatNumber(currentValue)} ${nextOperator}`);
        } else if (operator) {
            const result = calculate(previousValue, operator, currentValue);
            setPreviousValue(result);
            setDisplay(formatNumber(result));
            setExpression(`${formatNumber(result)} ${nextOperator}`);
        }

        setOperator(nextOperator);
        setIsNewNumber(true);
    }, [display, operator, previousValue]);

    const equals = useCallback(() => {
        if (previousValue === null || !operator) return;

        const currentValue = parseFloat(display.replace(/,/g, ''));
        const result = calculate(previousValue, operator, currentValue);

        setExpression(`${formatNumber(previousValue)} ${operator} ${formatNumber(currentValue)}`);
        setDisplay(formatNumber(result));
        setPreviousValue(null);
        setOperator(null);
        setIsNewNumber(true);
    }, [display, operator, previousValue]);

    return {
        display,
        expression,
        clear,
        inputDigit,
        inputDecimal,
        toggleSign,
        percentage,
        performOperation,
        equals,
    };
}
