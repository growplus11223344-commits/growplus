import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';
import '../../orders/screens/checkout_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  bool _loading = true;
  Map<String, dynamic>? _cart;
  Map<String, dynamic>? _wallet;
  bool _applyCredits = true;

  @override
  void initState() {
    super.initState();
    _loadCart();
  }

  Future<void> _loadCart() async {
    setState(() => _loading = true);
    try {
      final cart = await ApiService.getCart();
      Map<String, dynamic>? wallet;
      try {
        wallet = await ApiService.getWallet();
      } catch (_) {}

      if (mounted) {
        setState(() {
          _cart = cart;
          _wallet = wallet;
        });
      }
    } catch (e) {
      debugPrint('Error loading cart: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _updateQuantity(String cartItemId, int newQty) async {
    try {
      await ApiService.updateCartItemQuantity(cartItemId: cartItemId, quantity: newQty);
      _loadCart();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  Future<void> _removeItem(String cartItemId) async {
    try {
      await ApiService.removeFromCart(cartItemId);
      _loadCart();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = (_cart?['cart_items'] as List?) ?? [];
    final subtotal = items.fold<double>(0.0, (sum, item) {
      final price = double.tryParse(item['unit_price']?.toString() ?? '0') ?? 0;
      final qty = int.tryParse(item['quantity']?.toString() ?? '1') ?? 1;
      return sum + (price * qty);
    });

    final walletBalance = double.tryParse(_wallet?['balance']?.toString() ?? '0') ?? 0.0;
    final creditsToApply = _applyCredits ? (subtotal < walletBalance ? subtotal : walletBalance) : 0.0;
    final totalPayable = (subtotal - creditsToApply) > 0 ? (subtotal - creditsToApply) : 0.0;

    return Scaffold(
      backgroundColor: AppColors.purpleBg,
      appBar: AppBar(
        title: const Text('Shopping Cart', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
        backgroundColor: AppColors.purpleBg,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.purpleAccent))
          : items.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.shopping_cart_outlined, size: 64, color: AppColors.textPurpleMuted.withOpacity(0.4)),
                      const SizedBox(height: 16),
                      const Text('Your cart is empty', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                      const SizedBox(height: 6),
                      const Text('Add eligible items to redeem your store credits', style: TextStyle(fontSize: 12, color: AppColors.textPurpleSecondary)),
                    ],
                  ),
                )
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Cart Items
                    ...items.map((item) {
                      final product = item['products'] ?? {};
                      final images = product['product_images'] as List?;
                      final imageUrl = images?.isNotEmpty == true ? images![0]['url'] : null;
                      final name = product['name'] ?? 'Product';
                      final price = item['unit_price'];
                      final qty = item['quantity'] ?? 1;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.purpleSurface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.purpleBorder),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                color: const Color(0xFF170A37),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: imageUrl != null
                                  ? ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: Image.network(
                                        imageUrl,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => const Icon(Icons.broken_image_outlined, color: AppColors.textPurpleMuted),
                                      ),
                                    )
                                  : const Icon(Icons.shopping_bag_outlined, color: AppColors.textPurpleMuted),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    name,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '₹$price',
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF34D399)),
                                  ),
                                ],
                              ),
                            ),
                            Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.remove_circle_outline, size: 18, color: AppColors.textPurpleSecondary),
                                  onPressed: () => qty > 1 ? _updateQuantity(item['id'], qty - 1) : _removeItem(item['id']),
                                ),
                                Text('$qty', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                                IconButton(
                                  icon: const Icon(Icons.add_circle_outline, size: 18, color: AppColors.purpleAccent),
                                  onPressed: () => _updateQuantity(item['id'], qty + 1),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, size: 18, color: Color(0xFFF87171)),
                                  onPressed: () => _removeItem(item['id']),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    }),

                    const SizedBox(height: 16),

                    // WALLET CREDITS REDEMPTION SECTION
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF30105F), Color(0xFF170A37)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppColors.purpleBorderLight),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.stars_rounded, color: AppColors.purpleAccent, size: 22),
                                  const SizedBox(width: 8),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'GrowPlus Store Credits',
                                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                                      ),
                                      Text(
                                        'Available balance: ₹${walletBalance.toStringAsFixed(2)}',
                                        style: const TextStyle(fontSize: 11, color: AppColors.textPurpleSecondary),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Switch(
                                value: _applyCredits && walletBalance > 0,
                                onChanged: walletBalance > 0
                                    ? (val) => setState(() => _applyCredits = val)
                                    : null,
                                activeColor: AppColors.purpleAccent,
                              ),
                            ],
                          ),
                          if (_applyCredits && walletBalance > 0) ...[
                            const SizedBox(height: 10),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withOpacity(0.18),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Credits Applied:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF34D399))),
                                  Text('- ₹${creditsToApply.toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF34D399))),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Bill Summary Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.purpleSurface,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppColors.purpleBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Order Summary', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white)),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Subtotal', style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 13)),
                              Text('₹${subtotal.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Promotional Credits', style: TextStyle(color: Color(0xFF34D399), fontSize: 13, fontWeight: FontWeight.w600)),
                              Text('- ₹${creditsToApply.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF34D399))),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Delivery Fee', style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 13)),
                              Text('FREE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF34D399))),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Divider(color: AppColors.purpleBorder),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Amount Payable', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Colors.white)),
                              Text(
                                '₹${totalPayable.toStringAsFixed(2)}',
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF34D399)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Proceed to Checkout Button
                    ElevatedButton(
                      onPressed: items.isEmpty
                          ? null
                          : () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => CheckoutScreen(
                                    subtotal: subtotal,
                                    creditsApplied: creditsToApply,
                                    totalPayable: totalPayable,
                                    cartItems: items,
                                  ),
                                ),
                              ).then((_) => _loadCart());
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.purpleAccent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 4,
                        shadowColor: AppColors.purpleAccent.withOpacity(0.4),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            totalPayable == 0 ? 'Checkout with Store Credits' : 'Proceed to Checkout (₹${totalPayable.toStringAsFixed(2)})',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.arrow_forward, size: 18),
                        ],
                      ),
                    ),

                    const SizedBox(height: 40),
                  ],
                ),
    );
  }
}
