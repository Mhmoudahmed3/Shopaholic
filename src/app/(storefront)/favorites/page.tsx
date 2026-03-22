import FavoritesPageClient from "./FavoritesPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Favorites | SHOPAHOLIC",
    description: "Manage your favorite luxury items and curated collection.",
};

export default function FavoritesPage() {
    return <FavoritesPageClient />;
}
