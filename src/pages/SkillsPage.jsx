import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Code, 
  Layers, 
  FileCode, 
  Layout, 
  Palette, 
  Wind, 
  Server, 
  Zap, 
  Terminal, 
  Coffee, 
  Code2, 
  Box, 
  Database, 
  HardDrive, 
  FolderTree, 
  Flame, 
  Disc, 
  Cpu, 
  Cloud, 
  Boxes, 
  Compass, 
  GitMerge, 
  Workflow, 
  Grid, 
  Component, 
  LayoutGrid, 
  Eye, 
  Shield, 
  Key, 
  Network, 
  Lock, 
  Brain, 
  Sparkles, 
  Binary, 
  BarChart3, 
  GitBranch, 
  Monitor, 
  Send, 
  Globe 
} from 'lucide-react';
import { GithubIcon as Github, FigmaIcon as Figma } from '../components/common/BrandIcons';
import { skillsData } from '../data/portfolioData';
import PageHeader from '../components/common/PageHeader';
import Container from '../components/common/Container';
import CtaBanner from '../components/home/CtaBanner';

const iconComponents = {
  Code, Layers, FileCode, Layout, Palette, Wind, Server, Zap, Terminal, Coffee, Code2, Box,
  Database, HardDrive, FolderTree, Flame, Disc, Cpu, Cloud, Boxes, Compass, GitMerge, Workflow,
  Grid, Component, LayoutGrid, Eye, Shield, Key, Network, Lock, Brain, Sparkles, Binary,
  BarChart3, GitBranch, Github, Figma, Monitor, Send, Globe
};

export default function SkillsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all categories
  const categories = useMemo(() => {
    return [
      { name: 'All Categories', slug: 'all' },
      ...skillsData.map((cat) => ({ name: cat.category, slug: cat.slug }))
    ];
  }, []);

  // Filter skills by category and query
  const filteredCategories = useMemo(() => {
    return skillsData
      .map((cat) => {
        if (selectedCategory !== 'all' && cat.slug !== selectedCategory) {
          return null;
        }

        const filteredSkills = cat.skills.filter((skill) =>
          skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          skill.level.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filteredSkills.length === 0) return null;

        return {
          ...cat,
          skills: filteredSkills
        };
      })
      .filter(Boolean);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-navy text-navy-50">
      <PageHeader
        badge="STACK & TOOLING"
        title="Skills & Technologies"
        description="Comprehensive breakdown of programming languages, frameworks, cloud infrastructure, and engineering workflows."
        breadcrumbs={[{ label: 'Skills' }]}
      />

      <section className="py-12 md:py-16 bg-navy">
        <Container>
          {/* Controls: Search and Filter Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 border ${
                    selectedCategory === cat.slug
                      ? 'bg-cyan-500 text-navy-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/25'
                      : 'bg-navy-card text-navy-200 border-navy-border hover:border-cyan-500/50 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 flex-shrink-0">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search technologies..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-navy-card text-white border border-navy-border rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all placeholder:text-navy-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-navy-300 hover:text-cyan-400"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Categorized Skills Section */}
          {filteredCategories.length > 0 ? (
            <div className="space-y-12">
              {filteredCategories.map((group) => (
                <div key={group.category} className="bg-navy-card p-6 sm:p-8 rounded-3xl border border-navy-border shadow-xl">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-navy-border">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]"></span>
                    <h2 className="font-serif text-2xl font-medium text-white">
                      {group.category}
                    </h2>
                    <span className="text-xs text-navy-300 ml-auto font-medium">
                      {group.skills.length} {group.skills.length === 1 ? 'skill' : 'skills'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {group.skills.map((skill) => {
                      const IconComp = iconComponents[skill.icon] || Code;

                      return (
                        <div
                          key={skill.name}
                          className="group bg-navy p-4 rounded-2xl border border-navy-border hover:border-cyan-500/60 hover:shadow-luxury transition-all duration-300 flex flex-col items-center text-center"
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-navy-muted border border-navy-border group-hover:scale-110 group-hover:bg-cyan-500/10 transition-transform duration-300 shadow-sm"
                            style={{ color: skill.color || '#00F0FF' }}
                          >
                            <IconComp size={22} />
                          </div>

                          <h3 className="font-serif text-sm font-medium text-white mb-1 group-hover:text-cyan-300 transition-colors">
                            {skill.name}
                          </h3>

                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-navy-card border border-navy-border text-cyan-300">
                              {skill.level}
                            </span>
                          </div>

                          {skill.years && (
                            <span className="text-[11px] text-navy-300 mt-1">
                              {skill.years}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-navy-card rounded-3xl border border-navy-border">
              <p className="text-base text-navy-200 font-medium">
                No technologies found matching "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 text-sm font-semibold text-cyan-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </Container>
      </section>

      <CtaBanner />
    </div>
  );
}
