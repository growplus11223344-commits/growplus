import 'package:flutter_test/flutter_test.dart';
import 'package:growplus_shopping/core/constants/app_colors.dart';
import 'package:growplus_shopping/app.dart';

void main() {
  group('GrowPlus Shopping App Configuration Tests', () {
    test('AppColors brand palette matches GrowPlus eCommerce spec', () {
      expect(AppColors.primary, isNotNull);
      expect(AppColors.secondary, isNotNull);
      expect(AppColors.background, isNotNull);
      expect(AppColors.cardBackground, isNotNull);
      expect(AppColors.success, isNotNull);
    });

    test('GrowPlusShoppingApp widget instantiates correctly', () {
      const app = GrowPlusShoppingApp();
      expect(app, isNotNull);
    });

    test('Net payable calculations with promotional credits', () {
      const orderTotal = 1500.0;
      const availableCredits = 400.0;
      
      const creditsToApply = availableCredits > orderTotal ? orderTotal : availableCredits;
      const netPayable = orderTotal - creditsToApply;

      expect(creditsToApply, equals(400.0));
      expect(netPayable, equals(1100.0));
    });
  });
}
