import { useEffect, useState } from 'react';

import { Button } from '@renderer/shadcn/components/ui/button';
import { Input } from '@renderer/shadcn/components/ui/input';
import {
  useUserPreferencesActions,
  useUserPreferencesDyntoolsPath,
  useUserPreferencesPythonPath,
} from '@renderer/store/UserPreferencesStore';

export function GeneralSettings() {
  const dyntoolsPath = useUserPreferencesDyntoolsPath();
  const pythonPath = useUserPreferencesPythonPath();
  const { updateDyntoolsPath, updatePythonPath } = useUserPreferencesActions();
  const [currentDyntoolsPath, setCurrentDyntoolsPath] = useState(dyntoolsPath);
  const [currentPythonPath, setCurrentPythonPath] = useState(pythonPath);

  useEffect(() => {
    setCurrentDyntoolsPath(dyntoolsPath);
  }, [dyntoolsPath]);

  useEffect(() => {
    setCurrentPythonPath(pythonPath);
  }, [pythonPath]);

  const normalizedDyntoolsPath = currentDyntoolsPath.trim();
  const normalizedPythonPath = currentPythonPath.trim();
  const isDyntoolsDirty = normalizedDyntoolsPath !== dyntoolsPath;
  const isPythonDirty = normalizedPythonPath !== pythonPath;

  const handleBrowseDyntools = async () => {
    const selected = await window.userPreferences.selectDyntoolsPath();
    if (selected) {
      setCurrentDyntoolsPath(selected);
    }
  };

  const handleBrowsePython = async () => {
    const selected = await window.userPreferences.selectPythonPath();
    if (selected) {
      setCurrentPythonPath(selected);
    }
  };

  return (
    <section className="flex flex-col gap-4 p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">General</h2>
        <p className="text-sm text-muted-foreground">
          Configure paths for external tools used when importing PSS/E .out files.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="dyntools-path">
          DynTools path
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            id="dyntools-path"
            value={currentDyntoolsPath}
            onChange={(event) => setCurrentDyntoolsPath(event.target.value)}
            placeholder="C:\\Program Files\\PTI\\PSSE36\\36.3\\PSSPY313"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBrowseDyntools}>
              Browse
            </Button>
            <Button
              onClick={() => updateDyntoolsPath(normalizedDyntoolsPath)}
              disabled={!isDyntoolsDirty}
            >
              Save
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Update this path if DynTools is installed in a different location.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="python-path">
          Python path
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            id="python-path"
            value={currentPythonPath}
            onChange={(event) => setCurrentPythonPath(event.target.value)}
            placeholder="py"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBrowsePython}>
              Browse
            </Button>
            <Button
              onClick={() => updatePythonPath(normalizedPythonPath)}
              disabled={!isPythonDirty}
            >
              Save
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Set the python executable to use when running DynTools.
        </p>
      </div>
    </section>
  );
}
