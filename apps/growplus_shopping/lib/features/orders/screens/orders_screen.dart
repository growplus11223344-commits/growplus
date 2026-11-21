import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  bool _loading = true;
  List<dynamic> _orders = [];

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() => _loading = true);
    try {
      final orders = await ApiService.getOrders();
      if (mounted) setState(() => _orders = orders);
    } catch (e) {
      debugPrint('Error loading orders: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'delivered':
        return const Color(0xFF10B981);
      case 'shipped':
        return const Color(0xFF3B82F6);
      case 'processing':
        return AppColors.purpleAccent;
      case 'confirmed':
        return const Color(0xFFF59E0B);
      case 'cancelled':
      case 'refunded':
        return AppColors.error;
      default:
        return AppColors.textPurpleMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.purpleBg,
      appBar: AppBar(
        title: const Text('My Orders & Tracking', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
        backgroundColor: AppColors.purpleBg,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.purpleAccent),
            onPressed: _loadOrders,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadOrders,
        color: AppColors.purpleAccent,
        backgroundColor: AppColors.purpleSurface,
        child: _loading
            ? const Center(child: CircularProgressIndicator(color: AppColors.purpleAccent))
            : _orders.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.receipt_long_outlined, size: 64, color: AppColors.textPurpleMuted.withOpacity(0.4)),
                        const SizedBox(height: 16),
                        const Text('No orders placed yet', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                        const SizedBox(height: 6),
                        const Text('Your purchases will appear here with live tracking updates', style: TextStyle(fontSize: 12, color: AppColors.textPurpleSecondary)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _orders.length,
                    itemBuilder: (ctx, i) {
                      final o = _orders[i];
                      final orderNumber = o['order_number'] ?? 'Order';
                      final status = o['status'] ?? 'pending';
                      final total = o['total_amount'];
                      final credits = o['credits_applied'] ?? 0;
                      final dateStr = DateTime.tryParse(o['created_at'] ?? '')?.toLocal().toString().split('.').first ?? '';
                      final trackingNum = o['tracking_number'];
                      final items = (o['order_items'] as List?) ?? [];

                      final statusColor = _getStatusColor(status);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 14),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.purpleSurface,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: AppColors.purpleBorder),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 2)),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Header Row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  orderNumber,
                                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Colors.white),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3.5),
                                  decoration: BoxDecoration(
                                    color: statusColor.withOpacity(0.18),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: statusColor.withOpacity(0.4)),
                                  ),
                                  child: Text(
                                    status.toString().toUpperCase(),
                                    style: TextStyle(
                                      color: statusColor,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text('Ordered on $dateStr', style: const TextStyle(fontSize: 11, color: AppColors.textPurpleSecondary)),
                            const SizedBox(height: 12),
                            const Divider(height: 1, color: AppColors.purpleBorder),
                            const SizedBox(height: 10),

                            // Items List
                            ...items.map((item) => Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 2.5),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        '${item['quantity']}x ${item['product_name'] ?? 'Product'}',
                                        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w500, color: Colors.white),
                                      ),
                                      Text(
                                        '₹${item['total_price']}',
                                        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: Color(0xFF34D399)),
                                      ),
                                    ],
                                  ),
                                )),

                            const SizedBox(height: 10),
                            const Divider(height: 1, color: AppColors.purpleBorder),
                            const SizedBox(height: 10),

                            // Summary Row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (credits > 0)
                                      Text(
                                        'Credits Applied: -₹$credits',
                                        style: const TextStyle(fontSize: 11, color: AppColors.purpleAccent, fontWeight: FontWeight.bold),
                                      ),
                                    Text(
                                      'Paid: ₹$total',
                                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white),
                                    ),
                                  ],
                                ),
                                if (trackingNum != null && trackingNum.toString().isNotEmpty)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF3B82F6).withOpacity(0.18),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.35)),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.local_shipping_outlined, size: 14, color: Color(0xFF60A5FA)),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Track: $trackingNum',
                                          style: const TextStyle(color: Color(0xFF60A5FA), fontSize: 10, fontWeight: FontWeight.bold),
                                        ),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
