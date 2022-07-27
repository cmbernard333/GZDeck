import { Spinner, ThemeProvider } from 'react-bootstrap';
import { AppHeader } from './components/AppHeader';
import { Launch } from './screens/Launch';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { filterAcceptedFileTypes } from './utils/fileUtils';
import { SettingsInterface } from './screens/Launch/types';
import ErrorAlert from './components/ErrorAlert';
import { useTranslation } from 'react-i18next';
import LoadingOverlay from 'react-loading-overlay-ts';
import './i18n';

export function App() {
  const [iwads, setIwads] = useState<string[]>([]);
  const [mods, setMods] = useState<string[]>([]);
  const [settings, setSettings] = useState<SettingsInterface>();
  const [engineInstalled, setEngineInstalled] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { t, ready } = useTranslation('common', { useSuspense: false });

  const engineSearch = async (): Promise<void> => {
    setEngineInstalled(await window.Main.engineSearch());
  };

  const iwadSearch = async (): Promise<void> => {
    const results = await window.Main.fileSearch();
    setIwads(filterAcceptedFileTypes(results));
  };

  const modSearch = async (): Promise<void> => {
    const results = await window.Main.fileSearch('/mods');
    setMods(results);
  };

  const fetchSettings = async () => {
    const results = await window.Main.initSettings();
    setSettings(results);
  };

  const initApp = async (): Promise<void> => {
    setIsInitialized(false);
    await engineSearch();
    await fetchSettings();
    await iwadSearch();
    await modSearch();
    setIsInitialized(true);
  };

  useEffect(() => {
    initApp();
  }, []);

  return (
    <ThemeProvider>
      <AppHeader />
      <LoadingOverlay
        active={!isInitialized || !ready}
        styles={{ wrapper: { height: '100%' } }}
        spinner={<Spinner animation="border" />}
      >
        {!engineInstalled && isInitialized && (
          <ErrorAlert
            errorTitle={t('GZDOOM_NOT_FOUND')}
            errorBody={t('INSTALL_GZDOOM')}
          />
        )}
        {settings && engineInstalled && (
          <Launch mods={mods} iwads={iwads} settings={settings} />
        )}
      </LoadingOverlay>
    </ThemeProvider>
  );
}
