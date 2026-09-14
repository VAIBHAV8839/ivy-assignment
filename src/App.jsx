import React, { useState, useEffect } from 'react';
import { api } from './api';
import Navbar from './components/Navbar';
import ListingsPage from './pages/ListingsPage';
import DetailPage from './pages/DetailPage';
import RentalsPage from './pages/RentalsPage';
import ProjectsPage from './pages/ProjectsPage';
import SavedPage from './pages/SavedPage';
import InsightsPage from './pages/InsightsPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  const [user, setUser] = useState(api.user);
  const [currentTab, setCurrentTab] = useState('listings');
  const [selectedListing, setSelectedListing] = useState(null);
  const [savedListings, setSavedListings] = useState([]);
  const [listings, setListings] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial datasets
  useEffect(() => {
    async function loadData() {
      try {
        const [lData, rData, pData, sData] = await Promise.all([
          api.getListings(),
          api.getRentals(),
          api.getProjects(),
          api.getSaved()
        ]);
        setListings(lData || []);
        setRentals(rData || []);
        setProjects(pData || []);
        setSavedListings(sData || []);
      } catch (err) {
        console.error('Data loading error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync with URL hash for listing detail navigation (e.g. #listing-100-4000035)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#listing-')) {
        const id = hash.replace('#listing-', '');
        if (listings.length > 0) {
          const found = listings.find(l => l.listing_id === id);
          if (found) {
            setSelectedListing(found);
            setCurrentTab('detail');
          }
        }
      } else if (hash === '#rentals') {
        setCurrentTab('rentals');
        setSelectedListing(null);
      } else if (hash === '#projects') {
        setCurrentTab('projects');
        setSelectedListing(null);
      } else if (hash === '#saved') {
        setCurrentTab('saved');
        setSelectedListing(null);
      } else if (hash === '#insights') {
        setCurrentTab('insights');
        setSelectedListing(null);
      } else if (hash === '#listings' || !hash) {
        setCurrentTab('listings');
        setSelectedListing(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    if (listings.length > 0) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [listings]);

  // Periodic silent token refresh to keep session alive beyond 30 mins
  useEffect(() => {
    const interval = setInterval(() => {
      if (api.isAuthenticated()) {
        api.checkAndRefreshToken();
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = async (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentTab('listings');
    const userSaved = await api.getSaved();
    setSavedListings(userSaved);
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setSavedListings([]);
    setCurrentTab('login');
  };

  const handleToggleSave = async (listing) => {
    const isCurrentlySaved = savedListings.some(l => l.listing_id === listing.listing_id);
    if (isCurrentlySaved) {
      const updated = await api.removeSaved(listing.listing_id);
      setSavedListings(updated);
    } else {
      const updated = await api.saveListing(listing);
      setSavedListings(updated);
    }
  };

  const handleSelectListing = (listing) => {
    setSelectedListing(listing);
    setCurrentTab('detail');
    window.location.hash = `#listing-${listing.listing_id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToListings = () => {
    setSelectedListing(null);
    setCurrentTab('listings');
    window.location.hash = '#listings';
  };

  const savedIds = savedListings.map(l => l.listing_id);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 rounded-2xl border-4 border-emerald-500/30 border-t-emerald-500 animate-spin mb-4"></div>
        <span className="text-sm font-semibold tracking-wide">Loading Chennai Property Intelligence...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Global Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedListing(null);
          setCurrentTab(tab);
          window.location.hash = `#${tab}`;
        }}
        user={user}
        onLogout={handleLogout}
        savedCount={savedListings.length}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'login' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}

        {currentTab === 'listings' && (
          <ListingsPage
            listings={listings}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectListing={handleSelectListing}
          />
        )}

        {currentTab === 'detail' && selectedListing && (
          <DetailPage
            listing={selectedListing}
            allListings={listings}
            onBack={handleBackToListings}
            isSaved={savedIds.includes(selectedListing.listing_id)}
            onToggleSave={handleToggleSave}
            onSelectListing={handleSelectListing}
          />
        )}

        {currentTab === 'rentals' && (
          <RentalsPage rentals={rentals} />
        )}

        {currentTab === 'projects' && (
          <ProjectsPage projects={projects} listings={listings} />
        )}

        {currentTab === 'saved' && (
          <SavedPage
            savedListings={savedListings}
            onToggleSave={handleToggleSave}
            onSelectListing={handleSelectListing}
            onExplore={() => {
              setCurrentTab('listings');
              window.location.hash = '#listings';
            }}
          />
        )}

        {currentTab === 'insights' && (
          <InsightsPage
            listings={listings}
            projects={projects}
            rentals={rentals}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Ivy Homes — Software Engineering Internship Assessment (Chennai)</span>
          <span className="text-slate-400">Candidate: Vaibhav Pal (MNNIT)</span>
        </div>
      </footer>
    </div>
  );
}
