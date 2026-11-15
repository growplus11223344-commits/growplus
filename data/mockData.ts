export interface Product {
  id: string;
  name: string;
  category: "Electronics" | "Fashion" | "Home & Living" | "Beauty" | "Accessories";
  price: number;
  originalPrice: number;
  discountPercentage: number;
  shoppingCreditsUsable: number;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: string;
  inStock: boolean;
}

export interface FaqItem {
  id: string;
  category: "General" | "Rewards" | "Referral" | "Shopping" | "Security";
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  avatar: string;
  quote: string;
  rating: number;
  creditsEarned: string;
  shoppingSavings: string;
  isIllustrativeDemo: boolean;
}

export interface StepItem {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  highlight: string;
}

export const PRODUCTS_DATA: Product[] = [
  {
    id: "p1",
    name: "Aura Pro Wireless ANC Headphones",
    category: "Electronics",
    price: 3499,
    originalPrice: 6999,
    discountPercentage: 50,
    shoppingCreditsUsable: 1200,
    rating: 4.9,
    reviewsCount: 384,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    badge: "Top Seller",
    inStock: true,
  },
  {
    id: "p2",
    name: "Chronos Ultra Smartwatch (OLED Titanium)",
    category: "Electronics",
    price: 2499,
    originalPrice: 4999,
    discountPercentage: 50,
    shoppingCreditsUsable: 900,
    rating: 4.8,
    reviewsCount: 512,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    badge: "Trending",
    inStock: true,
  },
  {
    id: "p3",
    name: "SoundPulse Neo True Wireless Earbuds",
    category: "Electronics",
    price: 1999,
    originalPrice: 3999,
    discountPercentage: 50,
    shoppingCreditsUsable: 750,
    rating: 4.7,
    reviewsCount: 298,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    badge: "Hot Deal",
    inStock: true,
  },
  {
    id: "p4",
    name: "Urban Stealth Minimalist Bomber Jacket",
    category: "Fashion",
    price: 2799,
    originalPrice: 4599,
    discountPercentage: 39,
    shoppingCreditsUsable: 800,
    rating: 4.8,
    reviewsCount: 164,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
    inStock: true,
  },
  {
    id: "p5",
    name: "Lumina Smart Ambient Desk Lamp",
    category: "Home & Living",
    price: 1849,
    originalPrice: 2999,
    discountPercentage: 38,
    shoppingCreditsUsable: 600,
    rating: 4.6,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
    inStock: true,
  },
  {
    id: "p6",
    name: "Botanic Glow Botanical Skin Repair Elixir",
    category: "Beauty",
    price: 1299,
    originalPrice: 2199,
    discountPercentage: 41,
    shoppingCreditsUsable: 450,
    rating: 4.9,
    reviewsCount: 210,
    badge: "Eco Choice",
    image: "https://images.unsplash.com/photo-1608248597359-007f300c3c54?w=600&auto=format&fit=crop&q=80",
    inStock: true,
  },
  {
    id: "p7",
    name: "CyberShield RFID Matte Carbon Cardholder",
    category: "Accessories",
    price: 899,
    originalPrice: 1499,
    discountPercentage: 40,
    shoppingCreditsUsable: 350,
    rating: 4.8,
    reviewsCount: 430,
    badge: "Essential",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80",
    inStock: true,
  },
  {
    id: "p8",
    name: "Vortex Magnetic Fast Wireless Charger",
    category: "Electronics",
    price: 1499,
    originalPrice: 2499,
    discountPercentage: 40,
    shoppingCreditsUsable: 500,
    rating: 4.7,
    reviewsCount: 195,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
    inStock: true,
  },
];

export const FAQS_DATA: FaqItem[] = [
  {
    id: "faq-1",
    category: "General",
    question: "What is GrowPlus?",
    answer: "GrowPlus is an integrated digital loyalty, referral, and e-commerce shopping ecosystem. It empowers verified members to explore digital rewards, earn community referral perks, and seamlessly redeem shopping credits for lifestyle, tech, and everyday products across our shopping platform."
  },
  {
    id: "faq-2",
    category: "General",
    question: "How does GrowPlus work?",
    answer: "GrowPlus connects loyalty rewards directly with e-commerce shopping. Members register on the platform, participate in platform engagement and referral activities, accumulate eligible shopping credits and member rewards, and redeem them at checkout on our curated e-commerce marketplace."
  },
  {
    id: "faq-3",
    category: "General",
    question: "How do I register an account?",
    answer: "Registration is quick and straightforward. Click 'Register' in the navigation bar, provide your full name, email, and mobile number, create a secure password, and optionally input a friend's referral code. Once registered, your personal dashboard is activated instantly."
  },
  {
    id: "faq-4",
    category: "Rewards",
    question: "What are GrowPlus Rewards and how are they calculated?",
    answer: "GrowPlus rewards are member loyalty points and shopping credits unlocked through active platform participation, promotional campaigns, and community milestone activities. While educational previews may illustrate up to a 10% monthly incentive model, note that all rewards are strictly loyalty and shopping benefits governed by platform terms and regulatory guidelines—never guaranteed financial securities."
  },
  {
    id: "faq-5",
    category: "Referral",
    question: "How does the GrowPlus referral system work?",
    answer: "Every member receives a unique referral link and invitation code. When you invite friends who register and engage with GrowPlus, both you and your friend unlock tiered community rewards and bonus shopping credits credited straight to your digital rewards wallet."
  },
  {
    id: "faq-6",
    category: "Shopping",
    question: "What are Shopping Credits and how do I use them?",
    answer: "Shopping Credits are digital balance units earned within GrowPlus. Inside the GrowPlus Rewards App shopping gateway, you can apply eligible shopping credits to reduce the payable cash amount on featured products—sometimes up to 50% or more depending on current brand promotions."
  },
  {
    id: "faq-7",
    category: "Shopping",
    question: "How can I shop on GrowPlus?",
    answer: "Browse our curated collection of verified electronics, fashion, home essentials, and lifestyle accessories directly from the shopping gateway inside the GrowPlus Rewards App. Select your items, choose your delivery address, apply your available shopping credits at checkout, and complete the remaining balance using standard secure payment options."
  },
  {
    id: "faq-8",
    category: "General",
    question: "Is the GrowPlus Rewards mobile application currently available?",
    answer: "The GrowPlus Rewards App is currently in active final beta development. It is scheduled for official launch on Google Play Store (Android) and Apple App Store (iOS). You can join our VIP Early Access waitlist right now to receive immediate launch alerts and early adopter perks."
  },
  {
    id: "faq-9",
    category: "Security",
    question: "How do I contact customer support?",
    answer: "Our dedicated support team is available via our Contact page, live chat within the mobile app previews, or directly via email at support@growplus.eco. Standard response times are within 1 to 2 business hours."
  },
  {
    id: "faq-10",
    category: "Security",
    question: "Is my personal data and account information secure?",
    answer: "GrowPlus employs enterprise-grade AES-256 encryption, strict OAuth 2.0 access tokens, multi-factor authentication protocols, and rigorous compliance checks to ensure all member personal information remains fully protected at all times."
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "t1",
    name: "Arjun Verma",
    role: "Digital Marketer & Early Adopter",
    city: "Bengaluru",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    quote: "GrowPlus completely transformed how I view shopping discounts. The connection between referral perks and instant store credit allowed me to purchase premium noise-canceling headphones with incredible savings.",
    rating: 5,
    creditsEarned: "₹8,450",
    shoppingSavings: "42%",
    isIllustrativeDemo: true
  },
  {
    id: "t2",
    name: "Pooja Sharma",
    role: "E-commerce Enthusiast",
    city: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    quote: "The interface is sleek, dark, and futuristic—exactly what modern fintech platforms should feel like. The GrowPlus Rewards App makes tracking balances and daily bonuses so seamless.",
    rating: 5,
    creditsEarned: "₹12,200",
    shoppingSavings: "50%",
    isIllustrativeDemo: true
  },
  {
    id: "t3",
    name: "Rohan Kulkarni",
    role: "Tech Consultant",
    city: "Pune",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    quote: "Inviting friends was effortless with the unique referral codes. We both unlocked welcome credits right away. The transparency around reward calculation is refreshing.",
    rating: 5,
    creditsEarned: "₹15,800",
    shoppingSavings: "48%",
    isIllustrativeDemo: true
  }
];

export const HOW_IT_WORKS_STEPS: StepItem[] = [
  {
    number: "01",
    title: "Create Your Account",
    subtitle: "Instant Digital Onboarding",
    description: "Sign up in less than 60 seconds with your mobile number and basic profile. Unlock your personal GrowPlus digital identifier and welcome rewards wallet.",
    iconName: "UserPlus",
    highlight: "Free & Instant Setup"
  },
  {
    number: "02",
    title: "Explore the Platform",
    subtitle: "Engage with the Ecosystem",
    description: "Browse daily ecosystem activities, activate merchant partner offers, and link your referral network to maximize community engagement.",
    iconName: "Compass",
    highlight: "Interactive Dashboard"
  },
  {
    number: "03",
    title: "Discover Eligible Rewards",
    subtitle: "Loyalty Perks & Monthly Credits",
    description: "Track your accumulated rewards, milestone bonuses, and monthly engagement incentives updated continuously in your secure wallet overview.",
    iconName: "Gift",
    highlight: "Transparent Accrual"
  },
  {
    number: "04",
    title: "Shop with Eligible Credits",
    subtitle: "Seamless Cart Redemption",
    description: "Transfer or redeem your accumulated shopping credits directly at checkout across thousands of curated electronics, lifestyle, and fashion goods.",
    iconName: "ShoppingBag",
    highlight: "Real Value Redemption"
  }
];

export const ECOSYSTEM_METRICS = {
  activeMembers: "1,25,890+",
  activeMembersGrowth: "+12.4% MoM",
  shoppingCreditsCirculated: "₹5,84,20,000+",
  rewardsDistributed: "₹58,42,000+",
  merchantPartners: "350+ Brands",
  customerSatisfaction: "99.4%"
};
