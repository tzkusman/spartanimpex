import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import Container from '../components/common/Container';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 bg-navy text-navy-50">
      <Container>
        <div className="max-w-md mx-auto text-center bg-navy-card p-10 sm:p-12 rounded-3xl border border-navy-border shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-navy border border-cyan-500/40 flex items-center justify-center mx-auto mb-6 text-cyan-400 shadow-lg shadow-cyan-500/20">
            <span className="font-serif text-3xl font-bold">404</span>
          </div>

          <h1 className="text-3xl font-serif font-medium text-white mb-3">
            Page Not Found
          </h1>

          <p className="text-sm text-navy-200 mb-8 leading-relaxed">
            The page you are looking for doesn't exist or may have been relocated.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              to="/"
              variant="primary"
              size="md"
              icon={Home}
              iconPosition="left"
            >
              Return Home
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="secondary"
              size="md"
              icon={ArrowLeft}
              iconPosition="left"
            >
              Go Back
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
