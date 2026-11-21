import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../constants/api_constants.dart';

class ApiService {
  static const String _tokenKey = 'growplus_auth_token';

  static Future<String?> getToken() async {
    try {
      final supaSession = Supabase.instance.client.auth.currentSession;
      if (supaSession != null && supaSession.accessToken.isNotEmpty) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_tokenKey, supaSession.accessToken);
        return supaSession.accessToken;
      }
    } catch (_) {}

    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  static Future<Map<String, String>> _headers() async {
    final token = await getToken();
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // Authentication
  static Future<Map<String, dynamic>> syncGoogleOAuth({
    String? fullName,
    String? avatarUrl,
  }) async {
    final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.googleSync}');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({
        if (fullName != null) 'full_name': fullName,
        if (avatarUrl != null) 'avatar_url': avatarUrl,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Google profile synchronization failed');
    }
  }

  static Future<Map<String, dynamic>> completeProfile({
    required String phone,
    String? fullName,
  }) async {
    final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.completeProfile}');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({
        'phone': phone,
        if (fullName != null) 'full_name': fullName,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Failed to complete profile');
    }
  }

  static Future<Map<String, dynamic>> login({required String email, required String password}) async {
    final url = Uri.parse('${ApiConstants.baseUrl}/auth/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (data['access_token'] != null) {
        await saveToken(data['access_token']);
      }
      return data;
    } else {
      throw Exception(data['error'] ?? 'Login failed');
    }
  }

  static Future<Map<String, dynamic>> register({
    required String fullName,
    String? email,
    String? phone,
    required String password,
    String? referralCode,
  }) async {
    final url = Uri.parse('${ApiConstants.baseUrl}/auth/register');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'full_name': fullName,
        'email': email,
        'phone': phone,
        'password': password,
        'referral_code': referralCode,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Registration failed');
    }
  }

  // User Profile & Stats
  static Future<Map<String, dynamic>> getMe() async {
    final url = Uri.parse('${ApiConstants.baseUrl}/users/me');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load profile');
  }

  // Wallet
  static Future<Map<String, dynamic>> getWallet() async {
    final url = Uri.parse('${ApiConstants.baseUrl}/wallet');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to fetch wallet');
  }

  static Future<List<dynamic>> getWalletTransactions({int page = 1, String? type}) async {
    final query = '?page=$page&limit=30${type != null ? '&type=$type' : ''}';
    final url = Uri.parse('${ApiConstants.baseUrl}/wallet/transactions$query');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['transactions'] ?? [];
    }
    throw Exception('Failed to fetch transactions');
  }

  // Wallet Top-up (Razorpay)
  static Future<Map<String, dynamic>> createWalletTopup(double amount) async {
    final url = Uri.parse('${ApiConstants.baseUrl}/wallet/create-topup');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({'amount': amount}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }
    throw Exception(data['error'] ?? 'Failed to initialize top-up order');
  }

  static Future<Map<String, dynamic>> verifyWalletTopup({
    String? razorpayOrderId,
    String? razorpayPaymentId,
    String? razorpaySignature,
    String? provider,
    String? paymentId,
    required double amount,
  }) async {
    final url = Uri.parse('${ApiConstants.baseUrl}/wallet/verify-topup');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({
        if (provider != null) 'provider': provider,
        if (paymentId != null) 'payment_id': paymentId,
        if (razorpayOrderId != null) 'razorpay_order_id': razorpayOrderId,
        if (razorpayPaymentId != null) 'razorpay_payment_id': razorpayPaymentId,
        if (razorpaySignature != null) 'razorpay_signature': razorpaySignature,
        'amount': amount,
      }),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }
    throw Exception(data['error'] ?? 'Failed to verify payment and add credits');
  }

  // Referrals
  static Future<Map<String, dynamic>> getReferralCode() async {
    final url = Uri.parse('${ApiConstants.baseUrl}/referrals/my-code');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to fetch referral code');
  }

  static Future<List<dynamic>> getReferralHistory() async {
    final url = Uri.parse('${ApiConstants.baseUrl}/referrals/history');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to fetch referral history');
  }

  // Cross-App Handoff to GrowPlus Shopping
  static Future<Map<String, dynamic>> getCrossAppToken() async {
    final token = await getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Please sign in first to access GrowPlus Shopping');
    }

    final url = Uri.parse('${ApiConstants.baseUrl}/auth/cross-app-token');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      if (data is Map<String, dynamic>) {
        return data;
      }
    }

    try {
      final data = jsonDecode(response.body);
      final errorMsg = data['error'] ?? data['message'];
      if (errorMsg != null && errorMsg.toString().isNotEmpty) {
        throw Exception(errorMsg.toString());
      }
    } catch (e) {
      if (e is Exception && !e.toString().contains('FormatException')) rethrow;
    }

    throw Exception('Failed to generate cross-app handoff token (HTTP ${response.statusCode})');
  }

  // Notifications
  static Future<List<dynamic>> getNotifications() async {
    final url = Uri.parse('${ApiConstants.baseUrl}/notifications');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['notifications'] ?? [];
    }
    throw Exception('Failed to load notifications');
  }

  static Future<void> markNotificationAsRead(String id) async {
    final url = Uri.parse('${ApiConstants.baseUrl}/notifications/$id/read');
    await http.patch(url, headers: await _headers());
  }

  static Future<void> markAllNotificationsAsRead() async {
    final url = Uri.parse('${ApiConstants.baseUrl}/notifications/mark-all-read');
    await http.patch(url, headers: await _headers());
  }

  // Support
  static Future<void> createSupportTicket({
    required String subject,
    required String description,
    String category = 'other',
    String? orderId,
  }) async {
    final url = Uri.parse('${ApiConstants.baseUrl}/support/tickets');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({
        'subject': subject,
        'description': description,
        'category': category,
        if (orderId != null) 'order_id': orderId,
      }),
    );
    if (response.statusCode != 201) {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Failed to submit ticket');
    }
  }

  static Future<List<dynamic>> getSupportTickets() async {
    final url = Uri.parse('${ApiConstants.baseUrl}/support/tickets');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to load support tickets');
  }

  static Future<Map<String, dynamic>> getSupportTicketDetails(String ticketId) async {
    final url = Uri.parse('${ApiConstants.baseUrl}/support/tickets/$ticketId');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to load ticket details');
  }

  static Future<Map<String, dynamic>> replySupportTicket(String ticketId, String message) async {
    final url = Uri.parse('${ApiConstants.baseUrl}/support/tickets/$ticketId/messages');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({'message': message}),
    );
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    }
    final data = jsonDecode(response.body);
    throw Exception(data['error'] ?? 'Failed to send message');
  }

  // Profile Updates & Avatar Management
  static Future<Map<String, dynamic>> updateProfile({String? fullName, String? phone}) async {
    final url = Uri.parse('${ApiConstants.baseUrl}/users/me');
    final response = await http.patch(
      url,
      headers: await _headers(),
      body: jsonEncode({
        if (fullName != null) 'full_name': fullName,
        if (phone != null) 'phone': phone,
      }),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }
    throw Exception(data['error'] ?? 'Failed to update profile');
  }

  static Future<Map<String, dynamic>> uploadAvatar(Uint8List imageBytes, String filename) async {
    final url = Uri.parse('${ApiConstants.baseUrl}/users/me/avatar');
    final token = await getToken();
    final request = http.MultipartRequest('POST', url);
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    request.files.add(
      http.MultipartFile.fromBytes(
        'avatar',
        imageBytes,
        filename: filename,
      ),
    );

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    final data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }
    throw Exception(data['error'] ?? 'Failed to upload avatar');
  }

  static Future<Map<String, dynamic>> removeAvatar() async {
    final url = Uri.parse('${ApiConstants.baseUrl}/users/me/avatar');
    final response = await http.delete(url, headers: await _headers());
    final data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }
    throw Exception(data['error'] ?? 'Failed to remove avatar');
  }
}
