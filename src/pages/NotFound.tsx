import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden px-4">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[120px] sm:text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500/20 to-red-600/20 leading-none select-none">
            404
          </h1>
          
          <div className="-mt-8 sm:-mt-12 md:-mt-20 relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/">
                <Button className="bg-gradient-to-r from-yellow-500 to-red-600 text-white border-0 hover:from-yellow-600 hover:to-red-700 shadow-lg shadow-orange-500/20 h-12 px-8 rounded-full w-full sm:w-auto">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="border-white/10 text-white hover:bg-white/5 hover:text-yellow-500 h-12 px-8 rounded-full w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
