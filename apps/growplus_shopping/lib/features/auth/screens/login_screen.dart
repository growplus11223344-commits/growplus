import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';
import '../../home/screens/home_screen.dart';
import '../widgets/google_sign_in_button.dart';
import 'complete_profile_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  final String? handoffToken;
  const LoginScreen({super.key, this.handoffToken});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  String? _errorMessage;
  StreamSubscription<AuthState>? _authSubscription;

  @override
  void initState() {
    super.initState();
    if (widget.handoffToken != null) {
      _processHandoffToken(widget.handoffToken!);
    }
    _initAuthListener();
  }

  void _initAuthListener() {
    try {
      _authSubscription = Supabase.instance.client.auth.onAuthStateChange.listen((data) async {
        final session = data.session;
        if (data.event == AuthChangeEvent.signedIn && session != null && mounted) {
          await _processOAuthSession(session);
        }
      });
    } catch (_) {}
  }

  Future<void> _processOAuthSession(Session session) async {
    try {
      await ApiService.saveToken(session.accessToken);
      final syncData = await ApiService.syncGoogleOAuth(
        fullName: session.user.userMetadata?['full_name'] ?? session.user.userMetadata?['name'],
        avatarUrl: session.user.userMetadata?['avatar_url'] ?? session.user.userMetadata?['picture'],
      );

      final isComplete = syncData['is_profile_complete'] == true;
      if (!mounted) return;

      if (!isComplete) {
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
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
          (route) => false,
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = e.toString().replaceFirst('Exception: ', ''));
      }
    }
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _processHandoffToken(String token) async {
    setState(() => _isLoading = true);
    try {
      await ApiService.verifyCrossAppHandoff(token);
      if (mounted) {
        try {
          context.go('/home');
        } catch (_) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const HomeScreen()),
          );
        }
      }
    } catch (e) {
      setState(() => _errorMessage = 'Failed to link session from Rewards app: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Please enter email and password');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ApiService.login(email: email, password: password);
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      }
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showForgotPasswordDialog() {
    final resetEmailController = TextEditingController(text: _emailController.text.trim());
    bool isSubmitting = false;
    String? dialogError;
    String? dialogSuccess;

    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: AppColors.purpleSurface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: AppColors.purpleBorder, width: 1.2),
              ),
              title: const Row(
                children: [
                  Icon(Icons.lock_reset, color: AppColors.purpleAccent, size: 24),
                  SizedBox(width: 10),
                  Text(
                    'Reset Password',
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Enter your registered email address. We will send you a secure link to reset your password.',
                      style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 13, height: 1.4),
                    ),
                    const SizedBox(height: 16),
                    if (dialogError != null) ...[
                      Container(
                        padding: const EdgeInsets.all(10),
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: Colors.red.shade900.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.red.shade400.withOpacity(0.4)),
                        ),
                        child: Text(
                          dialogError!,
                          style: const TextStyle(color: Color(0xFFFF8B8B), fontSize: 12),
                        ),
                      ),
                    ],
                    if (dialogSuccess != null) ...[
                      Container(
                        padding: const EdgeInsets.all(10),
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: Colors.green.shade900.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.green.shade400.withOpacity(0.4)),
                        ),
                        child: Text(
                          dialogSuccess!,
                          style: const TextStyle(color: Color(0xFF6EE7B7), fontSize: 12),
                        ),
                      ),
                    ],
                    TextField(
                      controller: resetEmailController,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'user@example.com',
                        hintStyle: const TextStyle(color: AppColors.textPurpleMuted),
                        filled: true,
                        fillColor: const Color(0xFF170A37),
                        prefixIcon: const Icon(Icons.email_outlined, color: AppColors.purpleAccent, size: 20),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.purpleBorder),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.purpleBorder),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.purpleAccent, width: 1.5),
                        ),
                        contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                      ),
                      keyboardType: TextInputType.emailAddress,
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: isSubmitting ? null : () => Navigator.of(dialogContext).pop(),
                  child: const Text('Cancel', style: TextStyle(color: AppColors.textPurpleSecondary)),
                ),
                ElevatedButton(
                  onPressed: isSubmitting
                      ? null
                      : () async {
                          final email = resetEmailController.text.trim();
                          if (email.isEmpty) {
                            setDialogState(() => dialogError = 'Please enter your email address');
                            return;
                          }
                          setDialogState(() {
                            isSubmitting = true;
                            dialogError = null;
                            dialogSuccess = null;
                          });

                          try {
                            await Supabase.instance.client.auth.resetPasswordForEmail(email);
                            setDialogState(() {
                              isSubmitting = false;
                              dialogSuccess = 'Password reset link sent! Check your email inbox.';
                            });
                          } catch (err) {
                            setDialogState(() {
                              isSubmitting = false;
                              dialogError = err.toString().replaceFirst('Exception: ', '');
                            });
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.purpleAccent,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: isSubmitting
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Send Link', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.purpleBg,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Brand Header with Glowing Violet Accent
                Center(
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(
                            colors: [Color(0xFF3C1877), Color(0xFF170A37)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          border: Border.all(color: AppColors.purpleAccent.withOpacity(0.5), width: 1.5),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.purpleAccent.withOpacity(0.25),
                              blurRadius: 20,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: const Icon(Icons.shopping_bag_outlined, color: AppColors.purpleAccent, size: 36),
                      ),
                      const SizedBox(height: 16),
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('GROW', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 0.5)),
                          Text('PLUS', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.purpleAccent, letterSpacing: 0.5)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Exclusive Member Shopping',
                        style: TextStyle(fontSize: 14, color: AppColors.textPurpleSecondary, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Form Container
                Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: AppColors.purpleSurface,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppColors.purpleBorder, width: 1.2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.35),
                        blurRadius: 18,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Welcome to Shopping',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Sign in to shop with your promotional credits & wallet',
                        style: TextStyle(fontSize: 12, color: AppColors.textPurpleSecondary),
                      ),
                      const SizedBox(height: 20),

                      if (_errorMessage != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red.shade900.withOpacity(0.35),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.red.shade400.withOpacity(0.4)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.error_outline, color: Color(0xFFFF8B8B), size: 18),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _errorMessage!,
                                  style: const TextStyle(color: Color(0xFFFF8B8B), fontSize: 12),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Email input
                      const Text(
                        'Email Address',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPurpleSecondary),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _emailController,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          hintText: 'user@example.com',
                          hintStyle: const TextStyle(color: AppColors.textPurpleMuted, fontSize: 13),
                          prefixIcon: const Icon(Icons.mail_outline, size: 20, color: AppColors.purpleAccent),
                          filled: true,
                          fillColor: const Color(0xFF170A37),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.purpleBorder)),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.purpleBorder)),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.purpleAccent, width: 1.5)),
                          contentPadding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        keyboardType: TextInputType.emailAddress,
                      ),

                      const SizedBox(height: 16),

                      // Password input
                      const Text(
                        'Password',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPurpleSecondary),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _passwordController,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          hintText: '••••••••••••',
                          hintStyle: const TextStyle(color: AppColors.textPurpleMuted, fontSize: 13),
                          prefixIcon: const Icon(Icons.lock_outline, size: 20, color: AppColors.purpleAccent),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                              color: AppColors.textPurpleSecondary,
                              size: 20,
                            ),
                            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                          ),
                          filled: true,
                          fillColor: const Color(0xFF170A37),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.purpleBorder)),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.purpleBorder)),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.purpleAccent, width: 1.5)),
                          contentPadding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        obscureText: _obscurePassword,
                      ),

                      // Forgot Password Link
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: _showForgotPasswordDialog,
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          child: const Text(
                            'Forgot Password?',
                            style: TextStyle(
                              color: AppColors.purpleAccent,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Sign in Button
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.purpleAccent,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 4,
                            shadowColor: AppColors.purpleAccent.withOpacity(0.4),
                          ),
                          child: _isLoading
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Text('Sign In & Shop', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: 0.3)),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Google Sign In Button with OR divider
                      GoogleSignInButton(
                        onError: (err) => setState(() => _errorMessage = err),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Register link
                Center(
                  child: TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const RegisterScreen()),
                      );
                    },
                    child: RichText(
                      text: const TextSpan(
                        text: "Don't have an account? ",
                        style: TextStyle(color: AppColors.textPurpleSecondary, fontSize: 13),
                        children: [
                          TextSpan(
                            text: 'Create Account',
                            style: TextStyle(color: AppColors.purpleAccent, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
