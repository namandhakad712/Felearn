[23:06:38.539] Running build in Washington, D.C., USA (East) – iad1
[23:06:38.541] Build machine configuration: 2 cores, 8 GB
[23:06:38.585] Cloning github.com/namandhakad712/Felearn (Branch: master, Commit: df2081c)
[23:06:38.920] Previous build caches not available
[23:06:39.776] Cloning completed: 1.190s
[23:06:41.692] Running "vercel build"
[23:06:42.336] Vercel CLI 44.6.4
[23:06:42.932] Warning: Detected "engines": { "node": ">=18.0.0" } in your `package.json` that will automatically upgrade when a new major Node.js Version is released. Learn More: http://vercel.link/node-version
[23:06:42.939] Installing dependencies...
[23:06:45.629] npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
[23:06:45.955] npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[23:06:46.037] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[23:06:46.702] npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
[23:06:46.734] npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
[23:06:48.582] npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
[23:06:50.314] 
[23:06:50.315] > felearn-ai@1.0.0 postinstall
[23:06:50.315] > npm run type-check
[23:06:50.315] 
[23:06:50.448] 
[23:06:50.449] > felearn-ai@1.0.0 type-check
[23:06:50.449] > tsc --noEmit
[23:06:50.449] 
[23:07:00.225] src/appInit.ts(40,28): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.226] src/components/AdminRoute.tsx(20,22): error TS2339: Property 'isAdmin' does not exist on type 'User<Preferences>'.
[23:07:00.226] src/components/AppRoutes.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
[23:07:00.227] src/components/AppRoutes.tsx(9,18): error TS2304: Cannot find name 'lazy'.
[23:07:00.227] src/components/AppRoutes.tsx(10,31): error TS2304: Cannot find name 'lazy'.
[23:07:00.227] src/components/AppRoutes.tsx(11,24): error TS2304: Cannot find name 'lazy'.
[23:07:00.228] src/components/AppRoutes.tsx(12,23): error TS2304: Cannot find name 'lazy'.
[23:07:00.228] src/components/AppRoutes.tsx(26,6): error TS2304: Cannot find name 'Suspense'.
[23:07:00.228] src/components/AppRoutes.tsx(50,7): error TS2304: Cannot find name 'Suspense'.
[23:07:00.228] src/components/MagicURLLogin.tsx(13,11): error TS2339: Property 'loginWithMagicURL' does not exist on type 'AuthContextType'.
[23:07:00.228] src/components/admin/AdminProtectedRoute.tsx(22,26): error TS2339: Property 'isAdmin' does not exist on type 'User<Preferences>'.
[23:07:00.229] src/components/admin/DashboardMetrics.tsx(22,3): error TS2339: Property '_onRefresh' does not exist on type 'DashboardMetricsProps'.
[23:07:00.229] src/components/admin/DashboardMetrics.tsx(22,3): error TS6133: '_onRefresh' is declared but its value is never read.
[23:07:00.229] src/components/admin/DataMigrationTool.tsx(2,27): error TS2307: Cannot find module '../../utils/dataMigration' or its corresponding type declarations.
[23:07:00.229] src/components/admin/DataMigrationTool.tsx(3,32): error TS2307: Cannot find module '../../utils/dataTransformation' or its corresponding type declarations.
[23:07:00.230] src/components/admin/UserManagementTable.tsx(103,47): error TS2339: Property 'getUsers' does not exist on type 'AdminService'.
[23:07:00.230] src/components/admin/UserManagementTable.tsx(131,26): error TS2554: Expected 3 arguments, but got 2.
[23:07:00.230] src/components/admin/UserManagementTable.tsx(164,32): error TS2554: Expected 3 arguments, but got 2.
[23:07:00.230] src/components/admin/UserManagementTable.tsx(186,9): error TS6133: '_handleSelectAll' is declared but its value is never read.
[23:07:00.233] src/components/admin/UserManagementTable.tsx(198,9): error TS6133: '_handleSelectUser' is declared but its value is never read.
[23:07:00.233] src/components/admin/UserManagementTable.tsx(211,22): error TS2448: Block-scoped variable 'paginatedUsers' used before its declaration.
[23:07:00.233] src/components/admin/UserManagementTable.tsx(211,22): error TS2454: Variable 'paginatedUsers' is used before being assigned.
[23:07:00.234] src/components/admin/UserManagementTable.tsx(562,23): error TS7034: Variable 'pageNum' implicitly has type 'any' in some locations where its type cannot be determined.
[23:07:00.234] src/components/admin/UserManagementTable.tsx(576,53): error TS7005: Variable 'pageNum' implicitly has an 'any' type.
[23:07:00.234] src/components/admin/charts/BarChart.tsx(11,8): error TS2307: Cannot find module 'chart.js' or its corresponding type declarations.
[23:07:00.234] src/components/admin/charts/BarChart.tsx(12,21): error TS2307: Cannot find module 'react-chartjs-2' or its corresponding type declarations.
[23:07:00.234] src/components/admin/charts/HeatmapCalendar.tsx(81,30): error TS6133: 'index' is declared but its value is never read.
[23:07:00.235] src/components/admin/charts/LineChart.tsx(12,8): error TS2307: Cannot find module 'chart.js' or its corresponding type declarations.
[23:07:00.235] src/components/admin/charts/LineChart.tsx(13,22): error TS2307: Cannot find module 'react-chartjs-2' or its corresponding type declarations.
[23:07:00.235] src/components/auth/LoginForm.tsx(58,15): error TS2345: Argument of type 'ErrorDisplayData' is not assignable to parameter of type 'Error'.
[23:07:00.235]   Property 'name' is missing in type 'ErrorDisplayData' but required in type 'Error'.
[23:07:00.235] src/components/auth/PasswordResetForm.tsx(47,15): error TS2345: Argument of type 'ErrorDisplayData' is not assignable to parameter of type 'Error'.
[23:07:00.236] src/components/auth/PersistenceSelector.tsx(16,42): error TS2554: Expected 0 arguments, but got 1.
[23:07:00.236] src/components/auth/PersistenceSelector.tsx(93,18): error TS2339: Property 'message' does not exist on type 'never'.
[23:07:00.236] src/components/dashboard/DashboardHeader.tsx(14,3): error TS2339: Property '_sidebarOpen' does not exist on type 'DashboardHeaderProps'.
[23:07:00.236] src/components/dashboard/DashboardHeader.tsx(14,3): error TS6133: '_sidebarOpen' is declared but its value is never read.
[23:07:00.236] src/components/dashboard/DashboardHeader.tsx(90,24): error TS2339: Property 'isAdmin' does not exist on type 'User<Preferences>'.
[23:07:00.241] src/components/dashboard/DashboardLayout.tsx(119,11): error TS2739: Type 'User<Preferences>' is missing the following properties from type 'User': geminiKey, createdAt, settings
[23:07:00.241] src/components/dashboard/FeedbackModal.tsx(35,30): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.242] src/components/dashboard/FeedbackModal.tsx(36,29): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.242] src/components/dashboard/FeedbackModal.tsx(72,21): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.242] src/components/dashboard/FeedbackModal.tsx(133,11): error TS2322: Type '{ hidden: { opacity: number; scale: number; y: number; }; visible: { opacity: number; scale: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }; exit: { opacity: number; scale: number; y: number; transition: { ...; }; }; }' is not assignable to type 'Variants'.
[23:07:00.243]   Property 'visible' is incompatible with index signature.
[23:07:00.243]     Type '{ opacity: number; scale: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'Variant'.
[23:07:00.243]       Type '{ opacity: number; scale: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type 'TargetAndTransition'.
[23:07:00.243]         Type '{ opacity: number; scale: number; y: number; transition: { type: string; stiffness: number; damping: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues | undefined; }'.
[23:07:00.243]           Types of property 'transition' are incompatible.
[23:07:00.244]             Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'Transition<any> | undefined'.
[23:07:00.244]               Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
[23:07:00.244]                 Type '{ type: string; stiffness: number; damping: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
[23:07:00.244]                   Types of property 'type' are incompatible.
[23:07:00.244]                     Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
[23:07:00.244] src/components/dashboard/StorageStatus.tsx(3,56): error TS2307: Cannot find module '../../utils/testBucketConnection' or its corresponding type declarations.
[23:07:00.244] src/components/dashboard/StorageStatus.tsx(29,11): error TS6133: 'result' is declared but its value is never read.
[23:07:00.244] src/components/examples/AuthHooksExample.tsx(9,3): error TS2614: Module '"../../hooks"' has no exported member 'useUserProfile'. Did you mean to use 'import useUserProfile from "../../hooks"' instead?
[23:07:00.244] src/components/examples/AuthHooksExample.tsx(18,9): error TS6133: 'auth' is declared but its value is never read.
[23:07:00.244] src/components/examples/AuthHooksExample.tsx(24,11): error TS2339: Property 'loginWithEmail' does not exist on type '{ login: (email: string, password: string) => Promise<boolean>; isLoading: boolean; error: ErrorDisplayData | null; }'.
[23:07:00.244] src/components/examples/AuthHooksExample.tsx(25,11): error TS2339: Property 'registerWithEmail' does not exist on type '{ register: (email: string, password: string) => Promise<boolean>; isLoading: boolean; error: ErrorDisplayData | null; }'.
[23:07:00.244] src/components/examples/AuthHooksExample.tsx(27,11): error TS2339: Property 'sendPasswordResetEmail' does not exist on type '{ resetPassword: (email: string) => Promise<boolean>; isLoading: boolean; error: ErrorDisplayData | null; }'.
[23:07:00.244] src/components/examples/AuthHooksExample.tsx(27,62): error TS2339: Property 'success' does not exist on type '{ resetPassword: (email: string) => Promise<boolean>; isLoading: boolean; error: ErrorDisplayData | null; }'.
[23:07:00.244] src/components/examples/AuthHooksExample.tsx(78,30): error TS2554: Expected 0 arguments, but got 1.
[23:07:00.244] src/components/layout/Footer.tsx(3,35): error TS2307: Cannot find module '../../services/subscriberService' or its corresponding type declarations.
[23:07:00.244] src/components/onboarding/ApiKeyStep.tsx(2,1): error TS6133: 'motion' is declared but its value is never read.
[23:07:00.244] src/components/onboarding/ApiKeyStep.tsx(4,1): error TS6133: 'geminiService' is declared but its value is never read.
[23:07:00.244] src/components/onboarding/ApiKeyStep.tsx(4,10): error TS2724: '"../../services"' has no exported member named 'geminiService'. Did you mean 'AdminService'?
[23:07:00.244] src/components/profile/ApiKeyManager.tsx(2,1): error TS6133: 'authService' is declared but its value is never read.
[23:07:00.245] src/components/profile/ApiKeyManager.tsx(28,9): error TS6133: '_hasExistingKey' is declared but its value is never read.
[23:07:00.245] src/components/profile/ApiKeyManager.tsx(28,33): error TS2339: Property 'geminiKey' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/ApiKeyManager.tsx(28,51): error TS2339: Property 'geminiKey' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/ApiKeyManager.tsx(34,17): error TS2339: Property 'geminiKey' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/ApiKeyManager.tsx(34,35): error TS2339: Property 'geminiKey' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/ApiKeyManager.tsx(42,13): error TS2339: Property 'geminiKey' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/ApiKeyManager.tsx(154,9): error TS6133: '_handleCancel' is declared but its value is never read.
[23:07:00.245] src/components/profile/CredentialUpdate.tsx(92,41): error TS2339: Property 'verifyPassword' does not exist on type 'AuthService'.
[23:07:00.245] src/components/profile/CredentialUpdate.tsx(110,25): error TS2339: Property 'updateEmail' does not exist on type 'AuthService'.
[23:07:00.245] src/components/profile/CredentialUpdate.tsx(125,25): error TS2339: Property 'updatePassword' does not exist on type 'AuthService'.
[23:07:00.245] src/components/profile/SecurityManager.tsx(164,19): error TS6133: 'useAuth' is declared but its value is never read.
[23:07:00.245] src/components/profile/UserPreferencesManager.tsx(20,11): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/UserPreferencesManager.tsx(23,11): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/UserPreferencesManager.tsx(42,51): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/UserPreferencesManager.tsx(43,57): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/UserPreferencesManager.tsx(45,46): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/UserPreferencesManager.tsx(68,20): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/UserPreferencesManager.tsx(81,17): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/UserPreferencesManager.tsx(82,23): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/UserPreferencesManager.tsx(83,31): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/UserPreferencesManager.tsx(91,33): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/profile/UserPreferencesManager.tsx(92,36): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.245] src/components/sections/HeroSection.tsx(79,13): error TS2322: Type '{ hidden: { opacity: number; y: number; }; visible: { opacity: number; y: number; transition: { duration: number; ease: string; }; }; }' is not assignable to type 'Variants'.
[23:07:00.245]   Property 'visible' is incompatible with index signature.
[23:07:00.245]     Type '{ opacity: number; y: number; transition: { duration: number; ease: string; }; }' is not assignable to type 'Variant'.
[23:07:00.245]       Type '{ opacity: number; y: number; transition: { duration: number; ease: string; }; }' is not assignable to type 'TargetAndTransition'.
[23:07:00.246]         Type '{ opacity: number; y: number; transition: { duration: number; ease: string; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues | undefined; }'.
[23:07:00.246]           Types of property 'transition' are incompatible.
[23:07:00.246]             Type '{ duration: number; ease: string; }' is not assignable to type 'Transition<any> | undefined'.
[23:07:00.246]               Type '{ duration: number; ease: string; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
[23:07:00.246]                 Type '{ duration: number; ease: string; }' is not assignable to type 'ValueAnimationTransition<any>'.
[23:07:00.246]                   Types of property 'ease' are incompatible.
[23:07:00.246]                     Type 'string' is not assignable to type 'Easing | Easing[] | undefined'.
[23:07:00.246] src/components/sections/HeroSection.tsx(84,15): error TS2322: Type '{ initial: { rotate: number; }; hover: { rotate: number[]; transition: { duration: number; repeat: number; repeatType: string; }; }; }' is not assignable to type 'Variants'.
[23:07:00.246]   Property 'hover' is incompatible with index signature.
[23:07:00.246]     Type '{ rotate: number[]; transition: { duration: number; repeat: number; repeatType: string; }; }' is not assignable to type 'Variant'.
[23:07:00.246]       Type '{ rotate: number[]; transition: { duration: number; repeat: number; repeatType: string; }; }' is not assignable to type 'TargetAndTransition'.
[23:07:00.246]         Type '{ rotate: number[]; transition: { duration: number; repeat: number; repeatType: string; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues | undefined; }'.
[23:07:00.246]           Types of property 'transition' are incompatible.
[23:07:00.246]             Type '{ duration: number; repeat: number; repeatType: string; }' is not assignable to type 'Transition<any> | undefined'.
[23:07:00.246]               Type '{ duration: number; repeat: number; repeatType: string; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
[23:07:00.246]                 Type '{ duration: number; repeat: number; repeatType: string; }' is not assignable to type 'ValueAnimationTransition<any>'.
[23:07:00.246]                   Types of property 'repeatType' are incompatible.
[23:07:00.246]                     Type 'string' is not assignable to type 'RepeatType | undefined'.
[23:07:00.246] src/components/sections/HeroSection.tsx(114,15): error TS2322: Type '{ hidden: { opacity: number; scale: number; }; visible: { opacity: number; scale: number; transition: { duration: number; delay: number; ease: string; }; }; }' is not assignable to type 'Variants'.
[23:07:00.246]   Property 'visible' is incompatible with index signature.
[23:07:00.247]     Type '{ opacity: number; scale: number; transition: { duration: number; delay: number; ease: string; }; }' is not assignable to type 'Variant'.
[23:07:00.247]       Type '{ opacity: number; scale: number; transition: { duration: number; delay: number; ease: string; }; }' is not assignable to type 'TargetAndTransition'.
[23:07:00.247]         Type '{ opacity: number; scale: number; transition: { duration: number; delay: number; ease: string; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues | undefined; }'.
[23:07:00.247]           Types of property 'transition' are incompatible.
[23:07:00.247]             Type '{ duration: number; delay: number; ease: string; }' is not assignable to type 'Transition<any> | undefined'.
[23:07:00.247]               Type '{ duration: number; delay: number; ease: string; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
[23:07:00.247]                 Type '{ duration: number; delay: number; ease: string; }' is not assignable to type 'ValueAnimationTransition<any>'.
[23:07:00.247]                   Types of property 'ease' are incompatible.
[23:07:00.247]                     Type 'string' is not assignable to type 'Easing | Easing[] | undefined'.
[23:07:00.247] src/components/story/ChatInterface.tsx(17,3): error TS6133: 'userId' is declared but its value is never read.
[23:07:00.247] src/components/story/LiveSlideView.tsx(2,18): error TS6133: 'AnimatePresence' is declared but its value is never read.
[23:07:00.247] src/components/story/LiveSlideView.tsx(16,3): error TS6133: 'images' is declared but its value is never read.
[23:07:00.247] src/components/story/LiveSlideView.tsx(104,9): error TS2322: Type '{ hidden: { opacity: number; scale: number; x: number; }; visible: { opacity: number; scale: number; x: number; transition: { type: string; stiffness: number; damping: number; duration: number; }; }; }' is not assignable to type 'Variants'.
[23:07:00.247]   Property 'visible' is incompatible with index signature.
[23:07:00.247]     Type '{ opacity: number; scale: number; x: number; transition: { type: string; stiffness: number; damping: number; duration: number; }; }' is not assignable to type 'Variant'.
[23:07:00.247]       Type '{ opacity: number; scale: number; x: number; transition: { type: string; stiffness: number; damping: number; duration: number; }; }' is not assignable to type 'TargetAndTransition'.
[23:07:00.247]         Type '{ opacity: number; scale: number; x: number; transition: { type: string; stiffness: number; damping: number; duration: number; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues | undefined; }'.
[23:07:00.247]           Types of property 'transition' are incompatible.
[23:07:00.247]             Type '{ type: string; stiffness: number; damping: number; duration: number; }' is not assignable to type 'Transition<any> | undefined'.
[23:07:00.247]               Type '{ type: string; stiffness: number; damping: number; duration: number; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
[23:07:00.247]                 Type '{ type: string; stiffness: number; damping: number; duration: number; }' is not assignable to type 'ValueAnimationTransition<any>'.
[23:07:00.247]                   Types of property 'type' are incompatible.
[23:07:00.247]                     Type 'string' is not assignable to type 'AnimationGeneratorType | undefined'.
[23:07:00.248] src/components/story/LiveSlideView.tsx(116,17): error TS2322: Type '{ initial: { opacity: number; scale: number; }; animate: { opacity: number[]; scale: number[]; transition: { duration: number; repeat: number; ease: string; }; }; } | {}' is not assignable to type 'Variants | undefined'.
[23:07:00.248]   Type '{ initial: { opacity: number; scale: number; }; animate: { opacity: number[]; scale: number[]; transition: { duration: number; repeat: number; ease: string; }; }; }' is not assignable to type 'Variants'.
[23:07:00.248]     Property 'animate' is incompatible with index signature.
[23:07:00.248]       Type '{ opacity: number[]; scale: number[]; transition: { duration: number; repeat: number; ease: string; }; }' is not assignable to type 'Variant'.
[23:07:00.248]         Type '{ opacity: number[]; scale: number[]; transition: { duration: number; repeat: number; ease: string; }; }' is not assignable to type 'TargetAndTransition'.
[23:07:00.248]           Type '{ opacity: number[]; scale: number[]; transition: { duration: number; repeat: number; ease: string; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues | undefined; }'.
[23:07:00.248]             Types of property 'transition' are incompatible.
[23:07:00.248]               Type '{ duration: number; repeat: number; ease: string; }' is not assignable to type 'Transition<any> | undefined'.
[23:07:00.248]                 Type '{ duration: number; repeat: number; ease: string; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
[23:07:00.248]                   Type '{ duration: number; repeat: number; ease: string; }' is not assignable to type 'ValueAnimationTransition<any>'.
[23:07:00.248]                     Types of property 'ease' are incompatible.
[23:07:00.248]                       Type 'string' is not assignable to type 'Easing | Easing[] | undefined'.
[23:07:00.248] src/components/story/LiveSlideView.tsx(146,23): error TS2322: Type '{ initial: { x: string; }; animate: { x: string; transition: { repeat: number; duration: number; ease: string; }; }; }' is not assignable to type 'Variants'.
[23:07:00.248]   Property 'animate' is incompatible with index signature.
[23:07:00.248]     Type '{ x: string; transition: { repeat: number; duration: number; ease: string; }; }' is not assignable to type 'Variant'.
[23:07:00.248]       Type '{ x: string; transition: { repeat: number; duration: number; ease: string; }; }' is not assignable to type 'TargetAndTransition'.
[23:07:00.248]         Type '{ x: string; transition: { repeat: number; duration: number; ease: string; }; }' is not assignable to type '{ transition?: Transition<any> | undefined; transitionEnd?: ResolvedValues | undefined; }'.
[23:07:00.248]           Types of property 'transition' are incompatible.
[23:07:00.248]             Type '{ repeat: number; duration: number; ease: string; }' is not assignable to type 'Transition<any> | undefined'.
[23:07:00.248]               Type '{ repeat: number; duration: number; ease: string; }' is not assignable to type 'TransitionWithValueOverrides<any>'.
[23:07:00.248]                 Type '{ repeat: number; duration: number; ease: string; }' is not assignable to type 'ValueAnimationTransition<any>'.
[23:07:00.248]                   Types of property 'ease' are incompatible.
[23:07:00.248]                     Type 'string' is not assignable to type 'Easing | Easing[] | undefined'.
[23:07:00.248] src/components/story/ReactPageFlipView.tsx(13,25): error TS6133: 'totalPages' is declared but its value is never read.
[23:07:00.248] src/components/story/ReactPageFlipView.tsx(136,31): error TS6133: 'e' is declared but its value is never read.
[23:07:00.248] src/components/story/ReactPageFlipView.tsx(140,44): error TS6133: 'orientation' is declared but its value is never read.
[23:07:00.248] src/components/story/ReactPageFlipView.tsx(144,38): error TS6133: 'state' is declared but its value is never read.
[23:07:00.249] src/components/story/ReactPageFlipView.tsx(148,31): error TS6133: 'data' is declared but its value is never read.
[23:07:00.249] src/components/story/ReactPageFlipView.tsx(289,18): error TS2739: Type '{ children: Element[]; ref: MutableRefObject<any>; width: number; height: number; size: "fixed"; minWidth: number; maxWidth: number; minHeight: number; maxHeight: number; ... 16 more ...; onInit: (data: any) => void; }' is missing the following properties from type 'Omit<IProps & RefAttributes<any>, "ref">': style, startPage, showPageCorners, disableFlipByClick
[23:07:00.249] src/components/story/StoryDisplay.tsx(3,16): error TS6133: 'Carousel' is declared but its value is never read.
[23:07:00.249] src/components/story/StoryDisplay.tsx(66,9): error TS6133: 'storyContent' is declared but its value is never read.
[23:07:00.249] src/components/story/StoryDisplay.tsx(68,9): error TS6133: 'handleImageClick' is declared but its value is never read.
[23:07:00.249] src/components/story/StoryDisplay.tsx(177,28): error TS2339: Property 'tokens' does not exist on type 'string'.
[23:07:00.249] src/components/story/StoryDisplay.tsx(181,20): error TS2339: Property 'tokens' does not exist on type 'string'.
[23:07:00.249] src/components/story/StoryDisplay.tsx(188,33): error TS2339: Property 'tokens' does not exist on type 'string'.
[23:07:00.249] src/components/story/StoryHistorySidebar.tsx(1,27): error TS6133: 'useMemo' is declared but its value is never read.
[23:07:00.249] src/components/story/StorySlideshow.tsx(126,62): error TS2322: Type 'string | Promise<string>' is not assignable to type 'string | TrustedHTML'.
[23:07:00.249]   Type 'Promise<string>' is not assignable to type 'string | TrustedHTML'.
[23:07:00.249] src/components/story/StoryViewModes.tsx(7,1): error TS6133: 'ReactPageFlipView' is declared but its value is never read.
[23:07:00.249] src/components/story/StoryViewModes.tsx(21,25): error TS6133: 'totalPages' is declared but its value is never read.
[23:07:00.249] src/components/story/StoryViewModes.tsx(105,10): error TS6133: 'currentPage' is declared but its value is never read.
[23:07:00.249] src/components/story/StoryViewModes.tsx(130,9): error TS6133: 'nextSlide' is declared but its value is never read.
[23:07:00.249] src/components/story/StoryViewModes.tsx(134,9): error TS6133: 'prevSlide' is declared but its value is never read.
[23:07:00.249] src/components/story/StoryViewModes.tsx(138,9): error TS6133: 'goToSlide' is declared but its value is never read.
[23:07:00.249] src/components/story/StoryViewModes.tsx(246,9): error TS6133: 'goToPage' is declared but its value is never read.
[23:07:00.249] src/components/ui/JellyText.tsx(48,50): error TS6133: 'index' is declared but its value is never read.
[23:07:00.249] src/components/ui/JellyText.tsx(95,19): error TS2322: Type '() => (() => void) | undefined' is not assignable to type 'Callback'.
[23:07:00.249]   Type '(() => void) | undefined' is not assignable to type 'void | null'.
[23:07:00.250]     Type '() => void' is not assignable to type 'void'.
[23:07:00.250] src/components/ui/JellyText.tsx(102,11): error TS6133: 'container' is declared but its value is never read.
[23:07:00.250] src/components/ui/JellyText.tsx(218,14): error TS2322: Type '{ children: string; jsx: true; }' is not assignable to type 'DetailedHTMLProps<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>'.
[23:07:00.250]   Property 'jsx' does not exist on type 'DetailedHTMLProps<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>'.
[23:07:00.250] src/config/app.ts(65,29): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.250] src/config/app.ts(66,28): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.250] src/config/appwrite.ts(5,29): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.250] src/config/appwrite.ts(24,22): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.250] src/config/vercel.ts(9,29): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.250] src/config/vercel.ts(21,29): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.250] src/config/vercel.ts(22,30): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.250] src/contexts/AuthContext.tsx(193,27): error TS2322: Type '{ user: Models.User<Models.Preferences> | null; isLoading: boolean; isAuthenticated: boolean; login: (email: string, password: string) => Promise<AuthResponse>; ... 7 more ...; updateUser: (data: any) => Promise<...>; }' is not assignable to type 'AuthContextType'.
[23:07:00.250]   The types returned by 'refreshUser()' are incompatible between these types.
[23:07:00.250]     Type 'Promise<User<Preferences> | null>' is not assignable to type 'Promise<void>'.
[23:07:00.250]       Type 'User<Preferences> | null' is not assignable to type 'void'.
[23:07:00.250]         Type 'null' is not assignable to type 'void'.
[23:07:00.250] src/hooks/index.ts(50,48): error TS6133: 'duration' is declared but its value is never read.
[23:07:00.250] src/hooks/index.ts(54,46): error TS6133: 'duration' is declared but its value is never read.
[23:07:00.250] src/hooks/index.ts(58,45): error TS6133: 'duration' is declared but its value is never read.
[23:07:00.250] src/hooks/index.ts(62,48): error TS6133: 'duration' is declared but its value is never read.
[23:07:00.250] src/hooks/index.ts(67,19): error TS6133: 'id' is declared but its value is never read.
[23:07:00.250] src/hooks/useAuthErrorHandler.ts(41,30): error TS2339: Property 'handleError' does not exist on type 'typeof AuthErrorHandler'.
[23:07:00.251] src/hooks/useAuthOperations.ts(3,1): error TS6133: 'AuthErrorHandler' is declared but its value is never read.
[23:07:00.251] src/hooks/useAuthSession.ts(57,5): error TS2552: Cannot find name 'isAboutToExpire'. Did you mean '_isAboutToExpire'?
[23:07:00.251] src/hooks/useStories.ts(56,34): error TS6133: 'title' is declared but its value is never read.
[23:07:00.251] src/hooks/useStories.ts(94,26): error TS2339: Property 'lastLogin' does not exist on type 'User<Preferences>'.
[23:07:00.251] src/hooks/useStories.ts(108,33): error TS2339: Property 'lastLogin' does not exist on type 'User<Preferences>'.
[23:07:00.261] src/hooks/useUserProfile.ts(12,29): error TS2339: Property 'deleteAccount' does not exist on type 'AuthContextType'.
[23:07:00.261] src/hooks/useUserProfile.ts(13,37): error TS2304: Cannot find name 'useState'.
[23:07:00.261] src/hooks/useUserProfile.ts(14,29): error TS2304: Cannot find name 'useState'.
[23:07:00.269] src/hooks/useUserProfile.ts(21,50): error TS2304: Cannot find name 'User'.
[23:07:00.269] src/hooks/useUserTheme.ts(24,15): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.269] src/hooks/useUserTheme.ts(29,25): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.269] src/hooks/useUserTheme.ts(30,42): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.269] src/hooks/useUserTheme.ts(32,31): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.269] src/hooks/useUserTheme.ts(50,51): error TS2554: Expected 1 arguments, but got 2.
[23:07:00.269] src/hooks/useUserTheme.ts(62,13): error TS2339: Property 'settings' does not exist on type 'User<Preferences>'.
[23:07:00.269] src/pages/AdminSecurityPage.tsx(2,29): error TS2307: Cannot find module '../components/admin/layout' or its corresponding type declarations.
[23:07:00.269] src/pages/AdminSecurityPage.tsx(3,25): error TS2305: Module '"../components/admin"' has no exported member 'ErrorReportingTester'.
[23:07:00.269] src/pages/DashboardPage.tsx(46,9): error TS6133: '_handleStorySelect' is declared but its value is never read.
[23:07:00.269] src/pages/DashboardPage.tsx(55,9): error TS6133: '_handleStoryRename' is declared but its value is never read.
[23:07:00.269] src/pages/DashboardPage.tsx(64,9): error TS6133: '_handleStoryDelete' is declared but its value is never read.
[23:07:00.269] src/pages/DashboardPage.tsx(80,9): error TS6133: 'handleStoryPin' is declared but its value is never read.
[23:07:00.269] src/pages/DashboardPage.tsx(98,16): error TS2339: Property 'geminiKey' does not exist on type 'User<Preferences>'.
[23:07:00.269] src/pages/DashboardPage.tsx(118,22): error TS6133: 'apiKey' is declared but its value is never read.
[23:07:00.269] src/pages/DashboardPage.tsx(121,49): error TS6133: 'userId' is declared but its value is never read.
[23:07:00.269] src/pages/DashboardPage.tsx(135,15): error TS2353: Object literal may only specify known properties, and 'responseModalities' does not exist in type 'GenerationConfig'.
[23:07:00.270] src/pages/DashboardPage.tsx(141,16): error TS2339: Property 'history' does not exist on type 'ChatSession'.
[23:07:00.270] src/pages/DashboardPage.tsx(170,18): error TS2339: Property 'history' does not exist on type 'ChatSession'.
[23:07:00.270] src/pages/DashboardPage.tsx(189,39): error TS18048: 'chunk.candidates' is possibly 'undefined'.
[23:07:00.270] src/pages/DashboardPage.tsx(377,37): error TS2339: Property 'geminiKey' does not exist on type 'User<Preferences>'.
[23:07:00.270] src/pages/DashboardPage.tsx(382,22): error TS2339: Property 'geminiKey' does not exist on type 'User<Preferences>'.
[23:07:00.270] src/pages/DashboardPage.tsx(422,15): error TS6133: 'userEmail' is declared but its value is never read.
[23:07:00.270] src/pages/DashboardPage.tsx(423,15): error TS6133: '_userName' is declared but its value is never read.
[23:07:00.270] src/pages/DashboardPage.tsx(424,15): error TS6133: 'userLastLogin' is declared but its value is never read.
[23:07:00.270] src/pages/DashboardPage.tsx(424,37): error TS2339: Property 'lastLogin' does not exist on type 'User<Preferences>'.
[23:07:00.270] src/pages/DashboardPage.tsx(607,9): error TS2322: Type 'Story | { $id: string; userId: string; title: string; content: string; images: string[]; createdAt: string; isPinned: false; } | undefined' is not assignable to type 'Story | undefined'.
[23:07:00.270]   Type '{ $id: string; userId: string; title: string; content: string; images: string[]; createdAt: string; isPinned: false; }' is missing the following properties from type 'Story': email, name, lastLogin
[23:07:00.270] src/pages/DashboardPage.tsx(646,15): error TS2339: Property 'geminiKey' does not exist on type 'User<Preferences>'.
[23:07:00.270] src/pages/EmailVerificationPage.tsx(78,13): error TS6133: 'fullUrl' is declared but its value is never read.
[23:07:00.270] src/pages/EmailVerificationPage.tsx(89,17): error TS6133: 'hashParamsObj' is declared but its value is never read.
[23:07:00.270] src/pages/LandingPage.tsx(51,17): error TS2322: Type '{ children: Element[]; animate: true; as: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<"div">>; initial: { ...; }; whileInView: { ...; }; transition: { ...; }; viewport: { ...; }; }' is not assignable to type 'IntrinsicAttributes & CardProps'.
[23:07:00.270]   Property 'as' does not exist on type 'IntrinsicAttributes & CardProps'.
[23:07:00.270] src/pages/LandingPage.tsx(71,17): error TS2322: Type '{ children: Element[]; animate: true; as: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<"div">>; initial: { ...; }; whileInView: { ...; }; transition: { ...; }; viewport: { ...; }; }' is not assignable to type 'IntrinsicAttributes & CardProps'.
[23:07:00.270]   Property 'as' does not exist on type 'IntrinsicAttributes & CardProps'.
[23:07:00.270] src/pages/LandingPage.tsx(91,17): error TS2322: Type '{ children: Element[]; animate: true; as: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<"div">>; initial: { ...; }; whileInView: { ...; }; transition: { ...; }; viewport: { ...; }; }' is not assignable to type 'IntrinsicAttributes & CardProps'.
[23:07:00.270]   Property 'as' does not exist on type 'IntrinsicAttributes & CardProps'.
[23:07:00.270] src/pages/OnboardingPage.tsx(175,9): error TS6133: 'handleSkip' is declared but its value is never read.
[23:07:00.270] src/pages/admin/AdminDashboardPage.tsx(2,1): error TS6192: All imports in import declaration are unused.
[23:07:00.270] src/pages/admin/AdminDashboardPage.tsx(5,1): error TS6133: 'motion' is declared but its value is never read.
[23:07:00.270] src/pages/admin/AdminDashboardPage.tsx(10,1): error TS6133: 'UserManagementPage' is declared but its value is never read.
[23:07:00.270] src/pages/admin/AdminDashboardPage.tsx(83,49): error TS2339: Property 'getDashboardStats' does not exist on type 'AdminService'.
[23:07:00.270] src/pages/admin/AdminDashboardPage.tsx(87,39): error TS2339: Property 'getRecentLogs' does not exist on type 'AdminService'.
[23:07:00.270] src/pages/admin/UserManagementPage.tsx(106,26): error TS2339: Property 'disableUser' does not exist on type 'AdminService'.
[23:07:00.270] src/pages/admin/UserManagementPage.tsx(123,26): error TS2339: Property 'enableUser' does not exist on type 'AdminService'.
[23:07:00.270] src/pages/dashboard/StoryLibraryPage.tsx(243,9): error TS6133: '_openDetailModal' is declared but its value is never read.
[23:07:00.270] src/pages/dashboard/StoryLibraryPage.tsx(405,36): error TS6133: 'e' is declared but its value is never read.
[23:07:00.270] src/pages/dashboard/StoryLibraryPage.tsx(708,42): error TS6133: 'index' is declared but its value is never read.
[23:07:00.270] src/pages/dashboard/StoryLibraryPage.tsx(823,36): error TS6133: 'e' is declared but its value is never read.
[23:07:00.270] src/services/admin.ts(19,25): error TS2339: Property 'isAdmin' does not exist on type 'User<{ [key: string]: any; [__default]: true; }>'.
[23:07:00.270] src/services/admin.ts(24,43): error TS2339: Property 'getAllUsers' does not exist on type 'AppwriteService'.
[23:07:00.270] src/services/admin.ts(39,25): error TS2339: Property 'isAdmin' does not exist on type 'User<{ [key: string]: any; [__default]: true; }>'.
[23:07:00.270] src/services/admin.ts(44,46): error TS2339: Property 'getUserActivity' does not exist on type 'AppwriteService'.
[23:07:00.270] src/services/admin.ts(47,27): error TS7006: Parameter 'item' implicitly has an 'any' type.
[23:07:00.270] src/services/admin.ts(65,25): error TS2339: Property 'isAdmin' does not exist on type 'User<{ [key: string]: any; [__default]: true; }>'.
[23:07:00.270] src/services/admin.ts(70,29): error TS2339: Property 'updateUserStatus' does not exist on type 'AppwriteService'.
[23:07:00.270] src/services/admin.ts(73,29): error TS2339: Property 'createAdminLog' does not exist on type 'AppwriteService'.
[23:07:00.270] src/services/admin.ts(96,25): error TS2339: Property 'isAdmin' does not exist on type 'User<{ [key: string]: any; [__default]: true; }>'.
[23:07:00.271] src/services/admin.ts(101,45): error TS2339: Property 'getAdminMetrics' does not exist on type 'AppwriteService'.
[23:07:00.271] src/services/admin.ts(116,25): error TS2339: Property 'isAdmin' does not exist on type 'User<{ [key: string]: any; [__default]: true; }>'.
[23:07:00.271] src/services/admin.ts(121,47): error TS2339: Property 'getErrorLogs' does not exist on type 'AppwriteService'.
[23:07:00.271] src/services/admin.ts(136,25): error TS2339: Property 'isAdmin' does not exist on type 'User<{ [key: string]: any; [__default]: true; }>'.
[23:07:00.271] src/services/admin.ts(141,29): error TS2339: Property 'resolveError' does not exist on type 'AppwriteService'.
[23:07:00.271] src/services/admin.ts(144,29): error TS2339: Property 'createAdminLog' does not exist on type 'AppwriteService'.
[23:07:00.271] src/services/admin.ts(167,29): error TS2339: Property 'createErrorReport' does not exist on type 'AppwriteService'.
[23:07:00.271] src/services/adminService.ts(1,10): error TS6133: 'ID' is declared but its value is never read.
[23:07:00.271] src/services/analytics.ts(2,1): error TS6133: 'storyService' is declared but its value is never read.
[23:07:00.271] src/services/analytics.ts(3,1): error TS6133: 'databaseService' is declared but its value is never read.
[23:07:00.271] src/services/analytics.ts(52,11): error TS6133: 'isAdmin' is declared but its value is never read.
[23:07:00.271] src/services/analytics.ts(69,36): error TS2339: Property 'isAdmin' does not exist on type 'User<{ [key: string]: any; [__default]: true; }>'.
[23:07:00.271] src/services/appwrite.ts(19,13): error TS6133: 'session' is declared but its value is never read.
[23:07:00.271] src/services/appwrite.ts(19,37): error TS2551: Property 'createEmailSession' does not exist on type 'Account'. Did you mean 'createSession'?
[23:07:00.271] src/services/appwrite.ts(56,9): error TS2345: Argument of type 'string' is not assignable to parameter of type 'OAuthProvider'.
[23:07:00.271] src/services/appwrite.ts(203,62): error TS2554: Expected 3 arguments, but got 4.
[23:07:00.271] src/services/appwrite.ts(301,34): error TS6133: 'width' is declared but its value is never read.
[23:07:00.271] src/services/appwrite.ts(301,55): error TS6133: 'height' is declared but its value is never read.
[23:07:00.271] src/services/auth.ts(1,19): error TS6133: 'ID' is declared but its value is never read.
[23:07:00.271] src/services/authService.ts(3,32): error TS6133: 'ErrorType' is declared but its value is never read.
[23:07:00.271] src/services/authService.ts(3,43): error TS6133: 'ErrorSeverity' is declared but its value is never read.
[23:07:00.271] src/services/authService.ts(25,29): error TS2339: Property 'register' does not exist on type 'AppwriteService'.
[23:07:00.271] src/services/authService.ts(75,29): error TS2339: Property 'resendVerificationEmail' does not exist on type 'AppwriteService'.
[23:07:00.271] src/services/authService.ts(110,7): error TS2739: Type 'User<{ [key: string]: any; [__default]: true; }>' is missing the following properties from type 'User': geminiKey, createdAt, settings
[23:07:00.271] src/services/authService.ts(191,29): error TS2554: Expected 4 arguments, but got 1.
[23:07:00.271] src/services/authService.ts(215,7): error TS2322: Type 'User<{ [key: string]: any; [__default]: true; }> | null' is not assignable to type 'User | null'.
[23:07:00.271]   Type 'User<{ [key: string]: any; [__default]: true; }>' is not assignable to type 'User'.
[23:07:00.271] src/services/authService.ts(251,29): error TS2339: Property 'deleteUser' does not exist on type 'AppwriteService'.
[23:07:00.271] src/services/database.ts(70,14): error TS2352: Conversion of type 'DefaultDocument' to type 'UserDocument' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
[23:07:00.271]   Type 'DefaultDocument' is missing the following properties from type 'UserDocument': email, name, geminiKey, isAdmin, and 4 more.
[23:07:00.271] src/services/database.ts(86,9): error TS2345: Argument of type 'Partial<UserDocument>' is not assignable to parameter of type 'Partial<DataWithoutDocumentKeys>'.
[23:07:00.271]   Types of property '$id' are incompatible.
[23:07:00.271]     Type 'string | undefined' is not assignable to type 'undefined'.
[23:07:00.271]       Type 'string' is not assignable to type 'undefined'.
[23:07:00.271] src/services/database.ts(89,14): error TS2352: Conversion of type 'DefaultDocument' to type 'UserDocument' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
[23:07:00.271] src/services/database.ts(107,14): error TS2352: Conversion of type 'DefaultDocument' to type 'UserDocument' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
[23:07:00.271] src/services/databaseService.ts(1,32): error TS6133: 'Models' is declared but its value is never read.
[23:07:00.271] src/services/databaseService.ts(413,57): error TS7006: Parameter 'slide' implicitly has an 'any' type.
[23:07:00.271] src/services/databaseService.ts(413,64): error TS7006: Parameter 'index' implicitly has an 'any' type.
[23:07:00.271] src/services/encryption.ts(10,20): error TS6133: 'saltLength' is declared but its value is never read.
[23:07:00.271] src/services/encryption.ts(24,17): error TS6133: 'deriveKey' is declared but its value is never read.
[23:07:00.272] src/services/enhancedPdfExport.ts(17,20): error TS6133: 'FONT_SIZE_TITLE' is declared but its value is never read.
[23:07:00.272] src/services/enhancedPdfExport.ts(20,20): error TS6133: 'FONT_SIZE_CAPTION' is declared but its value is never read.
[23:07:00.272] src/services/enhancedPdfExport.ts(213,5): error TS6133: 'yPosition' is declared but its value is never read.
[23:07:00.272] src/services/enhancedPdfExport.ts(237,31): error TS6133: 'index' is declared but its value is never read.
[23:07:00.272] src/services/enhancedPdfExport.ts(288,11): error TS6133: 'pageHeight' is declared but its value is never read.
[23:07:00.272] src/services/enhancedPdfExport.ts(330,29): error TS6133: 'index' is declared but its value is never read.
[23:07:00.272] src/services/enhancedPdfExport.ts(345,17): error TS6133: 'addContent' is declared but its value is never read.
[23:07:00.272] src/services/enhancedPdfExport.ts(400,5): error TS6133: 'watermarkOpacity' is declared but its value is never read.
[23:07:00.272] src/services/enhancedPdfExport.ts(403,11): error TS6133: 'pageHeight' is declared but its value is never read.
[23:07:00.272] src/services/enhancedPdfExport.ts(538,5): error TS6133: 'yPosition' is declared but its value is never read.
[23:07:00.272] src/services/enhancedPdfExport.ts(781,11): error TS6133: 'calculateOptimalLayout' is declared but its value is never read.
[23:07:00.272] src/services/export.ts(24,52): error TS2339: Property 'client' does not exist on type 'AppwriteService'.
[23:07:00.272] src/services/export.ts(46,20): error TS2339: Property 'statusCode' does not exist on type 'Execution'.
[23:07:00.272] src/services/export.ts(47,59): error TS2339: Property 'stderr' does not exist on type 'Execution'.
[23:07:00.272] src/services/export.ts(58,37): error TS2345: Argument of type '"json" | "pdf"' is not assignable to parameter of type '"pdf"'.
[23:07:00.272]   Type '"json"' is not assignable to type '"pdf"'.
[23:07:00.272] src/services/export.ts(108,14): error TS2678: Type '"json"' is not comparable to type '"pdf"'.
[23:07:00.272] src/services/export.ts(111,14): error TS2678: Type '"txt"' is not comparable to type '"pdf"'.
[23:07:00.272] src/services/export.ts(114,14): error TS2678: Type '"html"' is not comparable to type '"pdf"'.
[23:07:00.272] src/services/export.ts(131,17): error TS6133: 'exportToPDF' is declared but its value is never read.
[23:07:00.272] src/services/export.ts(262,11): error TS6133: 'exportToJSON' is declared but its value is never read.
[23:07:00.272] src/services/export.ts(327,11): error TS6133: 'exportToTXT' is declared but its value is never read.
[23:07:00.272] src/services/export.ts(357,49): error TS6133: 'options' is declared but its value is never read.
[23:07:00.272] src/services/export.ts(377,11): error TS6133: 'exportToHTML' is declared but its value is never read.
[23:07:00.272] src/services/export.ts(437,50): error TS6133: 'options' is declared but its value is never read.
[23:07:00.272] src/services/gemini.ts(1,30): error TS2305: Module '"@google/generative-ai"' has no exported member 'Modality'.
[23:07:00.272] src/services/gemini.ts(3,1): error TS6133: 'marked' is declared but its value is never read.
[23:07:00.272] src/services/gemini.ts(37,13): error TS2353: Object literal may only specify known properties, and 'responseModalities' does not exist in type 'GenerationConfig'.
[23:07:00.272] src/services/gemini.ts(48,11): error TS2353: Object literal may only specify known properties, and 'message' does not exist in type '(string | Part)[]'.
[23:07:00.272] src/services/gemini.ts(56,35): error TS2504: Type 'GenerateContentStreamResult' must have a '[Symbol.asyncIterator]()' method that returns an async iterator.
[23:07:00.272] src/services/gemini.ts(169,17): error TS6133: 'generateImages' is declared but its value is never read.
[23:07:00.272] src/services/gemini.ts(169,32): error TS6133: 'prompt' is declared but its value is never read.
[23:07:00.272] src/services/gemini.ts(169,48): error TS6133: 'apiKey' is declared but its value is never read.
[23:07:00.272] src/services/story.ts(11,84): error TS2304: Cannot find name 'StorySlide'.
[23:07:00.272] src/services/story.ts(18,43): error TS2339: Property 'createStory' does not exist on type 'AppwriteService'.
[23:07:00.272] src/services/story.ts(35,45): error TS2339: Property 'getStories' does not exist on type 'AppwriteService'.
[23:07:00.272] src/services/story.ts(39,28): error TS7006: Parameter 'a' implicitly has an 'any' type.
[23:07:00.272] src/services/story.ts(39,31): error TS7006: Parameter 'b' implicitly has an 'any' type.
[23:07:00.272] src/services/story.ts(60,43): error TS2339: Property 'getStory' does not exist on type 'AppwriteService'.
[23:07:00.272] src/services/story.ts(77,50): error TS2339: Property 'updateStory' does not exist on type 'AppwriteService'.
[23:07:00.272] src/services/story.ts(94,44): error TS2339: Property 'deleteStory' does not exist on type 'AppwriteService'.
[23:07:00.273] src/services/subscription.ts(6,28): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.273] src/services/subscription.ts(7,27): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.273] src/services/subscription.ts(19,36): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.273] src/services/subscription.ts(20,38): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.273] src/services/userService.ts(86,7): error TS2698: Spread types may only be created from object types.
[23:07:00.273] src/utils/appInit.ts(12,32): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.273] src/utils/appInit.ts(13,31): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.273] src/utils/appInit.ts(19,11): error TS6133: 'sessionRestored' is declared but its value is never read.
[23:07:00.274] src/utils/appInit.ts(35,28): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.274] src/utils/appInit.ts(36,32): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.274] src/utils/appInit.ts(37,31): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.274] src/utils/appwriteStorageHelper.ts(72,3): error TS6133: 'bucketId' is declared but its value is never read.
[23:07:00.274] src/utils/authErrorDisplay.ts(28,40): error TS2339: Property 'getErrorInfo' does not exist on type 'typeof AuthErrorHandler'.
[23:07:00.274] src/utils/authErrorDisplay.ts(32,34): error TS2339: Property 'getHelpText' does not exist on type 'typeof AuthErrorHandler'.
[23:07:00.274] src/utils/authErrorDisplay.ts(33,37): error TS2339: Property 'getActionSuggestions' does not exist on type 'typeof AuthErrorHandler'.
[23:07:00.274] src/utils/authErrorDisplay.ts(35,36): error TS2339: Property 'isRetryable' does not exist on type 'typeof AuthErrorHandler'.
[23:07:00.274] src/utils/authErrorDisplay.ts(36,28): error TS2339: Property 'getRetryDelay' does not exist on type 'typeof AuthErrorHandler'.
[23:07:00.274] src/utils/authErrorDisplay.ts(89,40): error TS2339: Property 'getErrorInfo' does not exist on type 'typeof AuthErrorHandler'.
[23:07:00.274] src/utils/authErrorHandler.ts(260,29): error TS2339: Property 'createErrorReport' does not exist on type 'AppwriteService'.
[23:07:00.274] src/utils/authErrorLogger.ts(1,58): error TS6133: 'ErrorType' is declared but its value is never read.
[23:07:00.274] src/utils/authErrorLogger.ts(111,29): error TS2339: Property 'createErrorReport' does not exist on type 'AppwriteService'.
[23:07:00.299] src/utils/authLogger.ts(313,31): error TS2339: Property 'createErrorReport' does not exist on type 'AppwriteService'.
[23:07:00.299] src/utils/authLogger.ts(373,31): error TS2339: Property 'createErrorReport' does not exist on type 'AppwriteService'.
[23:07:00.299] src/utils/authLogger.ts(430,29): error TS2339: Property 'createErrorReport' does not exist on type 'AppwriteService'.
[23:07:00.299] src/utils/authLogger.ts(482,29): error TS2339: Property 'createErrorReport' does not exist on type 'AppwriteService'.
[23:07:00.299] src/utils/authRateLimiter.ts(65,20): error TS2339: Property 'warn' does not exist on type 'typeof AuthLogger'.
[23:07:00.299] src/utils/authRateLimiter.ts(91,18): error TS2339: Property 'error' does not exist on type 'typeof AuthLogger'.
[23:07:00.299] src/utils/authRateLimiter.ts(135,9): error TS2322: Type 'number' is not assignable to type 'null'.
[23:07:00.299] src/utils/authRateLimiter.ts(137,20): error TS2339: Property 'warn' does not exist on type 'typeof AuthLogger'.
[23:07:00.299] src/utils/authRateLimiter.ts(140,34): error TS2769: No overload matches this call.
[23:07:00.299]   Overload 1 of 4, '(value: string | number | Date): Date', gave the following error.
[23:07:00.299]     Argument of type 'null' is not assignable to parameter of type 'string | number | Date'.
[23:07:00.299]   Overload 2 of 4, '(value: string | number): Date', gave the following error.
[23:07:00.299]     Argument of type 'null' is not assignable to parameter of type 'string | number'.
[23:07:00.299] src/utils/authRateLimiter.ts(152,18): error TS2339: Property 'error' does not exist on type 'typeof AuthLogger'.
[23:07:00.299] src/utils/authRateLimiter.ts(167,18): error TS2339: Property 'debug' does not exist on type 'typeof AuthLogger'.
[23:07:00.299] src/utils/authRateLimiter.ts(173,18): error TS2339: Property 'error' does not exist on type 'typeof AuthLogger'.
[23:07:00.299] src/utils/authRateLimiter.ts(197,18): error TS2339: Property 'warn' does not exist on type 'typeof AuthLogger'.
[23:07:00.299] src/utils/authRateLimiter.ts(205,18): error TS2339: Property 'error' does not exist on type 'typeof AuthLogger'.
[23:07:00.299] src/utils/imageUrlFixer.ts(5,3): error TS6133: 'generateFileViewUrl' is declared but its value is never read.
[23:07:00.299] src/utils/imageUrlFixer.ts(7,3): error TS6133: 'getStorySlideImageUrl' is declared but its value is never read.
[23:07:00.299] src/utils/imageUrlFixer.ts(8,3): error TS6133: 'getStoryThumbnailUrl' is declared but its value is never read.
[23:07:00.299] src/utils/keyRotation.ts(18,25): error TS2339: Property 'isAdmin' does not exist on type 'User<{ [key: string]: any; [__default]: true; }>'.
[23:07:00.299] src/utils/keyRotation.ts(23,43): error TS2339: Property 'getAllUsers' does not exist on type 'AppwriteService'.
[23:07:00.299] src/utils/keyRotation.ts(53,35): error TS2339: Property 'updateUserDocument' does not exist on type 'AppwriteService'.
[23:07:00.299] src/utils/keyRotation.ts(116,22): error TS2339: Property 'isAdmin' does not exist on type 'User<{ [key: string]: any; [__default]: true; }>'.
[23:07:00.299] src/utils/sessionManager.ts(12,32): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.299] src/utils/sessionManager.ts(13,31): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.299] src/utils/sessionManager.ts(19,11): error TS6133: '_session' is declared but its value is never read.
[23:07:00.299] src/utils/sessionManager.ts(39,32): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.299] src/utils/sessionManager.ts(40,31): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
[23:07:00.355] npm error code 2
[23:07:00.355] npm error path /vercel/path0
[23:07:00.355] npm error command failed
[23:07:00.355] npm error command sh -c npm run type-check
[23:07:00.356] npm error A complete log of this run can be found in: /vercel/.npm/_logs/2025-08-03T17_36_43_530Z-debug-0.log
[23:07:00.394] Error: Command "npm install" exited with 2
[23:07:03.466] Exiting build container