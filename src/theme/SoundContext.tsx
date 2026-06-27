import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import { Audio } from 'expo-av';

export type SoundKind = 'tap' | 'operator' | 'function' | 'equals';

const FILES: Record<SoundKind, number> = {
    tap: require('../../assets/sounds/tap.mp3'),
    operator: require('../../assets/sounds/operator.mp3'),
    function: require('../../assets/sounds/function.mp3'),
    equals: require('../../assets/sounds/equals.mp3'),
};

const VOLUME: Record<SoundKind, number> = {
    tap: 0.32,
    operator: 0.34,
    function: 0.3,
    equals: 0.4,
};

interface SoundContextType {
    play: (kind: SoundKind) => void;
    enabled: boolean;
    toggleEnabled: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
    const sounds = useRef<Partial<Record<SoundKind, Audio.Sound>>>({});
    const [enabled, setEnabled] = useState(true);
    const enabledRef = useRef(true);

    useEffect(() => {
        let cancelled = false;
        const loaded: Audio.Sound[] = [];

        (async () => {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: false,
                });
            } catch {
                // Audio mode is best-effort; playback still degrades gracefully.
            }

            for (const key of Object.keys(FILES) as SoundKind[]) {
                try {
                    const { sound } = await Audio.Sound.createAsync(FILES[key], {
                        volume: VOLUME[key],
                    });
                    if (cancelled) {
                        await sound.unloadAsync();
                        return;
                    }
                    sounds.current[key] = sound;
                    loaded.push(sound);
                } catch {
                    // Missing/undecodable asset: skip silently, haptics still fire.
                }
            }
        })();

        return () => {
            cancelled = true;
            loaded.forEach((s) => {
                s.unloadAsync().catch(() => undefined);
            });
            sounds.current = {};
        };
    }, []);

    const play = useCallback((kind: SoundKind) => {
        if (!enabledRef.current) return;
        const sound = sounds.current[kind];
        if (!sound) return;
        // replayAsync rewinds to 0 and plays, so rapid taps retrigger cleanly.
        sound.replayAsync().catch(() => undefined);
    }, []);

    const toggleEnabled = useCallback(() => {
        setEnabled((prev) => {
            enabledRef.current = !prev;
            return !prev;
        });
    }, []);

    return (
        <SoundContext.Provider value={{ play, enabled, toggleEnabled }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSounds() {
    const ctx = useContext(SoundContext);
    if (!ctx) {
        throw new Error('useSounds must be used within a SoundProvider');
    }
    return ctx;
}
