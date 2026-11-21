import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:growplus_rewards/features/profile/screens/my_profile_details_screen.dart';
import 'package:growplus_rewards/features/profile/screens/customer_support_screen.dart';
import 'package:growplus_rewards/features/profile/screens/compliance_terms_screen.dart';
import 'package:growplus_rewards/features/notifications/screens/notifications_screen.dart';

void main() {
  group('GrowPlus Rewards Profile, Support & Compliance Tests', () {
    testWidgets('MyProfileDetailsScreen splits full_name and displays verified email', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: MyProfileDetailsScreen(
            initialProfile: const {
              'full_name': 'Ajay Kumar',
              'email': 'ajay.kumar@example.com',
              'phone': '+919876543210',
            },
            onProfileUpdated: () {},
          ),
        ),
      );

      expect(find.text('My Profile'), findsOneWidget);
      expect(find.text('Ajay'), findsOneWidget);
      expect(find.text('Kumar'), findsOneWidget);
      expect(find.text('ajay.kumar@example.com'), findsOneWidget);
      expect(find.text('Verified'), findsOneWidget);
      expect(find.text('+919876543210'), findsOneWidget);
      expect(find.text('Change Photo'), findsOneWidget);
    });

    testWidgets('CustomerSupportScreen renders FAQs, Raise Ticket, and My Tickets tabs', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: CustomerSupportScreen(),
        ),
      );

      expect(find.text('Customer Support'), findsOneWidget);
      expect(find.text('FAQs'), findsOneWidget);
      expect(find.text('Raise Ticket'), findsOneWidget);
      expect(find.text('My Tickets'), findsOneWidget);

      // Verify FAQ questions appear
      expect(find.text('How do I earn promotional shopping credits?'), findsOneWidget);
    });

    testWidgets('ComplianceTermsScreen renders retail compliance standards', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ComplianceTermsScreen(),
        ),
      );

      expect(find.text('Compliance & Terms'), findsOneWidget);
      expect(find.text('1. Retail Promotional Rewards Model'), findsOneWidget);
      expect(find.text('2. No Investment or Guaranteed Returns'), findsOneWidget);
    });

    testWidgets('NotificationsScreen renders with title and empty state', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: NotificationsScreen(),
        ),
      );

      expect(find.text('Notifications'), findsOneWidget);
    });
  });
}
