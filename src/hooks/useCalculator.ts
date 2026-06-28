import { useState, useCallback } from 'react';

export type CalcOperator = '+' | '-' | '×' | '÷';

export interface HistoryEntry {
    id: number;
    expression: string;
    result: string;
}

const ERROR = 'Error';
const MAX_DIGITS = 12;

/**
 * Rounds away binary floating-point dust (e.g. 0.1 + 0.2 -> 0.30000000000000004)
 * by snapping to ~12 significant decimal digits, then back to a Number.
 */
function sanitize(num: number): number {
    if (!Number.isFinite(num)) return NaN;
    if (num === 0) return 0;
    return parseFloat(num.toPrecision(12));
}

function formatNumber(num: number): string {
    if (!Number.isFinite(num)) return ERROR;

    const clean = sanitize(num);
    const abs = Math.abs(clean);

    // Very large / very small magnitudes fall back to exponential notation.
    if (abs !== 0 && (abs >= 1e12 || abs < 1e-9)) {
        return clean.toExponential(4).replace('e', 'E');
    }

    return clean.toLocaleString('en-US', { maximumFractionDigits: 9 });
}

function toNumber(display: string): number {
    return parseFloat(display.replace(/,/g, ''));
}

/** Re-applies thousands separators while preserving an in-progress decimal tail. */
function withGrouping(raw: string): string {
    const negative = raw.startsWith('-');
    const body = negative ? raw.slice(1) : raw;
    const [intPart, decPart] = body.split('.');
    const grouped = parseInt(intPart || '0', 10).toLocaleString('en-US');
    const result = decPart !== undefined ? `${grouped}.${decPart}` : grouped;
    return negative ? `-${result}` : result;
}

export function useCalculator() {
    const [display, setDisplay] = useState('0');
    const [expression, setExpression] = useState('');
    const [isNewNumber, setIsNewNumber] = useState(true);
    const [operator, setOperator] = useState<CalcOperator | null>(null);
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    // Remembers the last "op + operand" so repeated "=" repeats it (e.g. 2 + 3 = = = ).
    const [lastOperator, setLastOperator] = useState<CalcOperator | null>(null);
    const [lastOperand, setLastOperand] = useState<number | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [errored, setErrored] = useState(false);

    const isError = display === ERROR || errored;

    const pushHistory = useCallback((expr: string, result: string) => {
        if (result === ERROR) return;
        setHistory((prev) => {
            const entry: HistoryEntry = { id: Date.now() + Math.random(), expression: expr, result };
            return [entry, ...prev].slice(0, 50);
        });
    }, []);

    const clear = useCallback(() => {
        setDisplay('0');
        setExpression('');
        setIsNewNumber(true);
        setOperator(null);
        setPreviousValue(null);
        setLastOperator(null);
        setLastOperand(null);
        setErrored(false);
    }, []);

    const clearHistory = useCallback(() => setHistory([]), []);

    const inputDigit = useCallback((digit: string) => {
        if (isError) {
            setDisplay(digit);
            setIsNewNumber(false);
            setErrored(false);
            return;
        }
        if (isNewNumber) {
            setDisplay(digit);
            setIsNewNumber(false);
            return;
        }
        setDisplay((prev) => {
            const raw = prev.replace(/,/g, '');
            // Count only significant characters against the digit limit.
            const digitCount = raw.replace(/[-.]/g, '').length;
            if (digitCount >= MAX_DIGITS) return prev;
            if (raw === '0') return digit; // replace leading zero
            if (raw === '-0') return `-${digit}`;
            return withGrouping(raw + digit);
        });
    }, [isError, isNewNumber]);

    const inputDecimal = useCallback(() => {
        if (isError) {
            setDisplay('0.');
            setIsNewNumber(false);
            setErrored(false);
            return;
        }
        if (isNewNumber) {
            setDisplay('0.');
            setIsNewNumber(false);
            return;
        }
        setDisplay((prev) => (prev.includes('.') ? prev : prev + '.'));
    }, [isError, isNewNumber]);

    const backspace = useCallback(() => {
        if (isError) {
            clear();
            return;
        }
        if (isNewNumber) return;
        setDisplay((prev) => {
            const raw = prev.replace(/,/g, '');
            const trimmed = raw.slice(0, -1);
            if (trimmed === '' || trimmed === '-') {
                setIsNewNumber(true);
                return '0';
            }
            return withGrouping(trimmed);
        });
    }, [isError, isNewNumber, clear]);

    const toggleSign = useCallback(() => {
        if (isError) return;
        setDisplay((prev) => {
            const num = toNumber(prev);
            if (num === 0) return prev;
            return formatNumber(num * -1);
        });
    }, [isError]);

    const percentage = useCallback(() => {
        if (isError) return;
        setDisplay((prev) => {
            const current = toNumber(prev);
            // Contextual percent: "200 + 10%" -> 10% of 200; otherwise plain /100.
            if (previousValue !== null && operator) {
                if (operator === '+' || operator === '-') {
                    return formatNumber((previousValue * current) / 100);
                }
                return formatNumber(current / 100);
            }
            return formatNumber(current / 100);
        });
        setIsNewNumber(false);
    }, [isError, previousValue, operator]);

    const calculate = (left: number, op: CalcOperator, right: number): number => {
        switch (op) {
            case '+': return left + right;
            case '-': return left - right;
            case '×': return left * right;
            case '÷': return right === 0 ? NaN : left / right;
        }
    };

    const performOperation = useCallback((nextOperator: CalcOperator) => {
        if (isError) return;
        const currentValue = toNumber(display);

        // Just pressed an operator: only swap the pending operator, don't compute.
        if (isNewNumber && previousValue !== null) {
            setOperator(nextOperator);
            setExpression(`${formatNumber(previousValue)} ${nextOperator}`);
            return;
        }

        if (previousValue === null) {
            setPreviousValue(currentValue);
            setExpression(`${formatNumber(currentValue)} ${nextOperator}`);
        } else if (operator) {
            const result = calculate(previousValue, operator, currentValue);
            const formatted = formatNumber(result);
            setDisplay(formatted);
            if (formatted === ERROR) {
                setErrored(true);
                setPreviousValue(null);
                setOperator(null);
                setIsNewNumber(true);
                return;
            }
            setPreviousValue(result);
            setExpression(`${formatted} ${nextOperator}`);
        }

        setOperator(nextOperator);
        setIsNewNumber(true);
    }, [isError, display, operator, previousValue, isNewNumber]);

    const equals = useCallback(() => {
        let op = operator;
        let operand: number | null = null;
        let base: number | null = previousValue;
        const currentValue = toNumber(display);

        if (op !== null && previousValue !== null) {
            // Standard "a op b =".
            operand = currentValue;
        } else if (lastOperator !== null && lastOperand !== null) {
            // Repeated "=" repeats the last op against the current display value.
            op = lastOperator;
            operand = lastOperand;
            base = currentValue;
        } else {
            return;
        }

        if (op === null || base === null || operand === null) return;

        const result = calculate(base, op, operand);
        const formatted = formatNumber(result);
        const expr = `${formatNumber(base)} ${op} ${formatNumber(operand)} =`;

        setDisplay(formatted);
        if (formatted === ERROR) {
            setErrored(true);
            setExpression(expr);
            setPreviousValue(null);
            setOperator(null);
            setLastOperator(null);
            setLastOperand(null);
            setIsNewNumber(true);
            return;
        }

        setExpression(expr);
        pushHistory(expr.replace(/ =$/, ''), formatted);
        setLastOperator(op);
        setLastOperand(operand);
        setPreviousValue(null);
        setOperator(null);
        setIsNewNumber(true);
    }, [display, operator, previousValue, lastOperator, lastOperand, pushHistory]);

    const recallHistory = useCallback((entry: HistoryEntry) => {
        setDisplay(entry.result);
        setExpression(entry.expression);
        setIsNewNumber(true);
        setOperator(null);
        setPreviousValue(null);
        setErrored(false);
    }, []);

    return {
        display,
        expression,
        operator,
        history,
        isError,
        clear,
        clearHistory,
        inputDigit,
        inputDecimal,
        backspace,
        toggleSign,
        percentage,
        performOperation,
        equals,
        recallHistory,
    };
}
