import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';
import '../../cart/screens/cart_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  bool _loading = true;
  Map<String, dynamic>? _product;
  int _quantity = 1;
  bool _addingToCart = false;

  @override
  void initState() {
    super.initState();
    _loadProduct();
  }

  Future<void> _loadProduct() async {
    setState(() => _loading = true);
    try {
      final p = await ApiService.getProductById(widget.productId);
      if (mounted) setState(() => _product = p);
    } catch (e) {
      debugPrint('Error loading product: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _addToCart({bool navigate = false}) async {
    setState(() => _addingToCart = true);
    try {
      await ApiService.addToCart(productId: widget.productId, quantity: _quantity);
      if (mounted) {
        if (navigate) {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen()));
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Added to shopping cart!'),
              backgroundColor: AppColors.purpleAccent,
              duration: Duration(seconds: 1),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _addingToCart = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: AppColors.purpleBg,
        body: Center(child: CircularProgressIndicator(color: AppColors.purpleAccent)),
      );
    }

    if (_product == null) {
      return Scaffold(
        backgroundColor: AppColors.purpleBg,
        appBar: AppBar(backgroundColor: AppColors.purpleBg, iconTheme: const IconThemeData(color: Colors.white)),
        body: const Center(child: Text('Product not found', style: TextStyle(color: Colors.white))),
      );
    }

    final p = _product!;
    final name = p['name'] ?? '';
    final description = p['description'] ?? 'No description provided.';
    final price = p['selling_price'];
    final mrp = p['mrp'];
    final rawInv = p['inventory'];
    final int stock = rawInv is Map
        ? (rawInv['quantity'] ?? 0)
        : (rawInv is List && rawInv.isNotEmpty ? (rawInv[0]['quantity'] ?? 0) : 0);
    final isEligible = p['is_eligible_for_rewards'] == true;
    final images = p['product_images'] as List?;
    final imageUrl = images?.isNotEmpty == true ? images![0]['url'] : null;

    return Scaffold(
      backgroundColor: AppColors.purpleBg,
      appBar: AppBar(
        title: const Text('Product Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
        backgroundColor: AppColors.purpleBg,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen())),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image gallery
            Container(
              height: 300,
              width: double.infinity,
              color: const Color(0xFF170A37),
              child: imageUrl != null
                  ? Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Center(
                        child: Icon(Icons.broken_image_outlined, size: 64, color: AppColors.textPurpleMuted),
                      ),
                    )
                  : const Center(child: Icon(Icons.shopping_bag_outlined, size: 64, color: AppColors.textPurpleMuted)),
            ),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Rewards Eligibility Badge
                  if (isEligible)
                    Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.purpleAccent.withOpacity(0.18),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.purpleAccent.withOpacity(0.4)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.star, color: AppColors.purpleAccent, size: 14),
                          SizedBox(width: 5),
                          Text(
                            'ELIGIBLE FOR GROWPLUS REFERRAL REWARDS',
                            style: TextStyle(color: AppColors.purpleAccent, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),

                  // Title
                  Text(
                    name,
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 12),

                  // Pricing
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        '₹$price',
                        style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF34D399)),
                      ),
                      if (mrp != null && double.tryParse(mrp.toString())! > double.tryParse(price.toString())!) ...[
                        const SizedBox(width: 10),
                        Text(
                          '₹$mrp',
                          style: const TextStyle(
                            fontSize: 16,
                            color: AppColors.textPurpleMuted,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],
                    ],
                  ),

                  const SizedBox(height: 8),

                  // Stock indicator
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: stock > 0 ? const Color(0xFF10B981) : AppColors.error,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        stock > 0 ? 'In Stock ($stock available)' : 'Out of Stock',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: stock > 0 ? const Color(0xFF10B981) : AppColors.error,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 18),
                  const Divider(color: AppColors.purpleBorder),
                  const SizedBox(height: 14),

                  // Description
                  const Text('Description', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 8),
                  Text(
                    description,
                    style: const TextStyle(fontSize: 13, color: AppColors.textPurpleSecondary, height: 1.5),
                  ),

                  const SizedBox(height: 22),

                  // Quantity Selector
                  Row(
                    children: [
                      const Text('Quantity:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                      const SizedBox(width: 16),
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.purpleSurface,
                          border: Border.all(color: AppColors.purpleBorder),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove, size: 16, color: Colors.white),
                              onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                            ),
                            Text('$_quantity', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                            IconButton(
                              icon: const Icon(Icons.add, size: 16, color: Colors.white),
                              onPressed: _quantity < stock ? () => setState(() => _quantity++) : null,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 90),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: const BoxDecoration(
          color: AppColors.purpleSurface,
          border: Border(top: BorderSide(color: AppColors.purpleBorder)),
        ),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: (_addingToCart || stock <= 0) ? null : () => _addToCart(navigate: false),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: BorderSide(color: stock > 0 ? AppColors.purpleAccent : AppColors.purpleBorder),
                  foregroundColor: stock > 0 ? AppColors.purpleAccent : AppColors.textPurpleMuted,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text(stock > 0 ? 'Add to Cart' : 'Unavailable', style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: (_addingToCart || stock <= 0) ? null : () => _addToCart(navigate: true),
                style: ElevatedButton.styleFrom(
                  backgroundColor: stock > 0 ? AppColors.purpleAccent : AppColors.purpleBorder,
                  foregroundColor: stock > 0 ? Colors.white : AppColors.textPurpleMuted,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: stock > 0 ? 3 : 0,
                ),
                child: Text(stock > 0 ? 'Buy Now' : 'Out of Stock', style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
