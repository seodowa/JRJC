import { fetchCars, fetchCarStatuses } from "@/lib/supabase/queries/admin/fetchCars";
import { fetchDisplayManageCars } from "@/lib/supabase/queries/admin/fetchManageCars";
import CarsPageClient from "@/components/admin/cars/CarsPageClient";
import { Suspense } from "react";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { Car } from "@/types";
import { RealtimeCarsRefresher } from "@/components/admin/cars/RealtimeCarsRefresher";

export const dynamic = 'force-dynamic';

interface ManageCarsPageProps {
    searchParams: Promise<{
        q?: string;
        view?: 'list' | 'grid';
    }>;
}

const ManageCarsPage = async ({ searchParams }: ManageCarsPageProps) => {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams?.q || '';
    const view = resolvedSearchParams?.view || 'list';
    
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