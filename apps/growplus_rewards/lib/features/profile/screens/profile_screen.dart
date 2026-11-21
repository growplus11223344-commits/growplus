import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';
import '../../auth/screens/login_screen.dart';
import 'my_profile_details_screen.dart';
import 'customer_support_screen.dart';
import 'compliance_terms_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _profile;
  bool _loading = true;
  bool _uploadingAvatar = false;

  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() => _loading = true);
    try {
      final p = await ApiService.getMe();
      if (mounted) {
        setState(() => _profile = p);
      }
    } catch (e) {
      debugPrint('Error loading profile: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _pickAndUploadImage(ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (file == null) return;

      final bytes = await file.readAsBytes();
      if (bytes.lengthInBytes > 2 * 1024 * 1024) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Photo exceeds 2 MB limit. Please select a smaller image.'),
            backgroundColor: AppColors.error,
          ),
        );
        return;
      }

      setState(() => _uploadingAvatar = true);
      final filename = file.name.isNotEmpty ? file.name : 'avatar.jpg';
      final res = await ApiService.uploadAvatar(bytes, filename);

      if (mounted) {
        setState(() {
          _profile?['avatar_url'] = res['avatar_url'];
          _profile?['avatar_signed_url'] = res['avatar_signed_url'];
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile photo updated successfully!'),
            backgroundColor: AppColors.purpleAccent,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
      );
    } finally {
      if (mounted) setState(() => _uploadingAvatar = false);
    }
  }

  Future<void> _removeAvatar() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF29154B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: Color(0xFF3D1B75)),
        ),
        title: const Text('Remove Photo', style: TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.bold)),
        content: const Text(
          'Are you sure you want to remove your profile photo?',
          style: TextStyle(color: Color(0xFFC5B5DF)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFFC5B5DF))),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Remove', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _uploadingAvatar = true);
    try {
      await ApiService.removeAvatar();
      if (mounted) {
        setState(() {
          _profile?['avatar_url'] = null;
          _profile?['avatar_signed_url'] = null;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile photo removed'),
            backgroundColor: AppColors.purpleAccent,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _uploadingAvatar = false);
    }
  }

  void _showPhotoOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF29154B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFF3D1B75),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 18),
              const Text(
                'Profile Photo',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textWhite),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.purpleAccent.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.photo_library_rounded, color: AppColors.purpleAccent, size: 22),
                ),
                title: const Text('Choose from Gallery', style: TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.w600)),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickAndUploadImage(ImageSource.gallery);
                },
              ),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.purpleAccent.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.camera_alt_rounded, color: AppColors.purpleAccent, size: 22),
                ),
                title: const Text('Take a Photo', style: TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.w600)),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickAndUploadImage(ImageSource.camera);
                },
              ),
              if (_profile?['avatar_url'] != null)
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.error.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 22),
                  ),
                  title: const Text('Remove Current Photo', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w600)),
                  onTap: () {
                    Navigator.pop(ctx);
                    _removeAvatar();
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleLogout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF29154B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF3D1B75)),
        ),
        title: const Text('Sign Out', style: TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.bold)),
        content: const Text(
          'Are you sure you want to sign out of GrowPlus Rewards?',
          style: TextStyle(color: Color(0xFFC5B5DF)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFFC5B5DF))),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Sign Out', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await Supabase.instance.client.auth.signOut();
      } catch (_) {}
      await ApiService.clearToken();
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
          (route) => false,
        );
      }
    }
  }

  void _showSecuritySettingsDialog() {
    final email = (_profile?['email'] ?? '').toString();
    final newPasswordController = TextEditingController();
    bool isUpdating = false;
    String? dialogStatus;
    bool isError = false;

    showDialog(
      context: context,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: const Color(0xFF29154B),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: Color(0xFF3D1B75)),
              ),
              title: const Row(
                children: [
                  Icon(Icons.shield_outlined, color: AppColors.purpleAccent, size: 24),
                  SizedBox(width: 10),
                  Text('Security Settings', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (dialogStatus != null) ...[
                      Container(
                        padding: const EdgeInsets.all(10),
                        margin: const EdgeInsets.only(bottom: 14),
                        decoration: BoxDecoration(
                          color: isError ? Colors.red.shade900.withOpacity(0.3) : Colors.green.shade900.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: isError ? Colors.red.shade400.withOpacity(0.4) : Colors.green.shade400.withOpacity(0.4)),
                        ),
                        child: Text(
                          dialogStatus!,
                          style: TextStyle(color: isError ? const Color(0xFFFF8B8B) : const Color(0xFF6EE7B7), fontSize: 12),
                        ),
                      ),
                    ],
                    const Text('Update Password', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: newPasswordController,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      obscureText: true,
                      decoration: InputDecoration(
                        hintText: 'New password (min 8 chars)',
                        hintStyle: const TextStyle(color: Color(0xFF8B7AA8), fontSize: 12),
                        filled: true,
                        fillColor: const Color(0xFF170A37),
                        prefixIcon: const Icon(Icons.lock_reset, color: AppColors.purpleAccent, size: 20),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF3D1B75))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF3D1B75))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.purpleAccent, width: 1.5)),
                        contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: isUpdating
                            ? null
                            : () async {
                                final newPass = newPasswordController.text.trim();
                                if (newPass.length < 8) {
                                  setDialogState(() {
                                    isError = true;
                                    dialogStatus = 'Password must be at least 8 characters';
                                  });
                                  return;
                                }
                                setDialogState(() {
                                  isUpdating = true;
                                  dialogStatus = null;
                                });
                                try {
                                  await Supabase.instance.client.auth.updateUser(
                                    UserAttributes(password: newPass),
                                  );
                                  setDialogState(() {
                                    isUpdating = false;
                                    isError = false;
                                    dialogStatus = 'Password successfully updated!';
                                    newPasswordController.clear();
                                  });
                                } catch (e) {
                                  setDialogState(() {
                                    isUpdating = false;
                                    isError = true;
                                    dialogStatus = e.toString().replaceFirst('Exception: ', '');
                                  });
                                }
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.purpleAccent,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: isUpdating
                            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Text('Update Password', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Divider(color: Color(0xFF3D1B75)),
                    const SizedBox(height: 10),
                    const Text('Reset via Email', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(
                      'Send a password reset link to $email',
                      style: const TextStyle(color: Color(0xFFC5B5DF), fontSize: 12),
                    ),
                    const SizedBox(height: 8),
                    OutlinedButton(
                      onPressed: isUpdating || email.isEmpty
                          ? null
                          : () async {
                              setDialogState(() {
                                isUpdating = true;
                                dialogStatus = null;
                              });
                              try {
                                await Supabase.instance.client.auth.resetPasswordForEmail(email);
                                setDialogState(() {
                                  isUpdating = false;
                                  isError = false;
                                  dialogStatus = 'Password reset link sent to $email!';
                                });
                              } catch (e) {
                                setDialogState(() {
                                  isUpdating = false;
                                  isError = true;
                                  dialogStatus = e.toString().replaceFirst('Exception: ', '');
                                });
                              }
                            },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.purpleAccent,
                        side: const BorderSide(color: AppColors.purpleAccent),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.mark_email_read_outlined, size: 16),
                          SizedBox(width: 8),
                          Text('Send Reset Link', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogCtx),
                  child: const Text('Close', style: TextStyle(color: Color(0xFFC5B5DF))),
                ),
              ],
            );
          },
        );
      },
    );
  }

  String _getInitials(String name) {
    if (name.trim().isEmpty) return 'GP';
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length > 1) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0].substring(0, parts[0].length >= 2 ? 2 : 1).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final name = (_profile?['full_name'] ?? 'GrowPlus Member').toString();
    final email = (_profile?['email'] ?? 'Not provided').toString();
    final phone = (_profile?['phone'] ?? '').toString();
    final avatarSignedUrl = _profile?['avatar_signed_url'] as String?;

    return Scaffold(
      backgroundColor: const Color(0xFF170B30),
      appBar: AppBar(
        title: const Text(
          'Profile',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: AppColors.textWhite),
        ),
        backgroundColor: const Color(0xFF170B30),
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.purpleAccent))
          : ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              children: [
                // Clickable Profile Card
                GestureDetector(
                  onTap: () {
                    if (_profile != null) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => MyProfileDetailsScreen(
                            initialProfile: _profile!,
                            onProfileUpdated: _loadProfile,
                          ),
                        ),
                      ).then((_) => _loadProfile());
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF29154B), Color(0xFF1E0E3B)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: const Color(0xFF3D1B75)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.3),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        // Avatar with camera icon
                        Stack(
                          children: [
                            Container(
                              width: 68,
                              height: 68,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: const LinearGradient(
                                  colors: [Color(0xFF8B5CF6), Color(0xFF3B0764)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                border: Border.all(color: AppColors.purpleAccent, width: 2),
                              ),
                              child: ClipOval(
                                child: _uploadingAvatar
                                    ? const Center(
                                        child: SizedBox(
                                          width: 20,
                                          height: 20,
                                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                        ),
                                      )
                                    : (avatarSignedUrl != null && avatarSignedUrl.isNotEmpty)
                                        ? Image.network(
                                            avatarSignedUrl,
                                            width: 68,
                                            height: 68,
                                            fit: BoxFit.cover,
                                            errorBuilder: (_, __, ___) => Center(
                                              child: Text(
                                                _getInitials(name),
                                                style: const TextStyle(
                                                  fontSize: 22,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.white,
                                                ),
                                              ),
                                            ),
                                          )
                                        : Center(
                                            child: Text(
                                              _getInitials(name),
                                              style: const TextStyle(
                                                fontSize: 22,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.white,
                                              ),
                                            ),
                                          ),
                              ),
                            ),
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: GestureDetector(
                                onTap: _showPhotoOptions,
                                child: Container(
                                  padding: const EdgeInsets.all(5),
                                  decoration: BoxDecoration(
                                    color: AppColors.purpleAccent,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: const Color(0xFF170B30), width: 1.5),
                                  ),
                                  child: const Icon(Icons.camera_alt_rounded, size: 12, color: Colors.white),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name,
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textWhite,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                email,
                                style: const TextStyle(fontSize: 12, color: Color(0xFFC5B5DF)),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                phone.isNotEmpty ? phone : 'Tap to complete profile',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: phone.isNotEmpty ? const Color(0xFFC5B5DF) : AppColors.purpleAccent,
                                  fontWeight: phone.isNotEmpty ? FontWeight.normal : FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.purpleAccent, size: 16),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Support & Information Card
                const Text(
                  'Support & Terms',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFFC5B5DF)),
                ),
                const SizedBox(height: 12),

                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF29154B),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF3D1B75)),
                  ),
                  child: Column(
                    children: [
                      ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.purpleAccent.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.headset_mic_rounded, color: AppColors.purpleAccent, size: 20),
                        ),
                        title: const Text('Customer Support & FAQs', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textWhite)),
                        subtitle: const Text('FAQs, tickets and live resolution', style: TextStyle(fontSize: 11, color: Color(0xFFC5B5DF))),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF8B7AA8)),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const CustomerSupportScreen()),
                          );
                        },
                      ),
                      const Divider(height: 1, color: Color(0xFF3D1B75)),
                      ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.purpleAccent.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.gavel_rounded, color: AppColors.purpleAccent, size: 20),
                        ),
                        title: const Text('Compliance & Reward Terms', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textWhite)),
                        subtitle: const Text('Retail promotional discount guidelines', style: TextStyle(fontSize: 11, color: Color(0xFFC5B5DF))),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF8B7AA8)),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const ComplianceTermsScreen()),
                          );
                        },
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Account Security & Settings
                const Text(
                  'Settings & Security',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFFC5B5DF)),
                ),
                const SizedBox(height: 12),

                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF29154B),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF3D1B75)),
                  ),
                  child: Column(
                    children: [
                      ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.purpleAccent.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.lock_outline_rounded, color: AppColors.purpleAccent, size: 20),
                        ),
                        title: const Text('Account Security & Password', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textWhite)),
                        subtitle: const Text('Update login password or send reset email', style: TextStyle(fontSize: 11, color: Color(0xFFC5B5DF))),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF8B7AA8)),
                        onTap: _showSecuritySettingsDialog,
                      ),
                      const Divider(height: 1, color: Color(0xFF3D1B75)),
                      ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.purpleAccent.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.info_outline_rounded, color: AppColors.purpleAccent, size: 20),
                        ),
                        title: const Text('App Information', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textWhite)),
                        subtitle: const Text('GrowPlus Rewards v1.0.0 (Build 20261120)', style: TextStyle(fontSize: 11, color: Color(0xFFC5B5DF))),
                        trailing: const Icon(Icons.verified_rounded, size: 16, color: AppColors.purpleAccent),
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('GrowPlus Rewards App v1.0.0 — Production Build'),
                              backgroundColor: AppColors.purpleAccent,
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                // Sign Out Button
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: OutlinedButton(
                    onPressed: _handleLogout,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFF87171),
                      side: const BorderSide(color: Color(0xFFEF4444), width: 1.5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      backgroundColor: const Color(0xFFEF4444).withOpacity(0.08),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.logout_rounded, size: 18),
                        SizedBox(width: 8),
                        Text('Sign Out', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
    );
  }
}
