import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="text-center py-12">
      <SettingsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
      <p className="text-gray-600">Account settings and preferences coming soon...</p>
    </div>
  );
};

export default Settings;
