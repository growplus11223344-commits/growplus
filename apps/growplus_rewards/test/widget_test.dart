import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:growplus_rewards/app.dart';

void main() {
  testWidgets('GrowPlus Rewards smoke test - app widget builds', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: GrowPlusRewardsApp(),
      ),
    );

    expect(find.byType(GrowPlusRewardsApp), findsOneWidget);
    await tester.pump(const Duration(milliseconds: 500));
  });
}
