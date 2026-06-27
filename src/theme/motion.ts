import { Easing } from 'react-native-reanimated';
import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

/**
 * Physics / motion design tokens.
 *
 * Reanimated's spring integrates a damped harmonic oscillator:
 *
 *     m * x'' + c * x' + k * x = 0
 *
 * where  m = mass, k = stiffness, c = damping. The qualitative feel is governed
 * by the dimensionless damping ratio:
 *
 *     ζ = c / (2 * sqrt(k * m))
 *
 *   ζ < 1  -> underdamped  (overshoots, springy / bouncy)
 *   ζ = 1  -> critically damped (fastest settle, no overshoot)
 *   ζ > 1  -> overdamped   (slow, no overshoot, "soft")
 *
 * and the undamped angular frequency  ω = sqrt(k / m)  sets the speed.
 *
 * The presets below are hand-tuned around these relationships so each
 * interaction has an intentional, distinct tactile character.
 */

export const spring = {
    /** Press-down: fast and crisp, lightly underdamped so it feels alive. */
    press: { mass: 0.6, damping: 18, stiffness: 520 } satisfies WithSpringConfig,
    /** Release: a touch bouncier (lower ζ) for a satisfying rebound. */
    release: { mass: 0.7, damping: 12, stiffness: 320 } satisfies WithSpringConfig,
    /** Display pop on value change: pronounced but controlled overshoot. */
    pop: { mass: 0.8, damping: 11, stiffness: 260 } satisfies WithSpringConfig,
    /** Operator highlight / selection: smooth, near-critical. */
    select: { mass: 0.9, damping: 20, stiffness: 220 } satisfies WithSpringConfig,
    /** Panels (history sheet): heavier, soft settle. */
    sheet: { mass: 1.1, damping: 22, stiffness: 200 } satisfies WithSpringConfig,
} as const;

export const timing = {
    /** Theme / color cross-fades. */
    theme: { duration: 320, easing: Easing.bezier(0.4, 0, 0.2, 1) } satisfies WithTimingConfig,
    /** Quick UI fades. */
    fast: { duration: 140, easing: Easing.out(Easing.cubic) } satisfies WithTimingConfig,
    /** Ripple expansion. */
    ripple: { duration: 420, easing: Easing.out(Easing.cubic) } satisfies WithTimingConfig,
} as const;

/**
 * Closed-form position of a critically-damped-ish spring impulse, normalised to
 * peak ~1.0. Used to drive the press "glow" so the ripple's brightness follows
 * the same physical curve as the motion instead of a linear ramp.
 *
 *   f(t) = (t / τ) * e^(1 - t/τ)
 */
export function impulseEnvelope(t: number, tau: number): number {
    'worklet';
    const x = t / tau;
    return x * Math.exp(1 - x);
}
