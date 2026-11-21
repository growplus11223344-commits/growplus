import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';
import '../../auth/screens/login_screen.dart';
import '../../orders/screens/orders_screen.dart';
import '../../wallet/screens/shopping_wallet_screen.dart';
import 'shopping_support_screen.dart';

class ShoppingProfileScreen extends StatefulWidget {
  final VoidCallback? onNavigateToOrders;

  const ShoppingProfileScreen({super.key, this.onNavigateToOrders});

  @override
  State<ShoppingProfileScreen> createState() => _ShoppingProfileScreenState();
}

class _ShoppingProfileScreenState extends State<ShoppingProfileScreen> {
  Map<String, dynamic>? _profile;
  Map<String, dynamic>? _wallet;
  bool _loading = true;

  final _currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);

  @override
  void initState() {
    super.initState();
    _loadProfileAndWallet();
  }

  Future<void> _loadProfileAndWallet() async {
    setState(() => _loading = true);
    try {
      final p = await ApiService.getMe();
      Map<String, dynamic>? w;
      try {
        w = await ApiService.getWallet();
      } catch (_) {}

      if (mounted) {
        setState(() {
          _profile = p;
          _wallet = w;
        });
      }
    } catch (e) {
      debugPrint('Error loading shopping profile: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleLogout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF29154B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF3D1B75)),
        ),
        title: const Text('Sign Out', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: const Text(
          'Are you sure you want to sign out of GrowPlus Shopping?',
          style: TextStyle(color: Color(0xFFC5B5DF)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFFC5B5DF))),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Sign Out', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await Supabase.instance.client.auth.signOut();
      } catch (_) {}
      await ApiService.clearToken();
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
          (route) => false,
        );
      }
    }
  }

  void _showSecuritySettingsDialog() {
    final email = (_profile?['email'] ?? '').toString();
    final newPasswordController = TextEditingController();
    bool isUpdating = false;
    String? dialogStatus;
    bool isError = false;

    showDialog(
      context: context,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: const Color(0xFF29154B),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: Color(0xFF3D1B75)),
              ),
              title: const Row(
                children: [
                  Icon(Icons.shield_outlined, color: AppColors.purpleAccent, size: 24),
                  SizedBox(width: 10),
                  Text('Security Settings', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (dialogStatus != null) ...[
                      Container(
                        padding: const EdgeInsets.all(10),
                        margin: const EdgeInsets.only(bottom: 14),
                        decoration: BoxDecoration(
                          color: isError ? Colors.red.shade900.withOpacity(0.3) : Colors.green.shade900.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: isError ? Colors.red.shade400.withOpacity(0.4) : Colors.green.shade400.withOpacity(0.4)),
                        ),
                        child: Text(
                          dialogStatus!,
                          style: TextStyle(color: isError ? const Color(0xFFFF8B8B) : const Color(0xFF6EE7B7), fontSize: 12),
                        ),
                      ),
                    ],
                    const Text('Update Password', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: newPasswordController,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      obscureText: true,
                      decoration: InputDecoration(
                        hintText: 'New password (min 8 chars)',
                        hintStyle: const TextStyle(color: Color(0xFF8B7AA8), fontSize: 12),
                        filled: true,
                        fillColor: const Color(0xFF170A37),
                        prefixIcon: const Icon(Icons.lock_reset, color: AppColors.purpleAccent, size: 20),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF3D1B75))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF3D1B75))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.purpleAccent, width: 1.5)),
                        contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: isUpdating
                            ? null
                            : () async {
                                final newPass = newPasswordController.text.trim();
                                if (newPass.length < 8) {
                                  setDialogState(() {
                                    isError = true;
                                    dialogStatus = 'Password must be at least 8 characters';
                                  });
                                  return;
                                }
                                setDialogState(() {
                                  isUpdating = true;
                                  dialogStatus = null;
                                });
                                try {
                                  await Supabase.instance.client.auth.updateUser(
                                    UserAttributes(password: newPass),
                                  );
                                  setDialogState(() {
                                    isUpdating = false;
                                    isError = false;
                                    dialogStatus = 'Password successfully updated!';
                                    newPasswordController.clear();
                                  });
                                } catch (e) {
                                  setDialogState(() {
                                    isUpdating = false;
                                    isError = true;
                                    dialogStatus = e.toString().replaceFirst('Exception: ', '');
                                  });
                                }
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.purpleAccent,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: isUpdating
                            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Text('Update Password', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Divider(color: Color(0xFF3D1B75)),
                    const SizedBox(height: 10),
                    const Text('Reset via Email', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(
                      'Send a password reset link to $email',
                      style: const TextStyle(color: Color(0xFFC5B5DF), fontSize: 12),
                    ),
                    const SizedBox(height: 8),
                    OutlinedButton(
                      onPressed: isUpdating || email.isEmpty
                          ? null
                          : () async {
                              setDialogState(() {
                                isUpdating = true;
                                dialogStatus = null;
                              });
                              try {
                                await Supabase.instance.client.auth.resetPasswordForEmail(email);
                                setDialogState(() {
                                  isUpdating = false;
                                  isError = false;
                                  dialogStatus = 'Password reset link sent to $email!';
                                });
                              } catch (e) {
                                setDialogState(() {
                                  isUpdating = false;
                                  isError = true;
                                  dialogStatus = e.toString().replaceFirst('Exception: ', '');
                                });
                              }
                            },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.purpleAccent,
                        side: const BorderSide(color: AppColors.purpleAccent),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.mark_email_read_outlined, size: 16),
                          SizedBox(width: 8),
                          Text('Send Reset Link', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogCtx),
                  child: const Text('Close', style: TextStyle(color: Color(0xFFC5B5DF))),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showComplianceModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1B0C36),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('GrowPlus Store Policies', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              const Text(
                '• Retail Pricing & Payments: All listed items reflect genuine consumer market prices inclusive of applicable taxes.\n\n'
                '• Shopping Credits Redemption: Promotional shopping credits may be redeemed towards eligible product orders. Credits are non-transferable, non-cash, and non-refundable.\n\n'
                '• Shipping & Fulfillment: Orders are processed through verified logistics partners with real-time tracking.\n\n'
                '• 7-Day Returns: Defective or damaged items qualify for 7-day replacements or store credit refunds.',
                style: TextStyle(color: Color(0xFFCDBDEA), fontSize: 13, height: 1.5),
              ),
              const SizedBox(height: 18),
            ],
          ),
        ),
      ),
    );
  }

  String _getInitials(String name) {
    if (name.trim().isEmpty) return 'GP';
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length > 1) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0].substring(0, parts[0].length >= 2 ? 2 : 1).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final name = (_profile?['full_name'] ?? 'GrowPlus Member').toString();
    final email = (_profile?['email'] ?? 'Not provided').toString();
    final phone = (_profile?['phone'] ?? '').toString();
    final balance = (_wallet?['balance'] ?? 0).toDouble();

    return Scaffold(
      backgroundColor: AppColors.purpleBg,
      appBar: AppBar(
        backgroundColor: AppColors.purpleBg,
        elevation: 0,
        title: const Text(
          'My Shopping Profile',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.purpleAccent),
            onPressed: _loadProfileAndWallet,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.purpleAccent))
          : ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              children: [
                // Profile Header Card
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
                        color: Colors.black.withOpacity(0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(
                            colors: [Color(0xFF8B5CF6), Color(0xFF3B0764)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          border: Border.all(color: AppColors.purpleAccent, width: 2),
                        ),
                        child: Center(
                          child: Text(
                            _getInitials(name),
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              email,
                              style: const TextStyle(fontSize: 12, color: Color(0xFFC5B5DF)),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (phone.isNotEmpty) ...[
                              const SizedBox(height: 2),
                              Text(phone, style: const TextStyle(fontSize: 12, color: Color(0xFFC5B5DF))),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Shopping Credits Quick Bar
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ShoppingWalletScreen()),
                    ).then((_) => _loadProfileAndWallet());
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppColors.purpleSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.purpleBorder),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.purpleAccent.withOpacity(0.18),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.stars_rounded, color: AppColors.purpleAccent, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Available Shopping Credits', style: TextStyle(fontSize: 11, color: AppColors.textPurpleSecondary)),
                                const SizedBox(height: 2),
                                Text(
                                  _currencyFormat.format(balance),
                                  style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF34D399)),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const Row(
                          children: [
                            Text('Wallet', style: TextStyle(color: AppColors.purpleAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                            SizedBox(width: 4),
                            Icon(Icons.arrow_forward_ios_rounded, color: AppColors.purpleAccent, size: 12),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // Menu Options
                const Text('Shopping & Orders', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFFC5B5DF))),
                const SizedBox(height: 10),

                Container(
                  decoration: BoxDecoration(
                    color: AppColors.purpleSurface,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.purpleBorder),
                  ),
                  child: Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.receipt_long_outlined, color: AppColors.purpleAccent, size: 22),
                        title: const Text('My Orders', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                        subtitle: const Text('Track active deliveries and view invoices', style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 11)),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textPurpleMuted),
                        onTap: () {
                          if (widget.onNavigateToOrders != null) {
                            widget.onNavigateToOrders!();
                          } else {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const OrdersScreen()));
                          }
                        },
                      ),
                      const Divider(height: 1, color: AppColors.purpleBorder),
                      ListTile(
                        leading: const Icon(Icons.account_balance_wallet_outlined, color: AppColors.purpleAccent, size: 22),
                        title: const Text('Shopping Credits Wallet', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                        subtitle: const Text('Balance, transaction history & redemptions', style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 11)),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textPurpleMuted),
                        onTap: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const ShoppingWalletScreen()))
                              .then((_) => _loadProfileAndWallet());
                        },
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                const Text('Help & Security', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFFC5B5DF))),
                const SizedBox(height: 10),

                Container(
                  decoration: BoxDecoration(
                    color: AppColors.purpleSurface,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.purpleBorder),
                  ),
                  child: Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.headset_mic_outlined, color: AppColors.purpleAccent, size: 22),
                        title: const Text('Customer Support & FAQs', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                        subtitle: const Text('Orders, shipping, returns and live help desk', style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 11)),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textPurpleMuted),
                        onTap: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const ShoppingSupportScreen()));
                        },
                      ),
                      const Divider(height: 1, color: AppColors.purpleBorder),
                      ListTile(
                        leading: const Icon(Icons.lock_outline_rounded, color: AppColors.purpleAccent, size: 22),
                        title: const Text('Security & Password', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                        subtitle: const Text('Change login password or send reset email', style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 11)),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textPurpleMuted),
                        onTap: _showSecuritySettingsDialog,
                      ),
                      const Divider(height: 1, color: AppColors.purpleBorder),
                      ListTile(
                        leading: const Icon(Icons.verified_user_outlined, color: AppColors.purpleAccent, size: 22),
                        title: const Text('Store Terms & Policies', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                        subtitle: const Text('Pricing, returns, delivery and credits policy', style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 11)),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textPurpleMuted),
                        onTap: _showComplianceModal,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                // Sign Out Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: OutlinedButton.icon(
                    onPressed: _handleLogout,
                    icon: const Icon(Icons.logout_rounded, size: 18),
                    label: const Text('Sign Out', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFF87171),
                      side: const BorderSide(color: Color(0xFFEF4444), width: 1.5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      backgroundColor: const Color(0xFFEF4444).withOpacity(0.08),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
    );
  }
}
