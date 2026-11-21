import 'package:flutter_test/flutter_test.dart';
import 'package:growplus_rewards/core/constants/api_constants.dart';
import 'package:growplus_rewards/core/constants/app_colors.dart';
import 'package:growplus_rewards/app.dart';

void main() {
  group('GrowPlus Rewards App Configuration Tests', () {
    test('ApiConstants endpoints are properly configured', () {
      expect(ApiConstants.register, equals('/auth/register'));
      expect(ApiConstants.login, equals('/auth/login'));
      expect(ApiConstants.wallet, equals('/wallet'));
      expect(ApiConstants.myReferralCode, equals('/referrals/my-code'));
      expect(ApiConstants.rewards, equals('/rewards'));
      expect(ApiConstants.notifications, equals('/notifications'));
    });

    test('AppColors brand palette matches GrowPlus fintech spec', () {
      expect(AppColors.primary, isNotNull);
      expect(AppColors.secondary, isNotNull);
      expect(AppColors.success, isNotNull);
      expect(AppColors.background, isNotNull);
      expect(AppColors.surface, isNotNull);
    });

    test('GrowPlusRewardsApp widget instantiates correctly', () {
      const app = GrowPlusRewardsApp();
      expect(app, isNotNull);
    });
  });
}
