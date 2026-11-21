import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:growplus_shopping/core/services/onboarding_service.dart';
import 'package:growplus_shopping/features/onboarding/screens/shopping_onboarding_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('GrowPlus Shopping Onboarding Persistence & Unit Tests', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('Onboarding status defaults to false on first launch', () async {
      final isCompleted = await OnboardingService.isOnboardingCompleted();
      expect(isCompleted, isFalse);
    });

    test('setOnboardingCompleted updates persistent flag correctly', () async {
      await OnboardingService.setOnboardingCompleted();
      final isCompleted = await OnboardingService.isOnboardingCompleted();
      expect(isCompleted, isTrue);

      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getBool(OnboardingService.key), isTrue);
    });

    test('Logout / auth clear does not remove onboarding completion', () async {
      await OnboardingService.setOnboardingCompleted();
      // Simulate auth token clear
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('growplus_shopping_token');
      await prefs.remove('growplus_shopping_user');

      final isCompleted = await OnboardingService.isOnboardingCompleted();
      expect(isCompleted, isTrue);
    });
  });

  group('GrowPlus Shopping Onboarding Widget Tests', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    testWidgets('First launch displays Page 1 (Welcome to GrowPlus)', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ShoppingOnboardingScreen(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Welcome to GrowPlus'), findsOneWidget);
      expect(find.text('Everything You Love, In One Place.'), findsOneWidget);
      expect(find.text('Next'), findsOneWidget);
      expect(find.text('Skip'), findsOneWidget);
    });

    testWidgets('Tapping Next navigates from Page 1 to Page 2', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ShoppingOnboardingScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Next
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(find.text('Discover Amazing Products'), findsOneWidget);
      expect(find.text('Explore. Choose. Enjoy.'), findsOneWidget);
      // Back button should now be present
      expect(find.byIcon(Icons.arrow_back_ios_new_rounded), findsOneWidget);
    });

    testWidgets('Tapping Back navigates back to Page 1', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ShoppingOnboardingScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Next to Page 2
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      // Back to Page 1
      await tester.tap(find.byIcon(Icons.arrow_back_ios_new_rounded));
      await tester.pumpAndSettle();

      expect(find.text('Welcome to GrowPlus'), findsOneWidget);
    });

    testWidgets('Tapping Skip navigates directly to Page 4 with Login & Sign Up', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ShoppingOnboardingScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Skip
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();

      expect(find.text("Let's Get Started"), findsOneWidget);
      expect(find.text('Your Shopping Journey Starts Here.'), findsOneWidget);
      expect(find.text('Login'), findsOneWidget);
      expect(find.text('Create New Account'), findsOneWidget);
      // Skip button should no longer be visible on page 4
      expect(find.text('Skip'), findsNothing);
    });

    testWidgets('Swiping through pages works smoothly', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ShoppingOnboardingScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Swipe left to page 2
      await tester.fling(find.byType(PageView), const Offset(-400, 0), 1000);
      await tester.pumpAndSettle();
      expect(find.text('Discover Amazing Products'), findsOneWidget);

      // Swipe left to page 3
      await tester.fling(find.byType(PageView), const Offset(-400, 0), 1000);
      await tester.pumpAndSettle();
      expect(find.text('Shopping Made Simple'), findsOneWidget);
      expect(find.text('Your Cart, Your Choice.'), findsOneWidget);

      // Swipe left to page 4
      await tester.fling(find.byType(PageView), const Offset(-400, 0), 1000);
      await tester.pumpAndSettle();
      expect(find.text("Let's Get Started"), findsOneWidget);
    });

    testWidgets('Tapping Login on Page 4 marks onboarding as completed', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ShoppingOnboardingScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Skip to Page 4
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();

      // Tap Login
      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      final isCompleted = await OnboardingService.isOnboardingCompleted();
      expect(isCompleted, isTrue);
    });
  });
}
