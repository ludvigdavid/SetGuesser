import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';
import { Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SettingsSheet from './src/components/SettingsSheet';
import { Card } from './src/data/api';
import { ERAS, EraId } from './src/data/sets';
import { loadSaved, persistSaved, SavedCard, toggleSaved } from './src/saved';
import { findMixUps, MixUp } from './src/game/drills';
import { EMPTY_PROGRESS, loadProgress, Outcome, Progress, recordEncounter, saveProgress } from './src/progress';
import CollectionScreen from './src/screens/CollectionScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import PlayScreen from './src/screens/PlayScreen';
import SetPickerScreen from './src/screens/SetPickerScreen';
import SavedScreen from './src/screens/SavedScreen';
import SetScreen from './src/screens/SetScreen';
import SwipeScreen from './src/screens/SwipeScreen';
import { DEFAULT_SETTINGS, loadLastEra, loadSettings, saveLastEra, saveSettings, Settings } from './src/storage';
import { LangProvider } from './src/i18n';
import { lightPalette, ThemeProvider } from './src/theme';

type Screen =
  | { name: 'home' }
  | { name: 'play'; era: EraId; drill?: MixUp[] }
  | { name: 'collection' }
  | { name: 'set'; setId: string }
  | { name: 'history' }
  | { name: 'saved' }
  | { name: 'swipePick'; era: EraId }
  | { name: 'swipe'; era: EraId; setIds: string[] };

export default function App() {
  const [fontsLoaded] = useFonts({ LilitaOne_400Regular, Nunito_700Bold, Nunito_800ExtraBold });
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [era, setEra] = useState<EraId>('vintage');
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [saved, setSaved] = useState<SavedCard[]>([]);
  const savedIds = useMemo(() => new Set(saved.map((s) => s.card.id)), [saved]);
  const system = useColorScheme();
  const dark = settings.theme === 'dark' || (settings.theme === 'system' && system === 'dark');

  useEffect(() => {
    loadSettings().then(setSettings);
    loadLastEra().then((e) => {
      if (e && ERAS.some((x) => x.id === e)) setEra(e as EraId);
    });
    loadProgress().then(setProgress);
    loadSaved().then(setSaved);
  }, []);

  const changeSettings = (s: Settings) => {
    setSettings(s);
    saveSettings(s);
  };

  const mixUps = useMemo(() => findMixUps(progress.history), [progress.history]);

  const onEncounter = useCallback((card: Card, setId: string, outcome: Outcome, pickedSetId?: string) => {
    setProgress((p) => {
      const next = recordEncounter(p, card, setId, outcome, pickedSetId);
      saveProgress(next);
      return next;
    });
  }, []);

  const onToggleSave = useCallback((card: Card, setId: string) => {
    setSaved((list) => {
      const next = toggleSaved(list, card, setId);
      persistSaved(next);
      return next;
    });
  }, []);

  const home = () => setScreen({ name: 'home' });

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: lightPalette.blue }} />;

  return (
    <SafeAreaProvider>
      <ThemeProvider mode={settings.theme}>
      <LangProvider mode={settings.language}>
      <StatusBar style={!dark && (screen.name === 'play' || screen.name === 'swipe') ? 'dark' : 'light'} />
      {screen.name === 'home' && (
        <HomeScreen
          era={era}
          onEraChange={(e) => {
            setEra(e);
            saveLastEra(e);
          }}
          onSwipe={(era) => setScreen({ name: 'swipePick', era })}
          onStart={(era) => setScreen({ name: 'play', era })}
          mixUpCount={mixUps.length}
          onDrill={() => setScreen({ name: 'play', era: 'all', drill: mixUps })}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenCollection={() => setScreen({ name: 'collection' })}
          onOpenHistory={() => setScreen({ name: 'history' })}
          onOpenSaved={() => setScreen({ name: 'saved' })}
          savedCount={saved.length}
        />
      )}
      {screen.name === 'play' && (
        <PlayScreen
          era={screen.era}
          drill={screen.drill}
          settings={settings}
          onEncounter={onEncounter}
          savedIds={savedIds}
          onToggleSave={onToggleSave}
          onOpenSettings={() => setSettingsOpen(true)}
          onExit={home}
        />
      )}
      {screen.name === 'collection' && (
        <CollectionScreen progress={progress} onOpenSet={(setId) => setScreen({ name: 'set', setId })} onBack={home} />
      )}
      {screen.name === 'set' && (
        <SetScreen setId={screen.setId} progress={progress} onBack={() => setScreen({ name: 'collection' })} />
      )}
      {screen.name === 'history' && <HistoryScreen progress={progress} onBack={home} />}
      {screen.name === 'saved' && (
        <SavedScreen saved={saved} onUnsave={(s) => onToggleSave(s.card, s.setId)} onBack={home} />
      )}
      {screen.name === 'swipePick' && (
        <SetPickerScreen
          era={screen.era}
          onPick={(setId) => setScreen({ name: 'swipe', era: screen.era, setIds: [setId] })}
          onShuffle={(setIds) => setScreen({ name: 'swipe', era: screen.era, setIds })}
          onBack={home}
        />
      )}
      {screen.name === 'swipe' && (
        <SwipeScreen setIds={screen.setIds} onClose={() => setScreen({ name: 'swipePick', era: screen.era })} />
      )}
      <SettingsSheet
        visible={settingsOpen}
        settings={settings}
        onChange={changeSettings}
        onClose={() => setSettingsOpen(false)}
      />
      </LangProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
