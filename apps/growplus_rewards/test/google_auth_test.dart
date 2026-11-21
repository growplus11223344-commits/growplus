import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:growplus_rewards/core/constants/api_constants.dart';
import 'package:growplus_rewards/core/constants/supabase_constants.dart';
import 'package:growplus_rewards/features/auth/widgets/google_sign_in_button.dart';
import 'package:growplus_rewards/features/auth/screens/complete_profile_screen.dart';

void main() {
  group('GrowPlus Rewards Google Auth & Profile Tests', () {
    test('SupabaseConstants does not contain sensitive secrets', () {
      expect(SupabaseConstants.url, contains('supabase.co'));
      expect(SupabaseConstants.anonKey, startsWith('sb_publishable_'));
      expect(SupabaseConstants.anonKey, isNot(contains('service_role')));
      expect(SupabaseConstants.mobileRedirectUrl, equals('growplus://rewards/auth/callback'));
    });

    test('ApiConstants includes Google sync and complete-profile routes', () {
      expect(ApiConstants.googleSync, equals('/auth/google-sync'));
      expect(ApiConstants.completeProfile, equals('/auth/complete-profile'));
    });

    testWidgets('GoogleSignInButton renders with OR divider and multicolor SVG', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GoogleSignInButton(),
          ),
        ),
      );

      // Verify "OR" divider text
      expect(find.text('OR'), findsOneWidget);
      expect(find.byType(Divider), findsNWidgets(2));

      // Verify "Continue with Google" button text
      expect(find.text('Continue with Google'), findsOneWidget);

      // Verify SVG Google logo is rendered
      expect(find.byType(SvgPicture), findsOneWidget);

      // Verify OutlinedButton is used
      expect(find.byType(OutlinedButton), findsOneWidget);
    });

    testWidgets('CompleteProfileScreen renders mandatory mobile field and Google info', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: CompleteProfileScreen(
            googleEmail: 'test.google.user@example.com',
            googleName: 'Google Test User',
          ),
        ),
      );

      expect(find.text('Complete Your Profile'), findsOneWidget);
      expect(find.text('Connected with Google'), findsOneWidget);
      expect(find.text('test.google.user@example.com'), findsOneWidget);
      expect(find.text('Google Test User'), findsOneWidget);
      expect(find.text('🇮🇳 +91'), findsOneWidget);
      expect(find.text('Complete & Continue'), findsOneWidget);
      expect(find.text('Use a different account'), findsOneWidget);
    });

    testWidgets('CompleteProfileScreen validates empty or invalid phone numbers', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: CompleteProfileScreen(
            googleEmail: 'test.google.user@example.com',
            googleName: 'Google Test User',
          ),
        ),
      );

      // Tap Complete & Continue with empty phone
      await tester.tap(find.text('Complete & Continue'));
      await tester.pumpAndSettle();

      expect(find.text('Mobile number is required to proceed'), findsOneWidget);

      // Enter invalid phone
      await tester.enterText(find.byType(TextFormField).last, '12345');
      await tester.tap(find.text('Complete & Continue'));
      await tester.pumpAndSettle();

      expect(find.text('Please enter a valid 10-digit Indian mobile number'), findsOneWidget);
    });
  });
}
