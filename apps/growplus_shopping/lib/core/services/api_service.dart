import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

class ApiService {
  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: kIsWeb ? 'http://localhost:3001/api/v1' : 'http://10.0.2.2:3001/api/v1',
  );

  static const String _tokenKey = 'growplus_shopping_token';
  static const String _userKey = 'growplus_shopping_user';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  static Future<void> clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  static Future<void> clearToken() => clearAuth();

  // User Profile
  static Future<Map<String, dynamic>> getMe() async {
    final url = Uri.parse('$_baseUrl/users/me');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load profile');
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

  // Auth & Cross-App Handoff
  static Future<Map<String, dynamic>> syncGoogleOAuth({
    String? fullName,
    String? avatarUrl,
  }) async {
    final url = Uri.parse('$_baseUrl/auth/google-sync');
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
    final url = Uri.parse('$_baseUrl/auth/complete-profile');
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
    final url = Uri.parse('$_baseUrl/auth/login');
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
    final url = Uri.parse('$_baseUrl/auth/register');
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
      if (data['access_token'] != null) {
        await saveToken(data['access_token']);
      }
      return data;
    } else {
      throw Exception(data['error'] ?? 'Registration failed');
    }
  }

  static Future<Map<String, dynamic>> verifyCrossAppHandoff(String handoffToken) async {
    final url = Uri.parse('$_baseUrl/auth/verify-cross-app');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'handoff_token': handoffToken}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_userKey, jsonEncode(data['profile'] ?? {}));
      if (data['access_token'] != null) {
        await saveToken(data['access_token']);
      }
      return data;
    } else {
      throw Exception(data['error'] ?? 'Cross-app verification failed');
    }
  }

  // Categories & Products
  static Future<List<dynamic>> getCategories() async {
    final url = Uri.parse('$_baseUrl/categories');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load categories');
  }

  static Future<Map<String, dynamic>> getProducts({String? category, String? search, int page = 1}) async {
    var query = '?page=$page&limit=20';
    if (category != null && category.isNotEmpty) query += '&category=$category';
    if (search != null && search.isNotEmpty) query += '&search=$search';

    final url = Uri.parse('$_baseUrl/products$query');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load products');
  }

  static Future<Map<String, dynamic>> getProductById(String id) async {
    final url = Uri.parse('$_baseUrl/products/$id');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Product not found');
  }

  // Wallet Credits (Verified from Supabase ledger)
  static Future<Map<String, dynamic>> getWallet() async {
    final url = Uri.parse('$_baseUrl/wallet');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to fetch wallet');
  }

  // Cart
  static Future<Map<String, dynamic>> getCart() async {
    final url = Uri.parse('$_baseUrl/cart');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load cart');
  }

  static Future<void> addToCart({required String productId, int quantity = 1, String? variationId}) async {
    final url = Uri.parse('$_baseUrl/cart/items');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({
        'product_id': productId,
        'quantity': quantity,
        'variation_id': variationId,
      }),
    );
    if (response.statusCode != 201) {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Failed to add item to cart');
    }
  }

  static Future<void> updateCartItemQuantity({required String cartItemId, required int quantity}) async {
    final url = Uri.parse('$_baseUrl/cart/items/$cartItemId');
    final response = await http.patch(
      url,
      headers: await _headers(),
      body: jsonEncode({'quantity': quantity}),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update cart');
    }
  }

  static Future<void> removeFromCart(String cartItemId) async {
    final url = Uri.parse('$_baseUrl/cart/items/$cartItemId');
    final response = await http.delete(url, headers: await _headers());
    if (response.statusCode != 200) {
      throw Exception('Failed to remove item');
    }
  }

  // Checkout & Orders
  static Future<Map<String, dynamic>> createOrder({
    required Map<String, dynamic> shippingAddress,
    double creditsToApply = 0,
    String? notes,
  }) async {
    final idempotencyKey = const Uuid().v4();
    final url = Uri.parse('$_baseUrl/orders');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({
        'shipping_address': shippingAddress,
        'credits_to_apply': creditsToApply,
        'idempotency_key': idempotencyKey,
        'notes': notes,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 201 || response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Failed to place order');
    }
  }

  // Payment Integration (Razorpay)
  static Future<Map<String, dynamic>> createPaymentOrder(String orderId) async {
    final url = Uri.parse('$_baseUrl/payments/create-order');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({'order_id': orderId}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Failed to initiate payment');
    }
  }

  static Future<void> verifyPayment({
    required String orderId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    final url = Uri.parse('$_baseUrl/payments/verify');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({
        'order_id': orderId,
        'razorpay_order_id': razorpayOrderId,
        'razorpay_payment_id': razorpayPaymentId,
        'razorpay_signature': razorpaySignature,
      }),
    );

    if (response.statusCode != 200) {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Payment verification failed');
    }
  }

  static Future<void> verifyEuropepayPayment({
    required String orderId,
    String? paymentId,
  }) async {
    final url = Uri.parse('$_baseUrl/payments/verify');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({
        'order_id': orderId,
        'provider': 'europepay',
        'payment_id': paymentId,
      }),
    );

    if (response.statusCode != 200) {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? data['message'] ?? 'Europepay payment verification failed');
    }
  }

  static Future<Map<String, dynamic>> getActivePaymentGateway() async {
    final url = Uri.parse('$_baseUrl/payments/active-gateway');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return {'provider': 'razorpay', 'isAvailable': true};
  }

  // Payment Failure & Credit Reversal Handling
  static Future<void> reportPaymentFailure({
    required String orderId,
    required String reason,
    String? idempotencyKey,
  }) async {
    final key = idempotencyKey ?? const Uuid().v4();
    final url = Uri.parse('$_baseUrl/payments/fail');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({
        'order_id': orderId,
        'reason': reason,
        'idempotency_key': key,
      }),
    );
    if (response.statusCode != 200) {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Failed to report payment failure');
    }
  }

  // Orders
  static Future<List<dynamic>> getOrders({int page = 1}) async {
    final url = Uri.parse('$_baseUrl/orders?page=$page&limit=20');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['orders'] ?? [];
    }
    throw Exception('Failed to load orders');
  }

  // Transactions
  static Future<List<dynamic>> getTransactions({String? type}) async {
    final query = '?page=1&limit=30${type != null ? '&type=$type' : ''}';
    final url = Uri.parse('$_baseUrl/wallet/transactions$query');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['transactions'] ?? [];
    }
    throw Exception('Failed to fetch transactions');
  }

  // Support
  static Future<List<dynamic>> getTickets() async {
    final url = Uri.parse('$_baseUrl/support/tickets');
    final response = await http.get(url, headers: await _headers());
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to load tickets');
  }

  static Future<void> createTicket({
    required String subject,
    required String category,
    required String message,
    String? orderId,
  }) async {
    final url = Uri.parse('$_baseUrl/support/tickets');
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({
        'subject': subject,
        'description': message,
        'category': category,
        if (orderId != null) 'order_id': orderId,
      }),
    );
    if (response.statusCode != 201) {
      final data = jsonDecode(response.body);
      throw Exception(data['error'] ?? 'Failed to submit ticket');
    }
  }
}
