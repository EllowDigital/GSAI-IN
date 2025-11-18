import React from 'react';
import { ChevronUp } from 'lucide-react';

const AdminBackToTopButton: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const listener = () => setVisible(window.scrollY > 200);
    window.addEventListener('scroll', listener);
    return () => window.removeEventListener('scroll', listener);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 bg-yellow-300 hover:bg-yellow-400 rounded-full shadow-lg p-2 z-50 animate-fade-in"
      aria-label="Back to Top"
    >
      <ChevronUp className="text-black" />
    </button>
  );
};

export default AdminBackToTopButton;
