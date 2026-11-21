import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';

class ReferralsScreen extends StatefulWidget {
  const ReferralsScreen({super.key});

  @override
  State<ReferralsScreen> createState() => _ReferralsScreenState();
}

class _ReferralsScreenState extends State<ReferralsScreen> {
  bool _loading = true;
  Map<String, dynamic>? _referralCode;
  List<dynamic> _history = [];

  @override
  void initState() {
    super.initState();
    _loadReferralData();
  }

  Future<void> _loadReferralData() async {
    setState(() => _loading = true);
    try {
      final codeData = await ApiService.getReferralCode();
      final history = await ApiService.getReferralHistory();
      if (mounted) {
        setState(() {
          _referralCode = codeData;
          _history = history;
        });
      }
    } catch (e) {
      debugPrint('Error loading referrals: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String get _code => _referralCode?['code']?.toString().trim() ?? '';

  String get _referralLink {
    if (_code.isEmpty) return '';
    // Use configured web preview domain without inventing fake production hosts
    return 'http://localhost:8081/refer?ref=$_code';
  }

  String get _shareMessage =>
      'Join GrowPlus with my referral code $_code and earn promotional store credits on eligible retail purchases!\n'
      'Sign up here: $_referralLink';

  void _copyCode() {
    if (_code.isEmpty) return;
    Clipboard.setData(ClipboardData(text: _code));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Referral code copied to clipboard!'),
        backgroundColor: AppColors.purpleAccent,
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _copyLink() {
    if (_referralLink.isEmpty) return;
    Clipboard.setData(ClipboardData(text: _referralLink));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Personal referral link copied!'),
        backgroundColor: AppColors.purpleAccent,
        duration: Duration(seconds: 2),
      ),
    );
  }

  Future<void> _shareGeneral() async {
    if (_code.isEmpty) return;
    await Share.share(_shareMessage, subject: 'Join GrowPlus with my referral code');
  }

  Future<void> _shareWhatsApp() async {
    if (_code.isEmpty) return;
    final encoded = Uri.encodeComponent(_shareMessage);
    final nativeUri = Uri.parse('whatsapp://send?text=$encoded');
    final webUri = Uri.parse('https://api.whatsapp.com/send?text=$encoded');

    try {
      if (await canLaunchUrl(nativeUri)) {
        await launchUrl(nativeUri, mode: LaunchMode.externalApplication);
        return;
      }
    } catch (_) {}

    try {
      if (await canLaunchUrl(webUri)) {
        await launchUrl(webUri, mode: LaunchMode.externalApplication);
        return;
      }
    } catch (_) {}

    _shareGeneral();
  }

  Future<void> _shareFacebook() async {
    if (_referralLink.isEmpty) return;
    final encodedUrl = Uri.encodeComponent(_referralLink);
    final fbUri = Uri.parse('https://www.facebook.com/sharer/sharer.php?u=$encodedUrl');

    try {
      if (await canLaunchUrl(fbUri)) {
        await launchUrl(fbUri, mode: LaunchMode.externalApplication);
        return;
      }
    } catch (_) {}

    _shareGeneral();
  }

  Future<void> _shareInstagram() async {
    // Instagram does not offer direct link-prefill URI. Copy link and open app or system share sheet.
    _copyLink();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Referral link copied! Open Instagram to paste in your Story or Bio.'),
        backgroundColor: Color(0xFFE1306C),
        duration: Duration(seconds: 3),
      ),
    );

    final igUri = Uri.parse('instagram://app');
    try {
      if (await canLaunchUrl(igUri)) {
        await launchUrl(igUri, mode: LaunchMode.externalApplication);
        return;
      }
    } catch (_) {}
  }

  Future<void> _shareSMS() async {
    if (_code.isEmpty) return;
    final encoded = Uri.encodeComponent(_shareMessage);
    final smsUri = Uri.parse('sms:?body=$encoded');

    try {
      if (await canLaunchUrl(smsUri)) {
        await launchUrl(smsUri, mode: LaunchMode.externalApplication);
        return;
      }
    } catch (_) {}

    _shareGeneral();
  }

  String _maskName(String? raw) {
    if (raw == null || raw.trim().isEmpty) return 'Member';
    final parts = raw.trim().split(RegExp(r'\s+'));
    return parts.map((p) {
      if (p.length <= 2) return '${p[0]}*';
      return '${p[0]}${'*' * (p.length - 2)}${p[p.length - 1]}';
    }).join(' ');
  }

  @override
  Widget build(BuildContext context) {
    final code = _code.isEmpty ? '--------' : _code;
    final totalReferrals = _referralCode?['total_referrals'] ?? 0;
    final eligibleReferrals = _referralCode?['successful_referrals'] ?? 0;
    final registeredReferrals = _history.length;

    return Scaffold(
      backgroundColor: const Color(0xFF120829),
      appBar: AppBar(
        title: const Text(
          'Referrals & Earnings',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: Colors.white,
            letterSpacing: 0.3,
          ),
        ),
        backgroundColor: const Color(0xFF120829),
        elevation: 0,
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.purpleAccent),
            onPressed: _loadReferralData,
            tooltip: 'Refresh Referral Data',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadReferralData,
        color: AppColors.purpleAccent,
        backgroundColor: const Color(0xFF231044),
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            // ============================================================
            // 1. UNIQUE REFERRAL CODE & LINK HERO CARD
            // ============================================================
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF3C1877), Color(0xFF170A37)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFF4C248B), width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF3C1877).withOpacity(0.35),
                    blurRadius: 18,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'MY UNIQUE REFERRAL CODE',
                        style: TextStyle(
                          color: Color(0xFFCDBDEA),
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.purpleAccent.withOpacity(0.18),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.purpleAccent.withOpacity(0.4)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.shield_outlined, color: AppColors.purpleAccent, size: 12),
                            SizedBox(width: 4),
                            Text(
                              'Verified Code',
                              style: TextStyle(color: AppColors.purpleAccent, fontSize: 10.5, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Code box with copy & share
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF170A37),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF5A2A9D)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          code,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 3,
                          ),
                        ),
                        Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.copy_rounded, color: AppColors.purpleAccent, size: 20),
                              onPressed: _copyCode,
                              tooltip: 'Copy Code',
                            ),
                            IconButton(
                              icon: const Icon(Icons.share_rounded, color: Colors.white, size: 20),
                              onPressed: _shareGeneral,
                              tooltip: 'Share Code',
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Personal Referral Link row
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF231044).withOpacity(0.7),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF3D1B75)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.link_rounded, color: AppColors.purpleAccent, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _referralLink.isNotEmpty ? _referralLink : 'http://localhost:8081/refer?ref=$code',
                            style: const TextStyle(color: Color(0xFFCDBDEA), fontSize: 11.5),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        InkWell(
                          onTap: _copyLink,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.purpleAccent.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text('Copy Link', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 22),

            // ============================================================
            // 2. SOCIAL SHARING OPTIONS
            // ============================================================
            const Text(
              'Share Invitation',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 4),
            const Text(
              'Invite friends across your preferred channels to earn promotional credits',
              style: TextStyle(fontSize: 11.5, color: Color(0xFFCDBDEA)),
            ),
            const SizedBox(height: 12),

            // Branded Action Buttons Grid
            Row(
              children: [
                _buildSocialButton(
                  label: 'WhatsApp',
                  icon: Icons.chat_bubble_outline_rounded,
                  color: const Color(0xFF25D366),
                  onTap: _shareWhatsApp,
                ),
                const SizedBox(width: 10),
                _buildSocialButton(
                  label: 'Instagram',
                  icon: Icons.camera_alt_outlined,
                  color: const Color(0xFFE1306C),
                  onTap: _shareInstagram,
                ),
                const SizedBox(width: 10),
                _buildSocialButton(
                  label: 'Facebook',
                  icon: Icons.facebook_rounded,
                  color: const Color(0xFF1877F2),
                  onTap: _shareFacebook,
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                _buildSocialButton(
                  label: 'Messages',
                  icon: Icons.sms_outlined,
                  color: const Color(0xFFA66CFF),
                  onTap: _shareSMS,
                ),
                const SizedBox(width: 10),
                _buildSocialButton(
                  label: 'Copy Link',
                  icon: Icons.link_rounded,
                  color: const Color(0xFF38BDF8),
                  onTap: _copyLink,
                ),
                const SizedBox(width: 10),
                _buildSocialButton(
                  label: 'More Options',
                  icon: Icons.more_horiz_rounded,
                  color: const Color(0xFFFBBF24),
                  onTap: _shareGeneral,
                ),
              ],
            ),

            const SizedBox(height: 24),

            // ============================================================
            // 3. REFERRAL STATISTICS (3 Cards)
            // ============================================================
            Row(
              children: [
                Expanded(
                  child: _buildStatCard('Total Invited', totalReferrals.toString(), const Color(0xFFCDBDEA)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildStatCard('Registered', registeredReferrals.toString(), const Color(0xFF38BDF8)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildStatCard('Eligible', eligibleReferrals.toString(), const Color(0xFF34D399)),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // ============================================================
            // 4. REFERRAL TREE VISUALIZATION
            // ============================================================
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF231044),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFF3D1B75)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.account_tree_outlined, color: AppColors.purpleAccent, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'My Referral Tree',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.purpleAccent.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${_history.length} Members',
                          style: const TextStyle(color: AppColors.purpleAccent, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Direct referral connections and their qualification status',
                    style: TextStyle(fontSize: 11.5, color: Color(0xFFCDBDEA)),
                  ),
                  const SizedBox(height: 16),

                  // Root Node: My Account
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF30105F),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF5A2A9D)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: AppColors.purpleAccent,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.person, color: Colors.white, size: 14),
                        ),
                        const SizedBox(width: 10),
                        const Expanded(
                          child: Text(
                            'My Account (Referrer Root)',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ),
                        Text(
                          code,
                          style: const TextStyle(color: AppColors.purpleAccent, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ],
                    ),
                  ),

                  // Branches / Children
                  if (_history.isEmpty) ...[
                    const SizedBox(height: 14),
                    Padding(
                      padding: const EdgeInsets.only(left: 20),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 16,
                            height: 24,
                            decoration: const BoxDecoration(
                              border: Border(
                                left: BorderSide(color: Color(0xFF5A2A9D), width: 1.5),
                                bottom: BorderSide(color: Color(0xFF5A2A9D), width: 1.5),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          const Expanded(
                            child: Padding(
                              padding: EdgeInsets.only(top: 10),
                              child: Text(
                                'No referred members yet. Share your code to expand your tree!',
                                style: TextStyle(color: Color(0xFF8B7AA8), fontSize: 12),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    ..._history.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final ref = entry.value;
                      final isLast = idx == _history.length - 1;
                      final rawName = ref['referred']?['user_profiles']?['full_name'] as String? ?? 'Referral ${idx + 1}';
                      final maskedName = _maskName(rawName);
                      final status = ref['status']?.toString() ?? 'pending';
                      final isEligible = status == 'qualified' || status == 'rewarded';

                      return Padding(
                        padding: const EdgeInsets.only(left: 20),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 16,
                              height: 36,
                              decoration: BoxDecoration(
                                border: Border(
                                  left: BorderSide(color: const Color(0xFF5A2A9D), width: isLast ? 1.5 : 1.5),
                                  bottom: const BorderSide(color: Color(0xFF5A2A9D), width: 1.5),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Container(
                                margin: const EdgeInsets.only(top: 10),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1B0C36),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: const Color(0xFF3D1B75)),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(
                                          isEligible ? Icons.verified_rounded : Icons.person_outline_rounded,
                                          size: 15,
                                          color: isEligible ? const Color(0xFF34D399) : const Color(0xFF8B7AA8),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          maskedName,
                                          style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600),
                                        ),
                                      ],
                                    ),
                                    _buildStatusBadge(status),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ============================================================
            // 5. REFERRAL EVENTS & ACTIVITY TIMELINE
            // ============================================================
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Referral Events & Milestones',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                Text(
                  '${_history.length} Events',
                  style: const TextStyle(color: AppColors.purpleAccent, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),

            _buildMilestoneFlowCard(),

            const SizedBox(height: 16),

            // History list or empty state
            if (_loading)
              const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator(color: AppColors.purpleAccent)))
            else if (_history.isEmpty)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
                decoration: BoxDecoration(
                  color: const Color(0xFF231044),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFF3D1B75)),
                ),
                child: const Center(
                  child: Column(
                    children: [
                      Icon(Icons.card_giftcard_rounded, size: 40, color: Color(0xFF8B7AA8)),
                      SizedBox(height: 10),
                      Text(
                        'No referral activity yet.',
                        style: TextStyle(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'When your friends register and complete qualifying retail product purchases, verified credits will appear here.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Color(0xFFCDBDEA), fontSize: 12, height: 1.4),
                      ),
                    ],
                  ),
                ),
              )
            else
              ..._history.map((item) {
                final rawName = item['referred']?['user_profiles']?['full_name'] as String? ?? 'Member';
                final masked = _maskName(rawName);
                final status = item['status']?.toString() ?? 'pending';
                final dateStr = item['created_at'] != null
                    ? DateFormat('MMM dd, yyyy • hh:mm a').format(DateTime.parse(item['created_at']).toLocal())
                    : '';

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF231044),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF3D1B75)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.purpleAccent.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.person_add_alt_1_rounded, color: AppColors.purpleAccent, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              masked,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
                            ),
                            const SizedBox(height: 2),
                            Text(dateStr, style: const TextStyle(color: Color(0xFFCDBDEA), fontSize: 11)),
                          ],
                        ),
                      ),
                      _buildStatusBadge(status),
                    ],
                  ),
                );
              }),

            const SizedBox(height: 24),

            // ============================================================
            // 6. COMPLIANCE & PROGRAM RULES
            // ============================================================
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF1B0C36),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFF3D1B75)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.verified_outlined, color: Color(0xFF34D399), size: 18),
                      SizedBox(width: 8),
                      Text(
                        'Referral Program Terms & Limitations',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: Colors.white),
                      ),
                    ],
                  ),
                  SizedBox(height: 10),
                  Text(
                    '• Promotional shopping credits are awarded exclusively when referred friends complete verified eligible retail product purchases.\n'
                    '• Credits are non-cash, non-withdrawable, and non-transferable; they may only be redeemed against GrowPlus store purchases.\n'
                    '• Zero commissions or returns are offered for recruiting members or for money deposits.\n'
                    '• Self-referrals and fraudulent ring signups are automatically detected and blocked.',
                    style: TextStyle(color: Color(0xFFCDBDEA), fontSize: 11.5, height: 1.5),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSocialButton({
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFF231044),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF3D1B75)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 6),
              Text(
                label,
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF231044),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF3D1B75)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFFCDBDEA), fontSize: 11, fontWeight: FontWeight.w500)),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg;
    Color fg;
    String text;

    switch (status.toLowerCase()) {
      case 'qualified':
      case 'eligible':
        bg = const Color(0xFF10B981).withOpacity(0.18);
        fg = const Color(0xFF34D399);
        text = 'Eligible';
        break;
      case 'rewarded':
        bg = AppColors.purpleAccent.withOpacity(0.18);
        fg = AppColors.purpleAccent;
        text = 'Rewarded';
        break;
      case 'registered':
        bg = const Color(0xFF38BDF8).withOpacity(0.18);
        fg = const Color(0xFF38BDF8);
        text = 'Registered';
        break;
      case 'pending':
      default:
        bg = const Color(0xFFFBBF24).withOpacity(0.18);
        fg = const Color(0xFFFBBF24);
        text = 'Pending';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(text, style: TextStyle(color: fg, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildMilestoneFlowCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1B0C36),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF3D1B75)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildMilestoneStep('1. Link Opened', Icons.touch_app_outlined),
          const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Color(0xFF8B7AA8)),
          _buildMilestoneStep('2. Registered', Icons.how_to_reg_outlined),
          const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Color(0xFF8B7AA8)),
          _buildMilestoneStep('3. Purchase', Icons.shopping_bag_outlined),
          const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Color(0xFF8B7AA8)),
          _buildMilestoneStep('4. Rewarded', Icons.check_circle_outline),
        ],
      ),
    );
  }

  Widget _buildMilestoneStep(String text, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 16, color: AppColors.purpleAccent),
        const SizedBox(height: 4),
        Text(
          text,
          style: const TextStyle(fontSize: 9.5, color: Color(0xFFCDBDEA), fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
