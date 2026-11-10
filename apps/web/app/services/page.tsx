'use client';

import { redirect } from 'next/navigation';

export default function ServicesIndexPage() {
  redirect('/search?category=CAR_WASH');
}
