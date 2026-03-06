import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Link2 } from 'lucide-react';

interface InternalLinkItem {
  to: string;
  label: string;
  description: string;
}

interface InternalLinksBlockProps {
  title?: string;
  items: InternalLinkItem[];
}

export default function InternalLinksBlock({
  title = 'Explore Related Pages',
  items,
}: InternalLinksBlockProps) {
  if (!items.length) return null;

  return (
    <section className="mt-12 mb-12 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="mb-5 flex items-center gap-2">
        <Link2 className="h-5 w-5 text-yellow-500" />
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <Link
            key={`${item.to}-${item.label}`}
            to={item.to}
            className="group rounded-xl border border-white/10 bg-black/30 p-4 transition-colors hover:border-yellow-500/40"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-sm md:text-base font-semibold text-white group-hover:text-yellow-400 transition-colors">
                {item.label}
              </span>
              <ChevronRight className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
