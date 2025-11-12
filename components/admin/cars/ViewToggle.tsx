"use client";

import { GridViewIcon, ListViewIcon } from "@/components/icons/ViewToggleIcons";

interface ViewToggleProps {
    view: 'list' | 'grid';
    setView: (view: 'list' | 'grid') => void;
}

const ViewToggle = ({ view, setView }: ViewToggleProps) => {
    const isGridView = view === 'grid';

    return (
        <div className="flex items-center gap-x-2 rounded-full bg-gray-200 p-1">
            <button
                className={`p-2 rounded-full ${!isGridView ? "bg-white" : ""}`}
                aria-label="List View"
                onClick={() => setView('list')}
            >
                <ListViewIcon className="w-5 h-5" />
            </button>
            <button
                className={`p-2 rounded-full ${isGridView ? "bg-white" : ""}`}
                aria-label="Grid View"
                onClick={() => setView('grid')}
            >
                <GridViewIcon className="w-5 h-5" />
            </button>
        </div>
    );
}

export default ViewToggle;
