import React from 'react';
import Hero from '../components/home/Hero';
import TechnicalExpertise from '../components/home/TechnicalExpertise';
import FeaturedProjectsSection from '../components/home/FeaturedProjectsSection';
import AboutPreviewSection from '../components/home/AboutPreviewSection';
import CtaBanner from '../components/home/CtaBanner';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <TechnicalExpertise />
      <FeaturedProjectsSection />
      <AboutPreviewSection />
      <CtaBanner />
    </div>
  );
}
