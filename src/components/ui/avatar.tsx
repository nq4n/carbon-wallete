'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from './utils';

import manAvatar from '../../assets/avatars/man_avatar.png';
import womenAvatar from '../../assets/avatars/women_avatar.png';

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot='avatar'
      className={cn(
        'relative flex size-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  src,
  gender,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image> & {
  gender?: string;
}) {
  const [hasError, setHasError] = React.useState(!src);

  React.useEffect(() => {
    setHasError(!src);
  }, [src]);

  const normalizedGender =
    gender?.toLowerCase().trim().startsWith('f') ? 'female' : 'male';
  const fallbackSrc = normalizedGender === 'female' ? womenAvatar : manAvatar;

  return (
    <AvatarPrimitive.Image
      data-slot='avatar-image'
      src={hasError ? fallbackSrc : src}
      onError={() => setHasError(true)}
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot='avatar-fallback'
      className={cn(
        'bg-muted flex size-full items-center justify-center rounded-full',
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
