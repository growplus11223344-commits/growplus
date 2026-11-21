import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';

class MyProfileDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> initialProfile;
  final VoidCallback onProfileUpdated;

  const MyProfileDetailsScreen({
    super.key,
    required this.initialProfile,
    required this.onProfileUpdated,
  });

  @override
  State<MyProfileDetailsScreen> createState() => _MyProfileDetailsScreenState();
}

class _MyProfileDetailsScreenState extends State<MyProfileDetailsScreen> {
  late Map<String, dynamic> _profile;
  bool _isEditing = false;
  bool _saving = false;
  bool _uploadingAvatar = false;

  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _phoneController;
  final _formKey = GlobalKey<FormState>();

  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _profile = Map<String, dynamic>.from(widget.initialProfile);
    _initControllers();
  }

  void _initControllers() {
    final fullName = (_profile['full_name'] ?? '').toString().trim();
    final parts = fullName.split(' ');
    final firstName = parts.isNotEmpty ? parts.first : '';
    final lastName = parts.length > 1 ? parts.sublist(1).join(' ') : '';

    String phone = (_profile['phone'] ?? '').toString();
    if (phone.startsWith('+91')) {
      phone = phone.replaceFirst('+91', '').trim();
    }

    _firstNameController = TextEditingController(text: firstName);
    _lastNameController = TextEditingController(text: lastName);
    _phoneController = TextEditingController(text: phone);
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    super.dispose();
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
            content: Text('Image file exceeds the 2 MB limit. Please choose a smaller photo.'),
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
          _profile['avatar_url'] = res['avatar_url'];
          _profile['avatar_signed_url'] = res['avatar_signed_url'];
        });
        widget.onProfileUpdated();
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
        SnackBar(content: Text('Error uploading photo: $e'), backgroundColor: AppColors.error),
      );
    } finally {
      if (mounted) setState(() => _uploadingAvatar = false);
    }
  }

  Future<void> _removeAvatar() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.purpleSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: AppColors.purpleBorder),
        ),
        title: const Text('Remove Photo', style: TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.bold)),
        content: const Text(
          'Are you sure you want to remove your profile photo?',
          style: TextStyle(color: AppColors.textPurpleSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textPurpleSecondary)),
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
          _profile['avatar_url'] = null;
          _profile['avatar_signed_url'] = null;
        });
        widget.onProfileUpdated();
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
      backgroundColor: AppColors.purpleSurface,
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
                  color: AppColors.purpleBorder,
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
              if (_profile['avatar_url'] != null)
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

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    final first = _firstNameController.text.trim();
    final last = _lastNameController.text.trim();
    final combinedName = last.isNotEmpty ? '$first $last' : first;

    final cleanPhone = _phoneController.text.trim().replaceAll(RegExp(r'[\s\-]'), '');
    final formattedPhone = cleanPhone.isNotEmpty ? (cleanPhone.startsWith('+91') ? cleanPhone : '+91$cleanPhone') : null;

    setState(() => _saving = true);
    try {
      final updated = await ApiService.updateProfile(
        fullName: combinedName,
        phone: formattedPhone,
      );

      if (mounted) {
        setState(() {
          _profile = updated;
          _isEditing = false;
        });
        widget.onProfileUpdated();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated successfully!'),
            backgroundColor: AppColors.purpleAccent,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error updating profile: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
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
    final avatarSignedUrl = _profile['avatar_signed_url'] as String?;
    final fullName = (_profile['full_name'] ?? 'GrowPlus Member').toString();
    final email = (_profile['email'] ?? 'Not provided').toString();
    final phone = (_profile['phone'] ?? '').toString();

    return Scaffold(
      backgroundColor: const Color(0xFF170B30),
      appBar: AppBar(
        backgroundColor: const Color(0xFF170B30),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textWhite, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'My Profile',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.textWhite,
          ),
        ),
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit_outlined, color: AppColors.purpleAccent),
              onPressed: () => setState(() => _isEditing = true),
              tooltip: 'Edit Profile',
            )
          else
            IconButton(
              icon: const Icon(Icons.close_rounded, color: AppColors.textPurpleSecondary),
              onPressed: () {
                _initControllers();
                setState(() => _isEditing = false);
              },
              tooltip: 'Cancel Edit',
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Avatar Section
              Center(
                child: Stack(
                  children: [
                    Container(
                      width: 104,
                      height: 104,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: [Color(0xFF8B5CF6), Color(0xFF3B0764)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        border: Border.all(color: AppColors.purpleAccent, width: 2.5),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.purpleAccent.withOpacity(0.35),
                            blurRadius: 18,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: ClipOval(
                        child: _uploadingAvatar
                            ? const Center(
                                child: SizedBox(
                                  width: 28,
                                  height: 28,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                                ),
                              )
                            : (avatarSignedUrl != null && avatarSignedUrl.isNotEmpty)
                                ? Image.network(
                                    avatarSignedUrl,
                                    width: 104,
                                    height: 104,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Center(
                                      child: Text(
                                        _getInitials(fullName),
                                        style: const TextStyle(
                                          fontSize: 34,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  )
                                : Center(
                                    child: Text(
                                      _getInitials(fullName),
                                      style: const TextStyle(
                                        fontSize: 34,
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
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.purpleAccent,
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF170B30), width: 2.5),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.3),
                                blurRadius: 6,
                              ),
                            ],
                          ),
                          child: const Icon(Icons.camera_alt_rounded, size: 16, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: _showPhotoOptions,
                child: const Text(
                  'Change Photo',
                  style: TextStyle(
                    color: AppColors.purpleAccent,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Profile Fields Card
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: const Color(0xFF29154B),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: const Color(0xFF3D1B75)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.25),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // First Name Field
                    _buildFieldLabel('First Name'),
                    const SizedBox(height: 6),
                    if (_isEditing)
                      TextFormField(
                        controller: _firstNameController,
                        style: const TextStyle(color: AppColors.textWhite, fontSize: 15),
                        decoration: _buildInputDecoration(hint: 'Enter first name'),
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) {
                            return 'First name is required';
                          }
                          return null;
                        },
                      )
                    else
                      _buildDisplayValue(_firstNameController.text.isNotEmpty ? _firstNameController.text : 'Not provided'),
                    const SizedBox(height: 18),

                    // Last Name Field
                    _buildFieldLabel('Last Name'),
                    const SizedBox(height: 6),
                    if (_isEditing)
                      TextFormField(
                        controller: _lastNameController,
                        style: const TextStyle(color: AppColors.textWhite, fontSize: 15),
                        decoration: _buildInputDecoration(hint: 'Enter last name (optional)'),
                      )
                    else
                      _buildDisplayValue(_lastNameController.text.isNotEmpty ? _lastNameController.text : '—'),
                    const SizedBox(height: 18),

                    // Mobile Number Field
                    _buildFieldLabel('Mobile Number'),
                    const SizedBox(height: 6),
                    if (_isEditing)
                      TextFormField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(color: AppColors.textWhite, fontSize: 15),
                        decoration: _buildInputDecoration(
                          hint: '9876543210',
                          prefixText: '🇮🇳 +91 ',
                        ),
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) return null;
                          final clean = val.replaceAll(RegExp(r'[\s\-]'), '');
                          if (!RegExp(r'^[6-9][0-9]{9}$').hasMatch(clean)) {
                            return 'Enter a valid 10-digit Indian mobile number';
                          }
                          return null;
                        },
                      )
                    else
                      _buildDisplayValue(phone.isNotEmpty ? phone : 'Not linked (Tap edit to add)'),
                    const SizedBox(height: 18),

                    // Email Address (Verified / Read-Only per spec)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildFieldLabel('Email Address'),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withOpacity(0.18),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'Verified',
                            style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1F0F3A),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF34175B)),
                      ),
                      child: Text(
                        email,
                        style: const TextStyle(color: Color(0xFFC5B5DF), fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // Save Button (when editing)
              if (_isEditing) ...[
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _saving ? null : _handleSave,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.purpleAccent,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 4,
                      shadowColor: AppColors.purpleAccent.withOpacity(0.5),
                    ),
                    child: _saving
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                          )
                        : const Text(
                            'Save Changes',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () {
                    _initControllers();
                    setState(() => _isEditing = false);
                  },
                  child: const Text('Cancel', style: TextStyle(color: AppColors.textPurpleSecondary)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.bold,
        color: Color(0xFFC5B5DF),
        letterSpacing: 0.3,
      ),
    );
  }

  Widget _buildDisplayValue(String text) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E0E3B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF34175B)),
      ),
      child: Text(
        text,
        style: const TextStyle(color: AppColors.textWhite, fontSize: 15, fontWeight: FontWeight.w600),
      ),
    );
  }

  InputDecoration _buildInputDecoration({required String hint, String? prefixText}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFF6B588D), fontSize: 14),
      prefixText: prefixText,
      prefixStyle: const TextStyle(color: AppColors.textWhite, fontSize: 15, fontWeight: FontWeight.bold),
      filled: true,
      fillColor: const Color(0xFF1A0A33),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFF3D1B75)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFF4C248B)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.purpleAccent, width: 1.5),
      ),
    );
  }
}
