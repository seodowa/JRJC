import { fetchCars, fetchCarStatuses } from "@/lib/supabase/queries/admin/fetchCars";
import { fetchDisplayManageCars } from "@/lib/supabase/queries/admin/fetchManageCars";
import CarsPageClient from "@/components/admin/cars/CarsPageClient";
import { Suspense } from "react";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { Car } from "@/types";
import { RealtimeCarsRefresher } from "@/components/admin/cars/RealtimeCarsRefresher";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

interface ManageCarsPageProps {
    searchParams: Promise<{
        q?: string;
        view?: 'list' | 'grid';
    }>;
}

const ManageCarsPage = async ({ searchParams }: ManageCarsPageProps) => {
    const resolvedSearchParams = await searchParams;
    
    // Server-side mobile detection to prevent flash of list view
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    const query = resolvedSearchParams?.q || '';
    // If view param exists, use it. If not, default to 'grid' for mobile, 'list' for desktop.
    // Note: The client-side effect will still enforce grid on mobile if user tries to force 'list' via URL.
    const view = resolvedSearchParams?.view || (isMobile ? 'grid' : 'list');
    
    let cars: Car[];
    if (query) {
        cars = await fetchCars(query);
    } else {
        cars = await fetchDisplayManageCars();
    }
    
    const carStatuses = await fetchCarStatuses();

    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full w-full"><LoadingSpinner /></div>}>
            <RealtimeCarsRefresher />
            <CarsPageClient cars={cars} carStatuses={carStatuses} view={view} search={query} />
        </Suspense>
    );
};

export default ManageCarsPage;