import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import CivilStatusPage from './pages/CivilStatusPage';
import SexPage from './pages/SexPage';
import AgePage from './pages/AgePage';
import EducationPage from './pages/EducationPage';
import OccupationPage from './pages/OccupationPage';
import MajorDestinationPage from './pages/MajorDestinationPage';
import OriginPage from './pages/OriginPage';
import ForecastingPage from './forecasting/ForecastingPage'; // Changed from ./pages/ForecastingPage
import AllModels from './forecasting/components/AllModels';
import ForecastGraphPage from './forecasting/components/ForecastingGraphPage'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Layout for pages with sidebar
  const MainLayout = ({ children }) => (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/forecasting"
          element={
            <MainLayout>
              <ForecastingPage />
            </MainLayout>
          }
        />
        <Route
          path="/forecasting-graph"
          element={
            <MainLayout>
              <ForecastGraphPage />
            </MainLayout>
          }
        />
        <Route
          path="/civil-status"
          element={
            <MainLayout>
              <CivilStatusPage />
            </MainLayout>
          }
        />
        <Route
          path="/age"
          element={
            <MainLayout>
              <AgePage />
            </MainLayout>
          }
        />
        <Route
          path="/sex"
          element={
            <MainLayout>
              <SexPage />
            </MainLayout>
          }
        />
        <Route
          path="/education"
          element={
            <MainLayout>
              <EducationPage />
            </MainLayout>
          }
        />
        <Route
          path="/occupation"
          element={
            <MainLayout>
              <OccupationPage />
            </MainLayout>
          }
        />
        <Route
          path="/major-destination"
          element={
            <MainLayout>
              <MajorDestinationPage />
            </MainLayout>
          }
        />
        <Route
          path="/origin"
          element={
            <MainLayout>
              <OriginPage />
            </MainLayout>
          }
        />
        <Route
          path="/all-models"
          element={
            <MainLayout>
              <AllModels />   
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;