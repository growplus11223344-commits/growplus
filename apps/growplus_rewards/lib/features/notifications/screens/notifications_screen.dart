import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _loading = true;
  List<dynamic> _notifications = [];

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getNotifications();
      if (mounted) {
        setState(() {
          _notifications = list;
        });
      }
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _markRead(String id, int index) async {
    try {
      await ApiService.markNotificationAsRead(id);
      if (mounted) {
        setState(() {
          _notifications[index]['is_read'] = true;
        });
      }
    } catch (e) {
      debugPrint('Error marking read: $e');
    }
  }

  Future<void> _markAllRead() async {
    try {
      await ApiService.markAllNotificationsAsRead();
      if (mounted) {
        setState(() {
          for (var n in _notifications) {
            n['is_read'] = true;
          }
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('All notifications marked as read'),
            backgroundColor: AppColors.purpleAccent,
          ),
        );
      }
    } catch (e) {
      debugPrint('Error marking all read: $e');
    }
  }

  IconData _getTypeIcon(String? type) {
    switch (type) {
      case 'reward':
      case 'promotion':
        return Icons.card_giftcard_rounded;
      case 'wallet':
      case 'payment':
        return Icons.account_balance_wallet_rounded;
      case 'referral':
        return Icons.people_alt_rounded;
      case 'order_update':
        return Icons.local_shipping_rounded;
      case 'support':
        return Icons.headset_mic_rounded;
      default:
        return Icons.notifications_active_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => n['is_read'] != true).length;

    return Scaffold(
      backgroundColor: AppColors.purpleBg,
      appBar: AppBar(
        backgroundColor: AppColors.purpleBg,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textWhite, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Notifications',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.textWhite,
          ),
        ),
        actions: [
          if (_notifications.isNotEmpty && unreadCount > 0)
            TextButton(
              onPressed: _markAllRead,
              child: const Text(
                'Mark all read',
                style: TextStyle(
                  color: AppColors.purpleAccent,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ),
        ],
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.purpleAccent),
            )
          : RefreshIndicator(
              onRefresh: _fetchNotifications,
              color: AppColors.purpleAccent,
              backgroundColor: AppColors.purpleSurface,
              child: _notifications.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      itemCount: _notifications.length,
                      itemBuilder: (context, index) {
                        final item = _notifications[index];
                        final isRead = item['is_read'] == true;
                        final type = item['type'] as String?;
                        final title = item['title'] ?? 'Notification';
                        final body = item['body'] ?? '';
                        final createdAt = item['created_at'] != null
                            ? DateTime.tryParse(item['created_at'])?.toLocal()
                            : null;
                        final dateStr = createdAt != null
                            ? DateFormat('MMM dd, yyyy • hh:mm a').format(createdAt)
                            : '';

                        return GestureDetector(
                          onTap: () {
                            if (!isRead && item['id'] != null) {
                              _markRead(item['id'].toString(), index);
                            }
                          },
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: isRead ? AppColors.purpleSurface : const Color(0xFF2E1556),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isRead ? AppColors.purpleBorder : AppColors.purpleAccent.withOpacity(0.4),
                                width: isRead ? 1 : 1.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.2),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: isRead
                                        ? AppColors.purpleBg
                                        : AppColors.purpleAccent.withOpacity(0.2),
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: isRead
                                          ? AppColors.purpleBorder
                                          : AppColors.purpleAccent,
                                      width: 1,
                                    ),
                                  ),
                                  child: Icon(
                                    _getTypeIcon(type),
                                    color: isRead ? AppColors.textPurpleSecondary : AppColors.purpleAccent,
                                    size: 20,
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              title,
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: isRead ? FontWeight.w600 : FontWeight.bold,
                                                color: AppColors.textWhite,
                                              ),
                                            ),
                                          ),
                                          if (!isRead)
                                            Container(
                                              width: 8,
                                              height: 8,
                                              margin: const EdgeInsets.only(left: 8),
                                              decoration: const BoxDecoration(
                                                color: AppColors.purpleAccent,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        body,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          color: AppColors.textPurpleSecondary,
                                          height: 1.35,
                                        ),
                                      ),
                                      if (dateStr.isNotEmpty) ...[
                                        const SizedBox(height: 8),
                                        Text(
                                          dateStr,
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color: AppColors.textPurpleMuted,
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(36),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.purpleSurface,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.purpleBorder, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.purpleAccent.withOpacity(0.12),
                    blurRadius: 24,
                    spreadRadius: 4,
                  ),
                ],
              ),
              child: const Icon(
                Icons.notifications_none_rounded,
                color: AppColors.purpleAccent,
                size: 48,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'No Notifications Yet',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textWhite,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              "You're all caught up! Updates regarding your verified shopping credits, partner purchases, and referral bonuses will appear here.",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textPurpleSecondary,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
