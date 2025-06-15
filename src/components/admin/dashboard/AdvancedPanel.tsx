
import React from 'react';

export default function AdvancedPanel() {
  return (
    <section className="rounded-2xl shadow bg-white/90 px-2 xs:px-4 sm:px-6 py-5">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-7">
        <div className="flex-1 flex flex-col gap-3">
          <div className="rounded-lg p-4 sm:p-5 bg-gradient-to-br from-yellow-100/70 to-yellow-50 border border-yellow-200 shadow-sm">
            <h3 className="font-bold mb-2 text-yellow-800 text-sm sm:text-base">Quick Tips</h3>
            <ul className="list-disc ml-4 text-gray-700 text-xs sm:text-sm space-y-1">
              <li>Use the sidebar to access all main modules.</li>
              <li>Data is updated in real-time.</li>
              <li>All sections are mobile friendly.</li>
              <li>Contact support for any issues.</li>
            </ul>
          </div>
          <div className="rounded-lg p-3 sm:p-4 bg-yellow-50 border border-yellow-100 shadow">
            <h4 className="font-bold text-yellow-700 mb-1 text-xs sm:text-base">Latest Announcements</h4>
            <ul className="text-xs sm:text-sm text-gray-700 list-disc ml-4">
              <li className="mb-1">Website redesign launched 🎉</li>
              <li>More dashboard analytics coming soon!</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
