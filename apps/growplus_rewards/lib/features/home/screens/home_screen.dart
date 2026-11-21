import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/handoff_service.dart';
import '../../notifications/screens/notifications_screen.dart';
import '../../wallet/screens/wallet_screen.dart';
import '../../wallet/screens/add_credits_screen.dart';
import '../../referrals/screens/referrals_screen.dart';
import '../../profile/screens/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  bool _loading = true;
  String? _errorMessage;

  Map<String, dynamic>? _profile;
  Map<String, dynamic>? _wallet;
  Map<String, dynamic>? _referralCode;
  List<dynamic> _recentTransactions = [];
  int _unreadNotifications = 0;

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.96, end: 1.06).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _loadDashboardData();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _loadDashboardData() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final profile = await ApiService.getMe();
      final wallet = await ApiService.getWallet();
      final refCode = await ApiService.getReferralCode();
      final txs = await ApiService.getWalletTransactions(page: 1);

      int unread = 0;
      try {
        final notifications = await ApiService.getNotifications();
        unread = notifications.where((n) => n['is_read'] != true).length;
      } catch (_) {}

      if (mounted) {
        setState(() {
          _profile = profile;
          _wallet = wallet;
          _referralCode = refCode;
          _recentTransactions = txs.take(5).toList();
          _unreadNotifications = unread;
        });
      }
    } catch (e) {
      debugPrint('Error loading dashboard: $e');
      if (mounted) {
        setState(() => _errorMessage = e.toString().replaceFirst('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _getFirstName() {
    final rawName = _profile?['full_name']?.toString().trim();
    if (rawName != null && rawName.isNotEmpty) {
      final first = rawName.split(RegExp(r'\s+')).first;
      if (first.toLowerCase() != 'complete' && first.isNotEmpty) {
        return first;
      }
    }
    final email = _profile?['email']?.toString();
    if (email != null && email.contains('@')) {
      final handle = email.split('@').first;
      return handle.substring(0, 1).toUpperCase() + handle.substring(1);
    }
    return 'Member';
  }

  String _getUserInitials() {
    final rawName = _profile?['full_name']?.toString().trim();
    if (rawName != null && rawName.isNotEmpty) {
      final parts = rawName.split(RegExp(r'\s+'));
      if (parts.length > 1) {
        return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
      }
      return parts[0].substring(0, math.min(2, parts[0].length)).toUpperCase();
    }
    return 'GP';
  }

  Future<void> _launchShoppingApp() async {
    await HandoffService.openShoppingApp(context);
  }

  void _copyReferralCode() {
    final code = _referralCode?['code'] ?? '';
    if (code.isNotEmpty) {
      Clipboard.setData(ClipboardData(text: code));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Referral code copied to clipboard!'),
          backgroundColor: AppColors.purpleAccent,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  void _shareReferral() {
    final code = _referralCode?['code'] ?? '';
    final name = _getFirstName();
    Share.share(
      'Join GrowPlus with my referral code $code and earn promotional shopping credits on eligible purchases!\nDownload GrowPlus Rewards: https://growplus.internal/app',
      subject: '$name invited you to GrowPlus Rewards',
    );
  }

  void _showDepositNoticeModal() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.purpleSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.purpleBorder),
        ),
        title: const Row(
          children: [
            Icon(Icons.info_outline_rounded, color: AppColors.purpleAccent, size: 24),
            SizedBox(width: 10),
            Text('Deposit Notice', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        content: const Text(
          'GrowPlus promotional shopping credits are retail discount incentives awarded exclusively upon verified eligible partner purchases and approved referrals.\n\n'
          'Under consumer financial regulations, direct cash deposits and guaranteed deposit yields are strictly prohibited on GrowPlus.',
          style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 13.5, height: 1.45),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.purpleAccent,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Understood'),
          ),
        ],
      ),
    );
  }

  void _openAddCreditsPage() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => AddCreditsScreen(
          onCreditsAdded: () {
            _loadDashboardData();
          },
        ),
      ),
    ).then((_) {
      _loadDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    // 5-Item screen routing:
    // 0: Home Dashboard
    // 1: Wallet
    // 2: Add Credits Full Page
    // 3: Referrals
    // 4: Profile
    final screens = [
      _buildHomeDashboard(),
      const WalletScreen(),
      AddCreditsScreen(
        onCreditsAdded: () {
          _loadDashboardData();
        },
      ),
      const ReferralsScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: AppColors.purpleBg,
      body: screens[_currentIndex],
      bottomNavigationBar: _buildFiveItemBottomNav(),
    );
  }

  Widget _buildFiveItemBottomNav() {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF170A37),
        border: Border(top: BorderSide(color: Color(0xFF2E1452), width: 1.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black45,
            blurRadius: 16,
            offset: Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          height: 70,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              // 1. Home
              _buildNavItem(
                index: 0,
                icon: Icons.home_rounded,
                label: 'Home',
              ),

              // 2. Portfolio
              _buildNavItem(
                index: 1,
                icon: Icons.account_balance_wallet_rounded,
                label: 'Portfolio',
              ),

              // 3. Central Glowing ₹ Button
              Semantics(
                label: 'Add Money',
                button: true,
                child: GestureDetector(
                  onTap: _openAddCreditsPage,
                  child: AnimatedBuilder(
                    animation: _pulseAnimation,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _pulseAnimation.value,
                        child: Container(
                          width: 54,
                          height: 54,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const SweepGradient(
                              colors: [
                                Color(0xFFFF007A),
                                Color(0xFF7928CA),
                                Color(0xFF0070F3),
                                Color(0xFF00DFD8),
                                Color(0xFFFF007A),
                              ],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFA66CFF).withOpacity(0.5),
                                blurRadius: 14,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(3.0),
                            child: Container(
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: [Color(0xFF3B136F), Color(0xFF1A0A33)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                              ),
                              child: const Center(
                                child: Text(
                                  '₹',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),

              // 4. Referrals
              _buildNavItem(
                index: 3,
                icon: Icons.card_giftcard_rounded,
                label: 'Referrals',
              ),

              // 5. Profile
              _buildNavItem(
                index: 4,
                icon: Icons.person_rounded,
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required String label,
  }) {
    final isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 22,
              color: isSelected ? AppColors.purpleAccent : AppColors.textPurpleSecondary,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? AppColors.purpleAccent : AppColors.textPurpleSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHomeDashboard() {
    if (_loading && _wallet == null) {
      return const Center(child: CircularProgressIndicator(color: AppColors.purpleAccent));
    }

    final firstName = _getFirstName();
    final initials = _getUserInitials();
    final balanceVal = double.tryParse(_wallet?['balance']?.toString() ?? '0') ?? 0.0;
    final pendingVal = double.tryParse(_wallet?['pending_balance']?.toString() ?? '0') ?? 0.0;
    final lifetimeVal = double.tryParse(_wallet?['lifetime_earned']?.toString() ?? '0') ?? 0.0;
    final code = _referralCode?['code'] ?? '--------';
    final totalInvited = _referralCode?['total_referrals'] ?? 0;
    final eligibleRefs = _referralCode?['successful_referrals'] ?? 0;
    final avatarSignedUrl = _profile?['avatar_signed_url'] as String?;

    return RefreshIndicator(
      onRefresh: _loadDashboardData,
      color: AppColors.purpleAccent,
      backgroundColor: AppColors.purpleSurface,
      child: CustomScrollView(
        slivers: [
          // Dynamic Welcome Header
          SliverAppBar(
            backgroundColor: AppColors.purpleBg,
            elevation: 0,
            floating: true,
            pinned: false,
            automaticallyImplyLeading: false,
            title: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Hello, $firstName 👋',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textWhite,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'GrowPlus Rewards Portal',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.textPurpleSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            actions: [
              // 1. Notification Bell
              Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.notifications_none_rounded, color: AppColors.textWhite, size: 24),
                    tooltip: 'Notifications',
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                      ).then((_) => _loadDashboardData());
                    },
                  ),
                  if (_unreadNotifications > 0)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Color(0xFFEF4444),
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                        child: Text(
                          '$_unreadNotifications',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                ],
              ),

              // 2. Gift / Referral Icon
              IconButton(
                icon: const Icon(Icons.card_giftcard_rounded, color: AppColors.purpleAccent, size: 22),
                tooltip: 'Referrals',
                onPressed: () => setState(() => _currentIndex = 3),
              ),

              // 3. Circular Profile Avatar with Initials
              Padding(
                padding: const EdgeInsets.only(right: 16, left: 4),
                child: GestureDetector(
                  onTap: () => setState(() => _currentIndex = 4),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [Color(0xFF8B5CF6), Color(0xFF4C1D95)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      border: Border.all(color: AppColors.purpleAccent, width: 1.5),
                    ),
                    child: ClipOval(
                      child: (avatarSignedUrl != null && avatarSignedUrl.isNotEmpty)
                          ? Image.network(
                              avatarSignedUrl,
                              width: 36,
                              height: 36,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Center(
                                child: Text(
                                  initials,
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                              ),
                            )
                          : Center(
                              child: Text(
                                initials,
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ),
                    ),
                  ),
                ),
              ),
            ],
          ),

          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.red.shade900.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.red.shade400),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: Colors.white, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(_errorMessage!, style: const TextStyle(color: Colors.white, fontSize: 12)),
                        ),
                      ],
                    ),
                  ),
                ],

                // 4. PREMIUM PURPLE WALLET CARD
                Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF30105F), Color(0xFF170A37)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF3D1B75), width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF7C3AED).withOpacity(0.18),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(22),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'YOUR SHOPPING WALLET',
                            style: TextStyle(
                              color: Color(0xFFC5B5DF),
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.3,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withOpacity(0.18),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.verified_rounded, color: Color(0xFF34D399), size: 12),
                                SizedBox(width: 4),
                                Text(
                                  'Ledger Verified',
                                  style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          const Text(
                            '₹',
                            style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            NumberFormat('#,##0.00').format(balanceVal),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 36,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Divider(color: Color(0xFF3D1B75)),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Pending Credits', style: TextStyle(color: Color(0xFFBDB0D8), fontSize: 11)),
                              const SizedBox(height: 3),
                              Text(
                                '₹${NumberFormat('#,##0.00').format(pendingVal)}',
                                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              const Text('Lifetime Earned', style: TextStyle(color: Color(0xFFBDB0D8), fontSize: 11)),
                              const SizedBox(height: 3),
                              Text(
                                '₹${NumberFormat('#,##0.00').format(lifetimeVal)}',
                                style: const TextStyle(color: AppColors.purpleAccent, fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 22),

                // 5. FOUR QUICK ACTION BOXES (2 x 2 GRID)
                Row(
                  children: [
                    // Box 1: Wallet
                    Expanded(
                      child: _buildQuickActionBox(
                        title: 'Wallet',
                        subtitle: 'Balances & Tiers',
                        icon: Icons.account_balance_wallet_rounded,
                        onTap: () => setState(() => _currentIndex = 1),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Box 2: History
                    Expanded(
                      child: _buildQuickActionBox(
                        title: 'History',
                        subtitle: 'Transactions',
                        icon: Icons.history_rounded,
                        onTap: () => setState(() => _currentIndex = 1),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    // Box 3: Referral
                    Expanded(
                      child: _buildQuickActionBox(
                        title: 'Referral',
                        subtitle: 'Invite & Earn',
                        icon: Icons.card_giftcard_rounded,
                        onTap: () => setState(() => _currentIndex = 3),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Box 4: Deposit (Bottom Right)
                    Expanded(
                      child: _buildQuickActionBox(
                        title: 'Deposit',
                        subtitle: 'Info Notice',
                        icon: Icons.currency_rupee_rounded,
                        onTap: _showDepositNoticeModal,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // 6. REFERRAL CODE CARD (PURPLE)
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF29154B), Color(0xFF1E0E3B)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: const Color(0xFF3D1B75)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.share_rounded, color: AppColors.purpleAccent, size: 20),
                          SizedBox(width: 10),
                          Text(
                            'Your GrowPlus Referral Code',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Share your code. Earn eligible shopping credits when friends make qualifying purchases.',
                        style: TextStyle(fontSize: 12, color: Color(0xFFBDB0D8), height: 1.35),
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF170A37),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFF3D1B75)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              code,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 2,
                                color: Colors.white,
                              ),
                            ),
                            Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.copy_rounded, size: 20, color: AppColors.purpleAccent),
                                  onPressed: _copyReferralCode,
                                  tooltip: 'Copy Code',
                                ),
                                IconButton(
                                  icon: const Icon(Icons.share_rounded, size: 20, color: Colors.white),
                                  onPressed: _shareReferral,
                                  tooltip: 'Share Link',
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // 7. REFERRAL STATISTICS (2 PURPLE CARDS)
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: const Color(0xFF231044),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0xFF3D1B75)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Total Invited', style: TextStyle(fontSize: 11, color: Color(0xFFBDB0D8), fontWeight: FontWeight.w600)),
                            const SizedBox(height: 6),
                            Text(
                              '$totalInvited',
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: const Color(0xFF231044),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0xFF3D1B75)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Eligible Referrals', style: TextStyle(fontSize: 11, color: Color(0xFFBDB0D8), fontWeight: FontWeight.w600)),
                            const SizedBox(height: 6),
                            Text(
                              '$eligibleRefs',
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.purpleAccent),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // 8. SHOPPING APP CTA BUTTON (RICH PURPLE GRADIENT, PLACED BEFORE BOTTOM NAV)
                Container(
                  width: double.infinity,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF8B5CF6), Color(0xFF5B21B6)],
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF7C3AED).withOpacity(0.4),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: _launchShoppingApp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.shopping_bag_outlined, color: Colors.white, size: 22),
                        SizedBox(width: 10),
                        Text(
                          'Open GrowPlus Shopping App',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            letterSpacing: 0.3,
                          ),
                        ),
                        SizedBox(width: 8),
                        Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 18),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 28),

                // 9. RECENT ACTIVITY / HISTORY SECTION
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Recent Activity',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    TextButton(
                      onPressed: () => setState(() => _currentIndex = 1),
                      child: const Text(
                        'View All History',
                        style: TextStyle(color: AppColors.purpleAccent, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 10),

                if (_recentTransactions.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: const Color(0xFF231044),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFF3D1B75)),
                    ),
                    child: const Center(
                      child: Text(
                        'No recent activity recorded yet.\nShare your referral code or make eligible retail purchases to earn shopping credits!',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Color(0xFFBDB0D8), fontSize: 12.5, height: 1.4),
                      ),
                    ),
                  )
                else
                  ..._recentTransactions.map((tx) {
                    final isCredit = tx['type'] == 'credit';
                    final isReversal = tx['type'] == 'reversal';
                    final title = tx['description'] ?? 'Transaction';
                    final amount = tx['amount'] ?? '0';
                    final dateStr = tx['created_at'] != null
                        ? DateFormat('MMM dd, yyyy • hh:mm a').format(DateTime.parse(tx['created_at']).toLocal())
                        : '';

                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF231044),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF3D1B75)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: isCredit
                                  ? const Color(0xFF10B981).withOpacity(0.18)
                                  : (isReversal ? Colors.amber.shade900.withOpacity(0.2) : Colors.red.shade900.withOpacity(0.2)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              isCredit
                                  ? Icons.arrow_downward_rounded
                                  : (isReversal ? Icons.replay_rounded : Icons.arrow_upward_rounded),
                              size: 18,
                              color: isCredit
                                  ? const Color(0xFF34D399)
                                  : (isReversal ? Colors.amber.shade400 : const Color(0xFFF87171)),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  title,
                                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: Colors.white),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  dateStr,
                                  style: const TextStyle(fontSize: 11, color: Color(0xFFBDB0D8)),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${isCredit ? '+' : '-'}₹$amount',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              color: isCredit ? const Color(0xFF34D399) : const Color(0xFFF87171),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                const SizedBox(height: 20),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionBox({
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF231044),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFF3D1B75)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.15),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF30105F),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF4C248B)),
              ),
              child: Icon(icon, color: AppColors.purpleAccent, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 11, color: Color(0xFFBDB0D8)),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
