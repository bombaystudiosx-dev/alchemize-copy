import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const soundscapes = [
  {
    id: 'cosmic-drift',
    title: 'Cosmic Drift',
    description: 'Soft ambient pads',
    icon: '🌌',
    url: 'https://cdn.pixabay.com/audio/2022/08/23/audio_d16737dc28.mp3'
  },
  {
    id: 'deep-theta',
    title: 'Deep Theta',
    description: 'Hypnotic healing tones',
    icon: '🧘',
    url: 'https://cdn.pixabay.com/audio/2022/10/25/audio_946bc06df3.mp3'
  },
  {
    id: 'celestial-rain',
    title: 'Celestial Rain',
    description: 'Gentle rain ambience',
    icon: '🌧️',
    url: 'https://cdn.pixabay.com/audio/2022/05/16/audio_1333dfacdb.mp3'
  },
  {
    id: 'astral-winds',
    title: 'Astral Winds',
    description: 'Ethereal meditation',
    icon: '💫',
    url: 'https://cdn.pixabay.com/audio/2023/09/04/audio_9dcf47b8c8.mp3'
  },
  {
    id: 'inner-temple',
    title: 'Inner Temple',
    description: 'Peaceful sleep music',
    icon: '🔔',
    url: 'https://cdn.pixabay.com/audio/2023/04/11/audio_5765ab0920.mp3'
  }
];

const SoundscapeContext = createContext(null);

export function SoundscapeProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const audioRef = useRef(null);
  const fadeAudioRef = useRef(null);

  // Load saved preferences on mount
  useEffect(() => {
    const savedTrack = localStorage.getItem('soundscape_track');
    const savedVolume = localStorage.getItem('soundscape_volume');
    const savedPlaying = localStorage.getItem('soundscape_playing');
    
    if (savedTrack) setCurrentTrack(savedTrack);
    if (savedVolume) setVolume(parseFloat(savedVolume));
    if (savedPlaying === 'true') setIsPlaying(true);
    
    setIsLoaded(true);
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (!isLoaded) return;
    if (currentTrack) localStorage.setItem('soundscape_track', currentTrack);
    localStorage.setItem('soundscape_volume', volume.toString());
    localStorage.setItem('soundscape_playing', isPlaying.toString());
  }, [currentTrack, volume, isPlaying, isLoaded]);

  // Handle first interaction to enable autoplay
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Initialize or update audio when track changes or starts playing
  useEffect(() => {
    if (!isLoaded || !hasInteracted) return;
    
    const track = soundscapes.find(s => s.id === currentTrack);
    if (!track) return;

    if (isPlaying) {
      // If there's an existing audio, crossfade
      if (audioRef.current && !audioRef.current.paused) {
        crossfadeToTrack(track.url);
      } else {
        // Start fresh
        if (!audioRef.current) {
          audioRef.current = new Audio(track.url);
          audioRef.current.loop = true;
        } else {
          audioRef.current.src = track.url;
        }
        audioRef.current.volume = volume;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentTrack, isPlaying, hasInteracted, isLoaded]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || !hasInteracted) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, hasInteracted]);

  const crossfadeToTrack = (newUrl) => {
    const oldAudio = audioRef.current;
    const newAudio = new Audio(newUrl);
    newAudio.loop = true;
    newAudio.volume = 0;
    
    fadeAudioRef.current = newAudio;
    newAudio.play().catch(() => {});
    
    const fadeDuration = 1500;
    const steps = 30;
    const stepDuration = fadeDuration / steps;
    const volumeStep = volume / steps;
    
    let step = 0;
    const fadeInterval = setInterval(() => {
      step++;
      if (oldAudio) oldAudio.volume = Math.max(0, volume - (volumeStep * step));
      newAudio.volume = Math.min(volume, volumeStep * step);
      
      if (step >= steps) {
        clearInterval(fadeInterval);
        if (oldAudio) {
          oldAudio.pause();
          oldAudio.src = '';
        }
        audioRef.current = newAudio;
        fadeAudioRef.current = null;
      }
    }, stepDuration);
  };

  const selectTrack = (trackId) => {
    if (trackId === currentTrack && isPlaying) return;
    
    const track = soundscapes.find(s => s.id === trackId);
    if (!track) return;
    
    if (currentTrack && isPlaying && audioRef.current) {
      setCurrentTrack(trackId);
      crossfadeToTrack(track.url);
    } else {
      setCurrentTrack(trackId);
      if (!audioRef.current) {
        audioRef.current = new Audio(track.url);
        audioRef.current.loop = true;
      } else {
        audioRef.current.src = track.url;
      }
      audioRef.current.volume = volume;
      if (isPlaying && hasInteracted) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const togglePlay = () => {
    if (!currentTrack) {
      setCurrentTrack(soundscapes[0].id);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <SoundscapeContext.Provider value={{
      soundscapes,
      currentTrack,
      isPlaying,
      volume,
      setVolume,
      selectTrack,
      togglePlay,
      hasInteracted
    }}>
      {children}
    </SoundscapeContext.Provider>
  );
}

export function useSoundscape() {
  const context = useContext(SoundscapeContext);
  if (!context) {
    throw new Error('useSoundscape must be used within SoundscapeProvider');
  }
  return context;
}