import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:uuid/uuid.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';

class CheckoutScreen extends StatefulWidget {
  final double? subtotal;
  final double? creditsApplied;
  final double? totalPayable;
  final List<dynamic>? cartItems;

  const CheckoutScreen({
    super.key,
    this.subtotal,
    this.creditsApplied,
    this.totalPayable,
    this.cartItems,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _nameController = TextEditingController(text: 'GrowPlus Customer');
  final _phoneController = TextEditingController(text: '9876543210');
  final _addressController = TextEditingController(text: '123 Commercial Hub, MG Road');
  final _cityController = TextEditingController(text: 'Bengaluru');
  final _stateController = TextEditingController(text: 'Karnataka');
  final _pincodeController = TextEditingController(text: '560001');

  bool _loading = true;
  bool _processing = false;
  late Razorpay _razorpay;

  // Cart & Financial state
  List<dynamic> _items = [];
  double _productTotal = 0.0;
  final double _deliveryCharge = 0.0; // FREE delivery
  final double _applicableDiscount = 0.0;
  double _availableCredits = 0.0;

  // Wallet slider & toggle
  bool _applyCredits = true;
  double _creditsToApply = 0.0;

  // Selected Payment Method: 'razorpay_all', 'upi', 'cards', 'netbanking'
  String _selectedPaymentMethod = 'razorpay_all';

  // In-flight order tracking
  String? _inFlightOrderId;
  String? _inFlightOrderNumber;
  String? _currentIdempotencyKey;

  @override
  void initState() {
    super.initState();
    _initRazorpay();
    _loadCheckoutData();
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
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    super.dispose();
  }

  Future<void> _loadCheckoutData() async {
    setState(() => _loading = true);
    try {
      // 1. Load cart items
      if (widget.cartItems != null && widget.cartItems!.isNotEmpty) {
        _items = List.from(widget.cartItems!);
        _productTotal = widget.subtotal ?? _computeSubtotal(_items);
      } else {
        final cart = await ApiService.getCart();
        _items = (cart['cart_items'] as List?) ?? [];
        _productTotal = _computeSubtotal(_items);
      }

      // Preload user profile info if available
      try {
        final me = await ApiService.getMe();
        if (me != null) {
          final profile = me['profile'];
          if (profile != null) {
            if (profile['full_name'] != null && profile['full_name'].toString().isNotEmpty) {
              _nameController.text = profile['full_name'];
            }
            if (profile['phone'] != null && profile['phone'].toString().isNotEmpty) {
              _phoneController.text = profile['phone'];
            }
          }
        }
      } catch (_) {}

      // 2. Load latest verified wallet balance from server ledger
      try {
        final wallet = await ApiService.getWallet();
        _availableCredits = double.tryParse(wallet['balance']?.toString() ?? '0') ?? 0.0;
      } catch (e) {
        debugPrint('Could not fetch wallet balance: $e');
        _availableCredits = 0.0;
      }

      // Initialize credits to apply (default: maximum permitted)
      final maxPermitted = min(_availableCredits, _orderTotal);
      _creditsToApply = _applyCredits ? maxPermitted : 0.0;
    } catch (e) {
      debugPrint('Error loading checkout data: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  double _computeSubtotal(List<dynamic> items) {
    return items.fold<double>(0.0, (sum, item) {
      final price = double.tryParse(item['unit_price']?.toString() ?? '0') ?? 0.0;
      final qty = int.tryParse(item['quantity']?.toString() ?? '1') ?? 1;
      return sum + (price * qty);
    });
  }

  // Final Order Total = Product Total + Delivery - Discounts
  double get _orderTotal => max(0.0, _productTotal + _deliveryCharge - _applicableDiscount);

  // Permitted maximum credits: cannot exceed order total and cannot exceed available balance
  double get _maxEligibleCredits => min(_availableCredits, _orderTotal);

  // Clamped Applied Credits
  double get _effectiveCreditsApplied {
    if (!_applyCredits || _availableCredits <= 0) return 0.0;
    return max(0.0, min(_creditsToApply, _maxEligibleCredits));
  }

  // FORMULA: Remaining Payment = Order Total - Applied Credits
  double get _remainingPayment => max(0.0, _orderTotal - _effectiveCreditsApplied);

  // Remaining credits after purchase
  double get _remainingWalletCredits => max(0.0, _availableCredits - _effectiveCreditsApplied);

  // Dynamic Payment Button Handler
  Future<void> _handlePayment() async {
    if (_nameController.text.trim().isEmpty ||
        _phoneController.text.trim().isEmpty ||
        _addressController.text.trim().isEmpty ||
        _pincodeController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fill in complete delivery destination information'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _processing = true);

    // Create server-side unique idempotency key
    _currentIdempotencyKey = const Uuid().v4();

    try {
      final shippingAddress = {
        'name': _nameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'address_line': _addressController.text.trim(),
        'city': _cityController.text.trim(),
        'state': _stateController.text.trim(),
        'pincode': _pincodeController.text.trim(),
      };

      // 1. Request order creation from backend (Atomic stock check & wallet ledger deduction)
      final orderResult = await ApiService.createOrder(
        shippingAddress: shippingAddress,
        creditsToApply: _effectiveCreditsApplied,
        notes: 'Checkout via GrowPlus Mobile/Web',
      );

      final orderId = orderResult['id'] as String;
      final orderNumber = orderResult['order_number'] as String? ?? 'Order';
      _inFlightOrderId = orderId;
      _inFlightOrderNumber = orderNumber;

      // 2. Zero Remaining Balance (Credits-Only Checkout):
      // Backend automatically marked order as paid and verified. Show confirmation directly!
      if (_remainingPayment == 0) {
        if (!mounted) return;
        setState(() => _processing = false);
        _showOrderSuccessDialog(orderNumber, isCreditsOnly: true);
        return;
      }

      // 3. Positive Remaining Balance: Request payment session from backend active gateway
      final paymentOrder = await ApiService.createPaymentOrder(orderId);
      final provider = paymentOrder['provider'] as String? ?? 'razorpay';
      final gatewayType = paymentOrder['gateway_type'] as String? ?? 'sdk';

      // Branch A: Hosted Checkout (EuropeanPay / Open Banking)
      if (provider == 'europepay' || gatewayType == 'hosted_checkout') {
        final checkoutUrl = paymentOrder['checkout_url'] as String? ?? '';
        if (checkoutUrl.isNotEmpty) {
          final uri = Uri.parse(checkoutUrl);
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
            if (!mounted) return;
            setState(() => _processing = false);
            _showHostedPaymentReturnDialog(orderId, orderNumber, paymentOrder['razorpay_order_id']);
            return;
          }
        }
        throw Exception('EuropeanPay hosted checkout URL is currently unavailable');
      }

      // Branch B: Native SDK Checkout (Razorpay)
      final razorpayOrderId = paymentOrder['razorpay_order_id'];
      final keyId = paymentOrder['key_id'];

      final options = {
        'key': keyId,
        'amount': paymentOrder['amount'], // paise from backend
        'name': 'GrowPlus Shopping',
        'order_id': razorpayOrderId,
        'description': 'Payment for Order #$orderNumber',
        'prefill': {
          'contact': _phoneController.text.trim(),
        },
        'theme': {
          'color': '#A66CFF',
        },
      };

      // Open Razorpay SDK checkout
      _razorpay.open(options);
    } catch (e) {
      if (!mounted) return;
      setState(() => _processing = false);
      _showPaymentFailureDialog(
        title: 'Order Submission Notice',
        message: e.toString().replaceFirst('Exception: ', ''),
        canRetry: true,
      );
    }
  }

  // Razorpay Success Callback
  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    if (_inFlightOrderId == null) return;

    try {
      // Step 4 & 5: Verify signature on backend server before confirming!
      await ApiService.verifyPayment(
        orderId: _inFlightOrderId!,
        razorpayOrderId: response.orderId ?? '',
        razorpayPaymentId: response.paymentId ?? '',
        razorpaySignature: response.signature ?? '',
      );

      if (!mounted) return;
      setState(() => _processing = false);
      _showOrderSuccessDialog(_inFlightOrderNumber ?? 'Order', isCreditsOnly: false);
    } catch (e) {
      // Server verification failed
      await _handleFailedPayment('Server signature verification failed: $e');
    }
  }

  // Razorpay Error Callback
  void _handlePaymentError(PaymentFailureResponse response) async {
    await _handleFailedPayment(response.message ?? 'Payment was cancelled or could not be completed.');
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    debugPrint('External Wallet Selected: ${response.walletName}');
  }

  // Failure / Cancellation / Timeout Handler with automatic credit restoration
  Future<void> _handleFailedPayment(String failureReason) async {
    if (!mounted) return;
    setState(() => _processing = true);

    try {
      if (_inFlightOrderId != null) {
        // Restore reserved credits atomically via backend
        await ApiService.reportPaymentFailure(
          orderId: _inFlightOrderId!,
          reason: failureReason,
          idempotencyKey: _currentIdempotencyKey,
        );
      }
    } catch (e) {
      debugPrint('Error reporting payment failure: $e');
    } finally {
      if (mounted) {
        setState(() => _processing = false);
        _showPaymentFailureDialog(
          title: 'Payment Incomplete',
          message: '$failureReason\n\nAny reserved shopping credits have been restored to your wallet.',
          canRetry: true,
        );
      }
    }
  }

  void _showHostedPaymentReturnDialog(String orderId, String orderNumber, String? paymentRef) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.purpleSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.purpleBorder),
        ),
        title: const Row(
          children: [
            Icon(Icons.open_in_browser_rounded, color: AppColors.purpleAccent),
            SizedBox(width: 10),
            Text('Payment Session Opened', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'A EuropeanPay hosted payment session has been opened for Order #$orderNumber.',
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
            onPressed: () {
              Navigator.pop(ctx);
              _handleFailedPayment('User cancelled hosted payment session');
            },
            child: const Text('Cancel Payment', style: TextStyle(color: Colors.redAccent)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.purpleAccent,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() => _processing = true);
              try {
                await ApiService.verifyEuropepayPayment(orderId: orderId, paymentId: paymentRef);
                if (!mounted) return;
                setState(() => _processing = false);
                _showOrderSuccessDialog(orderNumber, isCreditsOnly: false);
              } catch (e) {
                await _handleFailedPayment('Payment verification incomplete: $e');
              }
            },
            child: const Text('Confirm Payment'),
          ),
        ],
      ),
    );
  }

  void _showOrderSuccessDialog(String orderNumber, {required bool isCreditsOnly}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.purpleSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.purpleBorder),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded, color: Color(0xFF34D399), size: 26),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Order Confirmed!',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Order Number: #$orderNumber', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.purpleAccent)),
            const SizedBox(height: 8),
            Text(
              isCreditsOnly
                ? 'Your order was fully covered using your store shopping credits. Order fulfillment is now in progress!'
                : 'Payment verified successfully via Razorpay. Your order has been placed and is being prepared for dispatch.',
              style: const TextStyle(fontSize: 12.5, color: AppColors.textPurpleSecondary, height: 1.4),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.of(context).pop(true);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.purpleAccent,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('View Orders', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showPaymentFailureDialog({required String title, required String message, bool canRetry = true}) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.purpleSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.purpleBorder),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.error_outline_rounded, color: Color(0xFFF87171), size: 26),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
              ),
            ),
          ],
        ),
        content: Text(
          message,
          style: const TextStyle(fontSize: 12.5, color: AppColors.textPurpleSecondary, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Dismiss', style: TextStyle(color: AppColors.textPurpleSecondary)),
          ),
          if (canRetry)
            ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                _handlePayment();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.purpleAccent,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Retry Payment', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.purpleBg,
      appBar: AppBar(
        title: const Text(
          'Secure Checkout',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
        ),
        backgroundColor: AppColors.purpleBg,
        elevation: 0,
        centerTitle: false,
        iconTheme: const IconThemeData(color: Colors.white),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppColors.purpleBorder, height: 1),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.purpleAccent))
          : SafeArea(
              child: Column(
                children: [
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        // SECTION 1 — ORDER SUMMARY
                        _buildSectionHeader(Icons.shopping_bag_outlined, 'ORDER SUMMARY'),
                        const SizedBox(height: 10),
                        _buildOrderSummaryCard(),

                        const SizedBox(height: 20),

                        // SECTION 2 — SHOPPING WALLET & CREDITS ELIGIBILITY
                        _buildSectionHeader(Icons.account_balance_wallet_outlined, 'STORE CREDITS & WALLET'),
                        const SizedBox(height: 10),
                        _buildShoppingWalletCard(),

                        const SizedBox(height: 20),

                        // SECTION 3 — PAYMENT CALCULATION
                        _buildSectionHeader(Icons.calculate_outlined, 'PAYMENT CALCULATION'),
                        const SizedBox(height: 10),
                        _buildPaymentCalculationCard(),

                        const SizedBox(height: 20),

                        // DELIVERY DESTINATION
                        _buildSectionHeader(Icons.location_on_outlined, 'DELIVERY DESTINATION'),
                        const SizedBox(height: 10),
                        _buildShippingAddressCard(),

                        const SizedBox(height: 20),

                        // SECTION 4 — PAYMENT OPTIONS
                        _buildSectionHeader(Icons.payment_outlined, 'PAYMENT METHOD'),
                        const SizedBox(height: 10),
                        _buildPaymentOptionsSection(),

                        const SizedBox(height: 30),
                      ],
                    ),
                  ),

                  // SECTION 5 — FINAL PAYMENT BUTTON DOCK
                  _buildBottomPaymentDock(),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionHeader(IconData icon, String title) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.purpleAccent),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.6,
            color: AppColors.purpleAccent,
          ),
        ),
      ],
    );
  }

  // SECTION 1 — ORDER SUMMARY WIDGET
  Widget _buildOrderSummaryCard() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.purpleSurface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.purpleBorder),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Items List
          if (_items.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Text('No cart items selected', style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 13)),
            )
          else
            ..._items.map((item) {
              final product = item['products'] ?? {};
              final images = product['product_images'] as List?;
              final imageUrl = images?.isNotEmpty == true ? images![0]['url'] : null;
              final name = product['name'] ?? item['product_name'] ?? 'Product';
              final price = double.tryParse(item['unit_price']?.toString() ?? '0') ?? 0.0;
              final qty = int.tryParse(item['quantity']?.toString() ?? '1') ?? 1;
              final lineTotal = price * qty;

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: const Color(0xFF170A37),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.purpleBorder),
                      ),
                      child: imageUrl != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Image.network(imageUrl, fit: BoxFit.cover),
                            )
                          : const Icon(Icons.shopping_bag_outlined, color: AppColors.textPurpleMuted, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            'Qty: $qty × ₹${price.toStringAsFixed(2)}',
                            style: const TextStyle(fontSize: 11, color: AppColors.textPurpleSecondary),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '₹${lineTotal.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                    ),
                  ],
                ),
              );
            }),

          const Divider(height: 20, color: AppColors.purpleBorder),

          // Price Breakdown
          _buildSummaryRow('Product Subtotal', '₹${_productTotal.toStringAsFixed(2)}'),
          const SizedBox(height: 6),
          _buildSummaryRow(
            'Delivery Charges',
            _deliveryCharge == 0 ? 'FREE' : '₹${_deliveryCharge.toStringAsFixed(2)}',
            valueColor: const Color(0xFF34D399),
          ),
          if (_applicableDiscount > 0) ...[
            const SizedBox(height: 6),
            _buildSummaryRow(
              'Applicable Discounts',
              '- ₹${_applicableDiscount.toStringAsFixed(2)}',
              valueColor: const Color(0xFF34D399),
            ),
          ],
          const SizedBox(height: 8),
          const Divider(height: 16, color: AppColors.purpleBorder),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Final Order Total', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Colors.white)),
              Text(
                '₹${_orderTotal.toStringAsFixed(2)}',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF34D399)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // SECTION 2 — SHOPPING WALLET & ZERO-BALANCE HANDLING (TASK 3)
  Widget _buildShoppingWalletCard() {
    // CONDITION A: Wallet balance is ZERO
    if (_availableCredits <= 0) {
      return Container(
        decoration: BoxDecoration(
          color: AppColors.purpleSurface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.purpleBorder),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.stars_rounded, color: AppColors.purpleAccent, size: 20),
                SizedBox(width: 8),
                Text(
                  'Store Shopping Credits',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF170A37),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.purpleBorder),
              ),
              child: Column(
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Available Shopping Credits:', style: TextStyle(fontSize: 12, color: AppColors.textPurpleSecondary)),
                      Text('₹0.00', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Pay with Razorpay:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                      Text(
                        '₹${_orderTotal.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF34D399)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.purpleAccent.withOpacity(0.08),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.purpleAccent.withOpacity(0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, size: 14, color: AppColors.purpleAccent),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'No promotional credits available. You can complete your order securely using Razorpay (UPI, Cards, Netbanking).',
                      style: TextStyle(fontSize: 11, color: AppColors.textPurpleSecondary, height: 1.35),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // CONDITION B: Positive wallet balance available
    return Container(
      decoration: BoxDecoration(
        color: AppColors.purpleSurface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: _applyCredits ? const Color(0xFF34D399).withOpacity(0.6) : AppColors.purpleBorder),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Available Shopping Credits', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textPurpleSecondary)),
                  const SizedBox(height: 2),
                  Text(
                    '₹${_availableCredits.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF34D399)),
                  ),
                ],
              ),
              Row(
                children: [
                  Text(
                    _applyCredits ? 'Applied' : 'Apply Credits',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: _applyCredits ? const Color(0xFF34D399) : AppColors.textPurpleSecondary,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Switch.adaptive(
                    value: _applyCredits,
                    activeColor: const Color(0xFF34D399),
                    onChanged: (val) {
                      setState(() {
                        _applyCredits = val;
                        if (val && _creditsToApply == 0) {
                          _creditsToApply = _maxEligibleCredits;
                        }
                      });
                    },
                  ),
                ],
              ),
            ],
          ),

          if (_applyCredits) ...[
            const Divider(height: 20, color: AppColors.purpleBorder),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Credits Amount to Apply',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                Text(
                  '₹${_effectiveCreditsApplied.toStringAsFixed(2)}',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF34D399)),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Dynamic Slider to adjust credits (up to max eligible)
            if (_maxEligibleCredits > 0) ...[
              SliderTheme(
                data: SliderTheme.of(context).copyWith(
                  activeTrackColor: const Color(0xFF34D399),
                  inactiveTrackColor: const Color(0xFF170A37),
                  thumbColor: const Color(0xFF34D399),
                  overlayColor: const Color(0xFF34D399).withOpacity(0.12),
                  trackHeight: 6,
                ),
                child: Slider(
                  value: _effectiveCreditsApplied,
                  min: 0,
                  max: _maxEligibleCredits,
                  divisions: _maxEligibleCredits > 10 ? _maxEligibleCredits.toInt() : null,
                  onChanged: (val) {
                    setState(() {
                      _creditsToApply = val;
                    });
                  },
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildQuickCreditChip('None (₹0)', 0),
                  _buildQuickCreditChip('50% (₹${(_maxEligibleCredits * 0.5).toStringAsFixed(0)})', _maxEligibleCredits * 0.5),
                  _buildQuickCreditChip('Max (₹${_maxEligibleCredits.toStringAsFixed(0)})', _maxEligibleCredits),
                ],
              ),
            ],

            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF170A37),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.purpleBorder),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Remaining Credits After Purchase', style: TextStyle(fontSize: 11, color: AppColors.textPurpleSecondary)),
                  Text(
                    '₹${_remainingWalletCredits.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildQuickCreditChip(String label, double amount) {
    final isSelected = (_effectiveCreditsApplied - amount).abs() < 0.5;
    return GestureDetector(
      onTap: () {
        setState(() {
          _applyCredits = true;
          _creditsToApply = amount;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF34D399) : const Color(0xFF170A37),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isSelected ? const Color(0xFF34D399) : AppColors.purpleBorder),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10.5,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.black : AppColors.textPurpleSecondary,
          ),
        ),
      ),
    );
  }

  // SECTION 3 — AUTHORITATIVE PAYMENT CALCULATION
  Widget _buildPaymentCalculationCard() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.purpleSurface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.purpleBorder),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Dynamic Calculation Formula', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textPurpleSecondary)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.18),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text('Server Authoritative', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF34D399))),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Remaining Payment = Order Payable - Applied Credits',
            style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: AppColors.textPurpleSecondary),
          ),
          const SizedBox(height: 12),
          const Divider(color: AppColors.purpleBorder),
          const SizedBox(height: 6),

          _buildCalculationRow('Order Payable Total', '₹${_orderTotal.toStringAsFixed(2)}'),
          const SizedBox(height: 6),
          _buildCalculationRow('Available Wallet Credits', '₹${_availableCredits.toStringAsFixed(2)}'),
          const SizedBox(height: 6),
          _buildCalculationRow(
            'Credits Applied by Backend',
            '- ₹${_effectiveCreditsApplied.toStringAsFixed(2)}',
            valueColor: const Color(0xFF34D399),
          ),

          const SizedBox(height: 8),
          const Divider(color: AppColors.purpleBorder),
          const SizedBox(height: 6),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Net Razorpay Payable',
                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Colors.white),
              ),
              Text(
                '₹${_remainingPayment.toStringAsFixed(2)}',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 17,
                  color: _remainingPayment == 0 ? const Color(0xFF34D399) : Colors.white,
                ),
              ),
            ],
          ),

          if (_remainingPayment == 0) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check_circle_rounded, color: Color(0xFF34D399), size: 16),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '100% of this order is covered by promotional credits. Zero external gateway payment required.',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF34D399)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCalculationRow(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textPurpleSecondary)),
        Text(
          value,
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: valueColor ?? Colors.white),
        ),
      ],
    );
  }

  // DELIVERY DESTINATION FORM
  Widget _buildShippingAddressCard() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.purpleSurface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.purpleBorder),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildAddressField('Recipient Full Name', _nameController, Icons.person_outline),
          const SizedBox(height: 10),
          _buildAddressField('Contact Mobile Number', _phoneController, Icons.phone_outlined, keyboardType: TextInputType.phone),
          const SizedBox(height: 10),
          _buildAddressField('Street Address / Building', _addressController, Icons.home_outlined),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _buildAddressField('City', _cityController, Icons.location_city_outlined)),
              const SizedBox(width: 10),
              Expanded(child: _buildAddressField('PIN Code', _pincodeController, Icons.pin_drop_outlined, keyboardType: TextInputType.number)),
            ],
          ),
          const SizedBox(height: 10),
          _buildAddressField('State', _stateController, Icons.map_outlined),
        ],
      ),
    );
  }

  Widget _buildAddressField(
    String label,
    TextEditingController controller,
    IconData icon, {
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textPurpleSecondary)),
        const SizedBox(height: 4),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFF170A37),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.purpleBorder),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
              prefixIcon: Icon(icon, size: 16, color: AppColors.purpleAccent),
              border: InputBorder.none,
            ),
          ),
        ),
      ],
    );
  }

  // SECTION 4 — PAYMENT METHOD SELECTOR
  Widget _buildPaymentOptionsSection() {
    if (_remainingPayment == 0) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF10B981).withOpacity(0.12),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
        ),
        child: const Row(
          children: [
            Icon(Icons.stars_rounded, color: Color(0xFF34D399), size: 24),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Pay Using Store Credits',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF34D399)),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Instant verified checkout. No external payment gateway will be opened.',
                    style: TextStyle(fontSize: 11, color: AppColors.textPurpleSecondary),
                  ),
                ],
              ),
            ),
            Icon(Icons.check_circle_rounded, color: Color(0xFF34D399), size: 20),
          ],
        ),
      );
    }

    return Column(
      children: [
        _buildPaymentMethodCard(
          id: 'razorpay_all',
          title: 'Razorpay Secure Gateway',
          subtitle: 'UPI (GPay/PhonePe), Debit/Credit Cards, Net Banking',
          icon: Icons.shield_outlined,
          isRecommended: true,
        ),
        const SizedBox(height: 10),
        _buildPaymentMethodCard(
          id: 'upi',
          title: 'Instant UPI',
          subtitle: 'Google Pay, PhonePe, Paytm, BHIM UPI',
          icon: Icons.qr_code_rounded,
        ),
        const SizedBox(height: 10),
        _buildPaymentMethodCard(
          id: 'cards',
          title: 'Debit / Credit Cards',
          subtitle: 'Visa, Mastercard, RuPay',
          icon: Icons.credit_card_rounded,
        ),
        const SizedBox(height: 12),
        const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lock_outline_rounded, size: 12, color: AppColors.textPurpleSecondary),
            SizedBox(width: 4),
            Text(
              'Secured with 256-bit encryption & Razorpay compliant gateway',
              style: TextStyle(fontSize: 10.5, color: AppColors.textPurpleSecondary),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPaymentMethodCard({
    required String id,
    required String title,
    required String subtitle,
    required IconData icon,
    bool isRecommended = false,
  }) {
    final isSelected = _selectedPaymentMethod == id;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedPaymentMethod = id);
      },
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.purpleSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.purpleAccent : AppColors.purpleBorder,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.purpleAccent.withOpacity(0.18) : const Color(0xFF170A37),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: isSelected ? AppColors.purpleAccent : AppColors.textPurpleSecondary, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : AppColors.textPurpleSecondary,
                        ),
                      ),
                      if (isRecommended) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('Recommended', style: TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 10.5, color: AppColors.textPurpleSecondary)),
                ],
              ),
            ),
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: isSelected ? AppColors.purpleAccent : AppColors.textPurpleSecondary,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  // SECTION 5 — FINAL PAYMENT BUTTON DOCK
  Widget _buildBottomPaymentDock() {
    final buttonText = _remainingPayment == 0
        ? 'Pay Using Store Credits'
        : 'Pay with Razorpay: ₹${_remainingPayment.toStringAsFixed(2)}';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: const BoxDecoration(
        color: AppColors.purpleSurface,
        border: Border(top: BorderSide(color: AppColors.purpleBorder)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total Amount Payable', style: TextStyle(fontSize: 11, color: AppColors.textPurpleSecondary)),
                  Text(
                    '₹${_remainingPayment.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF34D399)),
                  ),
                ],
              ),
              if (_effectiveCreditsApplied > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.18),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '₹${_effectiveCreditsApplied.toStringAsFixed(2)} Credits Applied',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF34D399)),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: _processing ? null : _handlePayment,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.purpleAccent,
                foregroundColor: Colors.white,
                elevation: 3,
                shadowColor: AppColors.purpleAccent.withOpacity(0.4),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: _processing
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(_remainingPayment == 0 ? Icons.check_circle_outline : Icons.lock_outline, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          buttonText,
                          style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold, letterSpacing: 0.3),
                        ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textPurpleSecondary)),
        Text(
          value,
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: valueColor ?? Colors.white),
        ),
      ],
    );
  }
}
