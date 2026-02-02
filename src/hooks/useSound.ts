import { useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';

export function useSound() {
    const soundRef = useRef<Audio.Sound | null>(null);
    const isLoadedRef = useRef(false);

    useEffect(() => {
        // Preload the click sound
        const loadSound = async () => {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                });
                isLoadedRef.current = true;
            } catch (e) {
                console.log('Audio mode setup failed');
            }
        };
        loadSound();

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const playClick = useCallback(async () => {
        if (!isLoadedRef.current) return;

        try {
            // Unload previous sound if exists
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
            }

            // Create and play new sound
            const { sound } = await Audio.Sound.createAsync(
                require('../../assets/sounds/click.mp3'),
                { volume: 0.15, shouldPlay: true }
            );
            soundRef.current = sound;
        } catch (e) {
            // Sound file might not exist, fallback to no sound
        }
    }, []);

    return { playClick };
}
