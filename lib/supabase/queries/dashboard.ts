import { createClient } from '@/utils/supabase/server';
import { getSession } from '@/lib';

export async function getDashboardPageData() {
  const supabase = await createClient();
  const session = await getSession();
  const userId = session?.user?.id;

  // Fetch data using the RPC
  const { data: dashboardData, error } = await supabase.rpc('get_dashboard_overview', { user_id_param: userId });

  if (error) {
    console.error("Error fetching dashboard page data:", error);
    return {
      user: session?.user || null,
      ongoingBookings: [],
    };
  }

  // Filter the data on the server
  const ongoingBookings = dashboardData?.filter((item: { Booking_Status_Name: string; }) => item.Booking_Status_Name.toLowerCase() === 'ongoing') || [];

  return {
    user: session?.user || null,
    ongoingBookings,
    allDashboardData: dashboardData || [],
  };
}