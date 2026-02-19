'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';

interface PaginationProps {
    page: number;
    totalPages: number;
}

export function Pagination({
    page,
    totalPages,
}: PaginationProps): React.ReactElement {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createPageUrl = useCallback(
        (pageNumber: number): string => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', pageNumber.toString());
            return `${pathname}?${params.toString()}`;
        },
        [pathname, searchParams]
    );

    return (
        <div className="flex items-center justify-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(createPageUrl(page - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </Button>
            <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(createPageUrl(page + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </Button>
        </div>
    );
}
