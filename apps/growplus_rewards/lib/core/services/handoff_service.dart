import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../constants/app_colors.dart';
import 'api_service.dart';

class HandoffService {
  HandoffService._();

  /// Seamlessly authenticates and launches the GrowPlus Shopping App
  /// Works across Flutter Web, Android native intent, and iOS.
  static Future<void> openShoppingApp(BuildContext context) async {
    // 1. Verify that user is signed in
    String? token = await ApiService.getToken();

    if (token == null || token.isEmpty) {
      try {
        final supaSession = Supabase.instance.client.auth.currentSession;
        if (supaSession != null && supaSession.accessToken.isNotEmpty) {
          token = supaSession.accessToken;
          await ApiService.saveToken(token);
        }
      } catch (_) {}
    }

    if (token == null || token.isEmpty) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please sign in to your GrowPlus account to access Shopping.'),
            backgroundColor: Color(0xFFF59E0B),
            duration: Duration(seconds: 3),
          ),
        );
      }
      return;
    }

    // 2. Request single-use SSO handoff token from backend
    String handoffToken = '';
    try {
      final handoffResult = await ApiService.getCrossAppToken();
      handoffToken = (handoffResult['handoff_token'] ??
              handoffResult['launch_token'] ??
              handoffResult['token']) as String? ??
          '';
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Unable to connect to Shopping App: ${e.toString().replaceFirst("Exception: ", "")}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
      return;
    }

    if (handoffToken.isEmpty) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to generate secure shopping session. Please try again.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
      return;
    }

    // 3. Launch target based on platform
    final shoppingWebUrl = 'http://localhost:8082/#/login?handoff_token=$handoffToken';
    final shoppingDeepLink = 'growplus://shopping?handoff_token=$handoffToken';

    try {
      if (kIsWeb) {
        // Web Platform (Chrome, Safari, Firefox, Edge)
        final uri = Uri.parse(shoppingWebUrl);
        await launchUrl(uri, webOnlyWindowName: '_blank');
      } else {
        // Mobile Platforms (Android, iOS)
        final nativeUri = Uri.parse(shoppingDeepLink);
        bool launched = false;
        try {
          if (await canLaunchUrl(nativeUri)) {
            launched = await launchUrl(nativeUri, mode: LaunchMode.externalApplication);
          }
        } catch (_) {}

        if (!launched) {
          final webUri = Uri.parse(shoppingWebUrl);
          await launchUrl(webUri, mode: LaunchMode.externalApplication);
        }
      }

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Connecting you to GrowPlus Shopping with shared wallet credits...'),
            backgroundColor: AppColors.purpleAccent,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not open Shopping App: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }
}
