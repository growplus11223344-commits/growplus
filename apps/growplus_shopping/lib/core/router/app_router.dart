import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/onboarding_service.dart';
import '../services/api_service.dart';
import '../../features/onboarding/screens/shopping_onboarding_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/products/screens/products_screen.dart';
import '../../features/cart/screens/cart_screen.dart';
import '../../features/orders/screens/orders_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        redirect: (context, state) async {
          // 1. Cross-app SSO handoff token takes highest priority
          final token = state.uri.queryParameters['handoff_token'] ?? state.uri.queryParameters['token'];
          if (token != null && token.isNotEmpty) {
            return '/login?handoff_token=$token';
          }

          // 2. First launch check: show onboarding if not yet completed
          final onboardingCompleted = await OnboardingService.isOnboardingCompleted();
          if (!onboardingCompleted) {
            return '/onboarding';
          }

          // 3. If onboarding completed, check if user is already authenticated
          final authToken = await ApiService.getToken();
          if (authToken != null && authToken.isNotEmpty) {
            return '/home';
          }

          // 4. If onboarding completed but not authenticated, go to login
          return '/login';
        },
      ),
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const ShoppingOnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) {
          final token = state.uri.queryParameters['handoff_token'] ?? state.uri.queryParameters['token'];
          return LoginScreen(handoffToken: token);
        },
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(path: '/home', name: 'home', builder: (context, state) => const HomeScreen()),
      GoRoute(path: '/products', name: 'products', builder: (context, state) => const ProductsScreen()),
      GoRoute(path: '/cart', name: 'cart', builder: (context, state) => const CartScreen()),
      GoRoute(path: '/orders', name: 'orders', builder: (context, state) => const OrdersScreen()),
    ],
  );
});
