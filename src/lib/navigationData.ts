export interface NavLink {
    label: string;
    href: string;
}

export interface NavCategoryGroup {
    title: string;
    links: NavLink[];
}

export interface NavCategory {
    id: string;
    label: string;
    href: string;
    groups?: NavCategoryGroup[];
    editorial?: {
        title: string;
        subtitle: string;
        imageSrc: string;
        href: string;
    };
}

export const navigationData: NavCategory[] = [
    {
        id: "women",
        label: "WOMEN",
        href: "/shop?category=women",
        groups: [
            {
                title: "Clothing",
                links: [
                    { label: "T-Shirts", href: "/shop?category=women&type=t-shirts" },
                    { label: "Shirts & Blouses", href: "/shop?category=women&type=shirts" },
                    { label: "Sweaters", href: "/shop?category=women&type=sweaters" },
                    { label: "Jackets & Coats", href: "/shop?category=women&type=jackets" },
                    { label: "Pants", href: "/shop?category=women&type=pants" },
                    { label: "Jeans", href: "/shop?category=women&type=jeans" },
                    { label: "Skirts", href: "/shop?category=women&type=skirts" },
                    { label: "Shorts", href: "/shop?category=women&type=shorts" },
                ],
            },
            {
                title: "Footwear",
                links: [
                    { label: "Sneakers", href: "/shop?category=women&type=sneakers" },
                    { label: "Boots", href: "/shop?category=women&type=boots" },
                    { label: "Loafers", href: "/shop?category=women&type=loafers" },
                    { label: "Heels", href: "/shop?category=women&type=heels" },
                ],
            },
            {
                title: "Featured",
                links: [
                    { label: "New Arrivals", href: "/shop?category=women&sort=newest" },
                    { label: "Best Sellers", href: "/shop?category=women&sort=popularity" },
                    { label: "The Summer Edit", href: "/shop?category=women&collection=summer" },
                ],
            },
        ],
        editorial: {
            title: "Summer Collection 2026",
            subtitle: "Discover the new season essentials.",
            imageSrc: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
            href: "/shop?category=women&collection=summer",
        },
    },
    {
        id: "men",
        label: "MEN",
        href: "/shop?category=men",
        groups: [
            {
                title: "Clothing",
                links: [
                    { label: "T-Shirts", href: "/shop?category=men&type=t-shirts" },
                    { label: "Shirts", href: "/shop?category=men&type=shirts" },
                    { label: "Sweaters", href: "/shop?category=men&type=sweaters" },
                    { label: "Jackets & Coats", href: "/shop?category=men&type=jackets" },
                    { label: "Pants", href: "/shop?category=men&type=pants" },
                    { label: "Jeans", href: "/shop?category=men&type=jeans" },
                    { label: "Shorts", href: "/shop?category=men&type=shorts" },
                ],
            },
            {
                title: "Footwear",
                links: [
                    { label: "Sneakers", href: "/shop?category=men&type=sneakers" },
                    { label: "Boots", href: "/shop?category=men&type=boots" },
                    { label: "Loafers", href: "/shop?category=men&type=loafers" },
                ],
            },
            {
                title: "Featured",
                links: [
                    { label: "New Arrivals", href: "/shop?category=men&sort=newest" },
                    { label: "Best Sellers", href: "/shop?category=men&sort=popularity" },
                    { label: "The Summer Edit", href: "/shop?category=men&collection=summer" },
                ],
            },
        ],
        editorial: {
            title: "The Weekend Wardrobe",
            subtitle: "Relaxed fits for off-duty days.",
            imageSrc: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?q=80&w=800&auto=format&fit=crop",
            href: "/shop?category=men&collection=weekend",
        },
    },
    {
        id: "accessories",
        label: "ACCESSORIES",
        href: "/shop?category=accessories",
        groups: [
            {
                title: "All Accessories",
                links: [
                    { label: "Bags & Wallets", href: "/shop?category=accessories&type=bags" },
                    { label: "Belts", href: "/shop?category=accessories&type=belts" },
                    { label: "Hats & Caps", href: "/shop?category=accessories&type=hats" },
                    { label: "Jewelry", href: "/shop?category=accessories&type=jewelry" },
                    { label: "Sunglasses", href: "/shop?category=accessories&type=sunglasses" },
                    { label: "Scarves", href: "/shop?category=accessories&type=scarves" },
                ],
            },
        ],
        editorial: {
            title: "Minimalist Essentials",
            subtitle: "Elevate your look with our new leather goods.",
            imageSrc: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop",
            href: "/shop?category=accessories&collection=leather",
        },
    },
    {
        id: "children",
        label: "CHILDREN",
        href: "/shop?category=children",
        groups: [
            {
                title: "Boys",
                links: [
                    { label: "Tops", href: "/shop?category=children&gender=boys&type=tops" },
                    { label: "Bottoms", href: "/shop?category=children&gender=boys&type=bottoms" },
                    { label: "Outerwear", href: "/shop?category=children&gender=boys&type=outerwear" },
                ],
            },
            {
                title: "Girls",
                links: [
                    { label: "Tops", href: "/shop?category=children&gender=girls&type=tops" },
                    { label: "Dresses & Skirts", href: "/shop?category=children&gender=girls&type=dresses" },
                    { label: "Outerwear", href: "/shop?category=children&gender=girls&type=outerwear" },
                ],
            },
            {
                title: "Baby",
                links: [
                    { label: "Bodysuits", href: "/shop?category=children&age=baby&type=bodysuits" },
                    { label: "Sets", href: "/shop?category=children&age=baby&type=sets" },
                ],
            },
        ],
    },
];
