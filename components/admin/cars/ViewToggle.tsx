"use client";

import { motion } from "framer-motion";
import { GridViewIcon, ListViewIcon } from "@/components/icons/ViewToggleIcons";

interface ViewToggleProps {
    view: 'list' | 'grid';
    setView: (view: 'list' | 'grid') => void;
}

const ViewToggle = ({ view, setView }: ViewToggleProps) => {
    return (
        <div className="flex items-center gap-x-2 rounded-full bg-gray-200 p-1">
            <button
                className="relative p-2 rounded-full"
                aria-label="List View"
                onClick={() => setView('list')}
            >
                {view === 'list' && (
                    <motion.div
                        layoutId="view-toggle-active"
                        className="absolute inset-0 bg-white rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
                <ListViewIcon className="relative z-10 w-5 h-5" />
            </button>
            <button
                className="relative p-2 rounded-full"
                aria-label="Grid View"
                onClick={() => setView('grid')}
            >
                {view === 'grid' && (
                    <motion.div
                        layoutId="view-toggle-active"
                        className="absolute inset-0 bg-white rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
                <GridViewIcon className="relative z-10 w-5 h-5" />
            </button>
        </div>
    );
}

export default ViewToggle;
