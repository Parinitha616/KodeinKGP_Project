import React, { useState, useEffect } from 'react';

// Dynamic API Routing base config link for deployment environment pipelines
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [profile, setProfile] = useState({ name: '', bio: '', avatar: '', accentColor: '#3b82f6' });
  const [links, setLinks] = useState([]);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  // Fetch initial dashboard records from Backend API
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/data`)
      .then(res => res.json())
      .then(data => {
        setProfile(data.profile);
        setLinks(data.links);
      })
      .catch(err => console.error("Error fetching operational server data:", err));
  }, []);

  // Sync and toggle dark mode classes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    const updatedProfile = { ...profile, [name]: value };
    setProfile(updatedProfile);

    fetch(`${API_BASE_URL}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProfile)
    });
  };

  const addLink = () => {
    fetch(`${API_BASE_URL}/api/links`, { method: 'POST' })
      .then(res => res.json())
      .then(newLink => setLinks([...links, newLink]));
  };

  const updateLink = (id, fields) => {
    fetch(`${API_BASE_URL}/api/links/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields)
    })
      .then(res => res.json())
      .then(updated => setLinks(links.map(l => l.id === id ? updated : l)));
  };

  const deleteLink = (id) => {
    fetch(`${API_BASE_URL}/api/links/${id}`, { method: 'DELETE' })
      .then(() => setLinks(links.filter(l => l.id !== id)));
  };

  const handleLinkClickSimulation = (id, url) => {
    fetch(`${API_BASE_URL}/api/links/${id}/click`, { method: 'POST' })
      .then(res => res.json())
      .then(updated => setLinks(links.map(l => l.id === id ? updated : l)));
    window.open(url, '_blank');
  };

  const resetStats = () => {
    fetch(`${API_BASE_URL}/api/links/reset-stats`, { method: 'POST' })
      .then(res => res.json())
      .then(data => setLinks(data.links));
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Top Header Controls */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold tracking-tight">🔗 Link-in-Bio Dashboard</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium">
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button 
            onClick={resetStats}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg shadow">
            Reset Analytics Data
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Editor Form Columns */}
        <section className="space-y-6">
          
          {/* Profile Configuration */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Edit Profile Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-400 mb-1">Display Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="w-full p-2 border rounded bg-transparent dark:border-gray-600"/>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-400 mb-1">Short Bio</label>
                <textarea name="bio" value={profile.bio} onChange={handleProfileChange} className="w-full p-2 border rounded bg-transparent dark:border-gray-600" rows="2"/>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-400 mb-1">Avatar Image URL</label>
                <input type="text" name="avatar" value={profile.avatar} onChange={handleProfileChange} placeholder="https://example.com/pic.png" className="w-full p-2 border rounded bg-transparent dark:border-gray-600"/>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-400 mb-1">Accent Brand Color</label>
                <input type="color" name="accentColor" value={profile.accentColor} onChange={handleProfileChange} className="w-12 h-10 block border-0 cursor-pointer bg-transparent"/>
              </div>
            </div>
          </div>

          {/* Links Configuration */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Manage Links</h2>
              <button onClick={addLink} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                + Add Link Item
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {links.map((link) => (
                <div key={link.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2 border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <input 
                      type="text" 
                      value={link.label} 
                      onChange={(e) => updateLink(link.id, { label: e.target.value })}
                      className="font-medium bg-transparent border-b border-transparent hover:border-gray-400 focus:border-blue-500 outline-none text-sm w-2/3"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded">
                        📈 {link.clicks} clicks
                      </span>
                      <input 
                        type="checkbox" 
                        checked={link.active} 
                        onChange={(e) => updateLink(link.id, { active: e.target.checked })}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <button onClick={() => deleteLink(link.id)} className="text-red-500 hover:text-red-600 text-sm">🗑️</button>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={link.url} 
                    onChange={(e) => updateLink(link.id, { url: e.target.value })}
                    className="w-full text-xs text-gray-500 dark:text-gray-300 bg-transparent outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Real-time Mobile Preview Area */}
        <section className="flex justify-center items-start lg:sticky lg:top-8">
          <div className="w-[320px] min-h-[580px] border-[12px] border-gray-800 dark:border-gray-700 rounded-[36px] shadow-2xl overflow-hidden bg-white dark:bg-gray-900 relative flex flex-col items-center p-6 text-center">
            
            {/* Header Device Notch Mockup */}
            <div className="w-32 h-4 bg-gray-800 absolute top-0 rounded-b-xl"></div>

            {/* Avatar block */}
            <div className="mt-6 w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden flex items-center justify-center border-2 border-gray-100 dark:border-800">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl text-gray-500">👤</span>
              )}
            </div>

            {/* Profile context titles */}
            <h3 className="mt-3 font-bold text-lg text-gray-900 dark:text-white truncate max-w-full">{profile.name || 'Anonymous User'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-4 line-clamp-3">{profile.bio || 'Your bio placeholder details...'}</p>

            {/* Active Link elements mapping */}
            <div className="w-full space-y-3 mt-6 flex-1 overflow-y-auto max-h-[320px] px-2">
              {links.filter(l => l.active).map(link => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClickSimulation(link.id, link.url)}
                  style={{ backgroundColor: profile.accentColor }}
                  className="w-full py-2.5 px-4 text-white font-medium text-sm rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98] block shadow-sm truncate text-center">
                  {link.label}
                </button>
              ))}
            </div>

            <footer className="mt-4 text-[10px] text-gray-400 font-medium tracking-wide">
              Powered by KodeinKGP Task
            </footer>
          </div>
        </section>

      </main>
    </div>
  );
}
