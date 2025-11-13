import { fetchCars } from "@/lib/supabase/queries/fetchCars";
import CarsPageClient from "@/components/admin/cars/CarsPageClient";
import { Suspense } from "react";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

export const dynamic = 'force-dynamic';

interface ManageCarsPageProps {
    searchParams?: {
        q?: string;
        view?: 'list' | 'grid';
    };
}

const ManageCarsPage = async ({ searchParams }: ManageCarsPageProps) => {
    const query = searchParams?.q || '';
    const view = searchParams?.view || 'list';
    
    const cars = await fetchCars(query);

    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full w-full"><LoadingSpinner /></div>}>
            <CarsPageClient cars={cars} view={view} search={query} />
        </Suspense>
    );
};

export default ManageCarsPage;