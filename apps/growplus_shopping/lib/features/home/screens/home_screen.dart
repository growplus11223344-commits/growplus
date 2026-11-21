import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';
import '../../products/screens/products_screen.dart';
import '../../cart/screens/cart_screen.dart';
import '../../orders/screens/orders_screen.dart';
import '../../products/screens/product_detail_screen.dart';
import '../../profile/screens/shopping_profile_screen.dart';
import '../../wallet/screens/shopping_wallet_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  bool _loading = true;
  List<dynamic> _categories = [];
  List<dynamic> _products = [];
  Map<String, dynamic>? _wallet;
  int _cartItemCount = 0;
  String? _selectedCategorySlug;
  final TextEditingController _searchController = TextEditingController();

  final _currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);

  @override
  void initState() {
    super.initState();
    _loadStoreData();
  }

  Future<void> _loadStoreData() async {
    setState(() => _loading = true);
    try {
      final cats = await ApiService.getCategories();
      final prodsData = await ApiService.getProducts(category: _selectedCategorySlug);

      Map<String, dynamic>? wallet;
      int cartCount = 0;
      try {
        wallet = await ApiService.getWallet();
        final cart = await ApiService.getCart();
        cartCount = (cart['cart_items'] as List?)?.length ?? 0;
      } catch (_) {}

      if (mounted) {
        setState(() {
          _categories = cats;
          _products = prodsData['products'] ?? [];
          _wallet = wallet;
          _cartItemCount = cartCount;
        });
      }
    } catch (e) {
      debugPrint('Error loading store: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleAddToCart(String productId) async {
    try {
      await ApiService.addToCart(productId: productId, quantity: 1);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Item added to cart!'),
          backgroundColor: AppColors.purpleAccent,
          duration: Duration(seconds: 1),
        ),
      );
      _loadStoreData();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      _buildStoreHome(),
      const ProductsScreen(),
      const CartScreen(),
      const OrdersScreen(),
      ShoppingProfileScreen(
        onNavigateToOrders: () => setState(() => _currentIndex = 3),
      ),
    ];

    return Scaffold(
      backgroundColor: AppColors.purpleBg,
      body: screens[_currentIndex],
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          backgroundColor: AppColors.purpleSurface,
          indicatorColor: AppColors.purpleAccent.withOpacity(0.22),
          labelTextStyle: WidgetStateProperty.resolveWith<TextStyle>(
            (states) => TextStyle(
              fontSize: 11,
              fontWeight: states.contains(WidgetState.selected) ? FontWeight.bold : FontWeight.normal,
              color: states.contains(WidgetState.selected) ? AppColors.purpleAccent : AppColors.textPurpleSecondary,
            ),
          ),
          iconTheme: WidgetStateProperty.resolveWith<IconThemeData>(
            (states) => IconThemeData(
              color: states.contains(WidgetState.selected) ? AppColors.purpleAccent : AppColors.textPurpleSecondary,
              size: 22,
            ),
          ),
        ),
        child: Container(
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: AppColors.purpleBorder, width: 1)),
          ),
          child: NavigationBar(
            selectedIndex: _currentIndex,
            onDestinationSelected: (index) => setState(() => _currentIndex = index),
            destinations: [
              const NavigationDestination(
                icon: Icon(Icons.storefront_outlined),
                selectedIcon: Icon(Icons.storefront),
                label: 'Shop',
              ),
              const NavigationDestination(
                icon: Icon(Icons.category_outlined),
                selectedIcon: Icon(Icons.category),
                label: 'Catalog',
              ),
              NavigationDestination(
                icon: Badge(
                  label: Text('$_cartItemCount'),
                  isLabelVisible: _cartItemCount > 0,
                  backgroundColor: AppColors.purpleAccent,
                  child: const Icon(Icons.shopping_cart_outlined),
                ),
                selectedIcon: Badge(
                  label: Text('$_cartItemCount'),
                  isLabelVisible: _cartItemCount > 0,
                  backgroundColor: AppColors.purpleAccent,
                  child: const Icon(Icons.shopping_cart),
                ),
                label: 'Cart',
              ),
              const NavigationDestination(
                icon: Icon(Icons.receipt_long_outlined),
                selectedIcon: Icon(Icons.receipt_long),
                label: 'Orders',
              ),
              const NavigationDestination(
                icon: Icon(Icons.person_outline),
                selectedIcon: Icon(Icons.person),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStoreHome() {
    final balance = (_wallet?['balance'] ?? 0).toDouble();

    return RefreshIndicator(
      onRefresh: _loadStoreData,
      color: AppColors.purpleAccent,
      backgroundColor: AppColors.purpleSurface,
      child: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            backgroundColor: AppColors.purpleBg,
            elevation: 0,
            floating: true,
            pinned: false,
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(7),
                  decoration: BoxDecoration(
                    color: AppColors.purpleSurface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.purpleBorder),
                  ),
                  child: const Icon(Icons.shopping_bag_outlined, color: AppColors.purpleAccent, size: 20),
                ),
                const SizedBox(width: 10),
                const Row(
                  children: [
                    Text('GROW', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 0.5)),
                    Text('PLUS', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.purpleAccent, letterSpacing: 0.5)),
                    SizedBox(width: 6),
                    Text('SHOPPING', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.textPurpleSecondary)),
                  ],
                ),
              ],
            ),
            actions: [
              // Wallet Credits Pill
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ShoppingWalletScreen(onShopNow: () => setState(() => _currentIndex = 1)),
                    ),
                  ).then((_) => _loadStoreData());
                },
                child: Container(
                  margin: const EdgeInsets.symmetric(vertical: 10),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.purpleSurface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.purpleBorder),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.stars_rounded, color: AppColors.purpleAccent, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        _currencyFormat.format(balance),
                        style: const TextStyle(
                          color: Color(0xFF34D399),
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 6),
              IconButton(
                icon: Badge(
                  label: Text('$_cartItemCount'),
                  isLabelVisible: _cartItemCount > 0,
                  backgroundColor: AppColors.purpleAccent,
                  child: const Icon(Icons.shopping_cart_outlined, color: Colors.white),
                ),
                onPressed: () => setState(() => _currentIndex = 2),
              ),
              const SizedBox(width: 8),
            ],
          ),

          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // 1. Search Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: AppColors.purpleSurface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.purpleBorder),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 2)),
                    ],
                  ),
                  child: TextField(
                    controller: _searchController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: const InputDecoration(
                      icon: Icon(Icons.search, color: AppColors.purpleAccent, size: 20),
                      hintText: 'Search products, essentials, brands...',
                      hintStyle: TextStyle(fontSize: 13, color: AppColors.textPurpleMuted),
                      border: InputBorder.none,
                    ),
                    onSubmitted: (val) {
                      ApiService.getProducts(search: val).then((res) {
                        if (mounted) setState(() => _products = res['products'] ?? []);
                      });
                    },
                  ),
                ),

                const SizedBox(height: 16),

                // 2. Promotional Store Credits Banner
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF3C1877), Color(0xFF170A37)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.purpleBorderLight),
                    boxShadow: [
                      BoxShadow(color: AppColors.purpleAccent.withOpacity(0.18), blurRadius: 10, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.purpleAccent.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.stars_rounded, color: AppColors.purpleAccent, size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'STORE CREDITS AVAILABLE',
                              style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${_currencyFormat.format(balance)} available to redeem on checkout',
                              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ShoppingWalletScreen(onShopNow: () => setState(() => _currentIndex = 1)),
                            ),
                          ).then((_) => _loadStoreData());
                        },
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.purpleAccent,
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                        ),
                        child: const Text('View', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                // 3. Category Horizontal Pills
                SizedBox(
                  height: 38,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _categories.length + 1,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (ctx, i) {
                      if (i == 0) {
                        final isAll = _selectedCategorySlug == null;
                        return GestureDetector(
                          onTap: () {
                            setState(() => _selectedCategorySlug = null);
                            _loadStoreData();
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: isAll ? AppColors.purpleAccent : AppColors.purpleSurface,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: isAll ? AppColors.purpleAccent : AppColors.purpleBorder),
                            ),
                            child: Text(
                              'All Products',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: isAll ? Colors.white : AppColors.textPurpleSecondary,
                              ),
                            ),
                          ),
                        );
                      }

                      final cat = _categories[i - 1];
                      final isSelected = _selectedCategorySlug == cat['slug'];
                      return GestureDetector(
                        onTap: () {
                          setState(() => _selectedCategorySlug = cat['slug']);
                          _loadStoreData();
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.purpleAccent : AppColors.purpleSurface,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: isSelected ? AppColors.purpleAccent : AppColors.purpleBorder),
                          ),
                          child: Text(
                            cat['name'] ?? '',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              color: isSelected ? Colors.white : AppColors.textPurpleSecondary,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 22),

                // 4. Products Catalog Header
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Featured Products',
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    Text(
                      'Best Deals',
                      style: TextStyle(fontSize: 12, color: AppColors.textPurpleSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
              ]),
            ),
          ),

          // 5. Products Grid
          if (_loading)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator(color: AppColors.purpleAccent)),
            )
          else if (_products.isEmpty)
            const SliverFillRemaining(
              child: Center(
                child: Text('No products available in this category.', style: TextStyle(color: AppColors.textPurpleSecondary)),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.68,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final product = _products[index];
                    final price = product['selling_price'];
                    final mrp = product['mrp'];
                    final isEligible = product['is_eligible_for_rewards'] == true;
                    final images = product['product_images'] as List?;
                    final imageUrl = images?.isNotEmpty == true ? images![0]['url'] : null;

                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => ProductDetailScreen(productId: product['id'])),
                        ).then((_) => _loadStoreData());
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.purpleSurface,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: AppColors.purpleBorder),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 6, offset: const Offset(0, 2)),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Product Image
                            Expanded(
                              flex: 3,
                              child: Stack(
                                children: [
                                  Container(
                                    width: double.infinity,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFF170A37),
                                      borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
                                    ),
                                    child: imageUrl != null
                                        ? ClipRRect(
                                            borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                                            child: Image.network(
                                              imageUrl,
                                              fit: BoxFit.cover,
                                              errorBuilder: (_, __, ___) => const Center(
                                                child: Icon(Icons.broken_image_outlined, color: AppColors.textPurpleMuted, size: 32),
                                              ),
                                            ),
                                          )
                                        : const Center(child: Icon(Icons.shopping_bag_outlined, color: AppColors.textPurpleMuted, size: 36)),
                                  ),
                                  if (isEligible)
                                    Positioned(
                                      top: 8,
                                      left: 8,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                                        decoration: BoxDecoration(
                                          color: AppColors.purpleAccent,
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: const Row(
                                          children: [
                                            Icon(Icons.star, color: Colors.white, size: 10),
                                            SizedBox(width: 3),
                                            Text('REWARDS', style: TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.bold)),
                                          ],
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),

                            // Product Info
                            Expanded(
                              flex: 2,
                              child: Padding(
                                padding: const EdgeInsets.all(10),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      product['name'] ?? '',
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                                    ),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              '₹$price',
                                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF34D399)),
                                            ),
                                            if (mrp != null && double.tryParse(mrp.toString())! > double.tryParse(price.toString())!)
                                              Text(
                                                '₹$mrp',
                                                style: const TextStyle(fontSize: 10, color: AppColors.textPurpleMuted, decoration: TextDecoration.lineThrough),
                                              ),
                                          ],
                                        ),
                                        InkWell(
                                          onTap: () => _handleAddToCart(product['id']),
                                          child: Container(
                                            padding: const EdgeInsets.all(6),
                                            decoration: BoxDecoration(
                                              color: AppColors.purpleAccent,
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: const Icon(Icons.add_shopping_cart, color: Colors.white, size: 16),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                  childCount: _products.length,
                ),
              ),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 32)),
        ],
      ),
    );
  }
}
