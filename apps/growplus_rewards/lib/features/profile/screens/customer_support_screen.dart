import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';
import 'ticket_details_screen.dart';

class CustomerSupportScreen extends StatefulWidget {
  const CustomerSupportScreen({super.key});

  @override
  State<CustomerSupportScreen> createState() => _CustomerSupportScreenState();
}

class _CustomerSupportScreenState extends State<CustomerSupportScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  bool _loadingTickets = true;
  List<dynamic> _tickets = [];

  // Form State
  final _formKey = GlobalKey<FormState>();
  final _subjectController = TextEditingController();
  final _descController = TextEditingController();
  String _selectedCategory = 'reward';
  bool _submittingTicket = false;

  final List<Map<String, String>> _categories = [
    {'value': 'reward', 'label': 'Shopping Credits & Rewards'},
    {'value': 'referral', 'label': 'Referral Tracking'},
    {'value': 'account', 'label': 'Account & Profile Verification'},
    {'value': 'order', 'label': 'Orders & Delivery'},
    {'value': 'payment', 'label': 'Payment & Razorpay'},
    {'value': 'other', 'label': 'Other Inquiries'},
  ];

  final List<Map<String, String>> _faqs = [
    {
      'question': 'How do I earn promotional shopping credits?',
      'answer': 'Promotional shopping credits are earned strictly on verified eligible retail purchases made through GrowPlus partner merchants or qualified referral purchases. GrowPlus never awards rewards for deposits or recruitment.',
    },
    {
      'question': 'How can I redeem my shopping credits?',
      'answer': 'Open the GrowPlus Shopping App directly from your rewards dashboard via the secure SSO handoff button. During checkout, you can apply your available eligible promotional credits to discount your order total dynamically.',
    },
    {
      'question': 'How does referral tracking work?',
      'answer': 'When your friends register using your unique 8-character referral code and complete a qualifying retail product purchase, eligible promotional credits are automatically ledgered to your account upon return-window completion.',
    },
    {
      'question': 'Why is mobile number completion required?',
      'answer': 'Under retail merchant consumer verification guidelines, a verified 10-digit mobile number links your unified shopping wallet, order delivery notifications, and customer support history safely.',
    },
    {
      'question': 'Can I withdraw my store credits as fiat cash?',
      'answer': 'No. GrowPlus credits are strictly promotional, non-cash, and non-withdrawable retail discounts designed exclusively for shopping savings.',
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
    _descController.dispose();
    super.dispose();
  }

  Future<void> _loadTickets() async {
    setState(() => _loadingTickets = true);
    try {
      final list = await ApiService.getSupportTickets();
      if (mounted) {
        setState(() => _tickets = list);
      }
    } catch (e) {
      debugPrint('Error loading support tickets: $e');
    } finally {
      if (mounted) setState(() => _loadingTickets = false);
    }
  }

  Future<void> _handleCreateTicket() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _submittingTicket = true);
    try {
      await ApiService.createSupportTicket(
        subject: _subjectController.text.trim(),
        description: _descController.text.trim(),
        category: _selectedCategory,
      );

      _subjectController.clear();
      _descController.clear();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Support ticket submitted successfully! Check "My Tickets" tab.'),
            backgroundColor: AppColors.purpleAccent,
          ),
        );
        _tabController.animateTo(2); // Jump to My Tickets tab
        _loadTickets();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _submittingTicket = false);
    }
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'open':
        return const Color(0xFF3B82F6);
      case 'in_progress':
        return const Color(0xFFF59E0B);
      case 'waiting_for_customer':
        return const Color(0xFFA855F7);
      case 'resolved':
        return const Color(0xFF10B981);
      case 'closed':
        return const Color(0xFF6B7280);
      default:
        return const Color(0xFFA66CFF);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF170B30),
      appBar: AppBar(
        backgroundColor: const Color(0xFF170B30),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textWhite, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Customer Support',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.textWhite,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.purpleAccent,
          indicatorWeight: 3,
          labelColor: AppColors.purpleAccent,
          unselectedLabelColor: const Color(0xFFC5B5DF),
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(text: 'FAQs'),
            Tab(text: 'Raise Ticket'),
            Tab(text: 'My Tickets'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFaqsTab(),
          _buildRaiseTicketTab(),
          _buildMyTicketsTab(),
        ],
      ),
    );
  }

  Widget _buildFaqsTab() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF29154B),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF3D1B75)),
          ),
          child: const Row(
            children: [
              Icon(Icons.lightbulb_outline_rounded, color: AppColors.purpleAccent, size: 24),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Quick answers regarding shopping credits, rewards, orders, and referrals.',
                  style: TextStyle(color: Color(0xFFC5B5DF), fontSize: 13, height: 1.3),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        ..._faqs.map((faq) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF3D1B75)),
              ),
              child: Material(
                color: const Color(0xFF231044),
                borderRadius: BorderRadius.circular(16),
                child: Theme(
                  data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                  child: ExpansionTile(
                    title: Text(
                      faq['question']!,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textWhite,
                      ),
                    ),
                    iconColor: AppColors.purpleAccent,
                    collapsedIconColor: const Color(0xFFC5B5DF),
                    childrenPadding: const EdgeInsets.only(left: 18, right: 18, bottom: 18),
                    children: [
                      Text(
                        faq['answer']!,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFFC5B5DF),
                          height: 1.45,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            )),
      ],
    );
  }

  Widget _buildRaiseTicketTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(22),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Submit a Support Request',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textWhite),
            ),
            const SizedBox(height: 6),
            const Text(
              'Our customer support team is available 24/7 to resolve queries regarding your account and eligible rewards.',
              style: TextStyle(fontSize: 13, color: Color(0xFFC5B5DF), height: 1.35),
            ),
            const SizedBox(height: 24),

            // Category selector
            const Text('Inquiry Category *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFC5B5DF))),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E0E3B),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF3D1B75)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedCategory,
                  dropdownColor: const Color(0xFF29154B),
                  isExpanded: true,
                  style: const TextStyle(color: AppColors.textWhite, fontSize: 14, fontWeight: FontWeight.w600),
                  items: _categories.map((c) {
                    return DropdownMenuItem<String>(
                      value: c['value'],
                      child: Text(c['label']!),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedCategory = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Subject
            const Text('Subject *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFC5B5DF))),
            const SizedBox(height: 8),
            TextFormField(
              controller: _subjectController,
              style: const TextStyle(color: AppColors.textWhite, fontSize: 14),
              decoration: _buildInputDecoration(hint: 'Brief summary of your query'),
              validator: (val) {
                if (val == null || val.trim().isEmpty) return 'Subject is required';
                if (val.trim().length < 5) return 'Subject should be at least 5 characters';
                return null;
              },
            ),
            const SizedBox(height: 18),

            // Description
            const Text('Description *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFC5B5DF))),
            const SizedBox(height: 8),
            TextFormField(
              controller: _descController,
              maxLines: 4,
              style: const TextStyle(color: AppColors.textWhite, fontSize: 14),
              decoration: _buildInputDecoration(hint: 'Provide full details, order ID or partner merchant info...'),
              validator: (val) {
                if (val == null || val.trim().isEmpty) return 'Description is required';
                if (val.trim().length < 10) return 'Please provide more details (min 10 characters)';
                return null;
              },
            ),
            const SizedBox(height: 28),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _submittingTicket ? null : _handleCreateTicket,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.purpleAccent,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 4,
                  shadowColor: AppColors.purpleAccent.withOpacity(0.5),
                ),
                child: _submittingTicket
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.send_rounded, size: 18),
                          SizedBox(width: 8),
                          Text('Submit Ticket', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                        ],
                      ),
              ),
            ),
          ],
        ),
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
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF29154B),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF3D1B75)),
                ),
                child: const Icon(Icons.inbox_rounded, color: AppColors.purpleAccent, size: 40),
              ),
              const SizedBox(height: 20),
              const Text(
                'No Tickets Raised',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textWhite),
              ),
              const SizedBox(height: 8),
              const Text(
                'Have a question about your shopping credits or an order? Tap "Raise Ticket" to submit an inquiry.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFFC5B5DF), fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () => _tabController.animateTo(1),
                icon: const Icon(Icons.add_rounded, size: 18),
                label: const Text('Raise a Ticket'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.purpleAccent,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadTickets,
      color: AppColors.purpleAccent,
      backgroundColor: const Color(0xFF29154B),
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _tickets.length,
        itemBuilder: (context, index) {
          final t = _tickets[index];
          final tId = t['id'].toString();
          final tNum = t['ticket_number'] ?? 'TKT';
          final subject = t['subject'] ?? '';
          final category = t['category'] ?? 'other';
          final status = t['status'] as String?;
          final createdAt = t['created_at'] != null
              ? DateFormat('MMM dd, yyyy').format(DateTime.parse(t['created_at']).toLocal())
              : '';

          return GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => TicketDetailsScreen(ticketId: tId),
                ),
              ).then((_) => _loadTickets());
            },
            child: Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF29154B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF3D1B75)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        tNum,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.purpleAccent,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _getStatusColor(status).withOpacity(0.18),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          status?.split('_').map((s) => s.capitalize()).join(' ') ?? 'Open',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: _getStatusColor(status),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    subject,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textWhite,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        category.toUpperCase(),
                        style: const TextStyle(fontSize: 11, color: Color(0xFF8B7AA8), fontWeight: FontWeight.w600),
                      ),
                      Text(
                        createdAt,
                        style: const TextStyle(fontSize: 11, color: Color(0xFFC5B5DF)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  InputDecoration _buildInputDecoration({required String hint}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFF6B588D), fontSize: 13),
      filled: true,
      fillColor: const Color(0xFF1E0E3B),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFF3D1B75)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFF4C248B)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.purpleAccent, width: 1.5),
      ),
    );
  }
}
