import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:growplus_shopping/app.dart';

void main() {
  testWidgets('GrowPlus Shopping smoke test - app widget builds', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: GrowPlusShoppingApp(),
      ),
    );

    expect(find.byType(GrowPlusShoppingApp), findsOneWidget);
  });
}
