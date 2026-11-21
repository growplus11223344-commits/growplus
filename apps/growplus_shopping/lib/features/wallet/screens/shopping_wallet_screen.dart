import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';

class ShoppingWalletScreen extends StatefulWidget {
  final VoidCallback? onShopNow;

  const ShoppingWalletScreen({super.key, this.onShopNow});

  @override
  State<ShoppingWalletScreen> createState() => _ShoppingWalletScreenState();
}

class _ShoppingWalletScreenState extends State<ShoppingWalletScreen> {
  bool _loading = true;
  Map<String, dynamic>? _wallet;
  List<dynamic> _transactions = [];
  String _selectedFilter = 'All';

  final _currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);

  @override
  void initState() {
    super.initState();
    _loadWalletData();
  }

  Future<void> _loadWalletData() async {
    setState(() => _loading = true);
    try {
      final w = await ApiService.getWallet();
      final txs = await ApiService.getTransactions(type: _selectedFilter == 'All' ? null : _mapFilterToType(_selectedFilter));
      if (mounted) {
        setState(() {
          _wallet = w;
          _transactions = txs;
        });
      }
    } catch (e) {
      debugPrint('Error loading shopping wallet: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String? _mapFilterToType(String filter) {
    switch (filter) {
      case 'Credits':
        return 'credit';
      case 'Payments':
        return 'payment';
      case 'Purchases':
        return 'debit';
      default:
        return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final balance = (_wallet?['balance'] ?? 0).toDouble();
    final totalEarned = (_wallet?['total_earned'] ?? 0).toDouble();
    final totalRedeemed = (_wallet?['total_redeemed'] ?? 0).toDouble();
    final pendingRewards = (_wallet?['pending_rewards'] ?? 0).toDouble();

    return Scaffold(
      backgroundColor: AppColors.purpleBg,
      appBar: AppBar(
        backgroundColor: AppColors.purpleBg,
        elevation: 0,
        title: const Text(
          'Shopping Credits Wallet',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.purpleAccent),
            onPressed: _loadWalletData,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.purpleAccent))
          : RefreshIndicator(
              onRefresh: _loadWalletData,
              color: AppColors.purpleAccent,
              backgroundColor: AppColors.purpleSurface,
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                children: [
                  // Main Wallet Balance Card
                  Container(
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF3C1877), Color(0xFF170A37)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: AppColors.purpleBorderLight, width: 1.2),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.purpleAccent.withOpacity(0.25),
                          blurRadius: 18,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.stars_rounded, color: AppColors.purpleAccent, size: 20),
                                SizedBox(width: 8),
                                Text(
                                  'STORE SHOPPING CREDITS',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1.2,
                                    color: AppColors.textPurpleSecondary,
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withOpacity(0.18),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.check_circle_rounded, size: 12, color: Color(0xFF10B981)),
                                  SizedBox(width: 4),
                                  Text(
                                    'Active',
                                    style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _currencyFormat.format(balance),
                          style: const TextStyle(
                            fontSize: 34,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Automatically applied at checkout on eligible retail items',
                          style: TextStyle(fontSize: 12, color: AppColors.textPurpleSecondary),
                        ),
                        const SizedBox(height: 18),
                        const Divider(color: AppColors.purpleBorder),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: _buildBalanceMetric('Total Earned', _currencyFormat.format(totalEarned)),
                            ),
                            Container(width: 1, height: 32, color: AppColors.purpleBorder),
                            Expanded(
                              child: _buildBalanceMetric('Redeemed', _currencyFormat.format(totalRedeemed)),
                            ),
                            Container(width: 1, height: 32, color: AppColors.purpleBorder),
                            Expanded(
                              child: _buildBalanceMetric('Pending', _currencyFormat.format(pendingRewards)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Action Buttons Card
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: widget.onShopNow ?? () => Navigator.pop(context),
                          icon: const Icon(Icons.shopping_bag_outlined, size: 18),
                          label: const Text('Shop Catalog Now', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.purpleAccent,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 3,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Transaction History Header & Filter Chips
                  const Text(
                    'Credits & Purchases History',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 10),

                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: ['All', 'Credits', 'Purchases', 'Payments'].map((filter) {
                        final isSelected = _selectedFilter == filter;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: FilterChip(
                            label: Text(filter),
                            selected: isSelected,
                            onSelected: (selected) {
                              if (selected) {
                                setState(() => _selectedFilter = filter);
                                _loadWalletData();
                              }
                            },
                            backgroundColor: AppColors.purpleSurface,
                            selectedColor: AppColors.purpleAccent,
                            labelStyle: TextStyle(
                              color: isSelected ? Colors.white : AppColors.textPurpleSecondary,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              fontSize: 12,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                              side: BorderSide(
                                color: isSelected ? AppColors.purpleAccent : AppColors.purpleBorder,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),

                  const SizedBox(height: 14),

                  // Transaction List
                  if (_transactions.isEmpty) ...[
                    Container(
                      padding: const EdgeInsets.all(28),
                      decoration: BoxDecoration(
                        color: AppColors.purpleSurface,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppColors.purpleBorder),
                      ),
                      child: Column(
                        children: [
                          Icon(Icons.receipt_long_outlined, size: 44, color: AppColors.textPurpleMuted.withOpacity(0.5)),
                          const SizedBox(height: 12),
                          const Text(
                            'No Transactions Found',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Your credit earnings and redemptions will appear here once you shop.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    ..._transactions.map((tx) {
                      final type = (tx['type'] ?? 'credit').toString();
                      final isCredit = type == 'credit';
                      final amount = (tx['amount'] ?? 0).toDouble();
                      final desc = (tx['description'] ?? 'Wallet transaction').toString();
                      final createdAt = tx['created_at'] != null
                          ? DateFormat('dd MMM yyyy, hh:mm a').format(DateTime.parse(tx['created_at'].toString()))
                          : '';

                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.purpleSurface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.purpleBorder),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: isCredit
                                    ? const Color(0xFF10B981).withOpacity(0.15)
                                    : const Color(0xFFEF4444).withOpacity(0.15),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                isCredit ? Icons.arrow_downward_rounded : Icons.shopping_bag_outlined,
                                color: isCredit ? const Color(0xFF10B981) : const Color(0xFFF87171),
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    desc,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    createdAt,
                                    style: const TextStyle(color: AppColors.textPurpleMuted, fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              '${isCredit ? "+" : "-"}${_currencyFormat.format(amount)}',
                              style: TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 14,
                                color: isCredit ? const Color(0xFF34D399) : const Color(0xFFF87171),
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }

  Widget _buildBalanceMetric(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: AppColors.textPurpleSecondary),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ],
    );
  }
}
