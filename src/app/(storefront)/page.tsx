import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck, Sparkles, PhoneCall, ShieldCheck } from "lucide-react";
import { getHomepageContent } from "@/app/admin/actions";
import { ProductCarouselSection, NewsletterSection, DragScrollContainer, AnimatedSection, AnimatedHero } from "./HomePageClient";
import type { HomepageHero, HomepagePromo, HomepageNewsletter, Product } from "@/lib/types";

export const revalidate = 60; // Revalidate homepage every 60 seconds (ISR)

const defaultHero = {
  subtitle: "SHOPOHOLIC GLOBAL 2024",
  title: "The Essence of",
  titleAccent: "Timeless Minimalist Fashion",
  description: "Discover our debut collection of handcrafted essentials. Pieces defined by their silence, power, and absolute quality.",
  ctaText: "Discover More",
  ctaLink: "/shop",
  secondaryLinkText: "View Lookbook",
  secondaryLink: "/shop",
  backgroundImage: "/uploads/reham_hero.png"
};

const defaultPromo = {
  subtitle: "EXCLUSIVELY CRAFTED",
  title: "The Pure Silk",
  titleAccent: "Series",
  description: "Ethically sourced, sustainably made. Experience the softest touch of luxury in our limited edition summer series.",
  ctaText: "Explore Design",
  ctaLink: "/shop",
  backgroundImage: "/uploads/reham_promo.png"
};

const defaultNewsletter = {
  title: "Join the Inner Circle",
  description: "Unlock access to private collections, bespoke fitting events, and our editorial lookbooks.",
  ctaText: "Become a Member"
};

export default async function Home() {
  const serverContent = await getHomepageContent() as ({
    hero?: Partial<HomepageHero>;
    promo?: Partial<HomepagePromo>;
    newsletter?: Partial<HomepageNewsletter & { ctaText: string }>;
    collections?: { id: string; title: string; subtitle: string; image: string; link: string }[];
    bestSellers?: Product[];
    newArrivals?: Product[];
  } | null);

  const hero = { ...defaultHero, ...(serverContent?.hero || {}) };
  const collections = serverContent?.collections || [];
  const promo = { ...defaultPromo, ...(serverContent?.promo || {}) };
  const newsletter = { ...defaultNewsletter, ...(serverContent?.newsletter || {}) };
  const bestSellers = serverContent?.bestSellers || [];
  const newArrivals = serverContent?.newArrivals || [];

  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="relative min-h-[calc(100svh-4rem-4rem)] lg:min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {hero.backgroundImage && hero.backgroundImage.trim() ? (
            <Image
              src={hero.backgroundImage}
              alt={hero.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : null}
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>

        <AnimatedHero>
            <span className="text-white/70 text-sm font-medium tracking-[0.3em] uppercase mb-4 block">{hero.subtitle}</span>
            <h1 className="text-white text-6xl md:text-8xl lg:text-9xl font-serif italic mb-8 leading-tight">
              {hero.title} <br />
              <span className="not-italic font-sans font-light tracking-tighter">{hero.titleAccent}</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-light mb-12 tracking-wide max-w-2xl mx-auto leading-relaxed">
              {hero.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href={hero.ctaLink && hero.ctaLink.trim() ? hero.ctaLink : "/shop"}
                className="group relative inline-flex items-center justify-center px-10 py-4 overflow-hidden border border-white text-white font-medium tracking-widest uppercase transition-all duration-300 hover:text-black"
              >
                <span className="absolute inset-0 w-0 bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
                <span className="relative z-10 flex items-center gap-2">
                  {hero.ctaText} <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href={hero.secondaryLink && hero.secondaryLink.trim() ? hero.secondaryLink : "/shop"}
                className="text-white/70 hover:text-white text-sm font-medium tracking-widest uppercase transition-colors border-b border-white/20 hover:border-white pb-1"
              >
                {hero.secondaryLinkText}
              </Link>
            </div>
        </AnimatedHero>

        {/* Scroll Indicator - Hidden on mobile to prevent clutter with bottom nav */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-4">
          <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] [writing-mode:vertical-lr]">Scroll</span>
          <div className="w-px h-12 bg-linear-to-b from-white/60 to-transparent"></div>
        </div>
      </section>

      {/* Best Sellers */}
      <AnimatedSection className="flex flex-col justify-center bg-neutral-50 dark:bg-zinc-900/30 py-4 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="mb-4 md:mb-8">
            <div className="flex items-baseline justify-between gap-4 mb-4 md:mb-8">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif tracking-tight">Best Sellers</h2>
              <Link href="/shop" className="group flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase border-b border-transparent hover:border-black dark:hover:border-white transition-all pb-1 shrink-0">
                Shop All <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <ProductCarouselSection products={bestSellers} />
          </div>
        </div>
      </AnimatedSection>

      {/* Newest Arrivals */}
      <AnimatedSection className="flex flex-col justify-center bg-white dark:bg-black py-4 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="mb-4 md:mb-8">
            <div className="flex items-baseline justify-between gap-4 mb-4 md:mb-8">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif tracking-tight">Newest Arrivals</h2>
              <Link href="/shop" className="group flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase border-b border-transparent hover:border-black dark:hover:border-white transition-all pb-1 shrink-0">
                Shop All <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <ProductCarouselSection products={newArrivals} />
          </div>
        </div>
      </AnimatedSection>

      {/* Collections Showcase */}
      <AnimatedSection className="bg-brand-100 dark:bg-zinc-950 py-16 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-24">
            <div className="flex items-baseline justify-between gap-4 mb-4 md:mb-8">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif italic leading-tight">Collections</h2>
              <Link href="/collections" className="group flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase border-b-2 border-black dark:border-white pb-2 hover:opacity-50 transition-all">
                Explore All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm uppercase tracking-widest leading-loose max-w-sm">
              A vision of contemporary luxury. Each series reflects our commitment to form, function, and artistic expression.
            </p>
          </div>

          <div className="relative w-full">
            <DragScrollContainer className="flex gap-8 pb-6 md:pb-12 overflow-x-auto no-scrollbar">
              {collections.map((collection, index) => (
                <div
                  key={collection.id}
                  className="flex-none w-[85vw] md:w-[45vw] lg:w-[35vw] group relative overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl aspect-16/10"
                >
                  <Link href={collection.link} className="absolute inset-0 z-30">
                    <span className="sr-only">View {collection.title}</span>
                  </Link>
                  
                  {collection.image && collection.image.trim() ? (
                    <Image
                      src={collection.image}
                      alt={collection.title}
                      fill
                      sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 35vw"
                      draggable={false}
                      className="object-cover transition-transform duration-2000 ease-out group-hover:scale-105"
                      loading={index < 2 ? "eager" : "lazy"}
                    />
                  ) : null}
                  
                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 z-20 bg-linear-to-t from-black/60 via-black/20 to-transparent">
                    <div className="flex items-end justify-between transition-transform duration-700">
                      <div className="max-w-[80%]">
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/70 mb-2 block">{collection.subtitle}</span>
                        <h3 className="text-2xl md:text-3xl font-serif text-white">{collection.title}</h3>
                      </div>
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-8 left-8 mix-blend-difference z-20">
                    <span className="text-[9px] font-bold text-white uppercase tracking-[0.5em] opacity-40">Series. 0{index + 1}</span>
                  </div>
                </div>
              ))}
            </DragScrollContainer>
          </div>
        </div>
      </AnimatedSection>

      {/* Why Choose Us Section */}
      <AnimatedSection className="py-20 md:py-32 bg-white dark:bg-black overflow-hidden border-t border-neutral-100 dark:border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Why People Choose SHOPOHOLIC?
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              {
                icon: Truck,
                title: "Same day Delivery",
                description: "Fast and safe shipping all over Egypt"
              },
              {
                icon: Sparkles,
                title: "Authentic Design",
                description: "Discover the excellence of local craftsmanship and modern design."
              },
              {
                icon: PhoneCall,
                title: "Customer Care",
                description: "We're always here to help if you have any issues with your order"
              },
              {
                icon: ShieldCheck,
                title: "Secure Checkout",
                description: "Payments are made with advanced encryption standards."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-neutral-50 dark:bg-neutral-900/40 p-6 md:p-12 text-center flex flex-col items-center gap-4 md:gap-6 group hover:bg-white dark:hover:bg-zinc-800 transition-all duration-500 rounded-3xl border border-transparent hover:border-neutral-100 dark:hover:border-neutral-800 hover:shadow-2xl">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-0 md:mb-2 group-hover:rotate-12 transition-transform">
                  <feature.icon className="w-5 h-5 md:w-7 md:h-7 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm md:text-lg font-bold tracking-tight">{feature.title}</h3>
                <p className="hidden md:block text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed max-w-xs">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Social Proof Marquee */}
      <AnimatedSection className="py-10 md:py-20 border-y border-neutral-100 dark:border-neutral-900 bg-white dark:bg-black overflow-hidden relative">
        <div className="flex flex-col items-center mb-6 md:mb-12">
          <span className="text-[10px] font-bold tracking-[0.4em] text-neutral-400 uppercase">Globally Recognized By</span>
        </div>
        
        <div className="flex overflow-hidden group select-none">
          <div
            className="flex flex-none gap-20 items-center justify-around min-w-full pr-20 py-2 animate-marquee"
          >
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-20 items-center whitespace-nowrap">
                <span className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">VOGUE</span>
                <span className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">GQ</span>
                <span className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">BAZAAR</span>
                <span className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">ELLE</span>
                <span className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">VANITY FAIR</span>
                <span className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">HYPEBEAST</span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Promotional Banner */}
      <AnimatedSection className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {promo.backgroundImage && promo.backgroundImage.trim() ? (
            <Image
              src={promo.backgroundImage}
              alt={promo.title}
              fill
              sizes="100vw"
              className="object-cover"
              loading="lazy"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <span className="text-white/60 text-xs font-bold tracking-[0.5em] uppercase mb-6 block">{promo.subtitle}</span>
          <h2 className="text-white text-4xl sm:text-5xl md:text-7xl font-serif italic mb-8 leading-tight">
            {promo.title} <br />
            <span className="not-italic font-sans font-light tracking-tighter">{promo.titleAccent}</span>
          </h2>
          <p className="text-white/70 text-lg md:text-xl font-light mb-12 tracking-wide max-w-xl mx-auto leading-relaxed">
            {promo.description}
          </p>
          <Link
            href={promo.ctaLink && promo.ctaLink.trim() ? promo.ctaLink : "/shop"}
            className="inline-flex items-center justify-center px-10 py-4 text-[11px] font-bold tracking-[0.2em] text-black bg-white hover:bg-neutral-200 transition-all duration-300 uppercase shadow-2xl"
          >
            {promo.ctaText}
          </Link>
        </div>
      </AnimatedSection>

      {/* Newsletter CTA */}
      <NewsletterSection newsletter={newsletter as any} />

    </div>
  );
}
