import 'package:flutter/foundation.dart';

class ApiConstants {
  ApiConstants._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: kIsWeb ? 'http://localhost:3001/api/v1' : 'http://10.0.2.2:3001/api/v1',
  );

  // Auth
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String googleSync = '/auth/google-sync';
  static const String completeProfile = '/auth/complete-profile';

  // User
  static const String me = '/users/me';

  // Wallet
  static const String wallet = '/wallet';
  static const String walletTransactions = '/wallet/transactions';

  // Referrals
  static const String myReferralCode = '/referrals/my-code';
  static const String referralHistory = '/referrals/history';

  // Rewards
  static const String rewards = '/rewards';
  static const String rewardRules = '/rewards/rules';

  // Notifications
  static const String notifications = '/notifications';
}
