import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/constants/app_colors.dart';
import 'core/router/app_router.dart';

class GrowPlusRewardsApp extends ConsumerWidget {
  const GrowPlusRewardsApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'GrowPlus Rewards',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.purpleAccent,
          secondary: Color(0xFF7C3AED),
          surface: AppColors.purpleSurface,
          background: AppColors.purpleBg,
        ),
        scaffoldBackgroundColor: AppColors.purpleBg,
        useMaterial3: true,
      ),
      routerConfig: router,
    );
  }
}
