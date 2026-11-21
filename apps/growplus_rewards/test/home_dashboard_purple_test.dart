import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:growplus_rewards/core/constants/app_colors.dart';
import 'package:growplus_rewards/features/home/screens/home_screen.dart';

void main() {
  group('GrowPlus Rewards Purple Dashboard Tests', () {
    test('AppColors includes all required purple palette values', () {
      expect(AppColors.purpleBg, equals(const Color(0xFF120829)));
      expect(AppColors.purpleSurface, equals(const Color(0xFF231044)));
      expect(AppColors.purpleCardStart, equals(const Color(0xFF30105F)));
      expect(AppColors.purpleCardEnd, equals(const Color(0xFF170A37)));
      expect(AppColors.purpleAccent, equals(const Color(0xFFA66CFF)));
      expect(AppColors.textWhite, equals(const Color(0xFFFFFFFF)));
      expect(AppColors.textPurpleSecondary, equals(const Color(0xFFBDB0D8)));
    });

    testWidgets('HomeScreen builds and displays 5-item navigation with central ₹ button', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: HomeScreen(),
        ),
      );

      // Verify 5 bottom nav items exist
      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Portfolio'), findsOneWidget);
      expect(find.text('₹'), findsOneWidget); // Central floating ₹ action
      expect(find.text('Referrals'), findsOneWidget);
      expect(find.text('Profile'), findsOneWidget);

      // Verify Semantics widget is present
      expect(find.byType(Semantics), findsWidgets);
    });
  });
}
