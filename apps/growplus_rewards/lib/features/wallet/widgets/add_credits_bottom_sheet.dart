import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../screens/add_credits_screen.dart';

class AddCreditsBottomSheet extends StatefulWidget {
  final VoidCallback? onViewPortfolio;
  final VoidCallback? onOpenShopping;

  const AddCreditsBottomSheet({
    super.key,
    this.onViewPortfolio,
    this.onOpenShopping,
  });

  static Future<void> show(
    BuildContext context, {
    VoidCallback? onViewPortfolio,
    VoidCallback? onOpenShopping,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.purpleSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => AddCreditsBottomSheet(
        onViewPortfolio: onViewPortfolio,
        onOpenShopping: onOpenShopping,
      ),
    );
  }

  @override
  State<AddCreditsBottomSheet> createState() => _AddCreditsBottomSheetState();
}

class _AddCreditsBottomSheetState extends State<AddCreditsBottomSheet> {
  // Preset amounts requested for the central ₹ button:
  // ₹500, ₹800, ₹2,800, ₹5,800, ₹10,800
  static const List<int> _presetAmounts = [500, 800, 2800, 5800, 10800];

  int? _selectedPreset = 500;
  final TextEditingController _customController = TextEditingController();
  bool _isCustom = false;
  String? _errorMessage;

  @override
  void dispose() {
    _customController.dispose();
    super.dispose();
  }

  double? get _currentAmount {
    if (_isCustom) {
      final text = _customController.text.trim().replaceAll(',', '');
      return double.tryParse(text);
    }
    return _selectedPreset?.toDouble();
  }

  void _selectPreset(int amount) {
    setState(() {
      _selectedPreset = amount;
      _isCustom = false;
      _customController.clear();
      _errorMessage = null;
    });
  }

  void _enableCustom() {
    setState(() {
      _isCustom = true;
      _selectedPreset = null;
    });
  }

  void _onCustomChanged(String val) {
    final clean = val.trim().replaceAll(',', '');
    final numVal = double.tryParse(clean);
    setState(() {
      if (clean.isEmpty) {
        _errorMessage = 'Please enter an amount';
      } else if (numVal == null) {
        _errorMessage = 'Invalid numeric amount';
      } else if (numVal < 500) {
        _errorMessage = 'Minimum amount is ₹500';
      } else {
        _errorMessage = null;
      }
    });
  }

  void _handleSubmit() {
    final amount = _currentAmount;
    if (amount == null || amount < 500) {
      setState(() {
        _errorMessage = 'Minimum amount is ₹500';
      });
      return;
    }

    Navigator.pop(context);
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => AddCreditsScreen(initialAmount: amount),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    final displayAmount = _currentAmount;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.purpleBorder,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // Title
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Add Shopping Credits',
                    style: TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.purpleAccent.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.purpleAccent.withOpacity(0.3)),
                    ),
                    child: const Text(
                      'Store Credits',
                      style: TextStyle(
                        color: AppColors.purpleAccent,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'Select or enter credit amount for eligible partner shopping',
                style: TextStyle(color: Color(0xFFCDBDEA), fontSize: 12.5),
              ),

              const SizedBox(height: 20),

              // Preset amount chips
              const Text(
                'Select Amount',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white70),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ..._presetAmounts.map((amt) {
                    final isSelected = !_isCustom && _selectedPreset == amt;
                    final formatted = NumberFormat('#,##0').format(amt);
                    return InkWell(
                      onTap: () => _selectPreset(amt),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          gradient: isSelected
                              ? const LinearGradient(
                                  colors: [Color(0xFF3C1877), Color(0xFF170A37)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                )
                              : null,
                          color: isSelected ? null : const Color(0xFF1B0C36),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? AppColors.purpleAccent : const Color(0xFF3D1B75),
                            width: isSelected ? 1.8 : 1,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: AppColors.purpleAccent.withOpacity(0.25),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  )
                                ]
                              : null,
                        ),
                        child: Text(
                          '₹$formatted',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected ? Colors.white : const Color(0xFFCDBDEA),
                          ),
                        ),
                      ),
                    );
                  }),
                  InkWell(
                    onTap: _enableCustom,
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        gradient: _isCustom
                            ? const LinearGradient(
                                colors: [Color(0xFF3C1877), Color(0xFF170A37)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              )
                            : null,
                        color: _isCustom ? null : const Color(0xFF1B0C36),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _isCustom ? AppColors.purpleAccent : const Color(0xFF3D1B75),
                          width: _isCustom ? 1.8 : 1,
                        ),
                      ),
                      child: Text(
                        'Custom Amount',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: _isCustom ? FontWeight.bold : FontWeight.w500,
                          color: _isCustom ? Colors.white : const Color(0xFFCDBDEA),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              // Custom amount input field when active
              if (_isCustom) ...[
                const SizedBox(height: 16),
                TextField(
                  controller: _customController,
                  keyboardType: TextInputType.number,
                  autofocus: true,
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  onChanged: _onCustomChanged,
                  decoration: InputDecoration(
                    prefixText: '₹ ',
                    prefixStyle: const TextStyle(color: AppColors.purpleAccent, fontSize: 18, fontWeight: FontWeight.bold),
                    hintText: 'Enter amount (min ₹500)',
                    hintStyle: const TextStyle(color: Color(0xFF8B7AA8), fontSize: 14),
                    filled: true,
                    fillColor: const Color(0xFF1A0A35),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFF3D1B75)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.purpleAccent, width: 2),
                    ),
                    errorText: _errorMessage,
                    errorStyle: const TextStyle(color: Color(0xFFF87171)),
                  ),
                ),
              ],

              const SizedBox(height: 16),

              // Summary card
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1A0A35),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF3D1B75)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Selected Value:', style: TextStyle(color: Color(0xFFCDBDEA), fontSize: 13)),
                    Text(
                      displayAmount != null && displayAmount > 0
                          ? '₹${NumberFormat('#,##0.00').format(displayAmount)}'
                          : '₹0.00',
                      style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Action button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.purpleAccent,
                    foregroundColor: Colors.white,
                    elevation: 3,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.add_shopping_cart_rounded, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Review & Add Credits',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 12),
              const Divider(color: Color(0xFF2E1452)),
              const SizedBox(height: 8),

              // Quick shortcuts
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        widget.onViewPortfolio?.call();
                      },
                      icon: const Icon(Icons.account_balance_wallet_rounded, size: 16, color: AppColors.purpleAccent),
                      label: const Text('View Portfolio', style: TextStyle(color: Colors.white, fontSize: 12)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF3D1B75)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        widget.onOpenShopping?.call();
                      },
                      icon: const Icon(Icons.shopping_bag_outlined, size: 16, color: AppColors.purpleAccent),
                      label: const Text('Open Store', style: TextStyle(color: Colors.white, fontSize: 12)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF3D1B75)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
