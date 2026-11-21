import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';

class ShoppingSupportScreen extends StatefulWidget {
  const ShoppingSupportScreen({super.key});

  @override
  State<ShoppingSupportScreen> createState() => _ShoppingSupportScreenState();
}

class _ShoppingSupportScreenState extends State<ShoppingSupportScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();
  String _selectedCategory = 'order_inquiry';
  bool _submitting = false;
  bool _loadingTickets = true;
  List<dynamic> _tickets = [];

  final List<Map<String, String>> _faqs = [
    {
      'q': 'How do I redeem my promotional shopping credits?',
      'a': 'Shopping credits are automatically applied at checkout up to eligible catalog allowances. Any remaining balance can be completed securely via Razorpay UPI, cards, or net banking.',
    },
    {
      'q': 'When will my shopping order be delivered?',
      'a': 'Orders are typically dispatched within 24-48 hours. Standard delivery across India takes 3 to 5 business days with live courier tracking provided.',
    },
    {
      'q': 'Can I cancel or return my order?',
      'a': 'You can request cancellation before dispatch directly from the Orders tab. Eligible items carry a 7-day hassle-free return window.',
    },
    {
      'q': 'Are shopping credits withdrawable as cash?',
      'a': 'No. GrowPlus credits are non-cash, non-withdrawable promotional store credits intended strictly for retail product redemptions.',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadTickets();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _loadTickets() async {
    setState(() => _loadingTickets = true);
    try {
      final t = await ApiService.getTickets();
      if (mounted) setState(() => _tickets = t);
    } catch (e) {
      debugPrint('Error loading tickets: $e');
    } finally {
      if (mounted) setState(() => _loadingTickets = false);
    }
  }

  Future<void> _submitTicket() async {
    final sub = _subjectController.text.trim();
    final msg = _messageController.text.trim();

    if (sub.isEmpty || msg.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields'), backgroundColor: AppColors.error),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      await ApiService.createTicket(
        subject: sub,
        category: _selectedCategory,
        message: msg,
      );
      if (mounted) {
        _subjectController.clear();
        _messageController.clear();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Ticket created! Our support team will assist you shortly.'),
            backgroundColor: AppColors.purpleAccent,
          ),
        );
        _tabController.animateTo(2);
        _loadTickets();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.purpleBg,
      appBar: AppBar(
        backgroundColor: AppColors.purpleBg,
        elevation: 0,
        title: const Text(
          'Shopping Support & Help',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.purpleAccent,
          labelColor: AppColors.purpleAccent,
          unselectedLabelColor: AppColors.textPurpleSecondary,
          tabs: const [
            Tab(text: 'FAQs'),
            Tab(text: 'New Ticket'),
            Tab(text: 'My Tickets'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFaqTab(),
          _buildNewTicketTab(),
          _buildMyTicketsTab(),
        ],
      ),
    );
  }

  Widget _buildFaqTab() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      itemCount: _faqs.length,
      itemBuilder: (ctx, i) {
        final faq = _faqs[i];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: AppColors.purpleSurface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.purpleBorder),
          ),
          child: ExpansionTile(
            iconColor: AppColors.purpleAccent,
            collapsedIconColor: AppColors.textPurpleSecondary,
            title: Text(
              faq['q']!,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Colors.white),
            ),
            children: [
              Padding(
                padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
                child: Text(
                  faq['a']!,
                  style: const TextStyle(color: AppColors.textPurpleSecondary, fontSize: 13, height: 1.45),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildNewTicketTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.purpleSurface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.purpleBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Need assistance with an order or product?',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Open a ticket and our verified support team will respond within 24 hours.',
                  style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 12),
                ),
                const SizedBox(height: 20),

                const Text('Inquiry Category', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPurpleSecondary)),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF170A37),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.purpleBorder),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedCategory,
                      isExpanded: true,
                      dropdownColor: AppColors.purpleSurface,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      items: const [
                        DropdownMenuItem(value: 'order_inquiry', child: Text('Order Status & Shipping')),
                        DropdownMenuItem(value: 'payment', child: Text('Payment & Credit Deduction')),
                        DropdownMenuItem(value: 'product_defect', child: Text('Product & Quality Issue')),
                        DropdownMenuItem(value: 'cancellation_return', child: Text('Cancellation & Returns')),
                        DropdownMenuItem(value: 'general', child: Text('General Inquiry')),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedCategory = val);
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                const Text('Subject', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPurpleSecondary)),
                const SizedBox(height: 6),
                TextField(
                  controller: _subjectController,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'e.g. Order #GP104 tracking update',
                    hintStyle: const TextStyle(color: AppColors.textPurpleMuted, fontSize: 13),
                    filled: true,
                    fillColor: const Color(0xFF170A37),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.purpleBorder)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.purpleBorder)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.purpleAccent, width: 1.5)),
                    contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 14),
                  ),
                ),
                const SizedBox(height: 14),

                const Text('Message Details', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPurpleSecondary)),
                const SizedBox(height: 6),
                TextField(
                  controller: _messageController,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Provide complete details regarding your inquiry...',
                    hintStyle: const TextStyle(color: AppColors.textPurpleMuted, fontSize: 13),
                    filled: true,
                    fillColor: const Color(0xFF170A37),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.purpleBorder)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.purpleBorder)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.purpleAccent, width: 1.5)),
                    contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 14),
                  ),
                ),
                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _submitting ? null : _submitTicket,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.purpleAccent,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 3,
                    ),
                    child: _submitting
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Submit Ticket', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMyTicketsTab() {
    if (_loadingTickets) {
      return const Center(child: CircularProgressIndicator(color: AppColors.purpleAccent));
    }

    if (_tickets.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(28.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.inbox_outlined, size: 50, color: AppColors.textPurpleMuted.withOpacity(0.5)),
              const SizedBox(height: 12),
              const Text('No Tickets Raised', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 4),
              const Text('You have not created any support tickets yet.', style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 13)),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      itemCount: _tickets.length,
      itemBuilder: (ctx, i) {
        final t = _tickets[i];
        final status = (t['status'] ?? 'open').toString();
        final subject = (t['subject'] ?? 'Support Inquiry').toString();

        Color statusColor = const Color(0xFFF59E0B);
        if (status == 'resolved' || status == 'closed') statusColor = const Color(0xFF10B981);
        if (status == 'in_progress') statusColor = const Color(0xFF3B82F6);

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.purpleSurface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.purpleBorder),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(subject, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white)),
                    const SizedBox(height: 4),
                    Text('Ticket #${t['id']?.toString().substring(0, 8) ?? ''}', style: const TextStyle(color: AppColors.textPurpleMuted, fontSize: 11)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.18),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: statusColor.withOpacity(0.4)),
                ),
                child: Text(
                  status.toUpperCase(),
                  style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
