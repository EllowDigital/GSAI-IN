/**
 * Event Tracking Components & Utilities
 *
 * Production-ready components and utilities for tracking user interactions
 * These wrap common UI patterns with automatic GTM tracking
 *
 * FEATURES:
 * - TrackedButton: Button with automatic click tracking
 * - TrackedLink: Link with automatic click and outbound tracking
 * - TrackedForm: Form wrapper with submission and validation tracking
 * - Event tracking decorators for custom components
 */

import React, { ComponentProps, FormEvent, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  trackCTAClick,
  trackOutboundClick,
  trackFormSubmit,
  trackFormError,
} from '@/utils/gtm';

// ==========================================
// TrackedButton Component
// ==========================================

interface TrackedButtonProps extends ComponentProps<'button'> {
  trackingLabel: string; // Label for analytics
  trackingCategory?: string; // Category/section of the button
  trackingUrl?: string; // URL the button leads to (if any)
}

/**
 * Button component with automatic click tracking
 *
 * USAGE:
 * ```tsx
 * <TrackedButton
 *   trackingLabel="Sign Up Now"
 *   trackingCategory="hero_section"
 *   onClick={handleSignup}
 * >
 *   Sign Up
 * </TrackedButton>
 * ```
 */
export const TrackedButton: React.FC<TrackedButtonProps> = ({
  trackingLabel,
  trackingCategory,
  trackingUrl = '#',
  onClick,
  children,
  ...props
}) => {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Track the click
    trackCTAClick(trackingLabel, trackingUrl, trackingCategory);

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
};

// ==========================================
// TrackedLink Component
// ==========================================

// Omit anchor-specific props that conflict with React Router Link
type AnchorProps = Omit<ComponentProps<'a'>, 'href'>;

interface TrackedLinkProps extends AnchorProps {
  href?: string; // Made optional to support both internal and external links
  trackingLabel?: string; // Custom label (defaults to link text)
  trackAsOutbound?: boolean; // Force tracking as outbound (auto-detected by default)
}

/**
 * Link component with automatic click tracking
 * Automatically detects and tracks outbound links
 * Uses React Router Link for internal navigation to avoid page reloads
 *
 * USAGE:
 * ```tsx
 * <TrackedLink href="/programs" trackingLabel="View Programs">
 *   Our Programs
 * </TrackedLink>
 *
 * <TrackedLink href="https://external.com" trackingLabel="Partner Site">
 *   Visit Partner
 * </TrackedLink>
 * ```
 */
export const TrackedLink: React.FC<TrackedLinkProps> = ({
  href,
  trackingLabel,
  trackAsOutbound,
  onClick,
  children,
  ...props
}) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const linkText =
      trackingLabel || (typeof children === 'string' ? children : href || '');

    // Check if link is outbound
    const isOutbound = trackAsOutbound || (href && isExternalUrl(href));

    if (isOutbound && href) {
      trackOutboundClick(href, linkText);
    } else if (href) {
      trackCTAClick(linkText, href, 'navigation');
    }

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  // Use React Router Link for internal links to avoid page reload
  const isExternal = trackAsOutbound || (href && isExternalUrl(href));

  if (isExternal || !href) {
    return (
      <a {...props} href={href} onClick={handleClick}>
        {children}
      </a>
    );
  }

  // For internal links, use React Router Link
  // Filter out anchor-specific props that don't apply to Link component
  const { target, rel, download, hrefLang, ping, referrerPolicy, ...linkProps } = props;
  return (
    <Link {...linkProps} to={href} onClick={handleClick as any}>
      {children}
    </Link>
  );
};

// ==========================================
// TrackedForm Component
// ==========================================

interface TrackedFormProps extends ComponentProps<'form'> {
  formId: string; // Unique identifier for the form
  formName: string; // Human-readable form name
  onValidationError?: (fieldName: string, errorMessage: string) => void;
}

/**
 * Form component with automatic submission and error tracking
 *
 * USAGE:
 * ```tsx
 * <TrackedForm
 *   formId="contact_form"
 *   formName="Contact Form"
 *   onSubmit={handleSubmit}
 * >
 *   <input name="email" type="email" />
 *   <button type="submit">Submit</button>
 * </TrackedForm>
 * ```
 */
export const TrackedForm: React.FC<TrackedFormProps> = ({
  formId,
  formName,
  onSubmit,
  onValidationError,
  children,
  ...props
}) => {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Check HTML5 validation
      const form = e.currentTarget;
      if (!form.checkValidity()) {
        // Find first invalid field
        const firstInvalid = form.querySelector(':invalid') as HTMLInputElement;
        if (firstInvalid) {
          const fieldName = firstInvalid.name || firstInvalid.id || 'unknown';
          const errorMessage =
            firstInvalid.validationMessage || 'Validation error';

          trackFormError(formId, fieldName, errorMessage);

          if (onValidationError) {
            onValidationError(fieldName, errorMessage);
          }
        }
        return;
      }

      // Track successful submission
      trackFormSubmit(formId, formName, true);

      // Call original onSubmit if provided
      if (onSubmit) {
        await onSubmit(e);
      }
    } catch (error) {
      // Track failed submission
      trackFormSubmit(formId, formName, false);
      throw error;
    }
  };

  return (
    <form {...props} onSubmit={handleSubmit}>
      {children}
    </form>
  );
};

// ==========================================
// Utility Functions
// ==========================================

/**
 * Check if a URL is external/outbound
 */
const isExternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.href);
    return urlObj.hostname !== window.location.hostname;
  } catch {
    return false;
  }
};

/**
 * HOC: Add tracking to any component's click handler
 *
 * USAGE:
 * ```tsx
 * const TrackedCustomButton = withClickTracking(CustomButton, {
 *   trackingLabel: 'Custom Action',
 *   trackingCategory: 'custom_section'
 * });
 * ```
 */
export function withClickTracking<P extends { onClick?: (e: any) => void }>(
  Component: React.ComponentType<P>,
  trackingConfig: {
    trackingLabel: string;
    trackingCategory?: string;
    trackingUrl?: string;
  }
) {
  return (props: P) => {
    const handleClick = (e: any) => {
      trackCTAClick(
        trackingConfig.trackingLabel,
        trackingConfig.trackingUrl || '#',
        trackingConfig.trackingCategory
      );

      if (props.onClick) {
        props.onClick(e);
      }
    };

    return <Component {...props} onClick={handleClick} />;
  };
}

/**
 * Hook: Track form field changes
 * Useful for understanding where users struggle in forms
 *
 * USAGE:
 * ```tsx
 * const trackFieldChange = useFormFieldTracking('contact_form');
 *
 * <input
 *   name="email"
 *   onChange={(e) => trackFieldChange('email', e.target.value)}
 * />
 * ```
 */
export const useFormFieldTracking = (formId: string) => {
  return (fieldName: string, value: any) => {
    // Only track significant interactions (not every keystroke)
    // Track when field is filled or changed significantly
    if (value && value.length > 0) {
      // You can implement debouncing here if needed
      // For now, just track that the field was interacted with
      if (process.env.NODE_ENV === 'development') {
        console.log(`📝 Form field tracked: ${formId}.${fieldName}`);
      }
    }
  };
};

// ==========================================
// EXAMPLE USAGE IN YOUR COMPONENTS
// ==========================================

/**
 * EXAMPLE 1: Track CTA Button Click
 *
 * ```tsx
 * import { TrackedButton } from '@/utils/eventTracking';
 *
 * <TrackedButton
 *   trackingLabel="Join Now"
 *   trackingCategory="hero_section"
 *   trackingUrl="/signup"
 *   className="btn-primary"
 *   onClick={handleJoin}
 * >
 *   Join Now
 * </TrackedButton>
 * ```
 */

/**
 * EXAMPLE 2: Track Form Submission
 *
 * ```tsx
 * import { TrackedForm } from '@/utils/eventTracking';
 *
 * <TrackedForm
 *   formId="contact_form"
 *   formName="Contact Form"
 *   onSubmit={handleSubmit}
 * >
 *   <input type="text" name="name" required />
 *   <input type="email" name="email" required />
 *   <button type="submit">Send Message</button>
 * </TrackedForm>
 * ```
 */

/**
 * EXAMPLE 3: Track Outbound Link
 *
 * ```tsx
 * import { TrackedLink } from '@/utils/eventTracking';
 *
 * <TrackedLink
 *   href="https://facebook.com/ghataksportsacademy"
 *   trackingLabel="Facebook Page"
 * >
 *   Follow us on Facebook
 * </TrackedLink>
 * ```
 */

/**
 * EXAMPLE 4: Manual Event Tracking
 *
 * ```tsx
 * import { trackCTAClick, trackVideo } from '@/utils/gtm';
 *
 * const handlePlayVideo = () => {
 *   trackVideo('play', 'Introduction Video', videoUrl);
 *   // ... play video logic
 * };
 *
 * const handleDownload = () => {
 *   trackFileDownload('/brochure.pdf', 'Academy Brochure');
 *   // ... download logic
 * };
 * ```
 */
