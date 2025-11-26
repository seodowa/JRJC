"use client";

import { motion } from "framer-motion";
import { GridViewIcon, ListViewIcon } from "@/components/icons/ViewToggleIcons";

interface ViewToggleProps {
    view: 'list' | 'grid';
    setView: (view: 'list' | 'grid') => void;
}

const ViewToggle = ({ view, setView }: ViewToggleProps) => {
    return (
        <div className="flex items-center gap-x-1 rounded-full bg-gray-100 p-1 border border-gray-200 shadow-sm">
            <button
                className={`relative py-1.5 px-3 rounded-full flex items-center gap-2 transition-colors ${view === 'list' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="List View"
                onClick={() => setView('list')}
            >
                {view === 'list' && (
                    <motion.div
                        layoutId="view-toggle-active"
                        className="absolute inset-0 bg-white rounded-full shadow-sm border border-gray-200/50"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
                <ListViewIcon className="relative z-10 w-4 h-4" />
                <span className="relative z-10 text-sm font-medium">List</span>
            </button>
            <button
                className={`relative py-1.5 px-3 rounded-full flex items-center gap-2 transition-colors ${view === 'grid' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="Grid View"
                onClick={() => setView('grid')}
            >
                {view === 'grid' && (
                    <motion.div
                        layoutId="view-toggle-active"
                        className="absolute inset-0 bg-white rounded-full shadow-sm border border-gray-200/50"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
                <GridViewIcon className="relative z-10 w-4 h-4" />
                <span className="relative z-10 text-sm font-medium">Grid</span>
            </button>
        </div>
    );
}

export default ViewToggle;