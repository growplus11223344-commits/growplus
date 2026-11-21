import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';
import 'product_detail_screen.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  bool _loading = true;
  List<dynamic> _products = [];
  List<dynamic> _categories = [];
  String? _selectedCategory;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final cats = await ApiService.getCategories();
      final prods = await ApiService.getProducts(category: _selectedCategory, search: _searchController.text.trim());
      if (mounted) {
        setState(() {
          _categories = cats;
          _products = prods['products'] ?? [];
        });
      }
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.purpleBg,
      appBar: AppBar(
        title: const Text('Store Catalog', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
        backgroundColor: AppColors.purpleBg,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: AppColors.purpleSurface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.purpleBorder),
              ),
              child: TextField(
                controller: _searchController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: const InputDecoration(
                  hintText: 'Search catalog products...',
                  hintStyle: TextStyle(color: AppColors.textPurpleMuted, fontSize: 13),
                  prefixIcon: Icon(Icons.search, size: 20, color: AppColors.purpleAccent),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12),
                ),
                onSubmitted: (_) => _loadData(),
              ),
            ),
          ),

          // Category Chips
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length + 1,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (ctx, i) {
                if (i == 0) {
                  final isAll = _selectedCategory == null;
                  return ChoiceChip(
                    label: const Text('All Products'),
                    selected: isAll,
                    onSelected: (_) {
                      setState(() => _selectedCategory = null);
                      _loadData();
                    },
                    selectedColor: AppColors.purpleAccent,
                    backgroundColor: AppColors.purpleSurface,
                    side: BorderSide(color: isAll ? AppColors.purpleAccent : AppColors.purpleBorder),
                    labelStyle: TextStyle(
                      color: isAll ? Colors.white : AppColors.textPurpleSecondary,
                      fontWeight: isAll ? FontWeight.bold : FontWeight.normal,
                      fontSize: 12,
                    ),
                  );
                }
                final cat = _categories[i - 1];
                final isSelected = _selectedCategory == cat['slug'];
                return ChoiceChip(
                  label: Text(cat['name'] ?? ''),
                  selected: isSelected,
                  onSelected: (_) {
                    setState(() => _selectedCategory = cat['slug']);
                    _loadData();
                  },
                  selectedColor: AppColors.purpleAccent,
                  backgroundColor: AppColors.purpleSurface,
                  side: BorderSide(color: isSelected ? AppColors.purpleAccent : AppColors.purpleBorder),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textPurpleSecondary,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    fontSize: 12,
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 8),

          // Product list
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.purpleAccent))
                : _products.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.inventory_2_outlined, size: 48, color: AppColors.textPurpleMuted.withOpacity(0.5)),
                            const SizedBox(height: 12),
                            const Text('No products found', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                            const SizedBox(height: 4),
                            const Text('Try adjusting your search or category filter', style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 12)),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemCount: _products.length,
                        itemBuilder: (ctx, i) {
                          final p = _products[i];
                          final images = p['product_images'] as List?;
                          final imageUrl = images?.isNotEmpty == true ? images![0]['url'] : null;

                          return GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => ProductDetailScreen(productId: p['id'])),
                              );
                            },
                            child: Container(
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
                                    width: 72,
                                    height: 72,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF170A37),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: imageUrl != null
                                        ? ClipRRect(
                                            borderRadius: BorderRadius.circular(12),
                                            child: Image.network(
                                              imageUrl,
                                              fit: BoxFit.cover,
                                              errorBuilder: (_, __, ___) => const Icon(Icons.broken_image_outlined, color: AppColors.textPurpleMuted),
                                            ),
                                          )
                                        : const Icon(Icons.shopping_bag_outlined, color: AppColors.textPurpleMuted),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          p['name'] ?? '',
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          '₹${p['selling_price']}',
                                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF34D399)),
                                        ),
                                        if (p['is_eligible_for_rewards'] == true)
                                          const Padding(
                                            padding: EdgeInsets.only(top: 4),
                                            child: Text(
                                              '★ Eligible for Reward Credits',
                                              style: TextStyle(color: AppColors.purpleAccent, fontSize: 10.5, fontWeight: FontWeight.bold),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                  const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.purpleAccent, size: 14),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
