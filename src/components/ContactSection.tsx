import React from "react";
import { Sparkles, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="py-12 xs:py-20 px-2 xs:px-4 bg-gradient-to-br from-yellow-50 via-white to-red-50 border-b border-yellow-100 animate-fade-in relative overflow-hidden"
    >
      {/* Decorative sparkles */}
      <Sparkles className="absolute left-2 top-2 w-14 h-14 text-yellow-400 opacity-10 z-0 pointer-events-none" />
      <Sparkles className="absolute right-0 bottom-10 w-14 h-14 text-red-400 opacity-15 z-0 pointer-events-none animate-pulse" />

      <div className="max-w-xl mx-auto relative z-10">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="flex items-center gap-2 justify-center w-full">
            <Mail className="w-6 h-6 text-gray-600" aria-hidden="true" />
            <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold text-yellow-500 tracking-tight drop-shadow font-montserrat text-center w-full relative">
              Contact Us
              <span className="block h-1 w-14 bg-gradient-to-r from-yellow-400 to-red-200 rounded-full mx-auto mt-1" />
            </h2>
          </div>
          <p className="text-base md:text-lg font-medium text-gray-500 text-center max-w-2xl">
            Have questions or want to get in touch? Fill out the form below, and our team will reach out to you soon.
          </p>
        </div>

        <form
          action="https://formsubmit.co/ghatakgsai@gmail.com"
          method="POST"
          className="space-y-5 bg-white bg-opacity-80 p-5 xs:p-8 rounded-2xl shadow-lg border border-yellow-100"
        >
          <div>
            <label htmlFor="name" className="block font-semibold text-gray-700 mb-1">
              Name<span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-semibold text-gray-700 mb-1">
              Email<span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block font-semibold text-gray-700 mb-1">
              Phone Number<span className="text-red-500">*</span>
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              placeholder="Your phone number"
            />
          </div>

          <div>
            <label htmlFor="message" className="block font-semibold text-gray-700 mb-1">
              Your Message<span className="text-red-500">*</span>
            </label>
            <Textarea
              id="message"
              name="message"
              required
              rows={4}
              placeholder="Type your message here..."
            />
          </div>

          {/* FormSubmit hidden fields */}
          <input
            type="hidden"
            name="_subject"
            value="New Contact Form Submission from Ghatak Sports Academy"
          />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_next" value="https://ghatakgsai.netlify.app/assets/pages/success.html" />
          <input
            type="text"
            name="_honey"
            style={{ display: "none" }}
            tabIndex={-1}
          />

          <Button
            type="submit"
            variant="default"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-base rounded-md py-3 mt-2 transition-colors"
          >
            Send Message
          </Button>
        </form>
      </div>
    </section>
  );
}
