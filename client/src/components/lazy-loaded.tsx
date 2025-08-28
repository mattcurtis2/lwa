import { lazy } from 'react';

// Lazy load heavy admin components to reduce initial bundle size
export const LazyAdmin = lazy(() => import('@/pages/admin').then(module => ({ default: module.default })));
export const LazyImageCropper = lazy(() => import('@/components/ui/image-cropper'));
export const LazyDogManagement = lazy(() => import('@/components/admin/dog-management'));
export const LazyGoatManagement = lazy(() => import('@/components/admin/goat-management'));
export const LazySheepManagement = lazy(() => import('@/components/admin/sheep-management'));
export const LazyLitterManagement = lazy(() => import('@/components/admin/litter-management'));
export const LazyOrdersManagement = lazy(() => import('@/components/admin/orders-management'));