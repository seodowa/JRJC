import { fetchCars } from "@/lib/supabase/queries/fetchCars";
import CarsPageClient from "@/components/admin/cars/CarsPageClient";
import { Suspense } from "react";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

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
    
    const cars = await fetchCars(query);

    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full w-full"><LoadingSpinner /></div>}>
            <CarsPageClient cars={cars} view={view} search={query} />
        </Suspense>
    );
};

export default ManageCarsPage;