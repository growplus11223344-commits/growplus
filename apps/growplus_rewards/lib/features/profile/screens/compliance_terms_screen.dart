import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class ComplianceTermsScreen extends StatelessWidget {
  const ComplianceTermsScreen({super.key});

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
          'Compliance & Terms',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.textWhite,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 20),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF29154B),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFF3D1B75)),
            ),
            child: const Row(
              children: [
                Icon(Icons.verified_user_outlined, color: AppColors.purpleAccent, size: 28),
                SizedBox(width: 14),
                Expanded(
                  child: Text(
                    'GrowPlus Regulatory Compliance & Consumer Protection Standards',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textWhite,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          _buildSectionCard(
            title: '1. Retail Promotional Rewards Model',
            body: 'GrowPlus is a retail merchant loyalty and shopping rewards platform. All shopping credits awarded within the GrowPlus ecosystem represent purely promotional, non-cash store discounts intended for eligible product purchases on the GrowPlus Shopping application.',
          ),
          const SizedBox(height: 14),
          _buildSectionCard(
            title: '2. No Investment or Guaranteed Returns',
            body: 'GrowPlus does not accept deposits, offer financial investment plans, or promise guaranteed monthly returns or interest. Cash deposits and investment schemes are strictly prohibited under our consumer compliance policies.',
          ),
          const SizedBox(height: 14),
          _buildSectionCard(
            title: '3. Referral Qualification & Anti-Fraud',
            body: 'Referral rewards are granted only when an invited user registers a genuine account and completes an eligible retail order that passes standard delivery and return inspection windows. Artificial account creation, self-referral, or automated abuse triggers immediate ledger reversal.',
          ),
          const SizedBox(height: 14),
          _buildSectionCard(
            title: '4. Non-Transferable & Non-Withdrawable',
            body: 'Promotional shopping credits cannot be redeemed for fiat currency, transferred between unverified third parties, or withdrawn to bank accounts. Credits expire according to individual campaign terms and return reconciliations.',
          ),
          const SizedBox(height: 14),
          _buildSectionCard(
            title: '5. Order Returns & Credit Reversal',
            body: 'In the event an order purchased with promotional credits is cancelled, refunded, or returned, eligible applied credits are restored atomically to the customer’s shopping wallet based on server-side financial ledger verification.',
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({required String title, required String body}) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF231044),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF3D1B75)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.purpleAccent,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: const TextStyle(
              fontSize: 13,
              color: Color(0xFFC5B5DF),
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}
