import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:growplus_rewards/features/wallet/screens/wallet_screen.dart';
import 'package:growplus_rewards/features/wallet/screens/add_credits_screen.dart';
import 'package:growplus_rewards/features/wallet/widgets/add_credits_bottom_sheet.dart';
import 'package:growplus_rewards/features/wallet/widgets/credit_compliance_dialog.dart';

void main() {
  group('GrowPlus Rewards Portfolio & Add Credits Tests', () {
    testWidgets('WalletScreen renders Portfolio title, balance card, and amount chips', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: WalletScreen(),
        ),
      );
      await tester.pump(const Duration(milliseconds: 100));

      // Verify Page Title
      expect(find.text('Portfolio'), findsOneWidget);

      // Verify Balance Card
      expect(find.text('YOUR SHOPPING WALLET'), findsOneWidget);
      expect(find.text('Ledger Verified'), findsOneWidget);
      expect(find.text('Available Shopping Credits'), findsOneWidget);
      expect(find.text('Pending Credits'), findsOneWidget);
      expect(find.text('Lifetime Earned'), findsOneWidget);
      expect(find.text('Credits Used'), findsOneWidget);

      // Verify Amount Selection Interface
      expect(find.text('Add Money'), findsOneWidget);
      expect(find.text('₹500'), findsOneWidget);
      expect(find.text('₹1,000'), findsOneWidget);
      expect(find.text('₹2,000'), findsOneWidget);
      expect(find.text('₹5,000'), findsOneWidget);
      expect(find.text('₹10,000'), findsOneWidget);

      // Verify Transaction History and Filters
      expect(find.text('Transaction History'), findsOneWidget);
      expect(find.text('All'), findsOneWidget);
      expect(find.text('Credits'), findsOneWidget);
      expect(find.text('Payments'), findsOneWidget);
      expect(find.text('Purchases'), findsOneWidget);
      expect(find.text('Adjustments'), findsOneWidget);

      // Verify Shopping App CTA card
      expect(find.text('Explore GrowPlus Shopping'), findsOneWidget);
      expect(find.text('Open GrowPlus Shopping App'), findsOneWidget);
    });

    testWidgets('Amount selection validates minimum ₹500', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: WalletScreen(),
        ),
      );
      await tester.pump(const Duration(milliseconds: 100));

      // Enter 200 (less than 500)
      final inputFinder = find.byType(TextField);
      expect(inputFinder, findsOneWidget);

      await tester.enterText(inputFinder, '200');
      await tester.pump(const Duration(milliseconds: 50));

      expect(find.text('Minimum amount is ₹500'), findsOneWidget);

      // Enter valid amount 750
      await tester.enterText(inputFinder, '750');
      await tester.pump(const Duration(milliseconds: 50));

      expect(find.text('Minimum amount is ₹500'), findsNothing);
      expect(find.text('₹750.00'), findsOneWidget);
    });

    testWidgets('AddCreditsBottomSheet renders requested presets for central ₹ button', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AddCreditsBottomSheet(),
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 100));

      // Presets for central ₹ button: ₹500, ₹800, ₹2,800, ₹5,800, ₹10,800
      expect(find.text('Add Shopping Credits'), findsOneWidget);
      expect(find.text('₹500'), findsOneWidget);
      expect(find.text('₹800'), findsOneWidget);
      expect(find.text('₹2,800'), findsOneWidget);
      expect(find.text('₹5,800'), findsOneWidget);
      expect(find.text('₹10,800'), findsOneWidget);
      expect(find.text('Custom Amount'), findsOneWidget);
      expect(find.text('Review & Add Credits'), findsOneWidget);
    });

    testWidgets('Compliance dialog displays strict financial terms', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => ElevatedButton(
                onPressed: () => showCreditPurchaseUnavailableDialog(context, amount: 1500),
                child: const Text('Open Dialog'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Open Dialog'));
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Credit Purchase Unavailable'), findsOneWidget);
      expect(find.text('Selected Amount:'), findsOneWidget);
      expect(find.text('₹1500.00'), findsOneWidget);
      expect(find.text('Understood'), findsOneWidget);
    });

    testWidgets('AddCreditsScreen full page renders properly with all elements', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: AddCreditsScreen(),
        ),
      );
      await tester.pump(const Duration(milliseconds: 100));

      // 1. Verify Full Page Title and Badges
      expect(find.text('Add Money'), findsOneWidget);
      expect(find.text('Store Credits'), findsOneWidget);

      // 2. Verify Balance Card
      expect(find.text('CURRENT SHOPPING WALLET'), findsOneWidget);
      expect(find.text('Usable 100% on GrowPlus Shopping orders'), findsOneWidget);

      // 3. Verify Preset Packages
      expect(find.text('Select Credit Package'), findsOneWidget);
      expect(find.text('₹500'), findsOneWidget);
      expect(find.text('₹800'), findsOneWidget);
      expect(find.text('₹2800'), findsOneWidget);
      expect(find.text('₹5800'), findsOneWidget);
      expect(find.text('₹10800'), findsOneWidget);
      expect(find.text('POPULAR'), findsOneWidget);

      // 4. Verify Custom Amount Input
      expect(find.text('Custom Amount'), findsOneWidget);

      // 5. Verify Benefits Card
      expect(find.text('Shopping Credits Benefits'), findsOneWidget);
      expect(find.text('Instant Activation'), findsOneWidget);
      expect(find.text('100% Usable on Shopping'), findsOneWidget);

      // 6. Verify Bottom Action Dock
      expect(find.text('TOTAL PAYABLE'), findsOneWidget);
      expect(find.text('100% Converted to Credits'), findsOneWidget);
      expect(find.text('Proceed to Add Money • ₹500.00'), findsOneWidget);
    });

    testWidgets('AddCreditsScreen preset selection updates total dynamically', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: AddCreditsScreen(),
        ),
      );
      await tester.pump(const Duration(milliseconds: 100));

      // Tap ₹2800 preset
      await tester.tap(find.text('₹2800'));
      await tester.pump(const Duration(milliseconds: 50));

      expect(find.text('Proceed to Add Money • ₹2,800.00'), findsOneWidget);

      // Tap ₹10800 preset
      await tester.tap(find.text('₹10800'));
      await tester.pump(const Duration(milliseconds: 50));

      expect(find.text('Proceed to Add Money • ₹10,800.00'), findsOneWidget);
    });
  });
}
