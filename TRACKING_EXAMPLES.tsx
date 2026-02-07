/**
 * EXAMPLE IMPLEMENTATIONS
 * 
 * This file demonstrates how to use the GTM/GA4 tracking utilities
 * in various real-world scenarios within your React application.
 * 
 * Copy and adapt these examples to your actual components.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollDepth } from '@/hooks/useScrollDepth';
import { useCanonicalUrl } from '@/utils/seo';
import {
  trackCTAClick,
  trackFormSubmit,
  trackFormError,
  trackVideo,
  trackFileDownload,
  trackSearch,
  trackConversion,
  trackCustomEvent,
} from '@/utils/gtm';
import {
  TrackedButton,
  TrackedLink,
  TrackedForm,
} from '@/utils/eventTracking';

// ==========================================
// EXAMPLE 1: Hero Section with CTA Tracking
// ==========================================

export const ExampleHeroSection: React.FC = () => {
  const navigate = useNavigate();
  
  // Automatically track scroll depth on this page
  useScrollDepth();

  const handleJoinClick = () => {
    // Manual tracking alternative
    trackCTAClick('Join Now', '/signup', 'hero_section');
    navigate('/signup');
  };

  return (
    <section className="hero">
      <h1>Welcome to Ghatak Sports Academy</h1>
      <p>Train with the best martial arts instructors in India</p>
      
      {/* Option 1: Using TrackedButton component (recommended) */}
      <TrackedButton
        trackingLabel="Join Now - Hero"
        trackingCategory="hero_section"
        trackingUrl="/signup"
        onClick={() => navigate('/signup')}
        className="btn-primary"
      >
        Join Now
      </TrackedButton>

      {/* Option 2: Using regular button with manual tracking */}
      <button onClick={handleJoinClick} className="btn-secondary">
        Learn More
      </button>
    </section>
  );
};

// ==========================================
// EXAMPLE 2: Contact Form with Validation Tracking
// ==========================================

export const ExampleContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate email format
      if (!isValidEmail(formData.email)) {
        trackFormError('contact_form', 'email', 'Invalid email format');
        alert('Please enter a valid email');
        return;
      }

      // Submit to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Track successful submission
        trackFormSubmit('contact_form', 'Contact Form', true);
        
        // Track as conversion
        trackConversion('lead', 'Contact Form Submission');
        
        alert('Message sent successfully!');
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      // Track failed submission
      trackFormSubmit('contact_form', 'Contact Form', false);
      alert('Failed to send message');
    }
  };

  return (
    <TrackedForm
      formId="contact_form"
      formName="Contact Form"
      onSubmit={handleSubmit}
      className="contact-form"
    >
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Your Name"
        required
      />
      
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Your Email"
        required
      />
      
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="Phone Number"
      />
      
      <textarea
        name="message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        placeholder="Your Message"
        required
      />
      
      <button type="submit">Send Message</button>
    </TrackedForm>
  );
};

// ==========================================
// EXAMPLE 3: Navigation with Link Tracking
// ==========================================

export const ExampleNavigation: React.FC = () => {
  return (
    <nav className="main-nav">
      {/* Internal navigation - tracked automatically */}
      <TrackedLink href="/" trackingLabel="Home">
        Home
      </TrackedLink>
      
      <TrackedLink href="/programs" trackingLabel="Programs">
        Programs
      </TrackedLink>
      
      <TrackedLink href="/events" trackingLabel="Events">
        Events
      </TrackedLink>

      {/* External links - automatically detected as outbound */}
      <TrackedLink
        href="https://www.facebook.com/ghataksportsacademy"
        trackingLabel="Facebook Page"
        target="_blank"
        rel="noopener noreferrer"
      >
        Facebook
      </TrackedLink>
      
      <TrackedLink
        href="https://www.instagram.com/ghataksportsacademy"
        trackingLabel="Instagram Profile"
        target="_blank"
        rel="noopener noreferrer"
      >
        Instagram
      </TrackedLink>
    </nav>
  );
};

// ==========================================
// EXAMPLE 4: Video Player with Interaction Tracking
// ==========================================

export const ExampleVideoPlayer: React.FC<{ videoUrl: string; videoTitle: string }> = ({
  videoUrl,
  videoTitle,
}) => {
  const [progress, setProgress] = useState(0);
  const [hasTracked50, setHasTracked50] = useState(false);
  const [hasTracked75, setHasTracked75] = useState(false);

  const handlePlay = () => {
    trackVideo('play', videoTitle, videoUrl);
  };

  const handlePause = () => {
    trackVideo('pause', videoTitle, videoUrl, progress);
  };

  const handleProgress = (percent: number) => {
    setProgress(percent);

    // Track 50% milestone
    if (percent >= 50 && !hasTracked50) {
      trackVideo('progress', videoTitle, videoUrl, 50);
      setHasTracked50(true);
    }

    // Track 75% milestone
    if (percent >= 75 && !hasTracked75) {
      trackVideo('progress', videoTitle, videoUrl, 75);
      setHasTracked75(true);
    }
  };

  const handleEnded = () => {
    trackVideo('complete', videoTitle, videoUrl, 100);
  };

  return (
    <div className="video-player">
      <video
        src={videoUrl}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={(e) => {
          const video = e.currentTarget;
          const percent = (video.currentTime / video.duration) * 100;
          handleProgress(percent);
        }}
        onEnded={handleEnded}
        controls
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

// ==========================================
// EXAMPLE 5: Download Button with Tracking
// ==========================================

export const ExampleDownloadButton: React.FC = () => {
  const handleDownload = (fileUrl: string, fileName: string) => {
    // Track the download
    trackFileDownload(fileUrl, fileName);

    // Trigger actual download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="downloads">
      <TrackedButton
        trackingLabel="Download Brochure"
        trackingCategory="downloads"
        trackingUrl="/downloads/brochure.pdf"
        onClick={() => handleDownload('/downloads/brochure.pdf', 'Academy Brochure')}
      >
        Download Brochure (PDF)
      </TrackedButton>

      <TrackedButton
        trackingLabel="Download Schedule"
        trackingCategory="downloads"
        trackingUrl="/downloads/schedule.pdf"
        onClick={() => handleDownload('/downloads/schedule.pdf', 'Class Schedule')}
      >
        Download Schedule
      </TrackedButton>
    </div>
  );
};

// ==========================================
// EXAMPLE 6: Search Functionality with Tracking
// ==========================================

export const ExampleSearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    try {
      // Perform search
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      setResults(data.results);

      // Track search event
      trackSearch(searchQuery, data.results.length);

      // Navigate to results page
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } catch (error) {
      console.error('Search failed:', error);
      trackSearch(searchQuery, 0);
    }
  };

  return (
    <form onSubmit={handleSearch} className="search-bar">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search programs, events..."
      />
      <button type="submit">Search</button>
    </form>
  );
};

// ==========================================
// EXAMPLE 7: Newsletter Signup with Custom Event
// ==========================================

export const ExampleNewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Track newsletter signup as custom event
        trackCustomEvent('newsletter_signup', {
          source: 'footer',
          list: 'weekly_updates',
        });

        // Also track as conversion
        trackConversion('lead', 'Newsletter Signup');

        alert('Successfully subscribed!');
        setEmail('');
      }
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <form onSubmit={handleSignup} className="newsletter-form">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Subscribe</button>
    </form>
  );
};

// ==========================================
// EXAMPLE 8: Page with SEO Optimization
// ==========================================

export const ExampleSEOOptimizedPage: React.FC = () => {
  // Automatically manage canonical URL
  useCanonicalUrl('/programs');
  
  // Automatically track scroll depth
  useScrollDepth();

  return (
    <div className="programs-page">
      {/* SEO and tracking are handled automatically */}
      <h1>Our Programs</h1>
      <p>Explore our martial arts training programs...</p>
    </div>
  );
};

// ==========================================
// EXAMPLE 9: Social Share Buttons with Tracking
// ==========================================

export const ExampleSocialShare: React.FC<{ url: string; title: string }> = ({
  url,
  title,
}) => {
  const handleShare = (platform: string, shareUrl: string) => {
    // Track social share
    trackCustomEvent('social_share', {
      platform,
      url,
      title,
    });

    // Open share window
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="social-share">
      <button
        onClick={() =>
          handleShare(
            'facebook',
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
          )
        }
      >
        Share on Facebook
      </button>

      <button
        onClick={() =>
          handleShare(
            'twitter',
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
          )
        }
      >
        Share on Twitter
      </button>

      <button
        onClick={() =>
          handleShare(
            'whatsapp',
            `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
          )
        }
      >
        Share on WhatsApp
      </button>
    </div>
  );
};

// ==========================================
// EXAMPLE 10: Image Gallery with View Tracking
// ==========================================

export const ExampleGallery: React.FC<{ images: Array<{ url: string; title: string }> }> = ({
  images,
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const handleImageClick = (index: number, title: string) => {
    setSelectedImage(index);
    
    // Track image view
    trackCustomEvent('image_viewed', {
      image_title: title,
      image_index: index,
      gallery: 'main_gallery',
    });
  };

  return (
    <div className="gallery">
      {images.map((image, index) => (
        <img
          key={index}
          src={image.url}
          alt={image.title}
          onClick={() => handleImageClick(index, image.title)}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </div>
  );
};

// ==========================================
// Utility Functions
// ==========================================

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ==========================================
// USAGE NOTES
// ==========================================

/**
 * To use these examples in your actual components:
 * 
 * 1. Copy the relevant example to your component file
 * 2. Adapt the tracking labels and categories to your needs
 * 3. Ensure you've imported the necessary utilities
 * 4. Test in GTM Preview mode
 * 5. Verify events in GA4 DebugView
 * 
 * Remember:
 * - Use descriptive tracking labels
 * - Keep event names consistent
 * - Test thoroughly before production
 * - Monitor event volume to avoid quota issues
 */
