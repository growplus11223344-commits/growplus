import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/handoff_service.dart';
import 'add_credits_screen.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  bool _loading = true;
  bool _launchingShopping = false;
  Map<String, dynamic>? _wallet;
  List<dynamic> _transactions = [];
  String _selectedFilter = 'all';

  // Amount selection state (Section 4)
  // Presets: ₹500, ₹1,000, ₹2,000, ₹5,000, ₹10,000
  static const List<int> _presetAmounts = [500, 1000, 2000, 5000, 10000];
  int? _selectedPreset = 1000;
  final TextEditingController _amountController = TextEditingController(text: '1000');
  String? _amountError;

  @override
  void initState() {
    super.initState();
    _fetchWalletData();
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _fetchWalletData() async {
    setState(() => _loading = true);
    try {
      final wallet = await ApiService.getWallet();
      final txs = await ApiService.getWalletTransactions();

      if (mounted) {
        setState(() {
          _wallet = wallet;
          _transactions = txs;
        });
      }
    } catch (e) {
      debugPrint('Error fetching wallet/portfolio: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _onPresetTapped(int amount) {
    setState(() {
      _selectedPreset = amount;
      _amountController.text = amount.toString();
      _amountError = null;
    });
  }

  void _onAmountChanged(String val) {
    final clean = val.trim().replaceAll(',', '');
    final numVal = double.tryParse(clean);

    setState(() {
      if (clean.isEmpty) {
        _amountError = 'Please enter an amount';
        _selectedPreset = null;
      } else if (numVal == null) {
        _amountError = 'Invalid numeric amount';
        _selectedPreset = null;
      } else if (numVal < 500) {
        _amountError = 'Minimum amount is ₹500';
        _selectedPreset = null;
      } else {
        _amountError = null;
        final intVal = numVal.toInt();
        if (_presetAmounts.contains(intVal) && intVal.toDouble() == numVal) {
          _selectedPreset = intVal;
        } else {
          _selectedPreset = null;
        }
      }
    });
  }

  void _handleAddCreditsReview() {
    final clean = _amountController.text.trim().replaceAll(',', '');
    final amount = double.tryParse(clean);

    if (amount == null || amount < 500) {
      setState(() {
        _amountError = 'Minimum amount is ₹500';
      });
      return;
    }

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => AddCreditsScreen(
          initialAmount: amount,
          onCreditsAdded: () {
            _fetchWalletData();
          },
        ),
      ),
    ).then((_) {
      _fetchWalletData();
    });
  }

  Future<void> _handleOpenShopping() async {
    setState(() => _launchingShopping = true);
    try {
      await HandoffService.openShoppingApp(context);
    } finally {
      if (mounted) setState(() => _launchingShopping = false);
    }
  }

  List<dynamic> get _filteredTransactions {
    if (_selectedFilter == 'all') return _transactions;

    return _transactions.where((tx) {
      final type = tx['type']?.toString().toLowerCase() ?? '';
      final source = tx['source']?.toString().toLowerCase() ?? '';
      final desc = tx['description']?.toString().toLowerCase() ?? '';

      switch (_selectedFilter) {
        case 'credits':
          return type == 'credit' || source.contains('reward') || source.contains('bonus') || source.contains('credit');
        case 'payments':
          return source == 'order_payment' || type == 'debit' || desc.contains('pay');
        case 'purchases':
          return source == 'order_payment' || desc.contains('order') || desc.contains('purchase');
        case 'adjustments':
          return ['admin_credit', 'admin_debit', 'refund', 'expiry'].contains(source) ||
              type == 'reversal' ||
              type == 'adjustment';
        default:
          return true;
      }
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final balance = double.tryParse(_wallet?['balance']?.toString() ?? '0') ?? 0.0;
    final pendingBalance = double.tryParse(_wallet?['pending_balance']?.toString() ?? '0') ?? 0.0;
    final lifetimeEarned = double.tryParse(_wallet?['lifetime_earned']?.toString() ?? '0') ?? 0.0;
    final lifetimeSpent = double.tryParse(_wallet?['lifetime_spent']?.toString() ?? '0') ?? 0.0;

    final currentDisplayAmount = double.tryParse(_amountController.text.trim().replaceAll(',', '')) ?? 0.0;

    return Scaffold(
      backgroundColor: const Color(0xFF120829), // #120829 deep purple
      appBar: AppBar(
        title: const Text(
          'Portfolio',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: Colors.white,
            letterSpacing: 0.3,
          ),
        ),
        backgroundColor: const Color(0xFF120829),
        elevation: 0,
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.purpleAccent),
            onPressed: _fetchWalletData,
            tooltip: 'Refresh Portfolio',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchWalletData,
        color: AppColors.purpleAccent,
        backgroundColor: const Color(0xFF231044),
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            // ============================================================
            // 2. PORTFOLIO BALANCE CARD
            // ============================================================
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF3C1877), Color(0xFF170A37)], // #3C1877 to #170A37
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFF4C248B), width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF3C1877).withOpacity(0.35),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header row with Ledger Verified badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'YOUR SHOPPING WALLET',
                        style: TextStyle(
                          color: Color(0xFFCDBDEA),
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.8,
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
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.check_circle_rounded, color: Color(0xFF34D399), size: 12),
                            SizedBox(width: 4),
                            Text(
                              'Ledger Verified',
                              style: TextStyle(
                                color: Color(0xFF34D399),
                                fontSize: 10.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Main Available Shopping Credits
                  Text(
                    '₹${NumberFormat('#,##0.00').format(balance)}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 38,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Available Shopping Credits',
                    style: TextStyle(
                      color: Color(0xFFCDBDEA),
                      fontSize: 12.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),

                  const SizedBox(height: 18),
                  const Divider(color: Color(0xFF3D1B75), height: 1),
                  const SizedBox(height: 16),

                  // Metrics Row: Pending, Lifetime Earned, Credits Used
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildMetricItem(
                        'Pending Credits',
                        '₹${NumberFormat('#,##0.00').format(pendingBalance)}',
                        const Color(0xFFFBBF24), // amber
                      ),
                      _buildMetricItem(
                        'Lifetime Earned',
                        '₹${NumberFormat('#,##0.00').format(lifetimeEarned)}',
                        const Color(0xFF34D399), // emerald
                      ),
                      _buildMetricItem(
                        'Credits Used',
                        '₹${NumberFormat('#,##0.00').format(lifetimeSpent)}',
                        const Color(0xFFCDBDEA), // soft purple
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 22),

            // ============================================================
            // 4. AMOUNT SELECTION INTERFACE: Add Money
            // ============================================================
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF231044), // #231044 card
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFF3D1B75)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Add Money',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 0.2,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.purpleAccent.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.purpleAccent.withOpacity(0.3)),
                        ),
                        child: const Text(
                          'Instant Top-Up',
                          style: TextStyle(color: AppColors.purpleAccent, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 5),
                  const Text(
                    'Select or enter amount to add money to your wallet',
                    style: TextStyle(fontSize: 12, color: Color(0xFFCDBDEA)),
                  ),
                  const SizedBox(height: 16),

                  // Preset Amount Chips: ₹500, ₹1,000, ₹2,000, ₹5,000, ₹10,000
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _presetAmounts.map((amt) {
                      final isSelected = _selectedPreset == amt;
                      final formatted = NumberFormat('#,##0').format(amt);
                      return InkWell(
                        onTap: () => _onPresetTapped(amt),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                          decoration: BoxDecoration(
                            gradient: isSelected
                                ? const LinearGradient(
                                    colors: [Color(0xFF3C1877), Color(0xFF170A37)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  )
                                : null,
                            color: isSelected ? null : const Color(0xFF190C33),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected ? AppColors.purpleAccent : const Color(0xFF3D1B75),
                              width: isSelected ? 1.6 : 1,
                            ),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: AppColors.purpleAccent.withOpacity(0.3),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    )
                                  ]
                                : null,
                          ),
                          child: Text(
                            '₹$formatted',
                            style: TextStyle(
                              fontSize: 13.5,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              color: isSelected ? Colors.white : const Color(0xFFCDBDEA),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 16),

                  // Custom Amount Input
                  TextField(
                    controller: _amountController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    onChanged: _onAmountChanged,
                    decoration: InputDecoration(
                      prefixText: '₹ ',
                      prefixStyle: const TextStyle(color: AppColors.purpleAccent, fontSize: 18, fontWeight: FontWeight.bold),
                      hintText: 'Custom amount (min ₹500)',
                      hintStyle: const TextStyle(color: Color(0xFF8B7AA8), fontSize: 13.5),
                      filled: true,
                      fillColor: const Color(0xFF180A33),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: Color(0xFF3D1B75)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: Color(0xFF3D1B75)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(color: AppColors.purpleAccent, width: 1.8),
                      ),
                      errorText: _amountError,
                      errorStyle: const TextStyle(color: Color(0xFFF87171), fontSize: 11),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Selected amount summary row
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF190C33),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF3D1B75).withOpacity(0.6)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Selected Amount',
                          style: TextStyle(fontSize: 12.5, color: Color(0xFFCDBDEA), fontWeight: FontWeight.w500),
                        ),
                        Text(
                          currentDisplayAmount > 0
                              ? '₹${NumberFormat('#,##0.00').format(currentDisplayAmount)}'
                              : '₹1,000.00',
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  // Full-width Action Button ("poori line tak mein")
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton.icon(
                      onPressed: _handleAddCreditsReview,
                      icon: const Icon(Icons.add_circle_rounded, size: 20),
                      label: Text(
                        'Add Money • ₹${NumberFormat('#,##0').format(currentDisplayAmount > 0 ? currentDisplayAmount : 1000)}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, letterSpacing: 0.3),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.purpleAccent,
                        foregroundColor: Colors.white,
                        elevation: 4,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 22),

            // ============================================================
            // 6. TRANSACTION HISTORY
            // ============================================================
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Transaction History',
                      style: TextStyle(
                        fontSize: 16.5,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Server-side verified immutable activity',
                      style: TextStyle(fontSize: 11, color: Color(0xFFCDBDEA)),
                    ),
                  ],
                ),
                Text(
                  '${_filteredTransactions.length} entries',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.purpleAccent),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // 5 Filters: All, Credits, Payments, Purchases, Adjustments
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('All', 'all'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Credits', 'credits'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Payments', 'payments'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Purchases', 'purchases'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Adjustments', 'adjustments'),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Transaction Cards List or Empty State
            if (_loading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(color: AppColors.purpleAccent),
                ),
              )
            else if (_filteredTransactions.isEmpty)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                decoration: BoxDecoration(
                  color: const Color(0xFF231044),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFF3D1B75)),
                ),
                child: const Center(
                  child: Column(
                    children: [
                      Icon(Icons.receipt_long_outlined, size: 44, color: Color(0xFF8B7AA8)),
                      SizedBox(height: 10),
                      Text(
                        'No transactions yet.',
                        style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Your promotional credits and purchase activity will appear here once verified on the ledger.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Color(0xFFCDBDEA), fontSize: 12, height: 1.4),
                      ),
                    ],
                  ),
                ),
              )
            else
              ..._filteredTransactions.map((tx) {
                final isCredit = tx['type'] == 'credit';
                final isReversal = tx['type'] == 'reversal';
                final amount = tx['amount'];
                final description = tx['description'] ?? 'Ledger entry';
                final referenceId = tx['reference_id'] ?? tx['order_id'];
                final dateStr = tx['created_at'] != null
                    ? DateFormat('MMM dd, yyyy • hh:mm a').format(DateTime.parse(tx['created_at']).toLocal())
                    : '';

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(16),
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
                              : (isReversal
                                  ? Colors.amber.shade900.withOpacity(0.2)
                                  : AppColors.purpleAccent.withOpacity(0.18)),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          isCredit
                              ? Icons.arrow_downward_rounded
                              : (isReversal ? Icons.tune_rounded : Icons.shopping_bag_outlined),
                          color: isCredit
                              ? const Color(0xFF34D399)
                              : (isReversal ? Colors.amber.shade400 : AppColors.purpleAccent),
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              description,
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 13.5,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              dateStr,
                              style: const TextStyle(fontSize: 11, color: Color(0xFFCDBDEA)),
                            ),
                            if (referenceId != null) ...[
                              const SizedBox(height: 2),
                              Text(
                                'Ref: $referenceId',
                                style: const TextStyle(fontSize: 10, color: Color(0xFF8B7AA8)),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '${isCredit ? '+' : '-'}₹$amount',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: isCredit ? const Color(0xFF34D399) : const Color(0xFFF87171),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Verified',
                              style: TextStyle(color: Color(0xFF34D399), fontSize: 9.5, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              }),

            const SizedBox(height: 22),

            // ============================================================
            // 7. EXPLORE GROWPLUS SHOPPING APP CARD (CLICKABLE AUTO-HANDOFF)
            // ============================================================
            Material(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(22),
              child: InkWell(
                onTap: _launchingShopping ? null : _handleOpenShopping,
                borderRadius: BorderRadius.circular(22),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF30105F), Color(0xFF170A37)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: const Color(0xFF4C248B)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.purpleAccent.withOpacity(0.18),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.shopping_bag_rounded, color: AppColors.purpleAccent, size: 22),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text(
                              'Explore GrowPlus Shopping',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const Icon(Icons.open_in_new_rounded, color: AppColors.purpleAccent, size: 18),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Redeem your verified credits against thousands of genuine retail products with direct 1:1 savings.',
                        style: TextStyle(fontSize: 12, color: Color(0xFFCDBDEA), height: 1.4),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _launchingShopping ? null : _handleOpenShopping,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.purpleAccent,
                            foregroundColor: Colors.white,
                            elevation: 2,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          child: _launchingShopping
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      'Open GrowPlus Shopping App',
                                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                    ),
                                    SizedBox(width: 8),
                                    Icon(Icons.arrow_forward_rounded, size: 16),
                                  ],
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricItem(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Color(0xFFCDBDEA), fontSize: 11, fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(color: color, fontSize: 14, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildFilterChip(String label, String filterKey) {
    final isSelected = _selectedFilter == filterKey;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedFilter = filterKey);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.purpleAccent : const Color(0xFF231044),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.purpleAccent : const Color(0xFF3D1B75),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.white : const Color(0xFFCDBDEA),
          ),
        ),
      ),
    );
  }
}
