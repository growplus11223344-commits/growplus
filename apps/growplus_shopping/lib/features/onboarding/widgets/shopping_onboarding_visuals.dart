import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

/// Screen 1 Visual: Beautiful shopping bags, product collections & ecommerce illustration
class ShoppingVisual1 extends StatelessWidget {
  const ShoppingVisual1({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 220,
      child: Center(
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: SizedBox(
            width: 320,
            height: 220,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Glowing Background Aura
                Container(
                  width: 200,
                  height: 200,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        AppColors.primaryLight.withOpacity(0.8),
                        AppColors.primaryLight.withOpacity(0.0),
                      ],
                    ),
                  ),
                ),

                // Center Primary Brand Showcase Card
                Container(
                  width: 190,
                  padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.border, width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primaryDark.withOpacity(0.08),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppColors.primary, AppColors.primaryDark],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.35),
                              blurRadius: 12,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.shopping_bag_rounded,
                          size: 34,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'GROWPLUS',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                          color: AppColors.navy,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Text(
                          '★ Premium Shopping',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryDark,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Floating Left Offer Badge
                Positioned(
                  left: 12,
                  top: 20,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.local_offer_rounded, size: 14, color: AppColors.primary),
                        SizedBox(width: 4),
                        Text(
                          'Top Brands',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.navy),
                        ),
                      ],
                    ),
                  ),
                ),

                // Floating Right Badge
                Positioned(
                  right: 12,
                  bottom: 20,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.navy,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.navy.withOpacity(0.2),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.auto_awesome, size: 12, color: AppColors.gold),
                        SizedBox(width: 4),
                        Text(
                          'Exclusive Deals',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Screen 2 Visual: Product cards, fashion, electronics and shopping categories
class ShoppingVisual2 extends StatelessWidget {
  const ShoppingVisual2({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 220,
      child: Center(
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: SizedBox(
            width: 320,
            height: 220,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Top Search Pill
                Positioned(
                  top: 8,
                  child: Container(
                    width: 240,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.search_rounded, size: 14, color: AppColors.textSecondary),
                        SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Explore 10,000+ items...',
                            style: TextStyle(fontSize: 10, color: AppColors.textSecondary),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Product Card Left (Fashion)
                Positioned(
                  left: 20,
                  top: 48,
                  child: Container(
                    width: 130,
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppColors.border),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 14,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          height: 52,
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Center(
                            child: Icon(Icons.checkroom_rounded, size: 28, color: AppColors.primaryDark),
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text('Fashion Edit', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.navy)),
                        const SizedBox(height: 2),
                        const Wrap(
                          spacing: 4,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Text('₹1,499', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.primary)),
                            Text('₹2,499', style: TextStyle(fontSize: 9, decoration: TextDecoration.lineThrough, color: AppColors.textMuted)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                // Product Card Right (Electronics)
                Positioned(
                  right: 20,
                  top: 48,
                  child: Container(
                    width: 130,
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppColors.border),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 14,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          height: 52,
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Center(
                            child: Icon(Icons.headphones_rounded, size: 28, color: Color(0xFF3B82F6)),
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text('Electronics', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.navy)),
                        const SizedBox(height: 2),
                        const Wrap(
                          spacing: 4,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Text('₹2,999', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.primary)),
                            Text('₹4,999', style: TextStyle(fontSize: 9, decoration: TextDecoration.lineThrough, color: AppColors.textMuted)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                // Bottom Category Chips
                Positioned(
                  bottom: 6,
                  child: Wrap(
                    spacing: 6,
                    children: [
                      _buildChip('⚡ Tech', const Color(0xFF3B82F6)),
                      _buildChip('👟 Fashion', AppColors.primary),
                      _buildChip('✨ Beauty', Colors.pink),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color),
      ),
    );
  }
}

/// Screen 3 Visual: Shopping cart, digital wallet credits & secure checkout illustration
class ShoppingVisual3 extends StatelessWidget {
  const ShoppingVisual3({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 220,
      child: Center(
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: SizedBox(
            width: 320,
            height: 220,
            child: Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  width: 275,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppColors.border),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.08),
                        blurRadius: 18,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Flexible(
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.shopping_cart_checkout_rounded, size: 18, color: AppColors.primary),
                                SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    'Cart Total',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.navy),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(width: 8),
                          Text('₹3,200', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                        ],
                      ),
                      const SizedBox(height: 8),

                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.account_balance_wallet_rounded, size: 16, color: AppColors.primaryDark),
                            SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Wallet Credits',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                              ),
                            ),
                            Text(
                              '-₹500',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.primaryDark),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Divider(height: 1),
                      const SizedBox(height: 8),

                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              'Net Payable',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppColors.navy),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            '₹2,700',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.primary),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                Positioned(
                  bottom: 4,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.navy,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.navy.withOpacity(0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified_user_rounded, size: 12, color: AppColors.primary),
                        SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            '100% Secure Checkout & Razorpay',
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Screen 4 Visual: Celebration / Member perks visual
class ShoppingVisual4 extends StatelessWidget {
  const ShoppingVisual4({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 220,
      child: Center(
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: Container(
            width: 280,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppColors.border),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.08),
                  blurRadius: 18,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.primary, AppColors.primaryDark],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.card_giftcard_rounded,
                    size: 26,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Member Privileges',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.navy),
                ),
                const SizedBox(height: 10),
                _buildBenefitRow(Icons.check_circle_rounded, 'Apply reward credits at checkout'),
                const SizedBox(height: 6),
                _buildBenefitRow(Icons.local_shipping_rounded, 'Real-time order tracking'),
                const SizedBox(height: 6),
                _buildBenefitRow(Icons.lock_rounded, 'Seamless SSO with Rewards app'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBenefitRow(IconData icon, String label) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppColors.primary),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
