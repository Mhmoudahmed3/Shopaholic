import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getHomepageContent } from '@/app/admin/actions';
import { Product } from '@/lib/types';

interface HeroSection {
  subtitle: string;
  title: string;
  titleAccent: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryLinkText: string;
  secondaryLink: string;
  backgroundImage: string;
}

interface Collection {
  id: string;
  title: string;
  subtitle: string;
  link: string;
  image: string;
}

interface PromoSection {
  subtitle: string;
  title: string;
  titleAccent: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
}

interface NewsletterSection {
  title: string;
  description: string;
  ctaText: string;
}

interface HomeContent {
  hero: HeroSection;
  collections: Collection[];
  promo: PromoSection;
  newsletter: NewsletterSection;
  bestSellers: Product[];
}

interface HomeStore {
  content: HomeContent;
  isEditing: boolean;
  editingSection: string | null;
  setContent: (content: Partial<HomeContent>) => void;
  setHero: (hero: Partial<HeroSection>) => void;
  setCollection: (id: string, collection: Partial<Collection>) => void;
  setPromo: (promo: Partial<PromoSection>) => void;
  setNewsletter: (newsletter: Partial<NewsletterSection>) => void;
  setIsEditing: (isEditing: boolean) => void;
  setEditingSection: (section: string | null) => void;
  fetchContent: () => Promise<void>;
}

const defaultContent: HomeContent = {
  hero: {
    subtitle: "",
    title: "",
    titleAccent: "",
    description: "",
    ctaText: "",
    ctaLink: "/shop",
    secondaryLinkText: "",
    secondaryLink: "/shop",
    backgroundImage: ""
  },
  collections: [],
  promo: {
    subtitle: "",
    title: "",
    titleAccent: "",
    description: "",
    ctaText: "",
    ctaLink: "/shop",
    backgroundImage: ""
  },
  newsletter: {
    title: "",
    description: "",
    ctaText: ""
  },
  bestSellers: []
};

export const useHomeStore = create<HomeStore>()(
  persist(
    (set) => ({
      content: defaultContent,
      isEditing: false,
      editingSection: null,
      
      setContent: (newContent) => set((state) => ({
        content: { ...state.content, ...newContent }
      })),
      
      setHero: (hero) => set((state) => ({
        content: { ...state.content, hero: { ...state.content.hero, ...hero } }
      })),
      
      setCollection: (id, collection) => set((state) => ({
        content: {
          ...state.content,
          collections: state.content.collections.map(c => 
            c.id === id ? { ...c, ...collection } : c
          )
        }
      })),
      
      setPromo: (promo) => set((state) => ({
        content: { ...state.content, promo: { ...state.content.promo, ...promo } }
      })),
      
      setNewsletter: (newsletter) => set((state) => ({
        content: { ...state.content, newsletter: { ...state.content.newsletter, ...newsletter } }
      })),
      
      setIsEditing: (isEditing) => set({ isEditing }),
      setEditingSection: (editingSection) => set({ editingSection }),
      fetchContent: async () => {
        const serverContent = await getHomepageContent();
        if (serverContent) {
          set((state) => ({
            content: { ...state.content, ...serverContent }
          }));
        }
      }
    }),
    {
      name: 'home-content-storage'
    }
  )
);
