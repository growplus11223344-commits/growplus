import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';

class TicketDetailsScreen extends StatefulWidget {
  final String ticketId;

  const TicketDetailsScreen({
    super.key,
    required this.ticketId,
  });

  @override
  State<TicketDetailsScreen> createState() => _TicketDetailsScreenState();
}

class _TicketDetailsScreenState extends State<TicketDetailsScreen> {
  bool _loading = true;
  bool _sending = false;
  Map<String, dynamic>? _ticket;
  List<dynamic> _messages = [];
  final _replyController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _fetchDetails();
  }

  @override
  void dispose() {
    _replyController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchDetails() async {
    setState(() => _loading = true);
    try {
      final data = await ApiService.getSupportTicketDetails(widget.ticketId);
      if (mounted) {
        setState(() {
          _ticket = data;
          _messages = (data['support_messages'] as List<dynamic>?) ?? [];
        });
      }
    } catch (e) {
      debugPrint('Error fetching ticket: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleSendReply() async {
    final text = _replyController.text.trim();
    if (text.isEmpty) return;

    setState(() => _sending = true);
    try {
      final newMsg = await ApiService.replySupportTicket(widget.ticketId, text);
      _replyController.clear();
      if (mounted) {
        setState(() {
          _messages.add(newMsg);
        });
        // Scroll to bottom
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (_scrollController.hasClients) {
            _scrollController.animateTo(
              _scrollController.position.maxScrollExtent,
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOut,
            );
          }
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _sending = false);
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

  String _formatStatus(String? status) {
    if (status == null) return 'Open';
    return status.split('_').map((s) => s.capitalize()).join(' ');
  }

  @override
  Widget build(BuildContext context) {
    final ticketNum = _ticket?['ticket_number'] ?? 'Ticket';
    final subject = _ticket?['subject'] ?? '';
    final description = _ticket?['description'] ?? '';
    final status = _ticket?['status'] as String?;
    final isClosed = status == 'closed';
    final createdAtStr = _ticket?['created_at'] != null
        ? DateFormat('MMM dd, yyyy • hh:mm a').format(DateTime.parse(_ticket!['created_at']).toLocal())
        : '';

    return Scaffold(
      backgroundColor: const Color(0xFF170B30),
      appBar: AppBar(
        backgroundColor: const Color(0xFF170B30),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textWhite, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          ticketNum,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textWhite,
          ),
        ),
        actions: [
          if (status != null)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getStatusColor(status).withOpacity(0.18),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _getStatusColor(status).withOpacity(0.5)),
                  ),
                  child: Text(
                    _formatStatus(status),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: _getStatusColor(status),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.purpleAccent))
          : Column(
              children: [
                Expanded(
                  child: ListView(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(20),
                    children: [
                      // Ticket Header Card
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: const Color(0xFF29154B),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0xFF3D1B75)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              subject,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textWhite,
                              ),
                            ),
                            const SizedBox(height: 6),
                            if (createdAtStr.isNotEmpty)
                              Text(
                                'Opened on $createdAtStr',
                                style: const TextStyle(fontSize: 12, color: Color(0xFFC5B5DF)),
                              ),
                            const SizedBox(height: 14),
                            const Divider(color: Color(0xFF3D1B75)),
                            const SizedBox(height: 10),
                            const Text(
                              'Original Inquiry:',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.purpleAccent),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              description,
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.textWhite,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Messages Thread Header
                      const Row(
                        children: [
                          Icon(Icons.forum_outlined, size: 16, color: AppColors.purpleAccent),
                          SizedBox(width: 8),
                          Text(
                            'Conversation History',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFC5B5DF),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      if (_messages.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: const Color(0xFF210E3D),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFF34175B)),
                          ),
                          child: const Center(
                            child: Text(
                              'No responses yet. Our support team is reviewing your ticket.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Color(0xFFC5B5DF), fontSize: 13),
                            ),
                          ),
                        )
                      else
                        ..._messages.map((m) {
                          final isStaff = m['sender_type'] == 'staff';
                          final text = m['message'] ?? '';
                          final timeStr = m['created_at'] != null
                              ? DateFormat('hh:mm a').format(DateTime.parse(m['created_at']).toLocal())
                              : '';

                          return Align(
                            alignment: isStaff ? Alignment.centerLeft : Alignment.centerRight,
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              constraints: BoxConstraints(
                                maxWidth: MediaQuery.of(context).size.width * 0.78,
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: isStaff ? const Color(0xFF1E3A8A).withOpacity(0.4) : const Color(0xFF5B21B6),
                                borderRadius: BorderRadius.only(
                                  topLeft: const Radius.circular(16),
                                  topRight: const Radius.circular(16),
                                  bottomLeft: isStaff ? Radius.zero : const Radius.circular(16),
                                  bottomRight: isStaff ? const Radius.circular(16) : Radius.zero,
                                ),
                                border: Border.all(
                                  color: isStaff ? const Color(0xFF3B82F6).withOpacity(0.5) : const Color(0xFF8B5CF6),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: isStaff ? CrossAxisAlignment.start : CrossAxisAlignment.end,
                                children: [
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      if (isStaff) ...[
                                        const Icon(Icons.support_agent_rounded, size: 14, color: Color(0xFF60A5FA)),
                                        const SizedBox(width: 4),
                                        const Text(
                                          'GrowPlus Support',
                                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF60A5FA)),
                                        ),
                                      ] else ...[
                                        const Text(
                                          'You',
                                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFDDD6FE)),
                                        ),
                                      ],
                                      if (timeStr.isNotEmpty) ...[
                                        const SizedBox(width: 8),
                                        Text(timeStr, style: const TextStyle(fontSize: 10, color: Colors.white54)),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    text,
                                    style: const TextStyle(color: Colors.white, fontSize: 13.5, height: 1.35),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }),
                    ],
                  ),
                ),

                // Reply Input Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(
                    color: Color(0xFF231044),
                    border: Border(top: BorderSide(color: Color(0xFF3D1B75))),
                  ),
                  child: SafeArea(
                    child: isClosed
                        ? const Center(
                            child: Padding(
                              padding: EdgeInsets.symmetric(vertical: 8),
                              child: Text(
                                'This ticket is closed. Please raise a new ticket if you need further help.',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: Color(0xFFC5B5DF), fontSize: 12),
                              ),
                            ),
                          )
                        : Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _replyController,
                                  style: const TextStyle(color: AppColors.textWhite, fontSize: 14),
                                  maxLines: 3,
                                  minLines: 1,
                                  decoration: InputDecoration(
                                    hintText: 'Type your message...',
                                    hintStyle: const TextStyle(color: Color(0xFF7C6B98), fontSize: 14),
                                    filled: true,
                                    fillColor: const Color(0xFF170B30),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(20),
                                      borderSide: const BorderSide(color: Color(0xFF3D1B75)),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(20),
                                      borderSide: const BorderSide(color: Color(0xFF3D1B75)),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(20),
                                      borderSide: const BorderSide(color: AppColors.purpleAccent),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              GestureDetector(
                                onTap: _sending ? null : _handleSendReply,
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: const BoxDecoration(
                                    color: AppColors.purpleAccent,
                                    shape: BoxShape.circle,
                                  ),
                                  child: _sending
                                      ? const SizedBox(
                                          width: 18,
                                          height: 18,
                                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                        )
                                      : const Icon(Icons.send_rounded, size: 18, color: Colors.white),
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              ],
            ),
    );
  }
}

extension StringExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }
}
