import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Calendar, ArrowRight } from 'lucide-react';
import { blogArticlesData } from '../data/portfolioData';
import PageHeader from '../components/common/PageHeader';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import CtaBanner from '../components/home/CtaBanner';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Development', 'Cloud', 'DevOps', 'AI & Data', 'Security'];

  const filteredArticles = useMemo(() => {
    return blogArticlesData.filter((article) => {
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-navy text-navy-50">
      <PageHeader
        badge="ENGINEERING WRITINGS"
        title="Journal & Blog"
        description="Thoughts, architecture tutorials, and reflections on high-performance web development and cloud technologies."
        breadcrumbs={[{ label: 'Blog' }]}
      />

      <section className="py-12 md:py-16 bg-navy">
        <Container>
          {/* Controls: Search & Category Pills */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 border ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-navy-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/25'
                      : 'bg-navy-card text-navy-200 border-navy-border hover:border-cyan-500/50 hover:text-white'
                  }`}
                >
                  {cat}
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
                placeholder="Search articles & guides..."
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

          {/* Article Cards Grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="group bg-navy-card rounded-3xl border border-navy-border hover:border-cyan-500/60 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/blog/${article.slug}`}
                    className="relative aspect-[16/10] overflow-hidden bg-navy-muted block"
                    aria-label={`Read article: ${article.title}`}
                  >
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-navy/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-cyan-400 tracking-wide border border-navy-border">
                      {article.category}
                    </div>
                  </Link>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-navy-300 mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} />
                          <span>{article.date}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} />
                          <span>{article.readTime}</span>
                        </span>
                      </div>

                      <Link
                        to={`/blog/${article.slug}`}
                        className="block group-hover:text-cyan-400 transition-colors"
                      >
                        <h2 className="font-serif text-xl font-medium text-white mb-3 leading-snug">
                          {article.title}
                        </h2>
                      </Link>

                      <p className="text-sm text-navy-200 line-clamp-3 mb-6 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-4 border-t border-navy-border flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {article.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-navy text-cyan-300 border border-navy-border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Link
                        to={`/blog/${article.slug}`}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 group-hover:underline"
                      >
                        <span>Read More</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-navy-card rounded-3xl border border-navy-border p-8">
              <h3 className="font-serif text-xl font-medium text-white mb-2">
                No matching articles found
              </h3>
              <p className="text-sm text-navy-200 mb-6">
                Try adjusting your search query or choosing another category filter.
              </p>
              <Button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                variant="primary"
                size="sm"
              >
                Reset Filter
              </Button>
            </div>
          )}
        </Container>
      </section>

      <CtaBanner />
    </div>
  );
}
