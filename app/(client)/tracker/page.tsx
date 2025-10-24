export default function BookingTrackerPage() {
    return (
        <div className="flex justify-center items-start min-h-screen bg-main-color md:bg-transparent md:bg-gradient-to-b from-main-color from-80% md:from-60% lg:from-40% to-transparent -mt-12 pt-9 md:pt-12 relative overflow-hidden font-main-font">
            <img src="/images/BG.webp" className="opacity-20 min-w-full absolute bottom-0 -z-2" />

            <div className="bg-white flex flex-col mt-12 h-144 p-4 rounded-2xl shadow-xl sm:w-md md:flex-row md:w-full md:max-w-6xl md:mx-12">
                <div className="flex flex-col md:min-w-3xs md:max-w-3xs">
                    <h1 className="font-bold text-2xl">Booking Tracker</h1>
                    <label htmlFor="id-input" className="mt-3">Enter your booking ID:</label>
                    <span className="flex md:flex-col md:items-center justify-between gap-3 mt-2">
                        <input type="text" id="id-input" 
                        className="border-2 border-main-color rounded-xl grow px-1 self-stretch md:h-10"
                        placeholder="Booking ID"/>
                        <button className="bg-secondary-100 py-2 px-4 rounded-3xl
                            hover:cursor-pointer hover:bg-hover-color">Search</button>
                    </span>
                </div>
                <div className="mt-8 mb-4 bg-gray-400 w-full h-[1px] md:h-full md:w-[1px] md:mx-4 md:my-0"/>
                <div className="flex flex-col items-center w-full">
                    <h1 className="font-bold text-2xl">Booking Status</h1>
                </div>
            </div>
        </div>
    );
}