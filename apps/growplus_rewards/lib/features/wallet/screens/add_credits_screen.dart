import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/handoff_service.dart';

class AddCreditsScreen extends StatefulWidget {
  final double? initialAmount;
  final VoidCallback? onCreditsAdded;

  const AddCreditsScreen({
    super.key,
    this.initialAmount,
    this.onCreditsAdded,
  });

  @override
  State<AddCreditsScreen> createState() => _AddCreditsScreenState();
}

class _AddCreditsScreenState extends State<AddCreditsScreen> {
  static const List<int> _presetAmounts = [500, 800, 2800, 5800, 10800];

  int? _selectedPreset = 500;
  final TextEditingController _customController = TextEditingController();
  bool _isCustom = false;
  String? _errorMessage;

  bool _isLoadingBalance = true;
  bool _isProcessing = false;
  double _currentBalance = 0.0;

  late Razorpay _razorpay;
  String? _inFlightOrderId;
  double? _inFlightAmount;

  final NumberFormat _currencyFormat = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 2,
  );

  @override
  void initState() {
    super.initState();
    _initRazorpay();
    _loadCurrentBalance();

    if (widget.initialAmount != null && widget.initialAmount! >= 500) {
      final initialInt = widget.initialAmount!.toInt();
      if (_presetAmounts.contains(initialInt) && widget.initialAmount! == initialInt.toDouble()) {
        _selectedPreset = initialInt;
        _isCustom = false;
      } else {
        _isCustom = true;
        _selectedPreset = null;
        _customController.text = widget.initialAmount!.toStringAsFixed(0);
      }
    }
  }

  void _initRazorpay() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  @override
  void dispose() {
    _razorpay.clear();
    _customController.dispose();
    super.dispose();
  }

  Future<void> _loadCurrentBalance() async {
    try {
      final wallet = await ApiService.getWallet();
      if (mounted) {
        setState(() {
          _currentBalance = double.tryParse(wallet['balance']?.toString() ?? '0') ?? 0.0;
          _isLoadingBalance = false;
        });
      }
    } catch (e) {
      debugPrint('Failed to load wallet balance: $e');
      if (mounted) {
        setState(() => _isLoadingBalance = false);
      }
    }
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

  Future<void> _handleProceedToPay() async {
    final amount = _currentAmount;
    if (amount == null || amount < 500) {
      setState(() {
        _errorMessage = 'Minimum credit purchase amount is ₹500';
      });
      return;
    }

    setState(() {
      _isProcessing = true;
      _errorMessage = null;
    });

    try {
      // 1. Request top-up order from backend
      final topupData = await ApiService.createWalletTopup(amount);
      final provider = topupData['provider'] as String? ?? 'razorpay';
      final gatewayType = topupData['gateway_type'] as String? ?? 'sdk';

      // Branch A: Europepay Hosted Checkout
      if (provider == 'europepay' || gatewayType == 'hosted_checkout') {
        final checkoutUrl = topupData['checkout_url'] as String? ?? '';
        final gatewayOrderId = topupData['gateway_order_id'] as String? ?? 'TOPUP-${DateTime.now().millisecondsSinceEpoch}';
        _inFlightOrderId = gatewayOrderId;
        _inFlightAmount = amount;

        if (checkoutUrl.isNotEmpty) {
          final uri = Uri.parse(checkoutUrl);
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
            if (!mounted) return;
            setState(() => _isProcessing = false);
            _showEuropepayReturnDialog(gatewayOrderId, amount);
            return;
          }
        }
        throw Exception('Europepay hosted checkout URL is currently unavailable');
      }

      // Branch B: Razorpay SDK Checkout
      final razorpayOrderId = topupData['razorpay_order_id'] as String? ?? '';
      final keyId = topupData['key_id'] as String? ?? '';
      final amountInPaise = (topupData['amount'] as num?)?.toInt() ?? (amount * 100).toInt();

      _inFlightOrderId = razorpayOrderId;
      _inFlightAmount = amount;

      // 2. Fetch user profile for contact prefill
      String userPhone = '9876543210';
      String userEmail = 'customer@growplus.internal';
      try {
        final me = await ApiService.getMe();
        final profile = me['profile'];
        if (profile != null) {
          if (profile['phone'] != null && profile['phone'].toString().isNotEmpty) {
            userPhone = profile['phone'].toString();
          }
          if (profile['email'] != null && profile['email'].toString().isNotEmpty) {
            userEmail = profile['email'].toString();
          }
        }
      } catch (_) {}

      // 3. Launch Razorpay payment options
      final options = {
        'key': keyId,
        'amount': amountInPaise,
        'name': 'GrowPlus Rewards',
        'order_id': razorpayOrderId,
        'description': 'Add ${_currencyFormat.format(amount)} to Wallet',
        'prefill': {
          'contact': userPhone,
          'email': userEmail,
        },
        'theme': {
          'color': '#A66CFF',
        },
        'retry': {'enabled': true, 'max_count': 1},
      };

      _razorpay.open(options);
    } catch (e) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      _showErrorDialog(
        title: 'Top-Up Failed',
        message: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  void _showEuropepayReturnDialog(String orderRef, double amount) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF231044),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF3D1B75)),
        ),
        title: const Row(
          children: [
            Icon(Icons.open_in_browser_rounded, color: AppColors.purpleAccent),
            SizedBox(width: 10),
            Text(
              'Europepay Session Opened',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'A Europepay hosted checkout session has been opened to add ${_currencyFormat.format(amount)} to your wallet.',
              style: const TextStyle(color: Colors.white70, fontSize: 13),
            ),
            const SizedBox(height: 12),
            const Text(
              'Complete your payment in the browser window, then tap "Confirm Payment" below.',
              style: TextStyle(color: Color(0xFFCDBDEA), fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.redAccent)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.purpleAccent,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() => _isProcessing = true);
              try {
                final result = await ApiService.verifyWalletTopup(
                  provider: 'europepay',
                  paymentId: orderRef,
                  amount: amount,
                );
                if (!mounted) return;
                setState(() => _isProcessing = false);
                _showSuccessDialog(
                  amount: amount,
                  newBalance: result['balance'] != null
                      ? double.tryParse(result['balance'].toString()) ?? (_currentBalance + amount)
                      : _currentBalance + amount,
                  paymentId: orderRef,
                );
              } catch (e) {
                if (!mounted) return;
                setState(() => _isProcessing = false);
                _showErrorDialog(
                  title: 'Verification Incomplete',
                  message: e.toString().replaceAll('Exception: ', ''),
                );
              }
            },
            child: const Text('Confirm Payment'),
          ),
        ],
      ),
    );
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    final orderId = _inFlightOrderId ?? response.orderId;
    final amount = _inFlightAmount ?? _currentAmount ?? 500.0;

    if (orderId == null) {
      setState(() => _isProcessing = false);
      return;
    }

    try {
      // 4. Verify payment with backend & atomically credit wallet ledger
      final result = await ApiService.verifyWalletTopup(
        razorpayOrderId: orderId,
        razorpayPaymentId: response.paymentId ?? '',
        razorpaySignature: response.signature ?? '',
        amount: amount,
      );

      final newBalance = double.tryParse(result['balance']?.toString() ?? '') ?? (_currentBalance + amount);

      if (!mounted) return;
      setState(() {
        _isProcessing = false;
        _currentBalance = newBalance;
      });

      widget.onCreditsAdded?.call();

      _showSuccessDialog(
        amount: amount,
        newBalance: newBalance,
        paymentId: response.paymentId ?? 'N/A',
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      _showErrorDialog(
        title: 'Payment Verification Notice',
        message: 'Payment was captured but ledger synchronization encountered an issue: $e. Our backend webhook will verify and credit your wallet automatically.',
      );
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    if (!mounted) return;
    setState(() => _isProcessing = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          response.message?.isNotEmpty == true
              ? response.message!
              : 'Payment was cancelled or could not be completed.',
        ),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    debugPrint('External wallet chosen: ${response.walletName}');
  }

  void _showSuccessDialog({
    required double amount,
    required double newBalance,
    required String paymentId,
  }) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF231044),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: Color(0xFF5A2A9D), width: 1.5),
        ),
        title: Column(
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [Color(0xFF10B981), Color(0xFF059669)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF10B981).withOpacity(0.4),
                    blurRadius: 16,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Icon(Icons.check_rounded, color: Colors.white, size: 36),
            ),
            const SizedBox(height: 16),
            const Text(
              'Credits Added Successfully!',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 20,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${_currencyFormat.format(amount)} has been added to your shopping wallet balance.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFFCDBDEA), fontSize: 14),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFF30105F),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF4C248B)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Updated Balance',
                    style: TextStyle(color: Color(0xFFBDB0D8), fontSize: 14),
                  ),
                  Text(
                    _currencyFormat.format(newBalance),
                    style: const TextStyle(
                      color: Color(0xFFA66CFF),
                      fontWeight: FontWeight.w900,
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Transaction ID: $paymentId',
              style: const TextStyle(color: Color(0xFF8B7AA8), fontSize: 11),
            ),
          ],
        ),
        actions: [
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    Navigator.pop(context);
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF4C248B)),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Back to Home'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () async {
                    Navigator.pop(ctx);
                    Navigator.pop(context);
                    await _launchShoppingApp();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.purpleAccent,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Go Shopping', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showErrorDialog({required String title, required String message}) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF231044),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF3D1B75)),
        ),
        title: Row(
          children: [
            const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 24),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
              ),
            ),
          ],
        ),
        content: Text(
          message,
          style: const TextStyle(color: Color(0xFFCDBDEA), fontSize: 13, height: 1.4),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.purpleAccent,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _launchShoppingApp() async {
    await HandoffService.openShoppingApp(context);
  }

  @override
  Widget build(BuildContext context) {
    final displayAmount = _currentAmount ?? 0.0;

    return Scaffold(
      backgroundColor: AppColors.purpleBg,
      appBar: AppBar(
        backgroundColor: const Color(0xFF170A37),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Add Money',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.purpleAccent.withOpacity(0.18),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.purpleAccent.withOpacity(0.4)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.stars_rounded, color: AppColors.purpleAccent, size: 14),
                    SizedBox(width: 4),
                    Text(
                      'Store Credits',
                      style: TextStyle(
                        color: AppColors.purpleAccent,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Current Balance Card
                    _buildBalanceCard(),
                    const SizedBox(height: 24),

                    // 2. Select Amount Heading
                    const Text(
                      'Select Credit Package',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Choose a preset pack or enter custom credits (Min ₹500)',
                      style: TextStyle(
                        color: Color(0xFFBDB0D8),
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // 3. Preset Packages Grid
                    _buildPresetGrid(),
                    const SizedBox(height: 20),

                    // 4. Custom Amount Input
                    _buildCustomAmountInput(),
                    const SizedBox(height: 24),

                    // 5. Why Add Credits / Benefits
                    _buildBenefitsCard(),
                    const SizedBox(height: 20),

                    // 6. Regulatory & Terms disclosure
                    _buildRegulatoryNotice(),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),

            // Sticky Bottom CTA Dock
            _buildBottomDock(displayAmount),
          ],
        ),
      ),
    );
  }

  Widget _buildBalanceCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF38146D), Color(0xFF1D0B3D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF552899), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFA66CFF).withOpacity(0.15),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.purpleAccent.withOpacity(0.18),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.purpleAccent.withOpacity(0.3)),
            ),
            child: const Icon(
              Icons.account_balance_wallet_rounded,
              color: AppColors.purpleAccent,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'CURRENT SHOPPING WALLET',
                  style: TextStyle(
                    color: Color(0xFFCDBDEA),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 4),
                _isLoadingBalance
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppColors.purpleAccent,
                        ),
                      )
                    : Text(
                        _currencyFormat.format(_currentBalance),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                const SizedBox(height: 4),
                const Text(
                  'Usable 100% on GrowPlus Shopping orders',
                  style: TextStyle(
                    color: Color(0xFFA66CFF),
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPresetGrid() {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: _presetAmounts.map((amt) {
        final isSelected = !_isCustom && _selectedPreset == amt;
        final isPopular = amt == 2800;

        return InkWell(
          onTap: () => _selectPreset(amt),
          borderRadius: BorderRadius.circular(14),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isSelected ? const Color(0xFF3C1877) : const Color(0xFF231044),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isSelected ? AppColors.purpleAccent : const Color(0xFF3D1B75),
                width: isSelected ? 2.0 : 1.0,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: AppColors.purpleAccent.withOpacity(0.3),
                        blurRadius: 10,
                        spreadRadius: 1,
                      ),
                    ]
                  : null,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isPopular) ...[
                  Container(
                    margin: const EdgeInsets.only(right: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF007A),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'POPULAR',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
                Text(
                  '₹$amt',
                  style: TextStyle(
                    color: isSelected ? Colors.white : const Color(0xFFCDBDEA),
                    fontSize: 15,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildCustomAmountInput() {
    final isSelected = _isCustom;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF231044),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected ? AppColors.purpleAccent : const Color(0xFF3D1B75),
          width: isSelected ? 1.5 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Custom Amount',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
              if (isSelected)
                const Text(
                  'Editing custom value',
                  style: TextStyle(
                    color: AppColors.purpleAccent,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _customController,
            keyboardType: const TextInputType.numberWithOptions(decimal: false),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
            onTap: _enableCustom,
            onChanged: _onCustomChanged,
            decoration: InputDecoration(
              prefixText: '₹ ',
              prefixStyle: const TextStyle(
                color: AppColors.purpleAccent,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
              hintText: 'Enter amount (min ₹500)',
              hintStyle: const TextStyle(color: Color(0xFF8B7AA8), fontSize: 14),
              filled: true,
              fillColor: const Color(0xFF170A37),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              suffixIcon: _customController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, color: Color(0xFF8B7AA8), size: 18),
                      onPressed: () {
                        _customController.clear();
                        _onCustomChanged('');
                      },
                    )
                  : null,
            ),
          ),
          if (_errorMessage != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 14),
                const SizedBox(width: 6),
                Text(
                  _errorMessage!,
                  style: const TextStyle(color: AppColors.error, fontSize: 12),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBenefitsCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF1F0C3B),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF38146D)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.verified_rounded, color: AppColors.purpleAccent, size: 18),
              SizedBox(width: 8),
              Text(
                'Shopping Credits Benefits',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _buildBenefitRow(
            Icons.bolt_rounded,
            'Instant Activation',
            'Credits are added instantly to your wallet upon successful payment.',
          ),
          const SizedBox(height: 10),
          _buildBenefitRow(
            Icons.shopping_bag_outlined,
            '100% Usable on Shopping',
            'Apply your credits during checkout across all eligible products.',
          ),
          const SizedBox(height: 10),
          _buildBenefitRow(
            Icons.security_rounded,
            'Zero Extra Fees',
            'No transaction convenience fees or hidden charges applied.',
          ),
        ],
      ),
    );
  }

  Widget _buildBenefitRow(IconData icon, String title, String desc) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            color: AppColors.purpleAccent.withOpacity(0.15),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: AppColors.purpleAccent, size: 14),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                style: const TextStyle(
                  color: Color(0xFFBDB0D8),
                  fontSize: 11,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRegulatoryNotice() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF170A37),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF2E1556)),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline_rounded, color: Color(0xFF8B7AA8), size: 16),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'Shopping credits are promotional store credits redeemable exclusively for purchases on GrowPlus Shopping. Credits are non-transferable and non-withdrawable to bank accounts.',
              style: TextStyle(
                color: Color(0xFF8B7AA8),
                fontSize: 11,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomDock(double displayAmount) {
    final isValid = displayAmount >= 500 && _errorMessage == null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
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
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'TOTAL PAYABLE',
                      style: TextStyle(
                        color: Color(0xFF8B7AA8),
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.8,
                      ),
                    ),
                    Text(
                      '100% Converted to Credits',
                      style: TextStyle(
                        color: AppColors.purpleAccent,
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                Text(
                  isValid ? _currencyFormat.format(displayAmount) : '₹0.00',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: (_isProcessing || !isValid) ? null : _handleProceedToPay,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.purpleAccent,
                  disabledBackgroundColor: const Color(0xFF38146D).withOpacity(0.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: isValid ? 8 : 0,
                  shadowColor: const Color(0xFFA66CFF).withOpacity(0.5),
                ),
                child: _isProcessing
                    ? const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.2,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(width: 12),
                          Text(
                            'Securing Payment Session...',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                        ],
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.lock_outline_rounded, color: Colors.white, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            isValid
                                ? 'Proceed to Add Money • ${_currencyFormat.format(displayAmount)}'
                                : 'Select Minimum ₹500',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
