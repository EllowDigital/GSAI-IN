
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./ui/carousel";
import { Award } from "lucide-react";

const logos = [
  { name: "Government of India", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Emblem_of_India.svg/200px-Emblem_of_India.svg.png" },
  { name: "Ministry of Youth Affairs & Sports", url: "https://youthaffairs.gov.in/sites/default/files/ministry_logo.png" },
  { name: "Fit India", url: "https://fitindia.gov.in/assets/images/logo.png" },
  { name: "Khelo India", url: "https://kheloindia.gov.in/assets/images/logo.png" },
  { name: "MSME", url: "https://upload.wikimedia.org/wikipedia/commons/7/73/MSME_logo.png" },
  { name: "ISO Certified", url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/ISO_Logo.svg" },
  { name: "SGFI", url: "https://sgfi.org/assets/images/logo-blue_0.png" },
  { name: "UP Olympic Association", url: "https://upload.wikimedia.org/wikipedia/commons/6/67/Olympic_rings_without_rims.svg" },
  { name: "UP Kalaripayattu Federation", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Om_symbol.svg/120px-Om_symbol.svg.png" },
  { name: "Taekwondo Federation", url: "https://upload.wikimedia.org/wikipedia/en/1/1d/World_Taekwondo_Federation_logo.svg" },
];

export default function RecognitionAffiliationsSection() {
  return (
    <section id="recognitions" className="py-14 px-2 xs:px-4 md:px-6 bg-gradient-to-br from-yellow-50 via-white to-red-50 border-t border-b border-yellow-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-7 gap-2">
          <div className="flex items-center gap-3">
            {/* Optionally, use the Award icon instead of an emoji */}
            {/* <Award size={36} className="text-yellow-500 drop-shadow" /> */}
            <span className="text-3xl md:text-4xl text-yellow-500"><span role="img" aria-label="Awards">🏆</span></span>
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 tracking-tight drop-shadow">
              Recognitions &amp; Affiliations
            </h2>
          </div>
          <p className="text-base md:text-lg font-medium text-gray-500 text-center max-w-2xl">
            Proudly recognized and affiliated with premier national and state organizations driving excellence in sports for youth, fitness, and martial arts.
          </p>
        </div>
        <div className="relative flex items-center w-full justify-center">
          <Carousel
            opts={{
              align: "center",
              loop: true,
              slidesToScroll: 2,
              dragFree: true,
            }}
            className="w-full max-w-5xl"
          >
            <CarouselPrevious aria-label="Scroll left" />
            <CarouselContent className="gap-3 md:gap-5 py-4">
              {logos.map((logo) => (
                <CarouselItem key={logo.name} className="basis-1/3 xs:basis-1/4 md:basis-1/6 flex justify-center">
                  <div
                    className="group flex flex-col items-center min-w-[92px] max-w-[112px] flex-shrink-0"
                    title={logo.name}
                  >
                    <img
                      src={logo.url}
                      alt={logo.name}
                      loading="lazy"
                      className="h-16 w-auto object-contain grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-200 shadow-sm group-hover:shadow-lg border border-yellow-200 bg-white rounded-lg p-1"
                      style={{ backgroundColor: "#fff" }}
                    />
                    <span className="text-xs mt-2 text-gray-600 text-center max-w-[100px] group-hover:text-yellow-700 transition-colors font-medium">{logo.name}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNext aria-label="Scroll right" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}

