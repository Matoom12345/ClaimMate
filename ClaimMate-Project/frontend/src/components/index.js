// Export ทุก components เพื่อให้ import ง่าย

// Base Components
export { default as Button } from './Button';
export { default as Card, CardHeader, CardTitle, CardBody, CardFooter } from './Card';
export { default as Badge, StatusBadge } from './Badge';
export { default as Input, TextArea } from './Input';
export { default as Select } from './Select';

// Layout & Display Components
export { default as Timeline, ClaimTimeline } from './Timeline';
export { default as Modal, ConfirmModal } from './Modal';

// Feedback Components
export { default as Loading, Skeleton, SkeletonCard, SkeletonTable, SkeletonTimeline } from './Loading';

// Form Components
export { default as FileUpload } from './FileUpload';

// Usage Examples:
// import { Button, Card, Badge } from '@/components/common';
// import { ClaimTimeline } from '@/components/common';