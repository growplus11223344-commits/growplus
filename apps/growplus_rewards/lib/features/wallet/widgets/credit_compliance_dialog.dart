import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

void showCreditPurchaseUnavailableDialog(BuildContext context, {double? amount}) {
  showDialog(
    context: context,
    builder: (ctx) => AlertDialog(
      backgroundColor: const Color(0xFF231044),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: Color(0xFF3D1B75)),
      ),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.purpleAccent.withOpacity(0.18),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.info_outline_rounded, color: AppColors.purpleAccent, size: 22),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              'Credit Purchase Unavailable',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 17,
              ),
            ),
          ),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (amount != null && amount > 0) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF30105F),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF4C248B)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Selected Amount:', style: TextStyle(color: Color(0xFFCDBDEA), fontSize: 13)),
                  Text(
                    '₹${amount.toStringAsFixed(2)}',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
          ],
          const Text(
            'GrowPlus promotional shopping credits are retail discount incentives awarded exclusively upon verified eligible partner purchases and approved referrals.\n\n'
            'Under consumer financial regulations and RBI prepaid payment instrument (PPI) guidelines, direct real-money wallet top-ups and guaranteed return deposits are strictly disabled on this portal.',
            style: TextStyle(color: Color(0xFFCDBDEA), fontSize: 13, height: 1.45),
          ),
        ],
      ),
      actions: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.purpleAccent,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Understood', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    ),
  );
}
