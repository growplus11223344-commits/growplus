import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants/supabase_constants.dart';
import '../../../core/services/api_service.dart';
import '../../home/screens/home_screen.dart';
import '../screens/complete_profile_screen.dart';

class GoogleSignInButton extends StatefulWidget {
  final Function(String error)? onError;
  final VoidCallback? onLoadingStateChange;

  const GoogleSignInButton({
    super.key,
    this.onError,
    this.onLoadingStateChange,
  });

  @override
  State<GoogleSignInButton> createState() => _GoogleSignInButtonState();
}

class _GoogleSignInButtonState extends State<GoogleSignInButton> {
  bool _isLoading = false;

  static const String _googleSvg = '''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
</svg>
''';

  Future<void> _handleGoogleSignIn() async {
    setState(() => _isLoading = true);
    widget.onLoadingStateChange?.call();

    try {
      final supabase = Supabase.instance.client;

      // Determine redirect URL
      final String redirectUrl;
      if (kIsWeb) {
        redirectUrl = '${Uri.base.origin}/';
      } else {
        redirectUrl = SupabaseConstants.mobileRedirectUrl;
      }

      final res = await supabase.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: redirectUrl,
      );

      if (!res) {
        throw Exception('Google Sign-In initialization cancelled or failed');
      }

      // Check if session is already active
      final session = supabase.auth.currentSession;
      if (session != null && mounted) {
        await _processSuccessfulAuth(session);
      }
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      widget.onError?.call(msg);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(msg),
            backgroundColor: Colors.red.shade700,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
        widget.onLoadingStateChange?.call();
      }
    }
  }

  Future<void> _processSuccessfulAuth(Session session) async {
    // 1. Save Supabase token for backend API requests
    await ApiService.saveToken(session.accessToken);

    // 2. Synchronize Google profile with backend & check profile completion
    final syncData = await ApiService.syncGoogleOAuth(
      fullName: session.user.userMetadata?['full_name'] ?? session.user.userMetadata?['name'],
      avatarUrl: session.user.userMetadata?['avatar_url'] ?? session.user.userMetadata?['picture'],
    );

    final bool isProfileComplete = syncData['is_profile_complete'] == true;

    if (!mounted) return;

    if (!isProfileComplete) {
      // Navigate to mandatory Complete Profile screen
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => CompleteProfileScreen(
            googleEmail: session.user.email ?? '',
            googleName: session.user.userMetadata?['full_name'] ?? session.user.userMetadata?['name'] ?? '',
          ),
        ),
        (route) => false,
      );
    } else {
      // Profile complete - proceed directly to dashboard
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // "OR" Divider
        const Row(
          children: [
            Expanded(child: Divider(color: Color(0xFF3D1B75), thickness: 1)),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'OR',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFBDB0D8),
                  letterSpacing: 1.0,
                ),
              ),
            ),
            Expanded(child: Divider(color: Color(0xFF3D1B75), thickness: 1)),
          ],
        ),
        const SizedBox(height: 18),

        // Premium White Outlined "Continue with Google" Button
        SizedBox(
          width: double.infinity,
          height: 52,
          child: OutlinedButton(
            onPressed: _isLoading ? null : _handleGoogleSignIn,
            style: OutlinedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFF1E293B),
              side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.5),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            child: _isLoading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      color: Color(0xFF4285F4),
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SvgPicture.string(
                        _googleSvg,
                        width: 22,
                        height: 22,
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Continue with Google',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1E293B),
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ],
    );
  }
}
