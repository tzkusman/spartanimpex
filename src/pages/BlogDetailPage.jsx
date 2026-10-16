import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from 'lucide-react';
import { blogArticlesData, personalData } from '../data/portfolioData';
import PageHeader from '../components/common/PageHeader';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import CtaBanner from '../components/home/CtaBanner';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const article = blogArticlesData.find((a) => a.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!article) {
    return (
      <div className="py-24 text-center bg-navy min-h-screen text-white">
        <Container>
          <h1 className="text-3xl font-serif font-medium text-white mb-4">Article Not Found</h1>
          <p className="text-navy-200 mb-8">The article you are searching for does not exist or has been archived.</p>
          <Button to="/blog" variant="primary">
            Back to Journal
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-navy text-navy-50">
      <PageHeader
        badge={article.category}
        title={article.title}
        description={article.excerpt}
        breadcrumbs={[
          { label: 'Blog', to: '/blog' },
          { label: article.title }
        ]}
      />

      <article className="py-12 md:py-16 bg-navy">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <div className="mb-8">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-navy-300 hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Journal</span>
              </Link>
            </div>

            {/* Article Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-navy-border mb-8 text-xs text-navy-300">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{article.date}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{article.readTime}</span>
                </span>
                <span>•</span>
                <span className="text-cyan font-medium">By {personalData.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert("Article link copied to clipboard!");
                  }}
                  className="p-2 rounded-full border border-navy-border hover:border-cyan-400 text-navy-200 hover:text-cyan-400 transition-colors"
                  title="Share article link"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>

            {/* Featured Hero Image */}
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-navy-dark border border-navy-border shadow-2xl mb-12">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Main Article Body */}
            <div className="bg-navy-card p-8 sm:p-12 rounded-3xl border border-navy-border shadow-2xl space-y-6">
              {article.content.map((para, idx) => (
                <p key={idx} className="text-base sm:text-lg text-navy-200 leading-relaxed font-normal">
                  {para}
                </p>
              ))}

              {/* Editorial Highlight Box */}
              <div className="my-8 p-6 rounded-2xl bg-navy-dark border-l-4 border-cyan space-y-2">
                <h3 className="font-serif text-lg font-medium text-white">
                  Key Architectural Takeaway
                </h3>
                <p className="text-sm text-navy-200 leading-relaxed">
                  Always optimize for maintainability, zero-dependency tokenization, and strict separation between business data and presentation layers.
                </p>
              </div>

              {/* Tags */}
              <div className="pt-8 border-t border-navy-border">
                <div className="flex items-center gap-2 text-xs text-navy-300 mb-3">
                  <Tag size={14} />
                  <span className="font-semibold uppercase tracking-wider">Related Topics</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 rounded-full bg-navy text-cyan-300 font-medium border border-navy-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author Bio Box */}
              <div className="mt-10 pt-8 border-t border-navy-border flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-navy border border-navy-border flex-shrink-0">
                  <img
                    src={personalData.avatarUrl}
                    alt={personalData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-serif text-base font-medium text-white">
                    Written by {personalData.name}
                  </h4>
                  <p className="text-xs text-navy-300 leading-relaxed">
                    {personalData.shortBio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </article>

      <CtaBanner />
    </div>
  );
}
