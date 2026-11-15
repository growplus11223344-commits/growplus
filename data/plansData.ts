export interface InvestmentPlan {
  id: number;
  planCode: "BASIC" | "VIP" | "DAILY" | "SUPER";
  name: string;
  tagline: string;
  description: string;
  minAmount: number;
  maxAmount?: number;
  durationDays: number;
  monthlyReturnRate: number; // in percentage
  dailyBonus: number; // in Rupees
  dailyBonusWithdrawThreshold: number; // in Rupees
  minWithdrawal: number; // in Rupees
  badge: string;
  featured: boolean;
  colorTheme: string;
  summary: string;
  perks: string[];
  terms: string[];
}

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 1,
    planCode: "BASIC",
    name: "Basic Plan",
    tagline: "Allocation ₹1,000 - ₹20,000",
    description: "Monthly 10% Return",
    minAmount: 1000,
    maxAmount: 20000,
    durationDays: 365,
    monthlyReturnRate: 10,
    dailyBonus: 0,
    dailyBonusWithdrawThreshold: 0,
    minWithdrawal: 500,
    badge: "Starter Tier",
    featured: false,
    colorTheme: "blue",
    summary: "A 365-day capital growth plan yielding 10% net monthly return, withdrawable at ₹500+.",
    perks: [
      "Accessible entry from ₹1,000 to ₹20,000",
      "10% Monthly Simple Return",
      "Minimum Withdrawal: ₹500 (Earnings Only)",
      "Principal Locked for 365 Days",
      "Automated Monthly Payouts",
    ],
    terms: [
      "Minimum Investment: ₹1,000",
      "Maximum Investment: ₹20,000",
      "10% Monthly Return",
      "Minimum Withdrawal: ₹500 (Earnings Only)",
      "Principal Locked for 365 Days",
    ],
  },
  {
    id: 2,
    planCode: "VIP",
    name: "VIP Member Plan",
    tagline: "Allocation ₹20,000 - ₹1,00,000",
    description: "Monthly 12% Return",
    minAmount: 20000,
    maxAmount: 100000,
    durationDays: 365,
    monthlyReturnRate: 12,
    dailyBonus: 0,
    dailyBonusWithdrawThreshold: 0,
    minWithdrawal: 500,
    badge: "VIP Tier",
    featured: false,
    colorTheme: "purple",
    summary: "Premium growth tier for capital allocations up to ₹1,00,000 with monthly return of 12%.",
    perks: [
      "Allocation ₹20,000 - ₹1,00,000",
      "Monthly Return: 12% Guaranteed Accrual",
      "Minimum Withdrawal: ₹500 (Earnings Only)",
      "Principal Locked for 365 Days",
      "Priority Concierge Support",
    ],
    terms: [
      "Maximum Investment: ₹1,00,000",
      "Monthly Return: 12%",
      "Minimum Withdrawal: ₹500 (Earnings Only)",
      "Principal Locked for 365 Days",
    ],
  },
  {
    id: 3,
    planCode: "DAILY",
    name: "Daily Earning Plan",
    tagline: "₹99 Daily Bonus + 18% Monthly Return",
    description: "18% Monthly + ₹99 Daily Bonus",
    minAmount: 5000,
    maxAmount: 150000,
    durationDays: 365,
    monthlyReturnRate: 18,
    dailyBonus: 99,
    dailyBonusWithdrawThreshold: 1000,
    minWithdrawal: 500,
    badge: "₹99/Day Bonus Tier",
    featured: true,
    colorTheme: "indigo",
    summary: "An 18% monthly yield tier with an extra ₹99 daily bonus added to your dashboard every midnight.",
    perks: [
      "Allocation ₹5,000 - ₹1,50,000",
      "18% Monthly Return",
      "₹99 Daily Bonus Accrued Every Midnight",
      "Daily Bonus Withdrawable after ₹1,000",
      "Principal Locked for 365 Days",
      "High-Yield Compounding Opportunity",
    ],
    terms: [
      "Investment ₹5,000 - ₹1,50,000",
      "18% Monthly Return",
      "₹99 Daily Bonus Credited Midnight",
      "Daily Bonus Withdraw after ₹1,000",
      "Principal Locked for 365 Days",
    ],
  },
  {
    id: 4,
    planCode: "SUPER",
    name: "Daily Earning Super",
    tagline: "₹300 Daily Bonus + 20% Monthly Return",
    description: "20% Monthly + ₹300 Daily Bonus",
    minAmount: 10000,
    durationDays: 365,
    monthlyReturnRate: 20,
    dailyBonus: 300,
    dailyBonusWithdrawThreshold: 3000,
    minWithdrawal: 500,
    badge: "₹300/Day Super Tier",
    featured: true,
    colorTheme: "emerald",
    summary: "The ultimate growth tier with 20% monthly yield and an extra ₹300 daily bonus added every midnight.",
    perks: [
      "Minimum Investment: ₹10,000 (No Upper Limit)",
      "20% Monthly Return",
      "₹300 Daily Bonus Accrued Every Midnight",
      "Daily Bonus Withdrawable after ₹3,000",
      "Principal Locked for 365 Days",
      "VIP Fast-Track Withdrawals",
    ],
    terms: [
      "Minimum Investment: ₹10,000",
      "No Maximum Limit",
      "20% Monthly Return",
      "₹300 Daily Bonus Credited Midnight",
      "Daily Bonus Withdraw after ₹3,000",
      "Principal Locked for 365 Days",
    ],
  },
];
