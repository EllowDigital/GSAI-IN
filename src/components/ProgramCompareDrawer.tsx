import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeftRight, CheckCircle2, Clock, Users, CalendarDays } from 'lucide-react';
import { programs, Program } from '@/data/programsData';

interface ProgramCompareDrawerProps {
  selected: string[];
  onRemove: (slug: string) => void;
  onClear: () => void;
}

export default function ProgramCompareDrawer({ selected, onRemove, onClear }: ProgramCompareDrawerProps) {
  const selectedPrograms = useMemo(
    () => selected.map((s) => programs.find((p) => p.slug === s)).filter(Boolean) as Program[],
    [selected]
  );

  const [showFull, setShowFull] = useState(false);

  if (selected.length === 0) return null;

  return (
    <>
      {/* Sticky bottom bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#111] border-t border-white/10 px-4 py-3 shadow-2xl"
      >
        <div className="container mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <ArrowLeftRight className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-sm text-gray-300 flex-shrink-0">Compare:</span>
            {selectedPrograms.map((p) => (
              <span
                key={p.slug}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/20"
              >
                {p.icon} {p.title}
                <button onClick={() => onRemove(p.slug)} className="ml-0.5 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onClear}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setShowFull(true)}
              disabled={selected.length < 2}
              className="px-4 py-1.5 text-xs rounded-lg bg-gradient-to-r from-yellow-500 to-red-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
            >
              Compare ({selected.length}/3)
            </button>
          </div>
        </div>
      </motion.div>

      {/* Full comparison modal */}
      <AnimatePresence>
        {showFull && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowFull(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#111] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-yellow-400" />
                  Program Comparison
                </h2>
                <button onClick={() => setShowFull(false)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-500 font-medium p-4 min-w-[120px]">Feature</th>
                      {selectedPrograms.map((p) => (
                        <th key={p.slug} className="text-center p-4 min-w-[180px]">
                          <span className="text-3xl block mb-1">{p.icon}</span>
                          <span className="text-white font-bold">{p.title}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <CompareRow label="Category" icon={null} values={selectedPrograms.map((p) => p.category)} />
                    <CompareRow label="Level" icon={null} values={selectedPrograms.map((p) => p.level)} />
                    <CompareRow label="Duration" icon={<Clock className="w-4 h-4" />} values={selectedPrograms.map((p) => p.duration)} />
                    <CompareRow label="Age Group" icon={<Users className="w-4 h-4" />} values={selectedPrograms.map((p) => p.ageGroup)} />
                    <CompareRow label="Schedule" icon={<CalendarDays className="w-4 h-4" />} values={selectedPrograms.map((p) => p.schedule)} />
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-gray-400 font-medium align-top">Benefits</td>
                      {selectedPrograms.map((p) => (
                        <td key={p.slug} className="p-4 align-top">
                          <ul className="space-y-1.5">
                            {p.benefits.map((b) => (
                              <li key={b} className="flex items-start gap-1.5 text-gray-300 text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                {b}
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CompareRow({ label, icon, values }: { label: string; icon: React.ReactNode; values: string[] }) {
  const allSame = values.every((v) => v === values[0]);
  return (
    <tr className="border-b border-white/5">
      <td className="p-4 text-gray-400 font-medium">
        <span className="inline-flex items-center gap-1.5">{icon}{label}</span>
      </td>
      {values.map((v, i) => (
        <td key={i} className={`p-4 text-center ${allSame ? 'text-gray-400' : 'text-yellow-400 font-semibold'}`}>
          {v}
        </td>
      ))}
    </tr>
  );
}
